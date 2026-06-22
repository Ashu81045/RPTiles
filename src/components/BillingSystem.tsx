/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Language, TRANSLATIONS } from '../data/translations';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Search, Plus, Minus, Trash2, Printer, FileText, 
  ShoppingCart, User, Phone, CheckCircle, CreditCard, Book,
  Receipt, Landmark, Coins, ChevronRight, Sparkles, X, Compass, MapPin,
  IndianRupee, TrendingUp, History, QrCode, Smartphone, Save
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
        total: 2425,
        discountAmount: 0
      },
      {
        productName: 'Nero Portoro Marble Pedestal Basin',
        sku: 'SW-BSN-NP9045',
        price: 1450,
        quantity: 1,
        unit: 'pcs',
        size: '90x45 cm',
        total: 1450,
        discountAmount: 0
      }
    ],
    subtotal: 3875,
    discountRate: 5,
    discountAmount: 193.75,
    taxRate: 18,
    taxAmount: 662.625,
    grandTotal: 4343.875,
    paymentMethod: 'UPI',
    timestamp: '2026-06-15T14:30:00.000Z',
    loadingCharges: 0,
    labourCharges: 0,
    otherCharges: 0,
    paidAmount: 4343.875,
    dueAmount: 0
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
        total: 3160,
        discountAmount: 0
      }
    ],
    subtotal: 3160,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 568.8,
    grandTotal: 3728.8,
    paymentMethod: 'Bank Transfer',
    timestamp: '2026-06-16T09:15:00.000Z',
    loadingCharges: 0,
    labourCharges: 0,
    otherCharges: 0,
    paidAmount: 3728.8,
    dueAmount: 0
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
        total: 970,
        discountAmount: 0
      }
    ],
    subtotal: 970,
    discountRate: 10,
    discountAmount: 97,
    taxRate: 18,
    taxAmount: 157.14,
    grandTotal: 1030.14,
    paymentMethod: 'Cash',
    timestamp: '2026-06-17T11:00:00.000Z',
    loadingCharges: 0,
    labourCharges: 0,
    otherCharges: 0,
    paidAmount: 1030.14,
    dueAmount: 0
  }
];

interface BillingSystemProps {
  products: Product[];
  language: Language;
  onUpdateStock: (id: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUST', reason: string) => void;
  onConnectPhone?: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
  remark?: string;
  customPrice?: number;     // Customized item price per unit
  customDiscount?: number;  // Customized discount percentage (0-100) per item
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
    remark?: string;
    productImage?: string;
    discountAmount?: number;
  }[];
  subtotal: number;
  discountRate: number; // e.g. 10 for 10%
  discountAmount: number;
  taxRate: number; // e.g. 18 for 18% GST standard
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  timestamp: string;
  // Extra charges
  loadingCharges: number;
  labourCharges: number;
  otherCharges: number;
  otherChargesRemarks?: string;
  // Part payments
  paidAmount: number;
  dueAmount: number;
  deliveryStatus?: 'Pending' | 'Delivered';
}

