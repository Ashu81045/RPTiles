/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Search, Plus, Minus, Trash2, Printer, FileText, 
  ShoppingCart, User, Phone, CheckCircle, CreditCard, 
  Receipt, Landmark, Coins, ChevronRight, Sparkles, X, Compass, MapPin,
  IndianRupee, TrendingUp, History, QrCode, Smartphone
} from 'lucide-react';

const LOCAL_STORAGE_INVOICES_KEY = 'ceramica_catalog_invoices';

const DEFAULT_INVOICES: Invoice[] = [
  {
    invoiceNumber: 'RPT-INV-2606-4832',
    customerName: 'Asim Bakhtiyar',
    customerPhone: '+91 94312 87311',
    customerAddress: 'Ward No 12, Ashram Road, Araria - 854311',
    items: [
      {
        productName: 'Calacatta Gold Polished Porcelain Tile',
        sku: 'TL-CAL-GC6012',
        price: 4.85,
        quantity: 500,
        unit: 'sqft',
        size: '60x120 cm',
        total: 2425
      },
      {
        productName: 'Nero Portoro Marble Pedestal Basin',
        sku: 'SW-BSN-NP9045',
        price: 1450,
        quantity: 1,
        unit: 'pcs',
        size: '90x45 cm',
        total: 1450
      }
    ],
    subtotal: 3875,
    discountRate: 5,
    discountAmount: 193.75,
    taxRate: 18,
    taxAmount: 662.625,
    grandTotal: 4343.875,
    paymentMethod: 'UPI',
    timestamp: '2026-06-15T14:30:00.000Z'
  },
  {
    invoiceNumber: 'RPT-INV-2606-1294',
    customerName: 'Vikas Kumar',
    customerPhone: '+91 88775 51223',
    customerAddress: 'Mirzapur Colony, Near Bus Stand, Araria',
    items: [
      {
        productName: 'Charcoal Slate Structured Stone Tile',
        sku: 'TL-SLT-CC3060',
        price: 3.95,
        quantity: 800,
        unit: 'sqft',
        size: '30x60 cm',
        total: 3160
      }
    ],
    subtotal: 3160,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 568.8,
    grandTotal: 3728.8,
    paymentMethod: 'Bank Transfer',
    timestamp: '2026-06-16T09:15:00.000Z'
  },
  {
    invoiceNumber: 'RPT-INV-2606-9043',
    customerName: 'Araria Modern Builders',
    customerPhone: '+91 70041 29482',
    customerAddress: 'NH-57 Lane Project Site, Araria',
    items: [
      {
        productName: 'Calacatta Gold Polished Porcelain Tile',
        sku: 'TL-CAL-GC6012',
        price: 4.85,
        quantity: 200,
        unit: 'sqft',
        size: '60x120 cm',
        total: 970
      }
    ],
    subtotal: 970,
    discountRate: 10,
    discountAmount: 97,
    taxRate: 18,
    taxAmount: 157.14,
    grandTotal: 1030.14,
    paymentMethod: 'Cash',
    timestamp: '2026-06-17T11:00:00.000Z'
  }
];

interface BillingSystemProps {
  products: Product[];
  onUpdateStock: (id: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUST', reason: string) => void;
  onConnectPhone?: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    unit: string;
    size: string;
    total: number;
  }[];
  subtotal: number;
  discountRate: number; // e.g. 10 for 10%
  discountAmount: number;
  taxRate: number; // e.g. 18 for 18% GST standard
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  timestamp: string;
}

