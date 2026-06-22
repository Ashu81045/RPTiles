import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Smartphone,
  Printer,
  ChevronRight,
  TrendingUp,
  XCircle,
  Clock
} from 'lucide-react';
import { Product } from '../types';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Language, TRANSLATIONS } from '../data/translations';

interface InvoiceItem {
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
  size: string;
  total: number;
  remark?: string;
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
  paidAmount?: number;
  dueAmount?: number;
}

interface CustomerPayment {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  remarks: string;
  type?: 'credit' | 'debit';
}

interface CustomerSummary {
  name: string;
  phone: string;
  address: string;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  invoicesCount: number;
  paymentsCount: number;
}

interface CustomerLedgerProps {
  products: Product[];
  language: Language;
}

const LOCAL_STORAGE_INVOICES_KEY = 'ceramica_catalog_invoices';
const LOCAL_STORAGE_PAYMENTS_KEY = 'ceramica_catalog_customer_payments';

export default function CustomerLedger({ products, language }: CustomerLedgerProps) {
  // Invoices & payments loaded from local storage
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outstanding' | 'settled'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  // New Payment Form States
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [payRemarks, setPayRemarks] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payPhone, setPayPhone] = useState('');
  const [payName, setPayName] = useState('');
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit');

  // Initial Load & syncing in real-time from Firestore database
  useEffect(() => {
    // 1. Listen to invoices
    const unsubscribeInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const invList: Invoice[] = [];
      snapshot.forEach((doc) => {
        invList.push(doc.data() as Invoice);
      });
      invList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInvoices(invList);
    }, (error) => {
      console.error("Error reading invoices in CustomerLedger:", error);
    });

    // 2. Listen to customer payments
    const unsubscribePayments = onSnapshot(collection(db, 'customer_payments'), (snapshot) => {
      if (snapshot.empty) {
        const seedPayments: CustomerPayment[] = [
          {
            id: 'pay-7719a',
            customerName: 'Asim Bakhtiyar',
            customerPhone: '9843210987',
            amount: 15000,
            date: '2026-06-16',
            paymentMethod: 'UPI',
            remarks: 'Partial payment on delivery for premium marble slips'
          },
          {
            id: 'pay-290bb',
            customerName: 'Araria Construction House',
            customerPhone: '7004123567',
            amount: 45000,
            date: '2026-06-15',
            paymentMethod: 'Bank Transfer',
            remarks: 'Slab structural balance settlement'
          }
        ];
        seedPayments.forEach(async (p) => {
          await setDoc(doc(db, 'customer_payments', p.id), p);
        });
        setPayments(seedPayments);
      } else {
        const payList: CustomerPayment[] = [];
        snapshot.forEach((doc) => {
          payList.push(doc.data() as CustomerPayment);
        });
        payList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPayments(payList);
      }
    }, (error) => {
      console.error("Error reading payments in CustomerLedger:", error);
    });

    return () => {
      unsubscribeInvoices();
      unsubscribePayments();
    };
  }, []);

  // Compute a list of unique customer accounts based on checkout invoices & payments
  const customersList = React.useMemo(() => {
    const customersMap: Record<string, CustomerSummary> = {};

    // Helper to generate key (use phone if present, or fallback name)
    const getCustomerKey = (name: string, phone: string) => {
      const cleanPhone = phone.trim();
      const cleanName = name.trim();
      return cleanPhone && cleanPhone !== 'N/A' ? cleanPhone : `NAME:${cleanName}`;
    };

    // 1. Process all sales invoices
    invoices.forEach(inv => {
      const key = getCustomerKey(inv.customerName, inv.customerPhone);
      
      if (!customersMap[key]) {
        customersMap[key] = {
          name: inv.customerName,
          phone: inv.customerPhone,
          address: inv.customerAddress,
          totalBilled: 0,
          totalPaid: 0,
          outstanding: 0,
          invoicesCount: 0,
          paymentsCount: 0
        };
      } else {
        // Take longest/most valid address
        if (inv.customerAddress.length > customersMap[key].address.length && !inv.customerAddress.includes('Counter Sale')) {
          customersMap[key].address = inv.customerAddress;
        }
      }

      customersMap[key].totalBilled += inv.grandTotal;
      customersMap[key].invoicesCount += 1;

      // If invoice has a dedicated paidAmount (deposits / part payments), add that.
      // Otherwise, fall back to checking if paymentMethod was not Credit or Pay Later.
      if (inv.paidAmount !== undefined) {
        customersMap[key].totalPaid += inv.paidAmount;
      } else {
        if (inv.paymentMethod !== 'Credit' && inv.paymentMethod !== 'Pay Later') {
          customersMap[key].totalPaid += inv.grandTotal;
        }
      }
    });

    // 2. Process recorded custom payment receipts
    payments.forEach(pay => {
      const key = getCustomerKey(pay.customerName, pay.customerPhone);

      if (!customersMap[key]) {
        customersMap[key] = {
          name: pay.customerName,
          phone: pay.customerPhone,
          address: 'Payment Account Only',
          totalBilled: 0,
          totalPaid: 0,
          outstanding: 0,
          invoicesCount: 0,
          paymentsCount: 0
        };
      }

      if (pay.type === 'debit') {
        customersMap[key].totalBilled += pay.amount;
      } else {
        customersMap[key].totalPaid += pay.amount;
      }
      customersMap[key].paymentsCount += 1;
    });

    // 3. Calculate outstanding balances
    return Object.values(customersMap).map(c => {
      const balance = c.totalBilled - c.totalPaid;
      return {
        ...c,
        // Deal with standard floating decimals
        totalBilled: Math.round(c.totalBilled * 100) / 100,
        totalPaid: Math.round(c.totalPaid * 100) / 100,
        outstanding: Math.round(balance * 100) / 100
      };
    });
  }, [invoices, payments]);

  // Handle Recording of custom payment receipts
  const handleSavePaymentInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please specify a positive clearance amount.");
      return;
    }

    const nextPayment: CustomerPayment = {
      id: `pay-${Math.random().toString(36).substring(2, 7)}`,
      customerName: payName.trim() || 'Undisclosed Customer',
      customerPhone: payPhone.trim() || 'N/A',
      amount,
      date: payDate,
      paymentMethod: payMethod,
      remarks: payRemarks.trim() || (entryType === 'debit' ? 'Manual billing due charge adjustment' : 'Custom Ledger Cash Settle clearance'),
      type: entryType
    };

    try {
      await setDoc(doc(db, 'customer_payments', nextPayment.id), nextPayment);
    } catch (err) {
      console.error("Error writing payment to Firestore:", err);
    }

    // Update the selected customer view state live if applicable
    if (selectedCustomer) {
      const matchSelected = selectedCustomer.phone && selectedCustomer.phone !== 'N/A' 
        ? selectedCustomer.phone === payPhone 
        : selectedCustomer.name === payName;

      if (matchSelected) {
        setSelectedCustomer(prev => {
          if (!prev) return null;
          let uPaid = prev.totalPaid;
          let uBilled = prev.totalBilled;
          if (entryType === 'debit') {
            uBilled += amount;
          } else {
            uPaid += amount;
          }
          return {
            ...prev,
            totalBilled: Math.round(uBilled * 100) / 100,
            totalPaid: Math.round(uPaid * 100) / 100,
            outstanding: Math.round((uBilled - uPaid) * 100) / 100,
            paymentsCount: prev.paymentsCount + 1
          };
        });
      }
    }

    // Reset modals
    setPayAmount('');
    setPayRemarks('');
    setShowPaymentModal(false);
    setIsSuccessAlert(true);
    setTimeout(() => setIsSuccessAlert(false), 3000);
  };

  // Pre-fill modal states when clicking Record Action for a customer
  const openPaymentModalForCustomer = (cust: CustomerSummary) => {
    setPayName(cust.name);
    setPayPhone(cust.phone === 'N/A' ? '' : cust.phone);
    setPayAmount('');
    setPayRemarks(`Balance clearance for ${cust.name}`);
    setEntryType('credit');
    setShowPaymentModal(true);
  };

  // Chronological transaction ledger records for the selected customer
  const customerLedgerLogs = React.useMemo(() => {
    if (!selectedCustomer) return [];

    const logs: {
      type: 'INVOICE' | 'PAYMENT' | 'DEBIT_ADJ';
      id: string;
      date: string;
      remarks: string;
      amount: number;
      method?: string;
      paidAmount?: number;
    }[] = [];

    // Filter relevant invoices
    const isMatch = (phone: string, name: string) => {
      const hasPhone = selectedCustomer.phone && selectedCustomer.phone !== 'N/A';
      return hasPhone ? phone === selectedCustomer.phone : name === selectedCustomer.name;
    };

    invoices.forEach(inv => {
      if (isMatch(inv.customerPhone, inv.customerName)) {
        logs.push({
          type: 'INVOICE',
          id: inv.invoiceNumber,
          date: inv.timestamp.substring(0, 10),
          remarks: inv.items.map(it => `${it.quantity} ${it.unit} ${it.productName}${it.remark ? ` (${it.remark})` : ''}`).join(', ').slice(0, 75) + (inv.items.length > 2 ? '...' : ''),
          amount: inv.grandTotal,
          method: inv.paymentMethod,
          paidAmount: inv.paidAmount
        });
      }
    });

    // Filter payments
    payments.forEach(pay => {
      if (isMatch(pay.customerPhone, pay.customerName)) {
        logs.push({
          type: pay.type === 'debit' ? 'DEBIT_ADJ' : 'PAYMENT',
          id: pay.id.toUpperCase(),
          date: pay.date,
          remarks: pay.remarks,
          amount: pay.amount,
          method: pay.paymentMethod
        });
      }
    });

    // Sort chronologically (oldest first for continuous balance sheet layout)
    return logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedCustomer, invoices, payments]);

  // Aggregate Metrics
  const summaryMetrics = React.useMemo(() => {
    let totalOutstanding = 0;
    let totalBilledVal = 0;
    let totalCollectedVal = 0;
    let defaultersCount = 0;

    customersList.forEach(c => {
      totalBilledVal += c.totalBilled;
      totalCollectedVal += c.totalPaid;
      if (c.outstanding > 1) {
        totalOutstanding += c.outstanding;
        defaultersCount++;
      }
    });

    return {
      totalOutstanding: Math.round(totalOutstanding),
      totalBilled: Math.round(totalBilledVal),
      totalCollected: Math.round(totalCollectedVal),
      defaultersCount
    };
  }, [customersList]);

  // Filters search matches
  const filteredCustomers = React.useMemo(() => {
    return customersList.filter(c => {
      const matchQuery = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchQuery) return false;

      if (filterType === 'outstanding') return c.outstanding > 1;
      if (filterType === 'settled') return c.outstanding <= 1;

      return true;
    });
  }, [customersList, searchQuery, filterType]);

  return (
    <div className="space-y-6" id="ledger-pane">
      
      {/* Alert Banner */}
      {isSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-bounce" id="alert-ledger-success">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Payment voucher successfully logged in ledger books!</span>
          </div>
          <button onClick={() => setIsSuccessAlert(false)} className="text-emerald-500 hover:text-emerald-800 text-xs">✕</button>
        </div>
      )}

      {/* Header Cards: Ledger Summary Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="ledger-stats">
        
        {/* Outstanding Balance */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl hover:shadow-xs transition-shadow flex items-start justify-between">
          <div>
            <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">OUTSTANDING RECEIVABLES</span>
            <span className="block text-2xl font-black font-mono text-red-650 mt-1">₹{summaryMetrics.totalOutstanding.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-stone-500 mt-1 leading-none font-medium text-red-600">
              ● Active balance to be collected
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-red-650" />
          </div>
        </div>

        {/* Total Collected Settle values */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl hover:shadow-xs transition-shadow flex items-start justify-between">
          <div>
            <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">TOTAL SALES COLLECTED</span>
            <span className="block text-2xl font-black font-mono text-emerald-600 mt-1">₹{summaryMetrics.totalCollected.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-stone-500 mt-1 leading-none font-medium text-emerald-600">
              ● Bank and Cash credits cleared
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Lifetime sales tally */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl hover:shadow-xs transition-shadow flex items-start justify-between">
          <div>
            <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">LIFETIME INVOICED BILLS</span>
            <span className="block text-2xl font-black font-mono text-stone-900 mt-1">₹{summaryMetrics.totalBilled.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-stone-500 mt-1 leading-none font-medium">
              ● Aggregate book invoices value
            </p>
          </div>
          <div className="p-3 bg-stone-100 text-stone-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Defaulters */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl hover:shadow-xs transition-shadow flex items-start justify-between">
          <div>
            <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">ACCOUNTS WITH BALANCE</span>
            <span className="block text-2xl font-black font-mono text-amber-600 mt-1">{summaryMetrics.defaultersCount} Accounts</span>
            <p className="text-[10px] text-stone-500 mt-1 leading-none font-medium">
              Reflects credit client transactions
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <User className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main ledger controller split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ledger-layout-master">
        
        {/* Left Side: Ledger directory & accounts search list */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-stone-200 p-4 rounded-3xl space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <span>🧾 Client Ledger Directory</span>
            </h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by client name, mobile or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 py-2 pl-10 pr-4 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-stone-800 placeholder-stone-400 font-medium"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5 pt-1.5 border-t border-stone-100">
              {[
                { id: 'all', label: 'All Accounts' },
                { id: 'outstanding', label: 'Outstanding Balance 🔴' },
                { id: 'settled', label: 'Cleared / Nil 🟢' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase transition-all tracking-tight cursor-pointer ${
                    filterType === f.id 
                      ? 'bg-stone-900 text-white shadow-xs' 
                      : 'bg-stone-100 text-stone-600 hover:text-stone-950 hover:bg-stone-200/85'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer registry scroll box */}
          <div className="space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-250 p-8 rounded-3xl text-center">
                <XCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">No customer balance accounts match filters.</p>
                <p className="text-[11px] text-stone-400 mt-1">Check names database or create a new checkout invoice on credit mode.</p>
                <button
                  onClick={() => {
                    setPayName('');
                    setPayPhone('');
                    setPayRemarks('Opening ledger seed check-in');
                    setShowPaymentModal(true);
                  }}
                  className="mt-4 bg-stone-900 hover:bg-stone-850 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  + Add External Clearance
                </button>
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const isClientSelected = selectedCustomer && (
                  (cust.phone && cust.phone !== 'N/A' && selectedCustomer.phone === cust.phone) ||
                  (selectedCustomer.name === cust.name && selectedCustomer.phone === cust.phone)
                );
                
                return (
                  <div
                    key={`${cust.name}-${cust.phone}`}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`bg-white border rounded-2.5xl p-4 transition-all cursor-pointer flex flex-col justify-between hover:shadow-sm ${
                      isClientSelected 
                        ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/[0.01]' 
                        : 'border-stone-200 hover:border-stone-350'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3.5 gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-sm text-stone-900 truncate leading-tight">{cust.name}</h4>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            cust.outstanding > 1 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {cust.outstanding > 1 ? 'Balance Due' : 'Cleared'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10.5px] text-stone-500 mt-1">
                          <span className="flex items-center space-x-0.8 font-mono">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{cust.phone || 'N/A'}</span>
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{cust.address}</span>
                        </div>
                      </div>
                      
                      {/* Active Live balance flag arrow */}
                      <ChevronRight className={`w-4 h-4 text-stone-400 self-center shrink-0 transition-transform ${isClientSelected ? 'translate-x-1 text-amber-500' : ''}`} />
                    </div>

                    {/* Book accounting splits */}
                    <div className="grid grid-cols-3 bg-stone-50 p-2.5 rounded-xl text-center border border-stone-100 gap-1.5 font-mono text-[9px]">
                      <div>
                        <span className="block text-stone-400 uppercase text-[7.5px] mb-0.5">Billed</span>
                        <span className="block font-bold text-stone-900 leading-none">₹{cust.totalBilled.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-x border-stone-200/55">
                        <span className="block text-stone-400 uppercase text-[7.5px] mb-0.5">Cleared</span>
                        <span className="block font-bold text-emerald-650 leading-none">₹{cust.totalPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 uppercase text-[7.5px] mb-0.5">Outstanding</span>
                        <span className={`block font-bold leading-none ${cust.outstanding > 1 ? 'text-red-650 font-black' : 'text-stone-500'}`}>
                          ₹{cust.outstanding.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quick actions for item */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100/70 text-[9.5px]">
                      <span className="text-stone-450 font-medium">
                        💼 {cust.invoicesCount} Invoices • {cust.paymentsCount} Payments
                      </span>
                      {cust.outstanding > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPaymentModalForCustomer(cust);
                          }}
                          className="bg-emerald-650 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-bold uppercase transition-all tracking-tight cursor-pointer"
                        >
                          Clear Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Chosen ledger ledger detailed statements */}
        <div className="lg:col-span-7">
          
          {!selectedCustomer ? (
            <div className="bg-white border border-stone-200 p-12 rounded-3xl h-full flex flex-col items-center justify-center text-center shadow-xs">
              <User className="w-12 h-12 text-stone-200 mb-3" />
              <h4 className="text-sm font-black uppercase tracking-wider text-stone-800 font-mono">Personal Ledger Statement Client</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Select any active client from the Left Registration Directory to inspect their full chronological double-entry debit books, cash clearance invoices, and issue direct payment vouchers.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-xs" id="ledger-statement-panel">
              
              {/* Account Statement Header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-5 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-stone-900 text-amber-400 rounded-xl">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-950 font-serif leading-none flex items-center gap-1.5">
                        <span>{selectedCustomer.name}</span>
                        <span className={`text-[8.5px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          selectedCustomer.outstanding > 1 ? 'bg-red-50 text-red-650 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {selectedCustomer.outstanding > 1 ? 'Balances Unsettled' : 'Cleared Accounts OK'}
                        </span>
                      </h2>
                      <p className="text-xs text-stone-550 mt-1.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="font-mono">{selectedCustomer.phone || 'N/A Phone'}</span>
                        <span className="text-stone-300">|</span>
                        <MapPin className="w-3 h-3 text-stone-405 shrink-0" />
                        <span className="truncate max-w-[200px] italic">{selectedCustomer.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ledger actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                        window.print();
                    }}
                    className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-xl cursor-pointer"
                    title="Print the page audit report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openPaymentModalForCustomer(selectedCustomer)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Receive Clearance Payment</span>
                  </button>
                </div>
              </div>

              {/* Dynamic balances grid box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 border border-stone-150 rounded-2xl">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">AGGREGATE SALES BILLABLE</span>
                  <p className="text-lg font-black text-stone-900 font-mono mt-1">₹{selectedCustomer.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-stone-400 leading-none mt-1">Invoiced sales sum</p>
                </div>
                
                <div className="border-t sm:border-t-0 sm:border-x border-stone-200 px-0 sm:px-4 py-2 sm:py-0 text-center sm:text-left">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">CREDITS CLEARED / RECEIVED</span>
                  <p className="text-lg font-black text-emerald-650 font-mono mt-1">₹{selectedCustomer.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-emerald-600 leading-none mt-1">Direct receipts & paid bills</p>
                </div>

                <div className="text-center sm:text-left py-2 sm:py-0">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">CURRENT BOOKS OUTSTANDING</span>
                  <p className={`text-lg font-black font-mono mt-1 ${selectedCustomer.outstanding > 1 ? 'text-red-650' : 'text-stone-500'}`}>
                    ₹{selectedCustomer.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-stone-450 leading-none mt-1">Net pending clearance book value</p>
                </div>
              </div>

              {/* Comprehensive Chronological Book Statements Table (Double Entry Model) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <span>📑 STATEMENT ACCOUNT CHRONOLOGY (LEDGER RECORDS)</span>
                  </h4>
                  <span className="text-[9.5px] text-stone-400 font-mono italic">
                    Ordered oldest first
                  </span>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-605 font-mono text-[9px] uppercase tracking-wider border-b border-stone-200">
                          <th className="p-3">TRX DATE</th>
                          <th className="p-3">REF CODE / VOUCHER</th>
                          <th className="p-4">TRANSACTION PARTICULARS (DETAILS)</th>
                          <th className="p-3 text-right">DEBIT (+)</th>
                          <th className="p-3 text-right">CREDIT (-)</th>
                          <th className="p-3 text-right">BALANCE DUE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {customerLedgerLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-stone-400 font-mono italic">
                              No history transactions recorded for this customer in general accounts.
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            let runningBalance = 0;
                            return customerLedgerLogs.map((log, index) => {
                              // If ledger is INVOICE, it is customer buying -> debits customer (increases customer's liability)
                              // If payment was not credit, it shows up as immediately settled.
                              // So:
                              // Debit: Invoice Grand Total
                              // Credit: If cash/UPI immediately cleared, credit = Grand Total. Otherwise, 0 (pending).
                              // If Ledger is PAYMENT, it is direct credit receipt -> reduces customer liability (Credit = amount)
                              
                              let debit = 0;
                              let credit = 0;

                              if (log.type === 'INVOICE') {
                                debit = log.amount;
                                if (log.paidAmount !== undefined) {
                                  credit = log.paidAmount;
                                } else {
                                  const isImmediatelyPaid = log.method !== 'Credit' && log.method !== 'Pay Later';
                                  if (isImmediatelyPaid) {
                                    credit = log.amount;
                                  } else {
                                    credit = 0;
                                  }
                                }
                              } else if (log.type === 'DEBIT_ADJ') {
                                debit = log.amount;
                              } else {
                                credit = log.amount;
                              }

                              runningBalance += (debit - credit);

                              return (
                                <tr key={log.id + index} className="hover:bg-stone-50/50">
                                  {/* Date */}
                                  <td className="p-3 font-mono text-[10.5px] whitespace-nowrap text-stone-500">
                                    {log.date}
                                  </td>
                                  
                                  {/* Code */}
                                  <td className="p-3 font-mono text-[10.5px] whitespace-nowrap">
                                    <span className={`p-1 rounded text-[10px] font-bold ${
                                      log.type === 'INVOICE' 
                                        ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                                        : log.type === 'DEBIT_ADJ'
                                          ? 'bg-red-55/10 text-red-700 border border-red-100'
                                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                    }`}>
                                      {log.id}
                                    </span>
                                  </td>

                                  {/* Particulars description */}
                                  <td className="p-4 leading-tight">
                                    <span className="font-bold text-stone-900 block text-xs">
                                      {log.type === 'INVOICE' 
                                        ? 'Product Purchase Sales Invoice' 
                                        : log.type === 'DEBIT_ADJ'
                                          ? 'Manual Sales Due / Charge' 
                                          : 'Receipt Collection / Advance'}
                                    </span>
                                    <span className="text-[10px] text-stone-500 mt-0.5 block max-w-sm truncate" title={log.remarks}>
                                      {log.remarks}
                                    </span>
                                    {log.method && (
                                      <span className="text-[7.5px] font-mono uppercase bg-stone-150 px-1 py-0.2 rounded mt-0.5 inline-block text-stone-605 font-bold">
                                        Mode: {log.method}
                                      </span>
                                    )}
                                  </td>

                                  {/* Debit (+ Invoice) */}
                                  <td className="p-3 text-right font-mono text-red-650 font-bold">
                                    {debit > 0 ? `+₹${debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                  </td>

                                  {/* Credit (- payment) */}
                                  <td className="p-3 text-right font-mono text-emerald-650 font-semibold font-mono">
                                    {credit > 0 ? `-₹${credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                  </td>

                                  {/* Running Balance */}
                                  <td className="p-3 text-right font-mono font-bold text-stone-900 text-xs">
                                    ₹{Math.round(runningBalance * 100) / 100 === 0 ? '0.00' : (Math.round(runningBalance * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            });
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl flex items-start space-x-2 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-900 uppercase text-[9.5px] tracking-wider font-mono">Showroom Accountant Checklist:</h5>
                  <p className="text-stone-600 mt-1 leading-relaxed">
                    Under standard GST-18 rules, balances should be cleared via genuine bank or cash vouchers. When checking out a client at POS, choosing <strong>"Credit Sale"</strong> automatically appends their grand total here as a debit liability ledger asset. You can clear partial or full dues directly by recording payments.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Record Payment Voucher Receipt Modal dialog */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-250 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-5 py-4 rounded-t-3xl flex items-center justify-between border-b border-stone-800">
              <span className="font-mono text-xs font-bold tracking-wider text-amber-400 flex items-center gap-1.5 uppercase">
                <Plus className="w-4 h-4 animate-pulse text-emerald-400" /> RECORD RECEIPT STATEMENT CLEARANCE
              </span>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form inputs */}
            <form onSubmit={handleSavePaymentInput} className="p-6 space-y-4">
              
              {/* Entry Type Selector */}
              <div className="bg-stone-100 p-1 rounded-xl flex border border-stone-200" id="ledger-entry-type-selector">
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('credit');
                    if (payRemarks === 'Manual billing due charge adjustment') {
                      setPayRemarks('');
                    }
                  }}
                  className={`flex-1 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    entryType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  📥 Collect Advance / Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('debit');
                    if (!payRemarks) {
                      setPayRemarks('Manual billing due charge adjustment');
                    }
                  }}
                  className={`flex-1 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    entryType === 'debit'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  📤 Add Manual Owed Due
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Customer name */}
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    Client Full Name:
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter customer name..."
                    value={payName}
                    onChange={(e) => setPayName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 py-2 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:bg-stone-50 focus:bg-white text-stone-900 shadow-3xs"
                  />
                </div>

                {/* Customer telephone */}
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    Client Mobile/Phone Number:
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter phone..."
                    value={payPhone}
                    onChange={(e) => setPayPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 py-2 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:bg-stone-50 focus:bg-white text-stone-900 shadow-3xs"
                  />
                </div>

                {/* Amount to Pay */}
                <div>
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    {entryType === 'debit' ? 'Owed Due Amount (₹):' : 'Clearance Amount (₹):'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">₹</span>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 25000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-250 py-2 pl-6 pr-3 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:bg-stone-50 focus:bg-white text-stone-950 shadow-3xs"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    {entryType === 'debit' ? 'Due Charge Date:' : 'Receipt Entry Date:'}
                  </label>
                  <input 
                    type="date" 
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 py-2 px-3 rounded-lg text-xs font-mono font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Payment clearance Mode method */}
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    {entryType === 'debit' ? 'Journal Entry Reference Method:' : 'Received Collection Method:'}
                  </label>
                  <select 
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-250 py-2 px-3 rounded-lg text-xs font-bold text-stone-850 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Cash">{entryType === 'debit' ? '💵 INTERNAL CASH DEBIT' : '💵 CASH COLLECTION'}</option>
                    <option value="UPI">{entryType === 'debit' ? '📱 UPI CHARGE ASSIGN' : '📱 DIGITAL UPI (PHONEPE / GPAY)'}</option>
                    <option value="Bank Transfer">{entryType === 'debit' ? '🏦 BANK DEBIT SETTLE' : '🏦 IMPS / NEFT / REAR BANK'}</option>
                    <option value="Card">💳 CREDIT/DEBIT CARD VOUCHER</option>
                    <option value="Cheque">✍️ CHEQUE RECORD BOOK</option>
                  </select>
                </div>

                {/* Private remarks notes */}
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-1.5 font-mono">
                    Account Book Narration Remarks:
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Provide description constraints (e.g., cleared dues on block delivery)..."
                    value={payRemarks}
                    onChange={(e) => setPayRemarks(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 py-1.5 px-3 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-stone-100 uppercase text-[10px] font-mono tracking-wider">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center"
                >
                  Discard Empty
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-black transition-all cursor-pointer shadow-sm text-center"
                >
                  Save Entry Receipts ✓
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
