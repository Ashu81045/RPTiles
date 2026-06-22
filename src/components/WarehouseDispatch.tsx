import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product } from '../types';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Language, TRANSLATIONS } from '../data/translations';
import { 
  Barcode, Search, CheckCircle, AlertTriangle, Printer, Phone, MapPin, 
  User, Calendar, Clock, ShoppingCart, Plus, Minus, ArrowRight, ClipboardCheck, 
  Trash2, RefreshCw, Layers, ShieldCheck, Check, Edit2, Play, Truck, QrCode
} from 'lucide-react';

interface InvoiceItem {
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
  size: string;
  total: number;
  productImage?: string;
}

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  timestamp: string;
  paidAmount: number;
  dueAmount: number;
  deliveryStatus?: 'Pending' | 'Delivered';
  deliveryTimestamp?: string;
  deliveredBy?: string;
}

interface WarehouseDispatchProps {
  products: Product[];
  language: Language;
}

const LOCAL_STORAGE_INVOICES_KEY = 'ceramica_catalog_invoices';

export default function WarehouseDispatch({ products, language }: WarehouseDispatchProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [warehouseVerified, setWarehouseVerified] = useState<Record<string, number>>({}); // sku: verified count
  const [isDelivering, setIsDelivering] = useState(false);
  
  // Scanner state
  const [scannerInput, setScannerInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'idle' }>({
    text: 'STANDBY: Enter/Scan SKU code to register box',
    type: 'idle'
  });

  const [staffName, setStaffName] = useState('Chief Warehouse Officer');
  const [showConfetti, setShowConfetti] = useState(false);
  const soundInitialized = useRef(false);

  // Load invoices in real-time from Firestore on mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const invList: Invoice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        invList.push({
          ...data,
          deliveryStatus: data.deliveryStatus || 'Pending'
        } as Invoice);
      });
      invList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInvoices(invList);
    }, (error) => {
      console.error("Error reading invoices in WarehouseDispatch:", error);
    });
    return () => unsubscribe();
  }, []);

  // Filter bills pending or matching search
  const pendingInvoices = useMemo(() => {
    return invoices.filter(inv => inv.deliveryStatus !== 'Delivered');
  }, [invoices]);

  const deliveredInvoices = useMemo(() => {
    return invoices.filter(inv => inv.deliveryStatus === 'Delivered');
  }, [invoices]);

  // Audio dispatch success sound
  const playBeep = (freq = 880, duration = 120) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration/1000);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration/1000);
    } catch (e) {
      console.warn("Audio Context beep was blocked by browser autoplay constraints", e);
    }
  };

  // Perform search / lookup
  const handleQuerySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const matched = invoices.find(inv => 
      inv.invoiceNumber.toLowerCase().includes(query) || 
      inv.customerPhone.replace(/[\s+-]/g, '').includes(query.replace(/[\s+-]/g, '')) ||
      inv.customerName.toLowerCase().includes(query)
    );

    if (matched) {
      selectInvoice(matched);
      setScanMessage({
        text: `LOGGED: Bill ${matched.invoiceNumber} fetched successfully!`,
        type: 'success'
      });
      playBeep(987, 180);
    } else {
      setScanMessage({
        text: `FAILED: No invoice found matching "${searchQuery}"`,
        type: 'error'
      });
      playBeep(220, 300);
    }
  };

  const selectInvoice = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    setIsDelivering(invoice.deliveryStatus === 'Delivered');
    // Populate verified counts with 0 initially (or preset for convenience)
    const initialVerified: Record<string, number> = {};
    invoice.items.forEach(item => {
      initialVerified[item.sku] = invoice.deliveryStatus === 'Delivered' ? item.quantity : 0;
    });
    setWarehouseVerified(initialVerified);
    setScannerInput('');
  };

  // Standard barcodes helper to quick fill
  const availableSkusOfActiveBill = useMemo(() => {
    if (!activeInvoice) return [];
    return activeInvoice.items.map(it => it.sku);
  }, [activeInvoice]);

  // Warehouse barcode verification algorithm
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeInvoice) return;
    
    const code = scannerInput.trim().toUpperCase();
    if (!code) return;

    // Check if matching sku on current invoice
    const targetItem = activeInvoice.items.find(item => item.sku.toUpperCase() === code);

    if (targetItem) {
      const currentVal = warehouseVerified[targetItem.sku] || 0;
      if (currentVal >= targetItem.quantity) {
        setScanMessage({
          text: `WARNING: SKU ${targetItem.sku} is already fully scanned (${currentVal}/${targetItem.quantity})!`,
          type: 'error'
        });
        playBeep(440, 250);
      } else {
        const nextVal = currentVal + 1;
        setWarehouseVerified(prev => ({
          ...prev,
          [targetItem.sku]: nextVal
        }));
        setScanMessage({
          text: `SCANNED UNIT: ${targetItem.productName} SKU: ${targetItem.sku} count increased (${nextVal}/${targetItem.quantity})`,
          type: 'success'
        });
        playBeep(1046, 120); // High pitch friendly scan success beep
      }
    } else {
      setScanMessage({
        text: `INVALID SKU: "${code}" is not part of this customer invoice!`,
        type: 'error'
      });
      playBeep(180, 400); // Low failure buzz bzz
    }
    setScannerInput('');
  };

  // Helper scan each box
  const handleScanBoxIncrement = (sku: string) => {
    if (!activeInvoice) return;
    const targetItem = activeInvoice.items.find(item => item.sku === sku);
    if (!targetItem) return;

    const currentVal = warehouseVerified[sku] || 0;
    if (currentVal >= targetItem.quantity) {
      setScanMessage({
        text: `Limit met! SKU ${sku} is already complete.`,
        type: 'idle'
      });
      playBeep(440, 150);
      return;
    }

    setWarehouseVerified(prev => ({
      ...prev,
      [sku]: currentVal + 1
    }));
    playBeep(1046, 100);
  };

  const handleScanBoxDecrement = (sku: string) => {
    const currentVal = warehouseVerified[sku] || 0;
    if (currentVal <= 0) return;

    setWarehouseVerified(prev => ({
      ...prev,
      [sku]: currentVal - 1
    }));
    playBeep(659, 100);
  };

  // Manual Input Quantity override
  const handleManualQuantityChange = (sku: string, value: string) => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) return;
    
    setWarehouseVerified(prev => ({
      ...prev,
      [sku]: parsed
    }));
  };

  // Quick dispatch match trigger helper to auto fill quantities
  const handleCompleteAllQuantities = () => {
    if (!activeInvoice) return;
    const completed: Record<string, number> = {};
    activeInvoice.items.forEach(it => {
      completed[it.sku] = it.quantity;
    });
    setWarehouseVerified(completed);
    setScanMessage({
      text: "COMPLETE VERIFY: All item box quantities synced with invoice specs.",
      type: 'success'
    });
    playBeep(1318, 250);
  };

  const hasAllScanned = useMemo(() => {
    if (!activeInvoice) return false;
    return activeInvoice.items.every(it => {
      const scanned = warehouseVerified[it.sku] || 0;
      return scanned >= it.quantity;
    });
  }, [activeInvoice, warehouseVerified]);

  // Save/Finalize dispatch
  const handleFinalizeDispatch = async () => {
    if (!activeInvoice) return;

    const updatedInv = {
      ...activeInvoice,
      deliveryStatus: 'Delivered' as const,
      deliveryTimestamp: new Date().toISOString(),
      deliveredBy: staffName
    };

    try {
      await setDoc(doc(db, 'invoices', activeInvoice.invoiceNumber), updatedInv);
    } catch (err) {
      console.error("Error finalizing invoice dispatch:", err);
    }
    
    // Update current active view with Delivered attributes
    setActiveInvoice(updatedInv);

    // Beep double congrats chords!
    playBeep(880, 100);
    setTimeout(() => playBeep(1318, 200), 100);
    
    setScanMessage({
      text: `SUCCESS: Invoice ${activeInvoice.invoiceNumber} is fully dispatched & marked DELIVERED!`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 pt-2" id="warehouse-verification-portal">
      
      {/* 🏬 Top Informative Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-rose-950 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1.5Packed">
          <span className="text-[10px] font-mono font-extrabold uppercase bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30">
            Showroom Godown Gate App
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight mt-1 flex items-center gap-2">
            <span>🏬 Warehouse Stock Verification & Dispatch Desk</span>
          </h2>
          <p className="text-stone-300 text-xs mt-1 max-w-2xl leading-relaxed font-sans">
            Validate client-purchased boxes directly at the gate. Enter client numbers or slip barcodes to open invoices, run unit audits using barcode/SKU simulation tags, and confirm loading checklists before releasing the delivery vehicle.
          </p>
        </div>
        
        <div className="bg-stone-950/40 p-3 rounded-2xl border border-stone-800 shrink-0 self-end md:self-auto flex items-center gap-2.5">
          <User className="w-4 h-4 text-rose-450 shrink-0" />
          <div className="text-left">
            <span className="block text-[9px] font-mono text-stone-400 uppercase">Operator Shift</span>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="bg-transparent border-b border-stone-800 focus:border-rose-505 focus:outline-none text-xs font-bold text-white w-40"
              placeholder="Operator Name"
            />
          </div>
        </div>
      </div>

      {/* Main double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (Span 4): Lookup search panel & quick list */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bill lookup widget */}
          <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-3xs space-y-4">
            <h3 className="font-serif font-black text-stone-900 text-sm flex items-center gap-2">
              <Search className="w-4.5 h-4.5 text-rose-550" />
              <span>Invoice Search & Scan</span>
            </h3>

            <form onSubmit={handleQuerySearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. RPT-INV... OR Customer Phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 border border-stone-220 bg-stone-50 rounded-2xl text-xs font-medium focus:outline-none focus:border-stone-400 placeholder:text-stone-400 text-stone-900"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-900 transition-colors p-0.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Tweak search by typing phone numbers (e.g. <span className="font-mono bg-stone-100 rounded px-1">94312</span>) or typing invoice keys.
              </p>
            </form>
          </div>

          {/* Quick links to active/Pending customer lines */}
          <div className="bg-white border border-stone-200 rounded-3xl shadow-3xs overflow-hidden">
            <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-800 tracking-wider font-mono">
                ⏳ Unfulfilled Orders ({pendingInvoices.length})
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full font-mono">
                PENDING HANDOFFS
              </span>
            </div>

            <div className="divide-y divide-stone-150 max-h-56 overflow-y-auto">
              {pendingInvoices.length === 0 ? (
                <div className="p-5 text-center text-xs text-stone-450 italic">
                  No outstanding pending warehouse deliveries remaining! All cargo has been dispatched.
                </div>
              ) : (
                pendingInvoices.map((inv) => (
                  <button
                    key={inv.invoiceNumber}
                    onClick={() => selectInvoice(inv)}
                    className={`w-full p-3.5 text-left transition-all hover:bg-stone-50 flex justify-between items-center ${
                      activeInvoice?.invoiceNumber === inv.invoiceNumber ? 'bg-rose-50/40 border-l-4 border-l-rose-500' : ''
                    }`}
                  >
                    <div className="space-y-1 truncate pr-3">
                      <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <span className="font-mono text-[10.5px] font-black text-stone-850 bg-stone-100 px-1.5 py-0.5 rounded">
                          {inv.invoiceNumber.split('-').pop()}
                        </span>
                        <span className="truncate">{inv.customerName}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1.5">
                        <span>{inv.customerPhone}</span>
                        <span>•</span>
                        <span>{inv.items.length} materials</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Completed handoff archives */}
          <div className="bg-white border border-stone-200 rounded-3xl shadow-3xs overflow-hidden opacity-85">
            <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-800 tracking-wider font-mono">
                ✅ Done / Delivered Today ({deliveredInvoices.length})
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full font-mono">
                DISPATCHED GATEWAYS
              </span>
            </div>

            <div className="divide-y divide-stone-150 max-h-48 overflow-y-auto">
              {deliveredInvoices.length === 0 ? (
                <div className="p-4 text-center text-[10.5px] text-stone-400 italic">
                  No deliveries recorded on this session.
                </div>
              ) : (
                deliveredInvoices.map((inv) => (
                  <button
                    key={inv.invoiceNumber}
                    onClick={() => selectInvoice(inv)}
                    className={`w-full p-3 text-left transition-all hover:bg-stone-50 flex justify-between items-center ${
                      activeInvoice?.invoiceNumber === inv.invoiceNumber ? 'bg-emerald-50/15 border-l-3 border-l-emerald-555' : ''
                    }`}
                  >
                    <div className="space-y-0.5 truncate text-[11px] pr-2">
                      <span className="font-black text-emerald-900 block truncate">{inv.customerName}</span>
                      <span className="text-[9.5px] text-stone-400 font-mono block">Inv: {inv.invoiceNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Delivered
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Span 8): Active Invoice Dispatch Verification Workstation */}
        <div className="lg:col-span-8">
          
          {!activeInvoice ? (
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center text-stone-500 flex flex-col items-center justify-center space-y-4 min-h-[450px]">
              <Barcode className="w-16 h-16 text-stone-300 animate-pulse" />
              <div className="space-y-1.5 max-w-lg">
                <h4 className="font-serif font-black text-stone-800 text-lg">Workstation Standby</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  No invoice selected. Type an invoice ID (e.g. try searching <strong className="text-stone-900">Asim</strong>, <strong className="text-stone-900">Vikas</strong> inside the lookup field) or select an order from the unfulfilled listing side-grid to initiate direct handoff audits.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Active Bill Description Block */}
              <div className="bg-white border border-stone-200 rounded-3xl shadow-3xs overflow-hidden">
                <div className={`p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  activeInvoice.deliveryStatus === 'Delivered' 
                    ? 'bg-emerald-650' 
                    : 'bg-stone-950'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase bg-white/20 px-2.5 py-0.5 rounded-md">
                      {activeInvoice.deliveryStatus === 'Delivered' ? 'GATE RELEASE AUTHORIZED' : 'VERIFICATION UNDERWAY'}
                    </span>
                    <h3 className="text-lg font-serif font-black tracking-tight flex items-center gap-2">
                      <span>Invoice: {activeInvoice.invoiceNumber}</span>
                    </h3>
                    <p className="text-white/80 text-[11px] font-mono flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ordered Time: {new Date(activeInvoice.timestamp).toLocaleString()}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-xs font-black uppercase font-mono py-1 px-3.5 rounded-full flex items-center gap-1.5 shadow-xs ${
                      activeInvoice.deliveryStatus === 'Delivered'
                        ? 'bg-white text-emerald-800'
                        : 'bg-amber-500 text-stone-950 animate-bounce'
                    }`}>
                      {activeInvoice.deliveryStatus === 'Delivered' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-650" />
                          <span>Status: DELIVERED</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-stone-950" />
                          <span>Status: PENDING DISPATCH</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans border-b border-stone-150 bg-stone-50/50">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-stone-400 font-bold block">1. Customer Name</span>
                    <span className="font-black text-stone-900 flex items-center gap-1 text-[11.5px]">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {activeInvoice.customerName}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-stone-400 font-bold block">2. Phone Destination</span>
                    <span className="font-bold text-stone-800 flex items-center gap-1 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {activeInvoice.customerPhone}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-stone-400 font-bold block">3. Site Handoff Address</span>
                    <span className="font-medium text-stone-650 flex items-center gap-1 leading-normal">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate" title={activeInvoice.customerAddress}>{activeInvoice.customerAddress}</span>
                    </span>
                  </div>
                </div>

                {/* Specific Delivery Handoff Details if completed */}
                {activeInvoice.deliveryStatus === 'Delivered' && (
                  <div className="p-3 px-5 bg-emerald-50 text-emerald-990 text-[11.5px] font-sans border-b border-emerald-150 flex flex-col sm:flex-row justify-between gap-1.5 font-semibold">
                    <div className="flex items-center gap-1 text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Cargo checked-out from showroom main lockups & shipped successfully!</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-emerald-700">
                      <span>Gate Keeper: {activeInvoice.deliveredBy || 'Staff'} • Time: {new Date(activeInvoice.deliveryTimestamp || '').toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Conditional Begin Delivery Button */}
                {activeInvoice.deliveryStatus !== 'Delivered' && !isDelivering && (
                  <div className="p-8 bg-amber-500/5 text-center space-y-4 border-b border-stone-200">
                    <div className="max-w-md mx-auto space-y-3">
                      <Truck className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                      <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Delivery Outstanding Handoff</h4>
                      <p className="text-stone-500 text-xs leading-relaxed">
                        This invoice has been billed in the showroom and is pending gate release. Click below to start the warehouse cargo verification.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDelivering(true);
                          playBeep(1200, 150);
                        }}
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white hover:bg-stone-850 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Start Verification & Delivery Scan</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SCANNER WORKFLOW INTERFACE */}
                {activeInvoice.deliveryStatus !== 'Delivered' && isDelivering && (
                  <div className="p-5 border-b border-stone-150 bg-rose-50/15 text-xs text-stone-900 space-y-3.5" id="warehouse-active-scanner-bar">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <span className="font-black uppercase tracking-wider text-stone-800 text-[11px] block">
                          ⚡ LIVE BARCODE / SKU GATE SCANNER SIMULATION
                        </span>
                        <p className="text-stone-500 font-sans text-[10.5px]">
                          Warehouse clerks can type or copy-paste any product SKU below to simulate scanned crates or crates checkout signals.
                        </p>
                      </div>

                      {/* Cheat-sheet tags */}
                      <div className="flex flex-wrap gap-1 items-center shrink-0">
                        <span className="text-[9px] text-stone-400 font-mono">Invoice SKUs:</span>
                        {availableSkusOfActiveBill.map(s => (
                          <button
                            key={s}
                            onClick={() => {
                              setScannerInput(s);
                              playBeep(650, 60);
                            }}
                            className="bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-mono text-[10px] text-stone-700 px-1.5 py-0.5 border border-stone-200 rounded font-bold cursor-pointer"
                            title="Auto fill this SKU payload"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <Barcode className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Type or click SKU code (e.g. TL-CAL-GC6012) then hit Enter to scan..."
                          value={scannerInput}
                          onChange={(e) => setScannerInput(e.target.value)}
                          className="w-full pl-9 pr-2.5 py-2 border border-stone-300 bg-white rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-rose-500 text-stone-900 leading-normal"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 bg-stone-950 text-white font-bold rounded-xl text-xs hover:bg-stone-800 hover:border-stone-400 active:bg-stone-900 border border-transparent transition-all shrink-0 cursor-pointer"
                      >
                        Scan Box
                      </button>
                    </form>

                    {/* Status Alert Badge */}
                    <div className={`p-2.5 rounded-xl text-center font-mono font-bold text-[10px] border flex items-center justify-center gap-1.5 ${
                      scanMessage.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : scanMessage.type === 'error'
                        ? 'bg-rose-50 border-rose-100 text-rose-800 animate-shake'
                        : 'bg-stone-100 border-stone-200 text-stone-550'
                    }`}>
                      <Play className={`w-3 h-3 ${scanMessage.type === 'success' ? 'text-emerald-500 fill-emerald-500' : 'text-stone-405'}`} />
                      <span>{scanMessage.text}</span>
                    </div>

                  </div>
                )}

                {/* DISPATCH ITEMS VERIFICATION ROW */}
                <div className="p-0">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 font-bold font-mono text-[9.5px]">
                        <th className="p-3 pb-2">Material / Product Description</th>
                        <th className="p-3 pb-2 text-center w-24">Req. Boxes</th>
                        <th className="p-3 pb-2 text-center w-52 print:hidden">Verify Quantities (Dual-Mode)</th>
                        <th className="p-3 pb-2 text-right w-24">Verified / Scanned</th>
                        <th className="p-3 pb-2 text-center w-16">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150">
                      {activeInvoice.items.map((item, index) => {
                        const verifiedCount = warehouseVerified[item.sku] || 0;
                        const isDoneAndMatched = verifiedCount >= item.quantity;
                        
                        return (
                          <tr 
                            key={`${item.sku}-${index}`} 
                            className={`transition-colors font-sans ${
                              isDoneAndMatched 
                                ? 'bg-emerald-50/15 hover:bg-emerald-50/20' 
                                : verifiedCount > 0 
                                ? 'bg-amber-50/10 hover:bg-amber-50/15' 
                                : 'hover:bg-stone-50/50'
                            }`}
                          >
                            <td className="p-3.5 space-y-1">
                              <span className="font-bold text-stone-900 block text-[11.5px]">{item.productName}</span>
                              <div className="text-[10px] text-stone-450 font-mono space-x-2">
                                <span className="bg-stone-100 text-stone-700 px-1 rounded font-semibold">{item.sku}</span>
                                <span>Size: {item.size}</span>
                                <span>Unit: {item.unit}</span>
                              </div>
                            </td>
                            
                            <td className="p-3.5 text-center font-bold text-stone-800 font-mono text-xs">
                              {item.quantity} {item.unit}
                            </td>

                            {/* DUAL MODE CONTROL CELL */}
                            <td className="p-3.5 print:hidden">
                              {activeInvoice.deliveryStatus === 'Delivered' ? (
                                <div className="text-center text-[10px] text-emerald-600 font-semibold italic">
                                  Matched & released ✓
                                </div>
                              ) : !isDelivering ? (
                                <div className="text-center text-[10px] text-stone-400 font-medium italic select-none">
                                  🕒 Pending Verification Start
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2 p-1.5 bg-stone-50 border border-stone-200 rounded-xl max-w-sm mx-auto">
                                  
                                  {/* Mode 1: Box Scan Tick (+1 / -1) */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] text-stone-550 font-bold font-mono">Scan Unit:</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleScanBoxDecrement(item.sku)}
                                        className="p-1 px-2 border border-stone-300 hover:bg-stone-200 active:bg-stone-300 transition-colors text-[9.5px] font-bold rounded-lg cursor-pointer text-stone-700"
                                        title="Decrease scanned box units"
                                      >
                                        -1
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => handleScanBoxIncrement(item.sku)}
                                        className="p-1 px-[10px] bg-stone-950 text-white hover:bg-stone-900 active:bg-stone-950 transition-colors text-[9.5px] font-black rounded-lg cursor-pointer flex items-center gap-0.5"
                                        title="Simulate physical scanner hit"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>Scan Box (+1)</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Mode 2: Direct Manual Override Input */}
                                  <div className="flex items-center justify-between border-t border-stone-150 pt-1.5 mt-0.5">
                                    <span className="text-[9.5px] text-stone-550 font-bold font-mono">Direct Input:</span>
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <input
                                        type="number"
                                        value={warehouseVerified[item.sku] ?? ''}
                                        onChange={(e) => handleManualQuantityChange(item.sku, e.target.value)}
                                        placeholder="0"
                                        className="w-16 px-1.5 py-0.5 border border-stone-300 bg-white text-stone-950 font-bold rounded text-center text-[10.5px] focus:outline-none focus:border-stone-400"
                                      />
                                      <span className="text-[9px] text-stone-400">{item.unit}</span>
                                    </div>
                                  </div>

                                </div>
                              )}
                            </td>

                            <td className="p-3.5 text-right">
                              <span className={`font-mono font-black text-xs ${isDoneAndMatched ? 'text-emerald-705' : 'text-stone-850'}`}>
                                {verifiedCount}
                              </span>
                              <span className="text-stone-400 font-medium text-[10px] font-sans"> / {item.quantity}</span>
                              <div className="w-full bg-stone-150 h-1 rounded-full overflow-hidden mt-1 max-w-[80px] ml-auto">
                                <div 
                                  className={`h-full ${isDoneAndMatched ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                  style={{ width: `${Math.min(100, (verifiedCount / item.quantity) * 100)}%` }}
                                />
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              {isDoneAndMatched ? (
                                <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase animate-scaleUp">
                                  Done
                                </span>
                              ) : verifiedCount > 0 ? (
                                <span className="bg-amber-105 text-amber-900 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase animate-pulse">
                                  Scannin
                                </span>
                              ) : (
                                <span className="bg-stone-105 text-stone-500 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                                  Wait
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION: FINAL RELEASE CONFIRMATION CAPEX */}
              {activeInvoice.deliveryStatus !== 'Delivered' && isDelivering && (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-3xs flex flex-col md:flex-row justify-between items-center gap-6" id="dispatch-final-actions-panel">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-stone-400 block">
                      Gate Dispatch Clearance Stamp
                    </span>
                    <h4 className="font-serif font-black text-stone-900 text-sm flex items-center gap-1.5">
                      <ClipboardCheck className="w-4.5 h-4.5 text-rose-550" />
                      <span>Verify Cargo Deliveries Checklist</span>
                    </h4>
                    <p className="text-[10.5px] text-stone-550 max-w-xl leading-relaxed">
                      Please confirm that the verified scanned boxes match each ordered description on the receipt. Clicking "Finalize" permanently archives this client outstanding list and changes its system state to <strong>Delivered</strong>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleCompleteAllQuantities}
                      className="flex-1 md:flex-initial px-4 h-11 border border-stone-300 hover:border-stone-405 text-stone-700 bg-stone-50 text-[11px] font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      title="Cheating method for easy debug validation"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                      <span>Complete All Scans (Speedy)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalizeDispatch}
                      disabled={!hasAllScanned}
                      className={`flex-1 md:flex-initial px-6 h-11 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm ${
                        hasAllScanned 
                          ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer text-white animate-bounce' 
                          : 'bg-stone-150 text-stone-400 cursor-not-allowed border border-stone-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Finalize Gate Release ✓</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Show hint warnings if not all scanned */}
              {activeInvoice.deliveryStatus !== 'Delivered' && isDelivering && !hasAllScanned && (
                <div className="bg-amber-100/50 border border-amber-250 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 font-medium">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    <strong>Notice:</strong> The "Finalize Gate Release" button is locked. Warehouse staff must either use the global SKU code input to register crates or utilize the unit/input sliders to match required counts to clear the delivery checks.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Icon helper function fallback
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