export default function BillingSystem({ products, onUpdateStock, onConnectPhone }: BillingSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18); // Default real-world GST/tax for premium tiling

  // Receipt Modal State
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Invoices Register & Sub-Tabs State
  const [billingSubTab, setBillingSubTab] = useState<'checkout' | 'insights'>('checkout');
  
  // Real-time Barcode / QR Code Scanner Simulation states
  const [isScannerOpen, setIsScannerOpen] = useState(true);
  const [manualScanInput, setManualScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{ text: string; type: 'success' | 'error' | 'idle' }>({
    text: 'Scanner Standby - READY',
    type: 'idle'
  });

  const [useRealCamera, setUseRealCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live Mobile/Phone Camera integration using html5-qrcode
  useEffect(() => {
    if (!useRealCamera || !isScannerOpen) return;
    setCameraError(null);

    let html5QrCode: Html5Qrcode | null = null;
    const qrRegionId = "real-camera-scan-region";

    // Small delay to make sure the container DIV has been fully rendered in DOM layout
    const timer = setTimeout(() => {
      try {
        const element = document.getElementById(qrRegionId);
        if (!element) {
          console.warn("Camera viewport element missing can't mount.");
          return;
        }
        
        html5QrCode = new Html5Qrcode(qrRegionId);
        
        // Let's keep track of last scanned time to prevent scanning the same product multiple times in 2 seconds
        let lastScannedText = "";
        let lastScannedTime = 0;

        html5QrCode.start(
          { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, // Request High Definition video stream and back camera for high sharpness
          {
            fps: 30, // Double the frame capturing polling rate for scanning on the fly
            qrbox: (width, height) => {
              const minDimension = Math.min(width, height);
              const size = Math.floor(minDimension * 0.85); // Generous 85% area target alignment area
              return { width: size, height: size };
            },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true // Enable native Web API hardware acceleration on phones
            }
          } as any,
          (decodedText) => {
            const now = Date.now();
            if (decodedText === lastScannedText && (now - lastScannedTime) < 2200) {
              // Throttle repeat scans for the same item to prevent double checkouts
              return;
            }
            lastScannedText = decodedText;
            lastScannedTime = now;
            
            // Execute product code scanning match
            handleScannerScan(decodedText);
          },
          (errorMessage) => {
            // Silence frame-by-frame debug failure callbacks
          }
        ).catch((err) => {
          console.error("Camera permissions check or camera start failed:", err);
          setCameraError("Failed! Please grant Camera permission in your phone/browser settings to scan QR Codes.");
          setUseRealCamera(false);
        });
      } catch (ex: any) {
        console.error("html5-qrcode constructor exception:", ex);
        setCameraError("Camera device failed to initiate on this screen.");
        setUseRealCamera(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      if (html5QrCode) {
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              html5QrCode?.clear();
            }).catch(e => {
              console.warn("Failed stopping html5-qrcode cleanly:", e);
            });
          }
        } catch (err) {
          console.error("html5-qrcode stop state exception:", err);
        }
      }
    };
  }, [useRealCamera, isScannerOpen]);

  // Sound Synth Beep Generator for hand-held register mock feedback
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1150, audioCtx.currentTime); // Standard register beep frequency
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime); // Soft volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 85);
    } catch (e) {
      console.warn('AudioContext beep blocked by browser gesture sandbox.', e);
    }
  };

  // Automated Scanning Action
  const handleScannerScan = (scannedSku: string) => {
    const cleanSku = scannedSku.trim().toUpperCase();
    if (!cleanSku) {
      setScanStatus({ text: 'Please enter or select a SKU code to scan!', type: 'error' });
      return;
    }

    const matchedProduct = products.find(p => p.sku.toUpperCase() === cleanSku);
    if (!matchedProduct) {
      setScanStatus({ text: `❌ SKU "${cleanSku}" NOT found in showroom directory!`, type: 'error' });
      // Play error buzz
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(150, audioCtx.currentTime); // Low buzz
        osc.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); audioCtx.close(); }, 200);
      } catch (err) {}
      return;
    }

    if (matchedProduct.stock <= 0) {
      setScanStatus({ text: `🚫 SKU "${cleanSku}" exists but is OUT OF STOCK.`, type: 'error' });
      return;
    }

    // Call active billing addition logic
    handleAddToBill(matchedProduct);

    // Success feedback
    playScanBeep();
    setScanStatus({
      text: `✓ Success! Scanned "${matchedProduct.sku}" • Added 1 unit of ${matchedProduct.name}`,
      type: 'success'
    });
    setManualScanInput('');

    // Decay message back to idle
    setTimeout(() => {
      setScanStatus(prev => prev.text.includes(matchedProduct.sku) ? { text: 'Scanner Standby - READY', type: 'idle' } : prev);
    }, 4500);
  };

  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_INVOICES;
      }
    }
    return DEFAULT_INVOICES;
  });

  // Business Insights Calculations
  const insights = useMemo(() => {
    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    const paymentDistribution: Record<string, number> = { UPI: 0, Cash: 0, Card: 0, 'Bank Transfer': 0 };
    const productSales: Record<string, { name: string; sku: string; qty: number; revenue: number; unit: string }> = {};

    invoices.forEach(inv => {
      totalRevenue += inv.grandTotal;
      totalTax += inv.taxAmount;
      totalDiscount += inv.discountAmount;
      
      const method = inv.paymentMethod || 'Cash';
      paymentDistribution[method] = (paymentDistribution[method] || 0) + inv.grandTotal;

      inv.items.forEach(it => {
        if (!productSales[it.sku]) {
          productSales[it.sku] = {
            name: it.productName,
            sku: it.sku,
            qty: 0,
            revenue: 0,
            unit: it.unit
          };
        }
        productSales[it.sku].qty += it.quantity;
        productSales[it.sku].revenue += it.total;
      });
    });

    const bestSellers = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const avgTicketValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalRevenue,
      totalTax,
      totalDiscount,
      paymentDistribution,
      bestSellers,
      avgTicketValue
    };
  }, [invoices]);

  // Subcategories extract for filtering products
  const subcategories = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => list.add(p.subcategory));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Filtered Products for fetching in POS
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.material.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSub = selectedSubcategory === 'All' || p.subcategory === selectedSubcategory;
      return matchSearch && matchSub;
    });
  }, [products, searchQuery, selectedSubcategory]);

  // Add Item to Bill Cart
  const handleAddToBill = (product: Product) => {
    // Check if product is out of stock in real world
    if (product.stock <= 0) {
      alert(`SKU ${product.sku} is currently out of stock in the warehouse. Please restock before billing!`);
      return;
    }

    const existingCartItem = cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      alert(`Cannot add more. Available warehouse inventory is limited to ${product.stock} ${product.unit}.`);
      return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Update Cart Qty
  const handleUpdateCartQty = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          
          // Stock ceiling validation
          if (newQty > product.stock) {
            alert(`Maximum quantity reached. Only ${product.stock} ${product.unit} are available in stock.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  // Delete Cart Item
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculations
  const calculatedTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * gstPercent) / 100;
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    };
  }, [cart, discountPercent, gstPercent]);

  // Process and Submit Real Invoice
  const handleProcessAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your billing cart is empty. Please select products from the left panel to begin.');
      return;
    }

    // Double validation on quantities against live inventory counts
    for (const item of cart) {
      const liveProduct = products.find(p => p.id === item.product.id);
      if (!liveProduct) {
        alert(`Product ${item.product.name} no longer exists in database.`);
        return;
      }
      if (item.quantity > liveProduct.stock) {
        alert(`Stock count updated elsewhere! Only ${liveProduct.stock} ${liveProduct.unit} of ${liveProduct.name} remaining, but cart has ${item.quantity}.`);
        return;
      }
    }

    // Generate Invoice Number
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `RPT-INV-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${randCode}`;

    // Prepare Invoice Document Record
    const preparedInvoice: Invoice = {
      invoiceNumber,
      customerName: customerName.trim() || 'Valued Walk-In Client',
      customerPhone: customerPhone.trim() || 'N/A',
      customerAddress: customerAddress.trim() || 'Counter Sale (RP Tiles Showroom, Araria)',
      items: cart.map(item => ({
        productName: item.product.name,
        sku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        size: item.product.size,
        total: item.product.price * item.quantity
      })),
      subtotal: calculatedTotals.subtotal,
      discountRate: discountPercent,
      discountAmount: calculatedTotals.discountAmount,
      taxRate: gstPercent,
      taxAmount: calculatedTotals.taxAmount,
      grandTotal: calculatedTotals.grandTotal,
      paymentMethod,
      timestamp: new Date().toISOString()
    };

    // Substract Stock counts permanently from Main Inventory!
    cart.forEach(item => {
      onUpdateStock(
        item.product.id,
        item.quantity,
        'OUT',
        `Sales POS Invoice ${invoiceNumber} issued to user ${preparedInvoice.customerName}`
      );
    });

    // Clear state & show high fidelity invoice layout
    setCurrentInvoice(preparedInvoice);
    setIsSuccessModalOpen(true);
    setInvoices(prev => {
      const updated = [preparedInvoice, ...prev];
      localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(updated));
      return updated;
    });
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountPercent(0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing-container">
      {/* Overview Intro Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-stone-800" id="pos-banner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital POS Station</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold tracking-tight text-white mb-2">Real-Time Commercial Billing Desk</h2>
          <p className="text-stone-400 text-xs max-w-xl leading-relaxed">
            Search items seamlessly, confirm active warehouse inventory balances, insert customer profiles, and process tax-compliant invoices. Quantities are instantly decremented from the master inventory records.
          </p>
        </div>
        <div className="z-10 flex gap-4 bg-stone-850/70 p-4 rounded-2xl border border-stone-800 backdrop-blur">
          <div className="text-center px-2">
            <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mb-1">POS Sales Status</p>
            <div className="flex items-center text-xs font-bold text-emerald-400 space-x-1 justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LIVE TAX SERVER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200/80 gap-6 mt-2" id="billing-subtabs">
        <button
          onClick={() => setBillingSubTab('checkout')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-1.5 cursor-pointer ${
            billingSubTab === 'checkout'
              ? 'text-stone-900 border-b-2 border-amber-500 font-extrabold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale Checkout</span>
        </button>
        <button
          id="btn-pos-insights"
          onClick={() => setBillingSubTab('insights')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-1.5 cursor-pointer ${
            billingSubTab === 'insights'
              ? 'text-stone-900 border-b-2 border-amber-500 font-extrabold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Invoices History & Business Insights ({invoices.length})</span>
        </button>
      </div>

      {billingSubTab === 'checkout' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pos-grid">
        
        {/* Left Column: Product Selection Catalog Section (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4" id="pos-search-panel">

          {/* Virtual High-Speed Barcode / QR Code wedged cash-register POS Scanner */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Inline Scanner Animations Style sheet */}
            <style>{`
              @keyframes scanLineSweep {
                0% { top: 4%; opacity: 0.8; }
                50% { top: 96%; opacity: 0.95; }
                100% { top: 4%; opacity: 0.8; }
              }
            `}</style>

            {/* Header / Config Bar */}
            <div className="bg-stone-900 px-4 py-2.5 flex items-center justify-between text-white border-b border-stone-850">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScannerOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isScannerOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-[10.5px] font-black uppercase font-sans tracking-wide">
                  Showroom QR/SKU Scanner Terminal
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {isScannerOpen && (
                  <span className="bg-emerald-950/60 border border-emerald-800/80 text-[8px] font-extrabold text-emerald-400 px-2 py-1 rounded uppercase tracking-wider flex items-center space-x-1">
                    <span className="relative flex h-1.5 w-1.5 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300"></span>
                    </span>
                    <span>Camera Reader Active</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsScannerOpen(!isScannerOpen);
                    playScanBeep();
                  }}
                  className={`px-2 py-1 text-[9px] rounded-md font-bold transition-all uppercase tracking-tight border cursor-pointer ${
                    isScannerOpen 
                      ? 'bg-stone-850 hover:bg-stone-950 border-stone-700 text-stone-300' 
                      : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white'
                  }`}
                >
                  <span>{isScannerOpen ? '📶 Power Off' : '🔌 Power On'}</span>
                </button>
              </div>
            </div>

            {isScannerOpen && (
              <div className="p-4 bg-stone-50/50 space-y-3 font-sans text-xs">
                {/* Camera Permission/Fail Error banner */}
                {cameraError && (
                  <div className="bg-rose-50 border border-rose-250 rounded-xl p-2.5 text-rose-850 text-[10.5px] font-sans flex items-start space-x-2 animate-pulse">
                    <span className="text-rose-600 font-extrabold text-[11px] uppercase tracking-wider block">⚠️ Connection Error:</span>
                    <p className="flex-1 leading-normal font-medium">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="text-[10px] underline font-bold hover:text-stone-900 ml-1.5 cursor-pointer bg-transparent border-none"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Active scan results feed banner */}
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all duration-300 ${
                  scanStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-850 font-semibold' 
                    : scanStatus.type === 'error'
                    ? 'bg-rose-50 border-rose-250 text-rose-850 font-semibold'
                    : 'bg-stone-900 border-stone-850 text-stone-400 font-mono text-[10.5px]'
                }`}>
                  <div className="flex-shrink-0">
                    {scanStatus.type === 'success' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                    ) : scanStatus.type === 'error' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping" />
                    )}
                  </div>
                  <p className="truncate flex-1 leading-tight">{scanStatus.text}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Camera lens viewports (md:col-span-6) */}
                  <div className="md:col-span-6 bg-stone-950 rounded-2xl relative overflow-hidden h-72 sm:h-80 flex flex-col items-center justify-center border border-stone-850 shadow-md">
                    <div className="absolute inset-0 flex flex-col justify-end bg-stone-900 overflow-hidden">
                      {/* The HTML5 Qr Code element target */}
                      <div id="real-camera-scan-region" className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                      
                      {/* Target alignment framing overlay with beautiful borders */}
                      <div className="absolute inset-x-8 inset-y-8 border-2 border-dashed border-emerald-400 rounded-2xl pointer-events-none z-10 flex items-center justify-center bg-transparent">
                        <span className="w-12 h-[2px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse"></span>
                      </div>
                      
                      {/* Holographic glowing scan line sweep for high polish */}
                      <div 
                        className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_12px_#34d399] z-20 pointer-events-none" 
                        style={{ animation: 'scanLineSweep 2.2s infinite linear' }}
                      />

                      {/* Scanner hint footer tag */}
                      <div className="absolute bottom-3 inset-x-0 text-center z-20">
                        <span className="bg-stone-950/80 backdrop-blur-md text-[9px] px-2.5 py-1 rounded-md text-emerald-400 font-mono tracking-wider border border-emerald-930">
                          LIVE CAMERA VIEWPORT ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Wedged Input controls (md:col-span-6) */}
                  <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-[10.5px] font-black text-stone-900 uppercase tracking-widest font-mono">
                        📸 Camera Scan Controller
                      </label>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Position your phone camera directly over any printed/displayed showroom product QR tag to register it in the current invoice bill instantly.
                      </p>
                    </div>

                    {/* Active call to connect real camera if function is provided */}
                    {onConnectPhone && (
                      <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-3 flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                            <Smartphone className="w-4 h-4 animate-bounce" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-850 block">Got Another Phone?</span>
                            <span className="text-[9.5px] text-stone-500 block leading-tight mt-0.5">Show connection QR setup instructions</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onConnectPhone}
                          className="bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] text-white px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-tight transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          Show Connect QR
                        </button>
                      </div>
                    )}

                    {/* Quick demo hotkeys representing fast clicking */}
                    <div>
                      <span className="text-[8.5px] font-bold uppercase text-stone-400 block mb-1">Click to simulate scanning under laser:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {products.slice(0, 4).map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleScannerScan(p.sku)}
                            className="bg-white hover:bg-stone-100 text-stone-750 border border-stone-200 hover:border-amber-500/50 py-1 px-1.5 rounded-lg font-mono text-[9px] font-bold transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                            title={`Aim and scan SKU ${p.sku}`}
                          >
                            <span className="w-1 h-3 flex items-center justify-center font-sans text-[7px] font-black bg-stone-900 border border-amber-500 rounded text-amber-500 mr-0.5">SCAN</span>
                            <span>{p.sku}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input field for manual barcode search */}
                    <div className="flex space-x-1.5" id="pos-manual-trigger-wrapper">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Type/paste any created SKU..."
                          value={manualScanInput}
                          onChange={(e) => setManualScanInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleScannerScan(manualScanInput);
                            }
                          }}
                          className="w-full pl-2.5 pr-2 py-1.5 text-xs border border-stone-200 bg-white font-mono uppercase font-bold focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleScannerScan(manualScanInput)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
                        title="Add to invoice"
                      >
                        <span>Scan Code</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Search, Filter Tools */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                id="pos-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU model, marble variant, color finish..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-850 focus:border-stone-850 transition-colors"
              />
            </div>
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1">
              {subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                    selectedSubcategory === sub
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm" id="pos-product-list">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 font-mono">
              Available Items ({filteredProducts.length})
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No matching ceramic series, fittings or tiles available in inventory.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.stock <= 0;
                  const isInLowStock = p.stock > 0 && p.stock <= p.minStock;
                  // Count in current billing cart
                  const inCartItem = cart.find(item => item.product.id === p.id);
                  const inCartQty = inCartItem ? inCartItem.quantity : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddToBill(p)}
                      className={`group border rounded-xl p-3 flex flex-col justify-between transition-all relative ${
                        isOutOfStock 
                          ? 'bg-stone-50/75 border-stone-100 opacity-65 cursor-not-allowed'
                          : 'bg-white border-stone-200 hover:border-amber-500/70 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      {/* Top Tag row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            {p.subcategory}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 mt-1 truncate group-hover:text-amber-600 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-[10px] font-mono text-stone-500 mt-0.5">{p.sku}</p>
                        </div>
                        
                        {/* Img Micro thumbnail */}
                        <img 
                          src={p.image} 
                          alt="" 
                          className="w-9 h-9 object-cover rounded-md border border-stone-100 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Stock Specs Footer */}
                      <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold leading-none">Price Per Unit</p>
                          <span className="font-bold text-stone-900 mt-1 inline-block">
                            ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}<span className="text-[10px] text-stone-400 font-normal">/{p.unit}</span>
                          </span>
                        </div>

                        {/* Stock value */}
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold leading-none mb-0.5">Warehouse</p>
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">SOLD OUT</span>
                          ) : (
                            <span className={`font-mono font-bold ${isInLowStock ? 'text-amber-500 bg-amber-50 px-1 rounded' : 'text-stone-700'}`}>
                              {p.stock} {p.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Cart Overlay badge counter */}
                      {inCartQty > 0 && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                          {inCartQty}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: POS Active Cart and Checkout (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4" id="pos-billing-cart">
          <form onSubmit={handleProcessAndPay} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5 flex-1 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header Title count */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-stone-900 font-sans">Active Bill Cart</h3>
                </div>
                <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full font-mono font-bold text-stone-600">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </div>

              {/* Cart Items listing */}
              {cart.length === 0 ? (
                <div className="py-14 text-center text-stone-405 flex flex-col items-center justify-center">
                  <Receipt className="w-10 h-10 text-stone-300 mb-2" />
                  <p className="text-xs font-semibold text-stone-500">Billing invoice is blank</p>
                  <p className="text-[10.5px] text-stone-400 mt-1 max-w-xs">
                    Please tap any of the products on the left menu with available stock units to add them to your professional sale invoice.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div 
                      key={item.product.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 bg-stone-50/75 hover:bg-stone-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center space-x-1.5">
                          <h5 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h5>
                          <span className="text-[8.5px] bg-stone-200 px-1 py-0.2 rounded text-stone-600 uppercase flex-shrink-0 font-mono">
                            {item.product.unit}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                          ₹{item.product.price.toLocaleString('en-IN')} / {item.product.unit} • <span className="font-semibold text-stone-700">{item.product.sku}</span>
                        </p>
                        {(() => {
                          const p = item.product;
                          let helperText = '';
                          
                          if (p.category === 'Tiles') {
                            const cov = p.boxCoverage || 12.5;
                            const boxes = (item.quantity / cov).toFixed(1);
                            const totalPcs = Math.ceil(item.quantity / cov) * (p.itemsPerBox || 4);
                            helperText = `📦 Packing: ${boxes} boxes (${totalPcs} pcs)`;
                            if (p.weightPerBox) {
                              const weight = (Math.ceil(item.quantity / cov) * p.weightPerBox).toFixed(0);
                              helperText += ` • ~${weight}kg cargo`;
                            }
                          } else if (p.itemsPerBox) {
                            const boxes = Math.ceil(item.quantity / p.itemsPerBox);
                            helperText = `📦 Packing: ${boxes} cartons (${p.itemsPerBox} pcs/ctn)`;
                            if (p.weightPerBox) {
                              const weight = (boxes * p.weightPerBox).toFixed(0);
                              helperText += ` • ~${weight}kg cargo`;
                            }
                          } else {
                            helperText = `📦 Invoiced Unit: ${p.sellUnitBasis || 'pcs'} basis`;
                          }

                          return (
                            <p className="text-[9.5px] text-[#9A7B56] font-semibold mt-1 bg-stone-100 py-0.5 px-1.5 rounded inline-block font-mono">
                              {helperText}
                            </p>
                          );
                        })()}
                      </div>

                      {/* Controls Counter and Delete */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.product.id, -1)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.product.id, 1)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Purge item from draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Particulars Intake */}
              <div className="pt-3 border-t border-stone-100 space-y-2.5">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Client & Project Particulars
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-[11px] border border-stone-200 bg-stone-50 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Contact Details"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-[11px] border border-stone-200 bg-stone-50 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Project Site Delivery Address (e.g. Penthouse Site Flat #4B)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 text-[11px] border border-stone-200 bg-stone-50 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Taxation & Discount Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 bg-stone-50/50 p-2.5 rounded-xl">
                <div>
                  <label className="block text-[9.5px] font-bold text-stone-500 uppercase tracking-wider mb-1 font-mono">
                    Disc: {discountPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-stone-500 uppercase tracking-wider mb-1 font-mono">
                    Tax / GST: {gstPercent}%
                  </label>
                  <select
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg py-1 px-2 text-[11.5px] focus:outline-none font-mono"
                  >
                    <option value="0">0% Excluded</option>
                    <option value="5">5% Lower slab</option>
                    <option value="12">12% Intermediate</option>
                    <option value="18">18% standard Tile GST</option>
                    <option value="28">28% Luxury Cess slab</option>
                  </select>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">
                  Settlement Method
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'Cash', icon: Coins },
                    { id: 'Card', icon: CreditCard },
                    { id: 'UPI', icon: Sparkles },
                    { id: 'Bank Transfer', icon: Landmark }
                  ].map(method => {
                    const IconComp = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-1.5 px-1 border rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                          paymentMethod === method.id
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm font-semibold'
                            : 'border-stone-200 bg-white text-stone-605 hover:bg-stone-50'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] text-center leading-none truncate w-full">{method.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculations breakdown and Process receipt button */}
            <div className="pt-4 border-t border-stone-150 space-y-3.5">
              <div className="space-y-1.5 font-mono text-[11.5px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-stone-900">₹{calculatedTotals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-₹{calculatedTotals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {gstPercent > 0 && (
                  <div className="flex justify-between">
                    <span>GST/Sales Tax ({gstPercent}%):</span>
                    <span className="text-stone-900">+₹{calculatedTotals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-stone-200/60 font-sans text-xs font-bold text-stone-950">
                  <span className="text-xs">Final Billed Total:</span>
                  <span className="text-sm font-mono text-amber-600">₹{calculatedTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
                  cart.length === 0
                    ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                    : 'bg-stone-950 hover:bg-stone-900 text-white hover:shadow-lg'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Issue POS Invoice & Deduct Inventory</span>
              </button>
            </div>

          </form>
        </div>

      </div>
      ) : (
        <div className="space-y-6 animate-fadeIn" id="insights-and-history-view">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="insights-kpis">
            
            {/* Total Sales Revenue KPI */}
            <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 flex-shrink-0">
                <IndianRupee className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Sales Revenue</span>
                <span className="text-sm font-bold font-mono text-stone-900 truncate block">
                  ₹{insights.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-emerald-600 block mt-0.5 truncate">✔ Tax compliant gross sales</span>
              </div>
            </div>

            {/* Average Ticket Value */}
            <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 flex-shrink-0">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Average Ticket Size</span>
                <span className="text-sm font-bold font-mono text-stone-900 truncate block">
                  ₹{insights.avgTicketValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-stone-500 block mt-0.5 truncate">Per individual client volume</span>
              </div>
            </div>

            {/* Total Invoices count */}
            <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600 border border-sky-100 flex-shrink-0">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Sales Invoices Logged</span>
                <span className="text-sm font-bold font-mono text-stone-900 truncate block">
                  {invoices.length} invoices
                </span>
                <span className="text-[9px] text-stone-500 block mt-0.5 truncate">Stored inside local catalog</span>
              </div>
            </div>

            {/* Total Discount given */}
            <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 flex-shrink-0">
                <Receipt className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Contractor Rebates</span>
                <span className="text-sm font-bold font-mono text-stone-900 truncate block">
                  ₹{insights.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-stone-500 block mt-0.5 truncate">Promotional write-offs provided</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Metrics column: Channels and Top items (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Mode Share list */}
              <div className="bg-white border border-stone-200 shadow-sm rounded-3xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-mono">Payment Mode Share</h3>
                  <p className="text-[10px] text-stone-505">Breakdown of gross collections by platform receipts</p>
                </div>
                
                <div className="space-y-3.5">
                  {Object.entries(insights.paymentDistribution).map(([mode, amt]) => {
                    const amtVal = Number(amt);
                    const pct = insights.totalRevenue > 0 ? (amtVal / insights.totalRevenue) * 100 : 0;
                    return (
                      <div key={mode} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-stone-800">{mode}</span>
                          <span className="font-mono text-stone-500">₹{amtVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-550" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best selling list */}
              <div className="bg-white border border-stone-200 shadow-sm rounded-3xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-mono">Top Performing Catalog Items</h3>
                  <p className="text-[10px] text-stone-505">Highest grossing vitrified tiles and sanitaryware</p>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {insights.bestSellers.length === 0 ? (
                    <p className="text-stone-400 text-center py-4 italic">No custom sales logged yet</p>
                  ) : (
                    insights.bestSellers.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-stone-900 truncate">{item.name}</p>
                          <p className="text-[10px] font-mono text-stone-400">{item.sku} • {item.qty} {item.unit} sold</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono font-bold text-amber-600 block">₹{item.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right column: Invoice Register (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white border border-stone-200 shadow-sm rounded-3xl p-5 space-y-4 col-registration-table">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-mono">Invoice History Register</h3>
                  <p className="text-[10px] text-stone-550">Lookup and printable receipt archives</p>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, phone..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Invoices register list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-450 font-mono">
                      <th className="py-2.5 px-2">Invoice Details</th>
                      <th className="py-2.5 px-2 text-center">Items</th>
                      <th className="py-2.5 px-2 text-right">Settled Amount</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {invoices.filter(inv => {
                      const query = invoiceSearchQuery.toLowerCase();
                      return inv.invoiceNumber.toLowerCase().includes(query) ||
                             inv.customerName.toLowerCase().includes(query) ||
                             inv.customerPhone.toLowerCase().includes(query) ||
                             inv.paymentMethod.toLowerCase().includes(query);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-stone-400 italic">
                          No transaction records matching query
                        </td>
                      </tr>
                    ) : (
                      invoices.filter(inv => {
                        const query = invoiceSearchQuery.toLowerCase();
                        return inv.invoiceNumber.toLowerCase().includes(query) ||
                               inv.customerName.toLowerCase().includes(query) ||
                               inv.customerPhone.toLowerCase().includes(query) ||
                               inv.paymentMethod.toLowerCase().includes(query);
                      }).map((inv) => {
                        const itemsCount = inv.items.reduce((sum, item) => sum + item.quantity, 0);
                        return (
                          <tr key={inv.invoiceNumber} className="hover:bg-stone-50/50">
                            <td className="py-3 px-2">
                              <p className="font-bold text-stone-900">{inv.customerName}</p>
                              <div className="text-[10px] text-stone-505 font-mono mt-0.5 space-x-2">
                                <span className="font-bold text-amber-600">{inv.invoiceNumber}</span>
                                <span>•</span>
                                <span>{new Date(inv.timestamp).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="uppercase text-[9px] bg-stone-100 px-1 py-0.5 rounded text-stone-600 font-bold">{inv.paymentMethod}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-mono">
                              {itemsCount} units
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-stone-900 font-mono">
                              ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => {
                                  setCurrentInvoice(inv);
                                  setIsSuccessModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[10.5px] font-bold border border-stone-200 rounded-lg bg-stone-50 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-800 transition-all cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Reprint</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Invoice Digital Receipt Modal View */}
      {isSuccessModalOpen && currentInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  TRANSACTION SECURELY LOGGED & BILLED
                </span>
              </div>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Section wrapper matching realistic thermal/laser receipt */}
            <div className="p-6 md:p-8 space-y-6" id="invoice-print-area">
              
              {/* Receipt Header details */}
              <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-stone-200 pb-5 gap-4">
                <div>
                  <h1 className="text-2xl font-serif font-black tracking-tight text-stone-950 uppercase">
                    RP Tiles
                  </h1>
                  <p className="text-[10px] text-stone-500 font-mono tracking-wider max-w-xs mt-1">
                    Luxury Stone & Vitrified Tile Gallery. Experts in custom architectural layouts.
                  </p>
                  <p className="text-[10.5px] text-stone-605 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span>NH-57, Bus Stand, Near Pawan Motors, Araria - 854311</span>
                  </p>
                </div>
                
                <div className="text-left md:text-right font-mono text-xs text-stone-600 space-y-1">
                  <div className="font-bold text-stone-950 text-sm">INVOICE DOCUMENT</div>
                  <div>ID: {currentInvoice.invoiceNumber}</div>
                  <div>Issued: {new Date(currentInvoice.timestamp).toLocaleDateString()} at {new Date(currentInvoice.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                  <div>Method: <span className="font-bold text-stone-900 uppercase">{currentInvoice.paymentMethod}</span></div>
                </div>
              </div>

              {/* Customer Specific info cards */}
              <div className="bg-stone-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-stone-100 text-xs">
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-mono font-bold mb-1">
                    Billed To:
                  </span>
                  <div className="font-bold text-stone-900 text-sm">{currentInvoice.customerName}</div>
                  <div className="text-stone-600 mt-0.5">{currentInvoice.customerPhone}</div>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-mono font-bold mb-1">
                    Deliver Site Address:
                  </span>
                  <div className="text-stone-700 leading-relaxed italic">{currentInvoice.customerAddress}</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-stone-600 border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[10.5px] uppercase tracking-wider text-stone-400 font-mono">
                      <th className="py-2.5">Item Description & SKU</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-stone-100 text-stone-800">
                        <td className="py-3">
                          <p className="font-bold text-stone-950">{it.productName}</p>
                          <p className="text-[10px] font-mono text-stone-505 mt-0.5">{it.sku} ({it.size})</p>
                        </td>
                        <td className="py-3 text-center font-mono">
                          {it.quantity} <span className="text-[10px] text-stone-405">{it.unit}</span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          ₹{it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold text-stone-950">
                          ₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pricing breakdown summary */}
              <div className="flex justify-end pt-2">
                <div className="w-full md:w-72 font-mono text-xs space-y-2 border-t border-stone-200 pt-3">
                  <div className="flex justify-between text-stone-550">
                    <span>Subtotal:</span>
                    <span className="text-stone-900">₹{currentInvoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {currentInvoice.discountRate > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({currentInvoice.discountRate}%):</span>
                      <span>-₹{currentInvoice.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {currentInvoice.taxRate > 0 && (
                    <div className="flex justify-between text-stone-550">
                      <span>GST/Sales Tax ({currentInvoice.taxRate}%):</span>
                      <span className="text-stone-901">+₹{currentInvoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-stone-900 font-sans font-bold text-sm text-stone-950">
                    <span>Settled Grand Total:</span>
                    <span className="font-mono text-amber-600">₹{currentInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Legal Notes Footer info */}
              <div className="border-t border-stone-200 pt-5 text-center text-[10px] text-stone-400 space-y-2 font-sans font-medium">
                <p>
                  Terms: Goods once supplied in good order are completely non-returnable and non-exchangeable. Please verify batch lot/shade code matches before installation. 
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-stone-500">
                  RP Tiles • Thank you for your architectural patronage!
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-stone-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-stone-200">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-4 py-2 text-xs border border-stone-300 rounded-xl hover:bg-stone-100 text-stone-750 font-bold transition-all cursor-pointer"
              >
                Close Receipt Screen
              </button>
              
              <button
                onClick={handlePrint}
                className="px-5 py-2 text-xs bg-stone-950 text-white rounded-xl hover:bg-stone-900 font-bold shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Initialize System Print (Ctrl+P)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