function numberToIndianWords(num: number): string {
  if (isNaN(num)) return '';
  const rounded = Math.round(num);
  if (rounded === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const g = (val: number): string => {
    if (val < 20) return a[val];
    const digit = val % 10;
    return b[Math.floor(val / 10)] + (digit ? ' ' + a[digit] : '');
  };

  const convertLessThanOneThousand = (val: number): string => {
    let result = '';
    const hundreds = Math.floor(val / 100);
    const remainder = val % 100;
    if (hundreds) {
      result += a[hundreds] + ' Hundred';
    }
    if (remainder) {
      if (result) result += ' and ';
      result += g(remainder);
    }
    return result;
  };

  let result = '';
  let temp = rounded;
  
  const crores = Math.floor(temp / 10000000);
  temp %= 10000000;
  
  const lakhs = Math.floor(temp / 100000);
  temp %= 100000;
  
  const thousands = Math.floor(temp / 1000);
  temp %= 1000;
  
  if (crores) {
    result += convertLessThanOneThousand(crores) + ' Crore ';
  }
  if (lakhs) {
    result += convertLessThanOneThousand(lakhs) + ' Lakh ';
  }
  if (thousands) {
    result += convertLessThanOneThousand(thousands) + ' Thousand ';
  }
  if (temp) {
    result += convertLessThanOneThousand(temp);
  }

  return 'Rupees ' + result.trim() + ' Only';
}

const getHsnCode = (sku: string, category?: string) => {
  const cat = category?.toLowerCase() || '';
  const skuUpper = sku.toUpperCase();
  if (skuUpper.startsWith('TL') || cat === 'tiles') return '6907.21';
  if (skuUpper.startsWith('SW') || cat === 'sanitaryware' || cat === 'bathware') return '6910.10';
  if (skuUpper.startsWith('FT') || cat === 'fittings') return '8481.80';
  return '6907.00';
};

export default function BillingSystem({ products, language, onUpdateStock, onConnectPhone }: BillingSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Credit'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18); // Default real-world GST/tax for premium tiling

  // Extra ad-hoc charges and part-payments state
  const [loadingCharges, setLoadingCharges] = useState<number>(0);
  const [labourCharges, setLabourCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [otherChargesRemarks, setOtherChargesRemarks] = useState<string>('');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  // Receipt Modal State
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Drafts state
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Load drafts from Firestore in real-time on mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'drafts'), (snapshot) => {
      const draftList: any[] = [];
      snapshot.forEach((doc) => {
        draftList.push(doc.data());
      });
      setDrafts(draftList);
    }, (error) => {
      console.error("Error reading drafts:", error);
    });
    return () => unsubscribe();
  }, []);

  const [billingMode, setBillingMode] = useState<'showroom' | 'store'>('showroom');

  // Invoices Register & Sub-Tabs State
  const [billingSubTab, setBillingSubTab] = useState<'checkout' | 'insights'>('checkout');

  // Calculator states for active item (Marble Slab L×W vs Tile Wastage carton calculators)
  const [openedCalcId, setOpenedCalcId] = useState<string | null>(null);
  const [calcMode, setCalcMode] = useState<'slab' | 'wastage'>('slab');
  const [slabLength, setSlabLength] = useState<string>('6.5');
  const [slabWidth, setSlabWidth] = useState<string>('4.0');
  const [slabCount, setSlabCount] = useState<string>('10');
  const [targetArea, setTargetArea] = useState<string>('150');
  const [wastagePercent, setWastagePercent] = useState<string>('10');
  
  // Real-time Barcode / QR Code Scanner Simulation states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualScanInput, setManualScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{ text: string; type: 'success' | 'error' | 'idle' }>({
    text: 'Scanner Standby - READY',
    type: 'idle'
  });

  const [useRealCamera, setUseRealCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Auto-detect and fetch all physical camera devices on the phone
  useEffect(() => {
    if (!isScannerOpen || !useRealCamera) return;
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          // Try to auto-select a rear-facing camera first
          const rearCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment') ||
            d.label.toLowerCase().includes('0')
          );
          if (rearCam) {
            setSelectedCameraId(rearCam.id);
          } else {
            setSelectedCameraId(devices[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("Retrying/fetching camera devices failed:", err);
      });
  }, [isScannerOpen, useRealCamera]);

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

        // Custom call-back when QR is detected
        const onScanSuccess = (decodedText: string) => {
          const now = Date.now();
          if (decodedText === lastScannedText && (now - lastScannedTime) < 2200) {
            // Throttle repeat scans for the same item to prevent double checkouts
            return;
          }
          lastScannedText = decodedText;
          lastScannedTime = now;
          
          // Execute product code scanning match
          handleScannerScan(decodedText);
        };

        const onScanFailure = (errorMessage: string) => {
          // Silence frame-by-frame debug failure callbacks
        };

        // Determine target lens configuration
        // If a specific camera is chosen, use it. Otherwise, request back camera specifically.
        const cameraConfig = selectedCameraId ? selectedCameraId : { facingMode: "environment" };

        // Attempt ultra-fast scanning first
        html5QrCode.start(
          cameraConfig,
          {
            fps: 30, // Poll more frequently for scan on-the-fly
            qrbox: (width, height) => {
              const minDimension = Math.min(width, height);
              const size = Math.floor(minDimension * 0.85); // Big scan box
              return { width: size, height: size };
            },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true // Native hardware detector on Safari/Chrome Mobile
            }
          } as any,
          onScanSuccess,
          onScanFailure
        ).catch((err) => {
          console.warn("High-speed constraints rejected, checking for permission issue first:", err);
          
          const errStr = String(err);
          const isPermissionError = 
            err?.name === 'NotAllowedError' || 
            err?.name === 'PermissionDeniedError' || 
            errStr.includes('NotAllowedError') || 
            errStr.includes('Permission denied') || 
            errStr.includes('PermissionDeniedError');

          if (isPermissionError) {
            console.warn("Camera permission explicitly denied or blocked by browser environment:", err);
            setCameraError(
              "Failed! Please grant Camera permission in your phone/browser settings. Note: If you are previewing inside the developer editor/chat workspace, please copy/open the Shared App URL directly in Chrome/Safari on your device, or click 'Connect Phone' above to scan with your phone's native browser."
            );
            return;
          }

          // Retry with simple constraints to bypass OverconstrainedError
          if (html5QrCode) {
            html5QrCode.start(
              cameraConfig,
              {
                fps: 20,
                qrbox: (w, h) => {
                  const s = Math.floor(Math.min(w, h) * 0.85);
                  return { width: s, height: s };
                }
              } as any,
              onScanSuccess,
              onScanFailure
            ).catch((innerErr) => {
              console.error("Camera start failed on second attempt:", innerErr);
              setCameraError(
                "Failed! Please grant Camera permission in your phone/browser settings. Note: If you are previewing inside the developer editor/chat workspace, please copy/open the Shared App URL directly in Chrome/Safari on your device, or click 'Connect Phone' above to scan with your phone's native browser."
              );
            });
          }
        });
      } catch (ex: any) {
        console.error("html5-qrcode constructor exception:", ex);
        setCameraError("Camera device failed to initiate on this screen.");
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
  }, [useRealCamera, isScannerOpen, selectedCameraId]);

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Customer Ledger directory search and lookup
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [showLedgerDropdown, setShowLedgerDropdown] = useState(false);

  // Subscribe to invoices real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      if (snapshot.empty) {
        // Seed DEFAULT_INVOICES to Firestore
        DEFAULT_INVOICES.forEach(async (inv) => {
          await setDoc(doc(db, 'invoices', inv.invoiceNumber), inv);
        });
        setInvoices(DEFAULT_INVOICES);
      } else {
        const invList: Invoice[] = [];
        snapshot.forEach((doc) => {
          invList.push(doc.data() as Invoice);
        });
        invList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setInvoices(invList);
      }
    }, (error) => {
      console.error("Error reading invoices:", error);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to customer payments real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'customer_payments'), (snapshot) => {
      const payList: any[] = [];
      snapshot.forEach((doc) => {
        payList.push(doc.data());
      });
      setPayments(payList);
    }, (error) => {
      console.error("Error reading payments:", error);
    });
    return () => unsubscribe();
  }, []);

  // Compute unique customers and balances
  const customersSummaryList = useMemo(() => {
    const map: Record<string, { name: string; phone: string; address: string; totalBilled: number; totalPaid: number }> = {};

    const getCustomerKey = (name: string, phone: string) => {
      const cleanPhone = phone.trim();
      const cleanName = name.trim();
      return cleanPhone && cleanPhone !== 'N/A' && cleanPhone !== '' ? cleanPhone : `NAME:${cleanName.toLowerCase()}`;
    };

    invoices.forEach(inv => {
      const key = getCustomerKey(inv.customerName, inv.customerPhone);
      if (!map[key]) {
        map[key] = {
          name: inv.customerName,
          phone: inv.customerPhone,
          address: inv.customerAddress,
          totalBilled: 0,
          totalPaid: 0
        };
      }
      map[key].totalBilled += inv.grandTotal;
      if (inv.paymentMethod !== 'Credit' && inv.paymentMethod !== 'Pay Later') {
        map[key].totalPaid += inv.grandTotal;
      }
    });

    payments.forEach(pay => {
      const key = getCustomerKey(pay.customerName, pay.customerPhone);
      if (!map[key]) {
        map[key] = {
          name: pay.customerName,
          phone: pay.customerPhone,
          address: 'Payment Account Only',
          totalBilled: 0,
          totalPaid: 0
        };
      }
      if (pay.type === 'debit') {
        map[key].totalBilled += pay.amount;
      } else {
        map[key].totalPaid += pay.amount;
      }
    });

    return Object.values(map).map(c => ({
      ...c,
      outstanding: Math.round((c.totalBilled - c.totalPaid) * 100) / 100
    }));
  }, [invoices, payments]);

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

  // Direct Cart Qty setter
  const handleSetCartQty = (productId: string, val: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (val < 0) val = 0;
    
    if (val > product.stock) {
      alert(`Warehouse stock warning! Only ${product.stock} ${product.unit} are available in total.`);
      val = product.stock;
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: val };
      }
      return item;
    }));
  };

  const handleUpdateCustomPrice = (productId: string, price: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, customPrice: price } : item));
  };

  const handleUpdateCustomDiscount = (productId: string, discountPct: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, customDiscount: discountPct } : item));
  };

  // Calculations
  const calculatedTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
      const discountPct = item.customDiscount !== undefined ? item.customDiscount : 0;
      const lineSubtotal = price * item.quantity;
      const lineDiscount = (lineSubtotal * discountPct) / 100;
      return sum + (lineSubtotal - lineDiscount);
    }, 0);

    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * gstPercent) / 100;
    const extraCharges = loadingCharges + labourCharges + otherCharges;
    const grandTotal = taxableAmount + taxAmount + extraCharges;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      extraCharges,
      grandTotal
    };
  }, [cart, discountPercent, gstPercent, loadingCharges, labourCharges, otherCharges]);

  // Draft Actions
  const handleSaveAsDraft = async () => {
    if (cart.length === 0) {
      alert("Cannot save an empty cart as draft. Choose materials first.");
      return;
    }
    
    const draftId = activeDraftId || `DFT-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`;
    const newDraft = {
      id: draftId,
      customerName: customerName.trim() || 'Untitled Draft Client',
      customerPhone: customerPhone.trim() || 'N/A',
      customerAddress: customerAddress.trim() || 'N/A',
      cart: cart,
      discountPercent: discountPercent,
      gstPercent: gstPercent,
      loadingCharges: loadingCharges,
      labourCharges: labourCharges,
      otherCharges: otherCharges,
      otherChargesRemarks: otherChargesRemarks,
      paidAmountInput: paidAmountInput,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'drafts', draftId), newDraft);
      setActiveDraftId(draftId);
      alert(`Draft Bill stored successfully in cloud! ID: ${draftId}`);
      playScanBeep();
    } catch (e) {
      console.error("Error saving draft:", e);
    }
  };

  const handleLoadDraft = (draft: any) => {
    setActiveDraftId(draft.id);
    setCustomerName(draft.customerName || '');
    setCustomerPhone(draft.customerPhone || '');
    setCustomerAddress(draft.customerAddress || '');
    setCart(draft.cart || []);
    setDiscountPercent(draft.discountPercent || 0);
    setGstPercent(draft.gstPercent || 18);
    setLoadingCharges(draft.loadingCharges || 0);
    setLabourCharges(draft.labourCharges || 0);
    setOtherCharges(draft.otherCharges || 0);
    setOtherChargesRemarks(draft.otherChargesRemarks || '');
    setPaidAmountInput(draft.paidAmountInput || '');
    setPaymentMethod(draft.paymentMethod || 'Cash');
    playScanBeep();
  };

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await deleteDoc(doc(db, 'drafts', draftId));
      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }
      playScanBeep();
    } catch (e) {
      console.error("Error deleting draft:", e);
    }
  };

  const actualPaidAmount = paidAmountInput === '' ? calculatedTotals.grandTotal : (parseFloat(paidAmountInput) || 0);
  const calculatedDueAmount = Math.max(0, calculatedTotals.grandTotal - actualPaidAmount);

  // Process and Submit Real Invoice
  const handleProcessAndPay = async (e: React.FormEvent) => {
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
      items: cart.map(item => {
        const itemPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;
        const itemDiscount = item.customDiscount !== undefined ? item.customDiscount : 0;
        const lineSubtotal = itemPrice * item.quantity;
        const lineDiscountAmount = (lineSubtotal * itemDiscount) / 100;
        return {
          productName: item.product.name,
          sku: item.product.sku,
          price: itemPrice,
          quantity: item.quantity,
          unit: item.product.unit,
          size: item.product.size,
          total: lineSubtotal - lineDiscountAmount,
          remark: item.remark,
          productImage: item.product.image,
          discountAmount: lineDiscountAmount
        };
      }),
      subtotal: calculatedTotals.subtotal,
      discountRate: discountPercent,
      discountAmount: calculatedTotals.discountAmount,
      taxRate: gstPercent,
      taxAmount: calculatedTotals.taxAmount,
      grandTotal: calculatedTotals.grandTotal,
      paymentMethod,
      timestamp: new Date().toISOString(),
      
      // Extra charges
      loadingCharges: loadingCharges,
      labourCharges: labourCharges,
      otherCharges: otherCharges,
      otherChargesRemarks: otherChargesRemarks.trim() || undefined,
      
      // Part payments deposition
      paidAmount: actualPaidAmount,
      dueAmount: calculatedDueAmount,
      deliveryStatus: 'Pending'
    };

    // Clean up active billing drafts if matched in Firestore
    if (activeDraftId) {
      try {
        await deleteDoc(doc(db, 'drafts', activeDraftId));
        setActiveDraftId(null);
      } catch (err) {
        console.error("Error deleting draft:", err);
      }
    }

    // Substract Stock counts permanently from Main Inventory!
    cart.forEach(item => {
      onUpdateStock(
        item.product.id,
        item.quantity,
        'OUT',
        `Sales POS Invoice ${invoiceNumber} issued to user ${preparedInvoice.customerName}`
      );
    });

    // Write invoice to Firestore database
    try {
      await setDoc(doc(db, 'invoices', preparedInvoice.invoiceNumber), preparedInvoice);
    } catch (err) {
      console.error("Error writing invoice to Firestore:", err);
    }

    // Clear state & show high fidelity invoice layout
    setCurrentInvoice(preparedInvoice);
    setIsSuccessModalOpen(true);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountPercent(0);
    setLoadingCharges(0);
    setLabourCharges(0);
    setOtherCharges(0);
    setOtherChargesRemarks('');
    setPaidAmountInput('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing-container">
      {/* Overview Intro Banner - Highly clean, professional and corporate */}
      <div className="bg-white text-stone-900 rounded-2xl p-5 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden" id="pos-banner">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-stone-50 rounded-xl text-stone-900 border border-stone-250 shrink-0">
            <Receipt className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-stone-900">Showroom Sales Counter</h2>
            <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">
              Create GST-compliant retail invoices. Quantities will automatically adjust inside stock registries upon finalization.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-stone-50 border border-stone-200 py-1 px-2.5 rounded-lg text-center">
            <div className="flex items-center text-[10.5px] font-medium text-stone-700 gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ledger Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6 mt-2" id="billing-subtabs">
        <button
          onClick={() => setBillingSubTab('checkout')}
          className={`pb-3 text-xs font-semibold transition-all relative flex items-center space-x-1.5 cursor-pointer ${
            billingSubTab === 'checkout'
              ? 'text-stone-900 border-b-2 border-stone-900 font-bold font-sans'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
          <span>New Invoice Checkout</span>
        </button>
        <button
          id="btn-pos-insights"
          onClick={() => setBillingSubTab('insights')}
          className={`pb-3 text-xs font-semibold transition-all relative flex items-center space-x-1.5 cursor-pointer ${
            billingSubTab === 'insights'
              ? 'text-stone-900 border-b-2 border-stone-900 font-bold font-sans'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <History className="w-3.5 h-3.5 text-stone-500" />
          <span>Invoices History ({invoices.length})</span>
        </button>
      </div>

      {billingSubTab === 'checkout' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pos-grid">
        
        {/* Left Column: Product Catalog Section (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4" id="pos-search-panel">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all duration-305">
            {/* Inline Scanner Animations Style sheet */}
            <style>{`
              @keyframes scanLineSweep {
                0% { top: 4%; opacity: 0.8; }
                50% { top: 96%; opacity: 0.95; }
                100% { top: 4%; opacity: 0.8; }
              }
            `}</style>

            {!isScannerOpen ? (
              <div 
                onClick={() => {
                  setIsScannerOpen(true);
                  playScanBeep();
                }}
                className="p-5.5 bg-gradient-to-br from-stone-50 via-amber-50/10 to-stone-50/50 border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-100/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 group shadow-3xs"
                id="camera-scanner-welcome-card"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-amber-400 group-hover:text-stone-950 transition-all duration-350 shrink-0">
                    <QrCode className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-950 uppercase tracking-tight flex items-center gap-2">
                      <span>📸 {TRANSLATIONS[language]?.digitalShowroom || 'Barcode Checkout'} Scanner</span>
                      <span className="text-[8px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded uppercase">
                        QR Scan Assist
                      </span>
                    </h3>
                    <p className="text-[10.5px] text-stone-500 leading-normal mt-0.5 max-w-md">
                      Scan product QR labels on boxes directly via smartphone camera or webcam to add vitrified tile models instantly to your active invoice bill.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-[11px] font-black bg-stone-950 text-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 shrink-0 border border-stone-850 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Start Live Camera</span>
                </button>
              </div>
            ) : (
              <>
                {/* Header / Config Bar */}
                <div className="bg-stone-950 px-4 py-3 flex items-center justify-between text-white border-b border-stone-800">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400 animate-pulse"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans text-stone-100 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Camera Scanner Active</span>
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsScannerOpen(false);
                      playScanBeep();
                    }}
                    className="px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer border bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 hover:border-stone-700"
                  >
                    <span>Turn Off Camera</span>
                  </button>
                </div>

                <div className="p-4 bg-stone-50 space-y-4 font-sans text-xs">
                  {/* Camera Permission/Fail Error banner */}
                  {cameraError && (
                    <div className="bg-rose-50 border border-rose-250 rounded-xl p-3 text-rose-800 text-[11px] font-sans flex items-start space-x-3">
                      <span className="text-rose-700 font-bold uppercase tracking-wider shrink-0">Note:</span>
                      <p className="flex-1 leading-normal font-medium">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setCameraError(null)}
                        className="text-[10px] font-bold text-stone-500 hover:text-stone-900 ml-1.5 cursor-pointer bg-transparent border-none"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Active scan status */}
                  <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all duration-300 ${
                    scanStatus.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' 
                      : scanStatus.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                      : 'bg-stone-900 border-stone-800 text-stone-300 font-mono text-[11px]'
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${scanStatus.type === 'success' ? 'bg-emerald-500 animate-pulse' : scanStatus.type === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`} />
                    <p className="truncate flex-1 leading-tight">{scanStatus.text}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Camera viewports */}
                    <div className="md:col-span-6 bg-stone-950 rounded-xl relative overflow-hidden h-64 flex flex-col items-center justify-center border border-stone-800 shadow-sm">
                      <div className="absolute inset-0 flex flex-col justify-end bg-stone-900 overflow-hidden">
                        <div id="real-camera-scan-region" className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                        
                        {/* Target alignment framing overlay with beautiful borders */}
                        <div className="absolute inset-x-12 inset-y-12 border-2 border-stone-400/50 rounded-xl pointer-events-none z-10 flex items-center justify-center bg-transparent">
                          <span className="w-10 h-[2px] bg-emerald-500 shadow-sm animate-pulse flex shrink-0"></span>
                        </div>
                        
                        {/* Clean sweep scan line */}
                        <div 
                          className="absolute left-0 right-0 h-[1.5px] bg-emerald-400 shadow-sm z-20 pointer-events-none" 
                          style={{ animation: 'scanLineSweep 2.5s infinite linear' }}
                        />

                        <div className="absolute bottom-3 inset-x-0 text-center z-20">
                          <span className="bg-stone-950/80 backdrop-blur-md text-[9.5px] px-2.5 py-1 rounded-md text-emerald-400 font-mono tracking-wider border border-emerald-900">
                            CAMERA VIEWPORT ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Manual Input controls */}
                    <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-850 uppercase tracking-wider font-sans">
                          Camera Scan Assist
                        </label>
                        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                          Aim your camera lens directly over any product's printed QR label. The system will look up the model and instantly add it to the active bill below.
                        </p>

                        {/* Camera Selector Dropdown */}
                        {availableCameras.length > 1 && (
                          <div className="mt-3 bg-white border border-stone-200 p-2 rounded-lg">
                            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                              Camera Device Source:
                            </label>
                            <select 
                              value={selectedCameraId}
                              onChange={(e) => {
                                setSelectedCameraId(e.target.value);
                                setCameraError(null);
                              }}
                              className="w-full bg-stone-50 border border-stone-200 py-1 px-2 rounded-md text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer"
                            >
                              {availableCameras.map(cam => (
                                <option key={cam.id} value={cam.id}>
                                  {cam.label || `Alternative Device (${cam.id.slice(0, 5)})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Active call to connect real camera if function is provided */}
                      {onConnectPhone && (
                        <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-3 flex items-center justify-between shadow-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10.5px] font-bold text-stone-800 block">External Android Scan Assist?</span>
                              <span className="text-[10px] text-stone-500 block leading-tight">Connect phone to bypass web camera limits</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={onConnectPhone}
                            className="bg-stone-900 hover:bg-stone-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Connect Mobile
                          </button>
                        </div>
                      )}

                      {/* Quick demo hotkeys */}
                      <div className="bg-white border border-stone-200 p-2.5 rounded-xl">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1.5">Quick-Scan Simulator:</span>
                        <div className="flex flex-wrap gap-1.5 font-sans">
                          {products.slice(0, 4).map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleScannerScan(p.sku)}
                              className="bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 hover:border-stone-400 py-1 px-2 rounded font-mono text-[10px] transition-all flex items-center space-x-1 cursor-pointer"
                              title={`Simulate Scan for SKU ${p.sku}`}
                            >
                              <span className="font-sans text-[8px] font-bold bg-amber-500 text-white px-1 py-0.2 rounded-sm mr-1">SCAN</span>
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
                            placeholder="Type or paste SKU code directly..."
                            value={manualScanInput}
                            onChange={(e) => setManualScanInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleScannerScan(manualScanInput);
                              }
                            }}
                            className="w-full pl-2.5 pr-2 py-1.5 text-xs border border-stone-250 bg-white font-mono uppercase font-bold focus:ring-1 focus:ring-stone-500 rounded-lg focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleScannerScan(manualScanInput)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                          title="Add to invoice"
                        >
                          Add to Bill
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Search, Filter & Product Auto-Lookup Tools */}
          <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
              <input
                id="pos-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type SKU code, variant name, material or ID category..."
                className="w-full pl-11 pr-4 py-2.5 text-xs font-bold border-2 border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors text-stone-900"
              />
            </div>
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1">
              {subcategories.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedSubcategory === sub
                      ? 'bg-amber-500 text-stone-950 font-black border-2 border-amber-400'
                      : 'bg-stone-50 text-stone-605 border-2 border-transparent hover:bg-stone-100'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Smart Search Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm" id="pos-product-list">
            {!searchQuery ? (
              <div className="py-10 px-4 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-800">
                    Product Lookup Registry
                  </h4>
                  <p className="text-xs text-stone-550 max-w-md mx-auto leading-relaxed font-medium">
                    Please type a model name, SKU code/ID, or tile finish in the search bar above (or toggle the camera scan icon on the cart) to look up items.
                  </p>
                </div>
                
                {/* Popular Shortcuts */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2.5">
                    🚀 Popular Ceramic SKU Shortcuts
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {products.slice(0, 8).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(p.sku);
                        }}
                        className="bg-stone-50 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{p.name} ({p.sku})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3.5 font-mono flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-sans font-extrabold text-stone-800">Search Results ({filteredProducts.length})</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-stone-700 font-bold text-[10px] uppercase tracking-wider bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-all"
                  >
                    Clear Search ✕
                  </button>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="py-14 text-center text-stone-400 text-xs">
                    <Compass className="w-9 h-9 mx-auto mb-2 opacity-30" />
                    No matching ceramic series, fittings or tiles found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {filteredProducts.map(p => {
                      const isOutOfStock = p.stock <= 0;
                      const isInLowStock = p.stock > 0 && p.stock <= p.minStock;
                      const inCartItem = cart.find(item => item.product.id === p.id);
                      const inCartQty = inCartItem ? inCartItem.quantity : 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => !isOutOfStock && handleAddToBill(p)}
                          className={`group border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between transition-all gap-3 relative ${
                            isOutOfStock 
                              ? 'bg-stone-50/75 border-stone-150 opacity-60 cursor-not-allowed'
                              : 'bg-white border-stone-200 hover:border-amber-500 hover:bg-amber-50/5 cursor-pointer shadow-3xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img 
                              src={p.image} 
                              alt="" 
                              className="w-11 h-11 object-cover rounded-lg border border-stone-150 shadow-3xs shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                <span className="text-[9px] font-mono bg-stone-100 text-stone-605 px-1.5 py-0.2 rounded font-bold uppercase">
                                  {p.subcategory}
                                </span>
                                <span className="text-[9.5px] font-mono text-stone-500 font-bold">Code: {p.sku}</span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5 group-hover:text-amber-650 transition-colors">
                                {p.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                            <div className="text-left md:text-right">
                              <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold leading-none">Price</p>
                              <span className="font-mono text-xs font-black text-stone-900 block mt-0.5">
                                ₹{p.price.toLocaleString('en-IN')}<span className="text-[9px] text-stone-400 font-normal">/{p.unit}</span>
                              </span>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold leading-none">Stock</p>
                              {isOutOfStock ? (
                                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 rounded block mt-0.5">SOLD OUT</span>
                              ) : (
                                <span className={`font-mono text-xs font-bold block mt-[1px] ${isInLowStock ? 'text-amber-500 bg-amber-50 px-1 rounded' : 'text-stone-700'}`}>
                                  {p.stock} {p.unit}
                                </span>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              className={`h-8 w-22 text-[10.5px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border shadow-3xs ${
                                isOutOfStock
                                  ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                                  : inCartQty > 0
                                  ? 'bg-amber-500 border-amber-400 text-stone-950 font-black'
                                  : 'bg-stone-950 border-stone-850 text-white hover:bg-stone-850 hover:border-stone-750'
                              }`}
                            >
                              {inCartQty > 0 ? (
                                <span className="uppercase text-[9px] font-black">Selected ({inCartQty})</span>
                              ) : (
                                <span className="uppercase text-[9px] font-black">+ Add</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: POS Active Cart and Checkout (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4" id="pos-billing-cart">
          <form onSubmit={handleProcessAndPay} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5 flex-1 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header Title & Mode Selector */}
              <div className="pb-3 border-b border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-stone-900 font-sans">Active Bill Cart</h3>
                  </div>

                  <span className="text-xs bg-stone-100 px-2 py-1 rounded-full font-mono font-bold text-stone-600">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                {/* Showroom vs Store Billing Mode Selector */}
                <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-xl text-stone-700 text-[10px] font-black uppercase tracking-wider relative shadow-3xs border border-stone-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingMode('showroom');
                      playScanBeep();
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      billingMode === 'showroom'
                        ? 'bg-white text-stone-950 shadow-3xs font-extrabold border-stone-150'
                        : 'text-stone-500 hover:text-stone-850'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-500" />
                    <span>🏬 Showroom POS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBillingMode('store');
                      setIsScannerOpen(false); // Disables scanner directly
                      playScanBeep();
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      billingMode === 'store'
                        ? 'bg-stone-950 text-white shadow-3xs font-extrabold'
                        : 'text-stone-500 hover:text-stone-850'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>🛒 Store Counter</span>
                  </button>
                </div>

                {/* Conditional Scanner Alert / Trigger */}
                {billingMode === 'showroom' ? (
                  <div className="flex items-center justify-between bg-amber-500/5 border border-amber-300/40 p-2 rounded-xl">
                    <span className="text-[9px] text-amber-800 font-semibold uppercase tracking-wider flex items-center gap-1">
                      📸 Crate QR Scanner Available
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScannerOpen(!isScannerOpen);
                        playScanBeep();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border shadow-3xs ${
                        isScannerOpen
                          ? 'bg-amber-500 text-stone-950 border-amber-400 scale-105'
                          : 'bg-white text-stone-800 border-stone-200 hover:bg-amber-100'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isScannerOpen ? 'Turn Scanner Off' : 'Open Camera'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-55/40 border border-emerald-400/20 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider">
                      ⚡ Store Mode Active (Manual cart edits with direct payment captures)
                    </span>
                  </div>
                )}
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
                      className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-3xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-stone-50/70 hover:bg-stone-50 gap-4 transition-colors">
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
                            
                            if (p.category === 'Tiles' || p.category === 'Marble') {
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

                          {/* Render Active Calculations remarks */}
                          {item.remark && (
                            <div className="mt-1 flex items-center space-x-1.5 text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-md font-mono self-start w-max">
                              <span>📐 {item.remark}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, remark: undefined } : c));
                                }}
                                className="text-emerald-500 hover:text-emerald-800 font-bold ml-1 text-[8.5px]"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* Quick calculator trigger button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (openedCalcId === item.product.id) {
                                setOpenedCalcId(null);
                              } else {
                                setOpenedCalcId(item.product.id);
                                if (item.product.category === 'Tiles') {
                                  setCalcMode('wastage');
                                  setTargetArea('150');
                                  setWastagePercent('10');
                                } else {
                                  setCalcMode('slab');
                                  setSlabLength('6.5');
                                  setSlabWidth('4.0');
                                  setSlabCount('10');
                                }
                              }
                            }}
                            className="mt-1.5 block text-[8.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 cursor-pointer w-max transition-all"
                          >
                            {openedCalcId === item.product.id ? 'Hide Calc ✕' : '📐 Inline Calc Slabs / Wastage'}
                          </button>

                          {/* Row direct pricing & line discount edits */}
                          <div className="mt-3.5 pt-2.5 border-t border-stone-200/60 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-stone-500 font-bold">Price per Unit:</span>
                              <div className="relative flex items-center">
                                <span className="absolute left-1.5 text-[10px] text-stone-400 font-mono">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.customPrice !== undefined ? item.customPrice : item.product.price}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleUpdateCustomPrice(item.product.id, isNaN(val) ? 0 : val);
                                  }}
                                  className="w-18 pl-4 pr-1 py-0.5 text-left font-mono text-[10.5px] font-bold text-stone-850 bg-stone-50 border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-stone-500 font-bold">Line Disc:</span>
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                  value={item.customDiscount !== undefined ? item.customDiscount : ''}
                                  onChange={(e) => {
                                    let val = parseFloat(e.target.value);
                                    if (isNaN(val)) val = 0;
                                    if (val < 0) val = 0;
                                    if (val > 100) val = 100;
                                    handleUpdateCustomDiscount(item.product.id, val);
                                  }}
                                  className="w-10 pr-4 pl-1 py-0.5 text-center font-mono text-[10.5px] font-bold text-stone-850 bg-stone-50 border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <span className="absolute right-1 text-[10px] text-stone-400 font-mono">%</span>
                              </div>
                            </div>

                            {(() => {
                              const pr = item.customPrice !== undefined ? item.customPrice : item.product.price;
                              const di = item.customDiscount !== undefined ? item.customDiscount : 0;
                              const lineTotal = (pr * item.quantity) * (1 - di / 100);
                              return (
                                <div className="ml-auto text-right text-[11px] font-extrabold text-stone-900 font-mono bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded">
                                  ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Controls Counter and Delete */}
                        <div className="flex items-center lg:flex-col gap-2.5 shrink-0 self-end md:self-center">
                          <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.product.id, -1)}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleSetCartQty(item.product.id, isNaN(val) ? 0 : val);
                              }}
                              className="w-12 text-center font-mono text-xs font-bold text-stone-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                            />
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
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                            title="Purge item from draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Inline measurements section */}
                      {openedCalcId === item.product.id && (
                        <div className="bg-stone-100/95 border-t border-stone-200/90 p-3 space-y-3 antialiased">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                            <span className="text-stone-700">Measurements Helper</span>
                            <div className="flex bg-stone-200 p-0.5 rounded text-[8px]">
                              <button
                                type="button"
                                onClick={() => setCalcMode('slab')}
                                className={`px-2 py-0.5 rounded-sm transition-all ${calcMode === 'slab' ? 'bg-white text-stone-900 font-extrabold shadow-3xs' : 'text-stone-550 hover:text-stone-850'}`}
                              >
                                Slab (L×W×N)
                              </button>
                              <button
                                type="button"
                                onClick={() => setCalcMode('wastage')}
                                className={`px-2 py-0.5 rounded-sm transition-all ${calcMode === 'wastage' ? 'bg-white text-stone-900 font-extrabold shadow-3xs' : 'text-stone-550 hover:text-stone-850'}`}
                              >
                                Tile (+Wastage)
                              </button>
                            </div>
                          </div>

                          {calcMode === 'slab' ? (
                            <div className="space-y-2.5">
                              <p className="text-[9px] text-stone-500 leading-tight">
                                Recommended for marble slabs or granite pieces. Enter dimensions in standard feet and run total area.
                              </p>
                              
                              <div className="grid grid-cols-3 gap-1.5 text-[9.5px] font-mono">
                                <div>
                                  <label className="block text-stone-500 uppercase text-[7.5px] mb-0.5 font-bold">Length (ft):</label>
                                  <input 
                                    type="number" 
                                    step="0.1"
                                    value={slabLength}
                                    onChange={(e) => setSlabLength(e.target.value)}
                                    className="w-full bg-white border border-stone-250 rounded px-1 py-0.5 text-center font-bold text-stone-800 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-500 uppercase text-[7.5px] mb-0.5 font-bold">Width (ft):</label>
                                  <input 
                                    type="number" 
                                    step="0.1"
                                    value={slabWidth}
                                    onChange={(e) => setSlabWidth(e.target.value)}
                                    className="w-full bg-white border border-stone-250 rounded px-1 py-0.5 text-center font-bold text-stone-800 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-500 uppercase text-[7.5px] mb-0.5 font-bold">Slabs (pcs):</label>
                                  <input 
                                    type="number" 
                                    step="1"
                                    value={slabCount}
                                    onChange={(e) => setSlabCount(e.target.value)}
                                    className="w-full bg-white border border-stone-250 rounded px-1 py-0.5 text-center font-bold text-stone-800 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {(() => {
                                const l = parseFloat(slabLength) || 0;
                                const w = parseFloat(slabWidth) || 0;
                                const c = Math.ceil(parseFloat(slabCount)) || 0;
                                const totalArea = Math.round(l * w * c * 10) / 10;
                                return (
                                  <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-stone-200">
                                    <div className="font-mono text-[9px] text-stone-500">
                                      <span className="font-bold text-stone-800">{l}ft</span> × <span className="font-bold text-stone-800">{w}ft</span> × <span className="font-bold text-stone-800">{c} slabs</span>
                                    </div>
                                    <div className="text-right font-mono text-[10px]">
                                      <span className="text-stone-400">Yield: </span>
                                      <span className="font-bold text-amber-700">{totalArea} sqft</span>
                                    </div>
                                  </div>
                                );
                              })()}

                              <button
                                type="button"
                                onClick={() => {
                                  const l = parseFloat(slabLength) || 0;
                                  const w = parseFloat(slabWidth) || 0;
                                  const c = Math.ceil(parseFloat(slabCount)) || 0;
                                  const totalArea = Math.round(l * w * c);
                                  
                                  if (totalArea <= 0) return;
                                  
                                  setCart(prev => prev.map(cItem => 
                                    cItem.product.id === item.product.id 
                                      ? { 
                                          ...cItem, 
                                          quantity: totalArea, 
                                          remark: `${c} Slabs (${l}' × ${w}')` 
                                        }
                                      : cItem
                                  ));
                                  setOpenedCalcId(null);
                                }}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-mono text-[9px] font-extrabold py-1 rounded uppercase tracking-wider cursor-pointer text-center"
                              >
                                Apply math values ✓
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <p className="text-[9px] text-stone-500 leading-tight">
                                Recommended for architectural flooring tiles. Enter target lay room size and select standard cutting wastage offsets.
                              </p>

                              <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono">
                                <div>
                                  <label className="block text-stone-500 uppercase text-[7.5px] mb-0.5 font-bold">Target (sqft):</label>
                                  <input 
                                    type="number" 
                                    value={targetArea}
                                    onChange={(e) => setTargetArea(e.target.value)}
                                    className="w-full bg-white border border-stone-250 rounded px-1 py-0.5 text-center font-bold text-stone-805 text-stone-800 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-500 uppercase text-[7.5px] mb-0.5 font-bold">Wastage Margin:</label>
                                  <select 
                                    value={wastagePercent}
                                    onChange={(e) => setWastagePercent(e.target.value)}
                                    className="w-full bg-white border border-stone-250 rounded p-0.5 py-0.5 text-center font-bold text-stone-800 text-[9px] focus:outline-none cursor-pointer"
                                  >
                                    <option value="0">0% perfect</option>
                                    <option value="5">5% simple layout</option>
                                    <option value="10">10% standard</option>
                                    <option value="15">15% high cut wastage</option>
                                  </select>
                                </div>
                              </div>

                              {(() => {
                                const target = parseFloat(targetArea) || 0;
                                const waste = parseFloat(wastagePercent) || 0;
                                const boxCov = item.product.boxCoverage || 12.5;
                                
                                const totalNeeded = target * (1 + waste / 100);
                                const boxes = Math.ceil(totalNeeded / boxCov);
                                const finalBillableArea = boxes * boxCov;

                                return (
                                  <div className="space-y-1 bg-white p-2 rounded border border-stone-200 font-mono text-[9px]">
                                    <div className="flex justify-between text-stone-500">
                                      <span>Area + Waste:</span>
                                      <span className="font-semibold text-stone-800">{totalNeeded.toFixed(1)} sqft</span>
                                    </div>
                                    <div className="flex justify-between text-stone-500 border-t border-stone-50 pt-1">
                                      <span>Cartons / Boxes Required:</span>
                                      <span className="font-bold text-stone-900">{boxes} Boxes</span>
                                    </div>
                                    <div className="flex justify-between text-stone-500 border-t border-stone-50 pt-1">
                                      <span>Invoiced coverage:</span>
                                      <span className="font-bold text-amber-700">{finalBillableArea.toFixed(1)} sqft</span>
                                    </div>
                                  </div>
                                );
                              })()}

                              <button
                                type="button"
                                onClick={() => {
                                  const target = parseFloat(targetArea) || 0;
                                  const waste = parseFloat(wastagePercent) || 0;
                                  const boxCov = item.product.boxCoverage || 12.5;
                                  
                                  const totalNeeded = target * (1 + waste / 100);
                                  const boxes = Math.ceil(totalNeeded / boxCov);
                                  const finalBillableArea = boxes * boxCov;

                                  if (boxes <= 0) return;

                                  setCart(prev => prev.map(cItem => 
                                    cItem.product.id === item.product.id 
                                      ? { 
                                          ...cItem, 
                                          quantity: finalBillableArea,
                                          remark: `${boxes} Boxes (for ${target} sqft +${waste}% waste)` 
                                        }
                                      : cItem
                                  ));
                                  setOpenedCalcId(null);
                                }}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-mono text-[9px] font-extrabold py-1 rounded uppercase tracking-wider cursor-pointer text-center"
                              >
                                Apply box estimators ✓
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SAVED DRAFTS DIRECTORY LAYOUT */}
              {drafts.length > 0 && (
                <div className="bg-stone-50 border-2 border-stone-200 p-3.5 rounded-2xl space-y-2.5 shadow-3xs" id="billing-drafts-list-container">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-stone-850 uppercase tracking-wider font-mono flex items-center gap-1">
                      📂 Saved Draft Bills ({drafts.length})
                    </span>
                    {activeDraftId && (
                      <span className="text-[8.5px] bg-amber-500 text-stone-950 font-extrabold px-1.5 py-0.5 rounded font-mono animate-pulse">
                        Editing: {activeDraftId}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {drafts.map((d: any) => (
                      <div
                        key={d.id}
                        onClick={() => handleLoadDraft(d)}
                        className={`p-2.5 rounded-xl border text-[11px] flex justify-between items-center transition-all cursor-pointer ${
                          activeDraftId === d.id
                            ? 'bg-amber-100/40 border-amber-300 text-stone-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-900 font-bold truncate">
                              {d.customerName || 'Untitled Client'}
                            </span>
                            <span className="text-[9px] text-stone-400 font-mono font-normal">
                              ({d.cart.reduce((sum: number, i: any) => sum + i.quantity, 0)} {d.cart[0]?.product?.unit || 'items'})
                            </span>
                          </div>
                          <div className="text-[9px] text-stone-500 font-mono flex items-center gap-1">
                            <span>Phone: {d.customerPhone || 'N/A'}</span>
                            <span>•</span>
                            <span>{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                            title="Delete draft permanent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {activeDraftId && (
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDraftId(null);
                          setCustomerName('');
                          setCustomerPhone('');
                          setCustomerAddress('');
                          setCart([]);
                        }}
                        className="text-[9px] font-bold text-amber-600 hover:text-amber-800 underline uppercase tracking-wider bg-transparent p-0 cursor-pointer"
                      >
                        ← Clear Draft Edit & Create New Bill
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Particulars Intake (Highly Highlighted, Premium Styled Container) */}
              <div className="pt-4 pb-4 px-3.5 border-2 border-amber-300 rounded-2xl bg-gradient-to-br from-teal-500/5 via-stone-50 to-amber-500/5 space-y-3 shadow-xs relative overflow-hidden" id="pos-customer-particulars-highlight-box">
                {/* Visual side-marker for attention */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                
                <div className="text-[11px] font-black text-stone-900 uppercase tracking-widest font-sans flex items-center justify-between">
                  <span className="flex items-center gap-1">👤 Client & Project Particulars</span>
                  <span className="text-[8.5px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">Ledger Connected ✓</span>
                </div>

                {/* Search existing ledger accounts picker */}
                <div className="mt-1 relative bg-white/90 p-3 rounded-xl border-2 border-amber-200/60 shadow-3xs" id="pos-ledger-search">
                  <span className="block text-[8.5px] font-black text-amber-900 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1">
                    🔍 Existing Account Lookup (Ledger Directory)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Search builder, contractor, client name/phone..."
                      value={ledgerSearch}
                      onChange={(e) => {
                        setLedgerSearch(e.target.value);
                        setShowLedgerDropdown(true);
                      }}
                      onFocus={() => setShowLedgerDropdown(true)}
                      className="flex-1 px-3 py-2 text-[11px] border-2 border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-stone-900"
                    />
                    {ledgerSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setLedgerSearch('');
                          setShowLedgerDropdown(false);
                        }}
                        className="px-2.5 py-1 text-[9.5px] font-black uppercase bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Dropdown list */}
                  {showLedgerDropdown && (
                    <div className="absolute left-1 right-1 mt-1 bg-white border border-stone-300 rounded-xl max-h-48 overflow-y-auto shadow-lg z-20 divide-y divide-stone-100">
                      {(() => {
                        const matching = customersSummaryList.filter(c => 
                          c.name.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          c.phone.includes(ledgerSearch)
                        );
                        if (matching.length === 0) {
                          return (
                            <div className="p-3 text-center text-stone-405 font-mono text-[9px] italic">
                              No accounts match. Type fields below to check out as generic walk-in.
                            </div>
                          );
                        }
                        return matching.map(c => {
                          const hasAdvance = c.outstanding < 0;
                          return (
                            <button
                              key={c.name + c.phone}
                              type="button"
                              onClick={() => {
                                setCustomerName(c.name);
                                setCustomerPhone(c.phone === 'N/A' ? '' : c.phone);
                                setCustomerAddress(c.address.includes('Payment Account Only') ? '' : c.address);
                                setLedgerSearch(c.name);
                                setShowLedgerDropdown(false);
                              }}
                              className="w-full text-left p-2 hover:bg-stone-50 flex items-center justify-between text-[10.5px] font-medium transition-colors cursor-pointer"
                            >
                              <div className="pl-1">
                                <span className="font-bold text-stone-900 block">{c.name}</span>
                                <span className="text-[8.5px] text-stone-500 font-mono">{c.phone || 'No phone'} • {c.address.slice(0, 32)}...</span>
                              </div>
                              <div className="text-right pr-1">
                                {hasAdvance ? (
                                  <span className="text-[8.5px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1.5 py-0.5 rounded font-mono block">
                                    Credit: ₹{Math.abs(c.outstanding).toLocaleString('en-IN')}
                                  </span>
                                ) : c.outstanding > 0 ? (
                                  <span className="text-[8.5px] bg-red-50 text-red-800 border border-red-100 font-bold px-1.5 py-0.5 rounded font-mono block">
                                    Due: ₹{c.outstanding.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-[8.5px] bg-stone-100 text-stone-605 font-bold px-1.5 py-0.5 rounded font-mono block">
                                    Cleared
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {/* Active selected customer Ledger Balance display */}
                  {(() => {
                    const match = customersSummaryList.find(c => 
                      c.name.trim().toLowerCase() === customerName.trim().toLowerCase() && 
                      (customerPhone ? c.phone.trim() === customerPhone.trim() : true)
                    );
                    if (!match) return null;
                    const hasAdvance = match.outstanding < 0;
                    return (
                      <div className={`mt-2.5 p-2 rounded-lg border-2 flex items-center justify-between text-[9.5px] font-mono font-bold ${
                        hasAdvance 
                          ? 'bg-emerald-50 text-emerald-850 border-emerald-250' 
                          : match.outstanding > 0 
                            ? 'bg-rose-50 text-rose-900 border-rose-250 animate-pulse' 
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}>
                        <div className="flex items-center space-x-1">
                          <span>👤 SYSTEM STATUS:</span>
                        </div>
                        <div>
                          {hasAdvance ? (
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                              ADVANCE CREDIT: ₹{Math.abs(match.outstanding).toLocaleString('en-IN')}
                            </span>
                          ) : match.outstanding > 0 ? (
                            <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                              OUTSTANDING DUE: ₹{match.outstanding.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="bg-stone-200 text-stone-850 px-2 py-0.5 rounded uppercase text-[8px] font-black">
                              No Due
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-2.5 h-9 text-[11px] font-bold border-2 border-amber-200 bg-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-0 text-stone-900 shadow-3xs"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Contact Details"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-8 pr-2.5 h-9 text-[11px] font-bold border-2 border-amber-200 bg-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-0 text-stone-900 shadow-3xs"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Project Site Delivery Address (e.g. Penthouse Site Flat #4B)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 h-9.5 text-[11px] font-bold border-2 border-amber-200 bg-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-0 text-stone-900 shadow-3xs"
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

              {/* Extra Labor / Loading / Custom Transport Charges Panel */}
              <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl space-y-3 font-sans">
                <div className="flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">
                    🚚 Additional Billing Charges
                  </span>
                  <span className="text-[9.5px] font-mono text-amber-700 font-bold">
                    +₹{calculatedTotals.extraCharges.toLocaleString('en-IN')} Add-on
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8.5px] font-bold text-stone-550 font-mono mb-1 truncate">
                      Loading (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={loadingCharges || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLoadingCharges(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-8 px-2 text-center text-xs font-mono font-semibold bg-white border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-bold text-stone-550 font-mono mb-1 truncate">
                      Labour (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={labourCharges || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLabourCharges(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-8 px-2 text-center text-xs font-mono font-semibold bg-white border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-bold text-stone-550 font-mono mb-1 truncate">
                      Other Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={otherCharges || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setOtherCharges(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-8 px-2 text-center text-xs font-mono font-semibold bg-white border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {(loadingCharges > 0 || labourCharges > 0 || otherCharges > 0) && (
                  <div>
                    <input
                      type="text"
                      placeholder="Describe Other Charges (e.g. wooden box palleting)"
                      value={otherChargesRemarks}
                      onChange={(e) => setOtherChargesRemarks(e.target.value)}
                      className="w-full px-2 py-1 bg-white text-[9.5px] border border-stone-200 rounded outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">
                  Settlement Method
                </span>
                <div className="grid grid-cols-5 gap-1.5" id="pos-payment-method-tiles">
                  {[
                    { id: 'Cash', icon: Coins, colorClass: 'text-emerald-500', selectedClass: 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold scale-102 transform -translate-y-0.5' },
                    { id: 'Card', icon: CreditCard, colorClass: 'text-purple-500', selectedClass: 'border-purple-600 bg-purple-600 text-white shadow-md font-bold scale-102 transform -translate-y-0.5' },
                    { id: 'UPI', icon: Sparkles, colorClass: 'text-amber-500', selectedClass: 'border-amber-500 bg-amber-500 text-stone-950 shadow-md font-black scale-102 transform -translate-y-0.5' },
                    { id: 'Bank Transfer', icon: Landmark, colorClass: 'text-blue-500', selectedClass: 'border-blue-600 bg-blue-600 text-white shadow-md font-bold scale-102 transform -translate-y-0.5' },
                    { id: 'Credit', icon: Book, colorClass: 'text-rose-500', selectedClass: 'border-rose-600 bg-rose-600 text-white shadow-md font-bold scale-102 transform -translate-y-0.5 animate-pulse' }
                  ].map(method => {
                    const IconComp = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-2 px-1 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? method.selectedClass
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : method.colorClass}`} />
                        <span className="text-[9px] font-bold text-center leading-none truncate w-full">{method.id}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'Credit' && (
                  <div className="text-[10px] text-red-850 bg-red-50/70 px-2.5 py-1.5 rounded-xl border border-red-150 text-center w-full font-semibold mt-2 font-mono">
                    ⚠️ Credit Registry Book: Outstanding ₹{calculatedTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} will be added to {customerName.trim() || 'Valued Walk-In Client'}'s balance ledger.
                  </div>
                )}
              </div>

              {/* Localized Part Payment / Deposited Advance/ Udhaar Setting (Color-Toned & Highly Highlighted Box) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-teal-500/5 border-2 border-amber-300 rounded-2xl p-4.5 space-y-3.5 font-sans relative overflow-hidden shadow-xs" id="billing-part-payment-highlight-box">
                {/* Visual marker */}
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-stone-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💵 {TRANSLATIONS[language].receivePartPayment}</span>
                  </span>
                  <span className="text-[8.5px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Udhaar Settings
                  </span>
                </div>
                
                <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
                  {TRANSLATIONS[language].receivePartPaymentDesc}
                </p>

                {/* Quick Terms Selector Buttons - Highly highlighted */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput('')}
                    className={`px-2 py-2.5 text-[9px] font-black rounded-xl border-2 transition-all truncate uppercase flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      paidAmountInput === ''
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102 transform -translate-y-0.5'
                        : 'bg-white text-stone-700 border-stone-250 hover:bg-stone-50'
                    }`}
                  >
                    <span>🚀 100% Cash</span>
                    <span className="text-[7.5px] font-bold opacity-80">({TRANSLATIONS[language].fullyPaidBtn})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (paidAmountInput === '' || parseFloat(paidAmountInput) === 0) {
                        setPaidAmountInput(Math.round(calculatedTotals.grandTotal * 0.5).toString());
                      }
                    }}
                    className={`px-2 py-2.5 text-[9px] font-black rounded-xl border-2 transition-all truncate uppercase flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      paidAmountInput !== '' && parseFloat(paidAmountInput) > 0 && parseFloat(paidAmountInput) < calculatedTotals.grandTotal
                        ? 'bg-amber-500 text-white border-amber-505 shadow-md scale-102 transform -translate-y-0.5'
                        : 'bg-white text-stone-700 border-stone-250 hover:bg-stone-50'
                    }`}
                  >
                    <span>🌗 Part Paid</span>
                    <span className="text-[7.5px] font-bold opacity-80">({TRANSLATIONS[language].partPaidBtn})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput('0')}
                    className={`px-2 py-2.5 text-[9px] font-black rounded-xl border-2 transition-all truncate uppercase flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      paidAmountInput === '0'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102 transform -translate-y-0.5'
                        : 'bg-white text-stone-700 border-stone-250 hover:bg-stone-50'
                    }`}
                  >
                    <span>📖 Full Udhaar</span>
                    <span className="text-[7.5px] font-bold opacity-80">({TRANSLATIONS[language].allDueBtn})</span>
                  </button>
                </div>

                {/* Amount input block - enhanced feedback */}
                <div className="space-y-2 pt-1 border-t border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={calculatedTotals.grandTotal}
                        step="any"
                        placeholder={`Paid amount... (e.g. ₹${Math.ceil(calculatedTotals.grandTotal).toLocaleString('en-IN')})`}
                        value={paidAmountInput}
                        onChange={(e) => setPaidAmountInput(e.target.value)}
                        className="w-full h-9 pl-6.5 pr-2.5 text-xs font-mono font-bold bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-3xs"
                      />
                    </div>
                  </div>

                  {/* Quick percentage helper buttons if choosing split payment */}
                  {paidAmountInput !== '' && parseFloat(paidAmountInput) < calculatedTotals.grandTotal && (
                    <div className="flex items-center gap-1.5 bg-white/85 p-1.5 rounded-xl border border-stone-200">
                      <span className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mr-1">Ratios:</span>
                      {[0.25, 0.50, 0.75].map((pct) => {
                        const calculatedAmt = Math.round(calculatedTotals.grandTotal * pct);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setPaidAmountInput(calculatedAmt.toString())}
                            className="bg-white hover:bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-[8.5px] font-mono text-stone-700 transition-all font-bold cursor-pointer"
                          >
                            {pct * 100}% (₹{calculatedAmt.toLocaleString('en-IN')})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ledger ledger / balance due visual ledger impact status display (Outstanding Highlights) */}
                <div className="pt-2.5 flex flex-col gap-1.5 text-[11px] font-mono border-t border-amber-200">
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-55/40 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-sans">
                    <span className="font-bold">{TRANSLATIONS[language].paidAmountLabel} (Jama):</span>
                    <span className="font-extrabold font-mono text-xs">₹{actualPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {calculatedDueAmount > 0 ? (
                    <div className="flex justify-between items-center text-red-800 bg-red-105/50 px-2.5 py-2 rounded-lg border-2 border-red-200 font-sans animate-pulse">
                      <span className="font-black text-red-700">Remaining Due (Udhaar / Baqaya):</span>
                      <span className="font-black font-mono text-xs">₹{calculatedDueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-sans">
                      <span className="font-bold">Outstanding Due:</span>
                      <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        Full Cash Paid ✔
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calculations breakdown and Process receipt button with pristine visibility */}
            <div className="pt-4 border-t border-stone-150 space-y-3.5">
              <div className="space-y-2 font-mono text-[12px] text-stone-700 bg-stone-900 text-stone-200 p-3.5 rounded-2xl border-2 border-stone-950 shadow-sm leading-relaxed" id="billing-summary-ticket">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal Amount:</span>
                  <span className="font-semibold text-white">₹{calculatedTotals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Deduction ({discountPercent}%):</span>
                    <span className="font-semibold">-₹{calculatedTotals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {gstPercent > 0 && (
                  <div className="flex justify-between text-stone-300">
                    <span>GST / Sales Tax ({gstPercent}%):</span>
                    <span className="font-semibold text-white">+₹{calculatedTotals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 border-t border-stone-800 font-sans text-xs font-black text-white">
                  <span className="text-xs uppercase tracking-wider text-amber-400">Final Billed Total:</span>
                  <span className="text-base font-mono text-amber-400 font-black">₹{calculatedTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={cart.length === 0}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-1.5 cursor-pointer ${
                    cart.length === 0
                      ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed shadow-none'
                      : activeDraftId
                      ? 'bg-amber-50 hover:bg-amber-100 text-stone-900 border-amber-300 hover:shadow-3xs'
                      : 'bg-stone-55/80 hover:bg-stone-100 text-stone-750 border-stone-200 hover:shadow-3xs'
                  }`}
                >
                  <Save className="w-4 h-4 text-amber-500" />
                  <span>{activeDraftId ? 'Update Draft' : 'Save Draft'}</span>
                </button>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
                    cart.length === 0
                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                      : 'bg-stone-950 hover:bg-stone-900 text-white hover:shadow-lg'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{activeDraftId ? 'Finalize & Pay' : 'Issue POS Bill'}</span>
                </button>
              </div>
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
                            <td className="py-3 px-2 text-right font-mono text-stone-900">
                              <span className="font-extrabold text-stone-950">₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                              <div className="text-[10px] mt-0.5 space-y-0.5">
                                <div className="text-emerald-700">Recd: ₹{(inv.paidAmount ?? inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
                                {(inv.dueAmount ?? 0) > 0 ? (
                                  <div className="text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded px-1 text-[9.5px] inline-block">Due: ₹{inv.dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
                                ) : (
                                  <div className="text-stone-400 text-[9px]">Fully Paid</div>
                                )}
                              </div>
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

            {/* CSS styles to clean up system-level margins, date banners and ensure crisp document printing */}
            <style>{`
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * {
                  visibility: hidden;
                }
                #invoice-print-area, #invoice-print-area * {
                  visibility: visible;
                }
                #invoice-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0 !important;
                  padding: 12px !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            {/* Print Section wrapper matching generic Indian Tax Invoice standard */}
            <div className="p-6 md:p-8 space-y-5 bg-white text-stone-900 selection:bg-stone-100" id="invoice-print-area">
              
              {/* Main Tax Invoice Header */}
              <div className="text-center border-2 border-stone-800 p-2.5 rounded-t-xl bg-stone-50">
                <h1 className="text-xl md:text-2xl font-sans font-black tracking-widest text-stone-950 uppercase border-b border-dashed border-stone-400 pb-1.5">
                  TAX INVOICE
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-stone-605 mt-1.5 uppercase font-bold">
                  Original for Recipient • Intra-State Goods Supply Record
                </p>
              </div>

              {/* Main Border Box holding company and bill particulars */}
              <div className="border-x border-b border-stone-800 grid grid-cols-1 md:grid-cols-2 text-xs divide-y md:divide-y-0 md:divide-x divide-stone-800">
                {/* Seller Particulars (RP Tiles) */}
                <div className="p-4 space-y-2">
                  <div className="font-serif font-black text-lg text-stone-950 tracking-tight leading-none uppercase">
                    RP TILES & SANITARY
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono tracking-wide">
                    Luxury Stone, Vitrified Tiles & Sanitaryware Gallery
                  </p>
                  <p className="text-[11px] leading-relaxed text-stone-701 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                    <span>NH-57, Bus Stand, Near Pawan Motors, Araria, Bihar, PIN-854311</span>
                  </p>
                  <div className="pt-2 font-mono text-[11px] space-y-1 border-t border-stone-100 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-stone-600 text-[10px] uppercase">GSTIN / Tax ID:</span>
                      <span className="font-black text-stone-950 tracking-wider">10AABCR7210Q1ZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-stone-600 text-[10px] uppercase">State Details:</span>
                      <span className="font-semibold text-stone-800">Bihar (State Code: 10)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-stone-600 text-[10px] uppercase">Contact Phone:</span>
                      <span className="font-semibold text-stone-800">+91 94312 87311</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Particulars Table */}
                <div className="p-4 divide-y divide-stone-100 text-[11px]">
                  <div className="grid grid-cols-2 pb-2 gap-2">
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Invoice Number:</span>
                      <span className="font-mono font-black text-xs text-stone-950 tracking-wider">{currentInvoice.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Payment Method:</span>
                      <span className="font-bold font-mono text-stone-950 text-xs px-2 py-0.5 bg-stone-100 rounded text-center block uppercase w-fit">{currentInvoice.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 py-2 gap-2">
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Invoice Date:</span>
                      <span className="font-semibold text-stone-900">{new Date(currentInvoice.timestamp).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Invoice Time:</span>
                      <span className="font-semibold text-stone-900">{new Date(currentInvoice.timestamp).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', hour12: true})}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 pt-2 gap-2">
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Place of Supply:</span>
                      <span className="font-bold text-stone-950">Bihar (State Code: 10)</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-0.5">Transporter / Route:</span>
                      <span className="text-stone-600 italic">Self Hand-Delivery / Local</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Specific info - High contrast box */}
              <div className="border border-stone-800 p-4 rounded-xl bg-stone-50/70 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1">
                  <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono font-black border-b border-stone-200 pb-1 mb-2">
                    DETAILS OF CONSIGNEE / BILL TO:
                  </span>
                  <div className="font-bold text-stone-950 text-xs flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{currentInvoice.customerName}</span>
                  </div>
                  <div className="text-stone-700 font-mono flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3 text-stone-500 shrink-0" />
                    <span>{currentInvoice.customerPhone}</span>
                  </div>
                  <p className="text-[10px] font-mono text-stone-500">
                    GSTIN / Registration: <span className="font-bold text-stone-800">Unregistered Retail Customer</span>
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono font-black border-b border-stone-200 pb-1 mb-2">
                    SHIPPING / DELIVERY DESTINATION:
                  </span>
                  <div className="text-stone-800 leading-relaxed italic pr-2 font-medium">
                    {currentInvoice.customerAddress}
                  </div>
                  <div className="text-[10.5px] mt-1 text-stone-600 font-mono">
                    State: <span className="font-bold">Bihar</span> | State Code: <span className="font-bold">10</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Grid Table - Standard Indian Format with S.No, Image and HSN */}
              <div className="border border-stone-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-[11px] text-left text-stone-800 border-collapse">
                  <thead>
                    <tr className="bg-stone-900 text-white font-mono text-[10px] divide-x divide-stone-700 uppercase tracking-wider">
                      <th className="py-2 px-1 text-center w-8">S.No.</th>
                      <th className="py-2 px-1.5 text-center w-14">Image</th>
                      <th className="py-2 px-3">Description of Goods</th>
                      <th className="py-2 px-2 text-center w-20 font-mono">HSN Code</th>
                      <th className="py-2 px-2 text-center w-16">Unit Rate</th>
                      <th className="py-2 px-2 text-center w-20">Quantity</th>
                      <th className="py-2 px-3 text-right w-24">Taxable Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {currentInvoice.items.map((it, idx) => {
                      const imageFallback = products.find(p => p.sku === it.sku)?.image || 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=120&q=80';
                      const finalImage = it.productImage || imageFallback;
                      const resolvedHsn = getHsnCode(it.sku);

                      return (
                        <tr key={idx} className="divide-x divide-stone-300 hover:bg-stone-50/50 text-stone-900">
                          {/* Serial Number */}
                          <td className="py-2 px-1 text-center font-mono font-bold text-stone-550">
                            {idx + 1}
                          </td>
                          {/* Real Product Thumbnail Image */}
                          <td className="py-2 px-1.5 text-center shrink-0">
                            <img 
                              src={finalImage} 
                              alt={it.productName} 
                              referrerPolicy="no-referrer" 
                              className="w-10 h-10 object-cover rounded-lg border border-stone-300 shadow-2xs mx-auto block shrink-0 bg-stone-100"
                            />
                          </td>
                          {/* Item Description details */}
                          <td className="py-2 px-3">
                            <span className="font-bold text-stone-950 block leading-tight">{it.productName}</span>
                            <span className="text-[10px] font-mono text-stone-501 mt-0.5 block">
                              SKU: {it.sku} &middot; Size: {it.size}
                            </span>
                            {it.remark && (
                              <span className="text-[10px] text-emerald-850 italic font-mono mt-0.5 block font-semibold leading-none">
                                ↳ Remark: {it.remark}
                              </span>
                            )}
                          </td>
                          {/* Indian HSN/SAC code */}
                          <td className="py-2 px-2 text-center font-mono text-stone-700">
                            {resolvedHsn}
                          </td>
                          {/* Rate Per Unit */}
                          <td className="py-2 px-2 text-center font-mono">
                            ₹{it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          {/* Quantity */}
                          <td className="py-2 px-2 text-center font-mono font-medium">
                            {it.quantity} <span className="text-[9.5px] uppercase font-bold text-stone-500">{it.unit}</span>
                          </td>
                          {/* Gross Line Total Taxable Amount */}
                          <td className="py-2 px-3 text-right font-mono font-semibold text-stone-950">
                            ₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tax calculations & Rupee Words block in India layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1.5">
                
                {/* Left Part: Indian Rupees in Words + Seller Banking Details */}
                <div className="md:col-span-7 space-y-3">
                  {/* Amount in words block */}
                  <div className="bg-stone-50 border border-stone-250 p-3 rounded-xl text-stone-850 font-sans text-[11px] leading-relaxed">
                    <span className="block text-[9px] font-black text-stone-400 uppercase tracking-wider font-mono">
                      Invoice Total Amount in Words:
                    </span>
                    <p className="font-extrabold text-stone-900 mt-0.5">
                      {numberToIndianWords(currentInvoice.grandTotal)}
                    </p>
                  </div>

                  {/* Seller Bank Details Block */}
                  <div className="border border-stone-250 p-3 rounded-xl text-[10.5px] font-mono bg-white space-y-1.5">
                    <span className="block text-[9px] font-black text-stone-400 uppercase tracking-wider">
                      🏦 Firm's Bank Account Details (for RTGS/NEFT/UPI):
                    </span>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-stone-800">
                      <div><span className="text-stone-400 text-[9.5px] uppercase">Account Holder:</span> <span className="font-semibold">RP TILES & SANITARY</span></div>
                      <div><span className="text-stone-400 text-[9.5px] uppercase">Account Type:</span> <span className="font-semibold">Current Account</span></div>
                      <div><span className="text-stone-400 text-[9.5px] uppercase">Bank Name:</span> <span className="font-black text-stone-950">State Bank of India</span></div>
                      <div><span className="text-stone-400 text-[9.5px] uppercase">IFSC Code:</span> <span className="font-black text-stone-950 tracking-wider">SBIN0000014</span></div>
                      <div><span className="text-stone-400 text-[9.5px] uppercase">Account Number:</span> <span className="font-black text-stone-950 tracking-widest">39840294821</span></div>
                      <div><span className="text-stone-400 text-[9.5px] uppercase">Bank Branch:</span> <span>Araria Main, Bihar</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Part: Calculations Summary & Split CGST / SGST */}
                <div className="md:col-span-5">
                  <div className="border border-stone-800 p-4 rounded-xl font-mono text-[11.5px] space-y-2 bg-stone-50/50">
                    <div className="flex justify-between text-stone-605">
                      <span>Total Gross Subtotal:</span>
                      <span className="font-bold">₹{currentInvoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {currentInvoice.discountRate > 0 && (
                      <div className="flex justify-between text-emerald-800 font-semibold font-sans">
                        <span>Trade Discount ({currentInvoice.discountRate}%):</span>
                        <span className="font-mono">-₹{currentInvoice.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-dashed border-stone-300 pt-2 font-bold text-stone-900">
                      <span>Net Taxable Value:</span>
                      <span>₹{(currentInvoice.subtotal - currentInvoice.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {currentInvoice.taxRate > 0 && (
                      <div className="space-y-1.5 border-t border-dashed border-stone-300 pt-2 text-[10.5px]">
                        <div className="flex justify-between text-stone-600">
                          <span>CGST (Central Tax @ {currentInvoice.taxRate / 2}%):</span>
                          <span className="font-semibold">+₹{(currentInvoice.taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>SGST (State Tax @ {currentInvoice.taxRate / 2}%):</span>
                          <span className="font-semibold">+₹{(currentInvoice.taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}

                    {/* Additional Fees and Cargo Transport breakdown */}
                    {((currentInvoice.loadingCharges ?? 0) > 0 || (currentInvoice.labourCharges ?? 0) > 0 || (currentInvoice.otherCharges ?? 0) > 0) && (
                      <div className="space-y-1 my-1.5 border-t border-dashed border-stone-300 pt-2 text-[10.5px] text-stone-600">
                        <span className="block font-sans font-bold text-stone-500 uppercase text-[8.5px] mb-1">Shipping & Packaging Dues:</span>
                        {(currentInvoice.loadingCharges ?? 0) > 0 && (
                          <div className="flex justify-between">
                            <span>Loading Charges:</span>
                            <span className="font-semibold">₹{currentInvoice.loadingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {(currentInvoice.labourCharges ?? 0) > 0 && (
                          <div className="flex justify-between">
                            <span>Labour / Setting Charges:</span>
                            <span className="font-semibold">₹{currentInvoice.labourCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {(currentInvoice.otherCharges ?? 0) > 0 && (
                          <div className="flex justify-between">
                            <span>{currentInvoice.otherChargesRemarks || 'Other Extra Charges'}:</span>
                            <span className="font-semibold">₹{currentInvoice.otherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-2.5 border-t-2 border-stone-800 font-sans font-black text-xs text-stone-950 bg-stone-100 p-2 rounded-lg">
                      <span className="uppercase tracking-wider">Grand Total Amount:</span>
                      <span className="font-mono text-base text-amber-700">₹{currentInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Part-payment deposit details split */}
                    <div className="space-y-1.5 border-t border-solid border-stone-800/20 pt-2.5 text-[10.5px]">
                      <div className="flex justify-between text-emerald-700 font-bold font-sans">
                        <span>Deposited Advance:</span>
                        <span className="font-mono">₹{(currentInvoice.paidAmount ?? currentInvoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {(currentInvoice.dueAmount ?? 0) > 0 ? (
                        <div className="flex justify-between text-red-700 bg-red-50 border border-red-200 p-1.5 rounded font-bold font-sans">
                          <span>Outstanding Balance Due:</span>
                          <span className="font-mono text-xs text-rose-600">₹{currentInvoice.dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-stone-500 font-semibold font-sans">
                          <span>Outstanding Dues:</span>
                          <span className="font-mono">₹0.00 (Fully Settled)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Standard Declarations and Terms & Signatures layout */}
              <div className="border-t-2 border-stone-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px] text-stone-500 font-sans font-medium">
                
                {/* Company Declarations & Term Details */}
                <div className="space-y-1.5 pr-4 border-r border-dotted border-stone-300">
                  <p className="font-bold text-stone-900 uppercase tracking-wider text-[10px]">
                    Terms & Conditions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[9px] leading-relaxed">
                    <li>Goods once fully supplied in good order are strictly non-returnable and non-exchangeable under any circumstances.</li>
                    <li>Please inspect batch shades lot numbers and tile quality prior to physical installation on walls/floors.</li>
                    <li>Interest at the rate of 18% per annum will be charged from the buyer on unpaid balance after the due date.</li>
                    <li>All civil and commercial disputes are subject exclusively to Araria, Bihar District Court jurisdictions.</li>
                  </ol>
                  <p className="text-[10px] text-stone-800 italic mt-2">
                    "We declare that this invoice shows the actual price of goods described & that all particulars are true and correct."
                  </p>
                </div>

                {/* Signatures Columns spacing block */}
                <div className="flex flex-col justify-between pt-2">
                  <div className="flex justify-between text-center font-mono font-bold mt-2 text-stone-700">
                    <div className="flex flex-col items-center">
                      <div className="h-10"></div>
                      <div className="border-t border-stone-400 w-32 pt-1 uppercase text-[9px] tracking-wider">Customer Signature</div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-[8.5px] italic font-semibold text-stone-400 lowercase leading-none block mb-1">for RP TILES & SANITARY</span>
                      <div className="h-9"></div>
                      <div className="border-t border-stone-400 w-44 pt-1 uppercase text-[9px] tracking-wider">Authorised Signatory / Representative</div>
                    </div>
                  </div>

                  <p className="text-center font-mono text-[9px] uppercase tracking-widest text-stone-400 mt-6 pt-2 border-t border-stone-150">
                    Thank you for your construction & architectural patronage!
                  </p>
                </div>

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
