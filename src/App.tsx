/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, Category, StockMovement } from './types';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import CatalogView from './components/CatalogView';
import TileVisualizer from './components/TileVisualizer';
import InventoryManager from './components/InventoryManager';
import BillingSystem from './components/BillingSystem';
import CustomerLedger from './components/CustomerLedger';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import CommercialProposal from './components/CommercialProposal';
import WarehouseDispatch from './components/WarehouseDispatch';
import { 
  Building, BookOpen, Layers, Settings, AppWindow, Clock, 
  RotateCcw, Info, Compass, HelpCircle, Package, Receipt, ArrowLeft,
  Smartphone, QrCode, X, DollarSign, LogOut, FileText, Coins, Truck
} from 'lucide-react';
import QRCode from 'qrcode';
import { Language, TRANSLATIONS } from './data/translations';

const LOCAL_STORAGE_PRODUCTS_KEY = 'ceramica_catalog_products';
const LOCAL_STORAGE_MOVEMENTS_KEY = 'ceramica_catalog_movements';

// Default initial transaction records for real feel
const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    productName: 'Calacatta Gold Polished Porcelain Tile',
    sku: 'TL-CAL-GC6012',
    type: 'IN',
    quantity: 500,
    reason: 'Container Import Shipment #4029 received from Genoa warehouse',
    timestamp: '2026-06-16T14:30:00.000Z'
  },
  {
    id: 'm2',
    productId: 'p10',
    productName: 'Nero Portoro Marble Pedestal Basin',
    sku: 'SW-BSN-NP9045',
    type: 'OUT',
    quantity: 2,
    reason: 'Sold to West Coast Luxury Estate project (Bill #2094)',
    timestamp: '2026-06-17T09:15:00.000Z'
  },
  {
    id: 'm3',
    productId: 'p4',
    productName: 'Terrazzo Grigio Matte Porcelain Tile',
    sku: 'TL-TRZ-GR6060',
    type: 'OUT',
    quantity: 80,
    reason: 'Delivered for Uptown Cafe renovation project matching specs',
    timestamp: '2026-06-17T11:00:00.000Z'
  }
];

export default function App() {
  // Global active language setup for Indian localization
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ceramica_language') as Language) || 'en';
  });

  // Support state-based routing + URL Hash sync
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>(() => {
    return window.location.hash.startsWith('#admin') ? 'admin' : 'landing';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ceramica_admin_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'visualizer' | 'inventory' | 'billing' | 'ledger' | 'proposal' | 'dispatch'>('catalog');
  // Public sub-tabs: Home overview, digital showroom catalog, interactive tiling simulator
  const [publicTab, setPublicTab] = useState<'home' | 'showroom' | 'visualizer'>('home');
  
  // Real product state backed by local storage
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Selected tile passing to Tiling visualizer
  const [visualizeProduct, setVisualizeProduct] = useState<Product | undefined>(undefined);

  // Time state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Mobile connect state
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [connectQrUrl, setConnectQrUrl] = useState<string>('');

  useEffect(() => {
    // 0. Listen to Authentication State changes in real-time
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminAuthenticated(true);
        setCurrentUser(user);
        sessionStorage.setItem('ceramica_admin_logged_in', 'true');
      } else {
        setIsAdminAuthenticated(false);
        setCurrentUser(null);
        sessionStorage.removeItem('ceramica_admin_logged_in');
      }
    });

    // 1. Listen to products in real-time
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        // Seed DEFAULT_PRODUCTS to Firestore
        DEFAULT_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(db, 'products', p.id), p);
        });
        setProducts(DEFAULT_PRODUCTS);
      } else {
        const prodList: Product[] = [];
        snapshot.forEach((doc) => {
          prodList.push(doc.data() as Product);
        });
        setProducts(prodList);
      }
    }, (error) => {
      console.error("Error reading products:", error);
    });

    // 2. Listen to movements in real-time
    const unsubscribeMovements = onSnapshot(collection(db, 'movements'), (snapshot) => {
      if (snapshot.empty) {
        // Seed INITIAL_MOVEMENTS to Firestore
        INITIAL_MOVEMENTS.forEach(async (m) => {
          await setDoc(doc(db, 'movements', m.id), m);
        });
        setMovements(INITIAL_MOVEMENTS);
      } else {
        const movList: StockMovement[] = [];
        snapshot.forEach((doc) => {
          movList.push(doc.data() as StockMovement);
        });
        movList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMovements(movList);
      }
    }, (error) => {
      console.error("Error reading movements:", error);
    });

    // Static formatted date placeholder
    setCurrentTime(new Date('2026-06-17T06:01:41-07:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' • ' + new Date('2026-06-17T06:01:41-07:00').toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }));

    // Listen to hash router updates
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#admin')) {
        setCurrentView('admin');
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        const tab = searchParams.get('tab');
        if (tab === 'catalog' || tab === 'visualizer' || tab === 'inventory' || tab === 'billing' || tab === 'ledger' || tab === 'proposal' || tab === 'dispatch') {
          setActiveTab(tab as any);
        }
      } else {
        setCurrentView('landing');
        setPublicTab('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeMovements();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Dynamically generate the mobile connection QR Code when modal opens
  useEffect(() => {
    if (showConnectModal) {
      // Build the target absolute URL targeting the POS bill scanner directly
      const targetUrl = window.location.origin + window.location.pathname + '#admin?tab=billing';
      QRCode.toDataURL(targetUrl, {
        margin: 2,
        width: 250,
        color: {
          dark: '#0f172a', // slate-900 / premium dark luxury slate color
          light: '#ffffff'
        }
      })
      .then(url => {
        setConnectQrUrl(url);
      })
      .catch(err => {
        console.error('Failed generating app access QR:', err);
      });
    }
  }, [showConnectModal]);

  // Switch hash route helper
  const navigateWithHash = (view: 'landing' | 'admin', tab?: 'catalog' | 'visualizer' | 'inventory' | 'billing' | 'ledger' | 'proposal' | 'dispatch') => {
    if (view === 'admin') {
      const targetTab = tab || activeTab;
      window.location.hash = `admin?tab=${targetTab}`;
      setCurrentView('admin');
      setActiveTab(targetTab);
    } else {
      window.location.hash = '';
      setCurrentView('landing');
      setPublicTab('home');
    }
  };

  // Add a new product
  const handleAddProduct = async (payload: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...payload,
      id: 'p-' + Math.random().toString(36).substring(2, 9)
    };
    
    const movementLog: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      type: 'IN',
      quantity: newProduct.stock,
      reason: 'Enlisted new catalog SKU into main storage',
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
      await setDoc(doc(db, 'movements', movementLog.id), movementLog);
    } catch (e) {
      console.error("Error adding product:", e);
    }
  };

  // Update an existing product
  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
    } catch (e) {
      console.error("Error updating product:", e);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) return;

    const log: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      productId: id,
      productName: productToDelete.name,
      sku: productToDelete.sku,
      type: 'OUT',
      quantity: productToDelete.stock,
      reason: 'SKU deleted and purged permanently from digital catalog listings',
      timestamp: new Date().toISOString()
    };

    try {
      await deleteDoc(doc(db, 'products', id));
      await setDoc(doc(db, 'movements', log.id), log);
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  // Adjust stock totals (Plus / Minus / Audit reset)
  const handleUpdateStock = async (
    id: string, 
    quantity: number, 
    type: 'IN' | 'OUT' | 'ADJUST', 
    reason: string
  ) => {
    if (reason === 'CLEAR_ALL_LOGS') {
      try {
        const snapshot = await getDocs(collection(db, 'movements'));
        snapshot.forEach(async (d) => {
          await deleteDoc(doc(db, 'movements', d.id));
        });
      } catch (e) {
        console.error("Error clearing logs:", e);
      }
      return;
    }

    const item = products.find(p => p.id === id);
    if (!item) return;

    let newStock = item.stock;
    if (type === 'IN') {
      newStock += quantity;
    } else if (type === 'OUT') {
      newStock = Math.max(0, item.stock - quantity);
    } else {
      newStock = quantity;
    }

    const log: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      productId: id,
      productName: item.name,
      sku: item.sku,
      type,
      quantity,
      reason,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'products', id), { ...item, stock: newStock });
      await setDoc(doc(db, 'movements', log.id), log);
    } catch (e) {
      console.error("Error updating stock:", e);
    }
  };

  // Inline adjustment specifically from specification drawer sheet shortcut
  const handleDirectStockUpdate = (id: string, newStock: number) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    
    const diff = newStock - item.stock;
    if (diff === 0) return;

    const type = diff > 0 ? 'IN' : 'OUT';
    handleUpdateStock(id, Math.abs(diff), type, 'Manual adjustments from catalog spec sheet drawer panel');
  };

  // Reset to showroom defaults trigger
  const handleFactoryReset = async () => {
    if (window.confirm('Reset catalog database back to standard default collections? Your custom items, adjustments, billing history and logs will be wiped.')) {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        for (const d of prodSnap.docs) {
          await deleteDoc(doc(db, 'products', d.id));
        }
        const movSnap = await getDocs(collection(db, 'movements'));
        for (const d of movSnap.docs) {
          await deleteDoc(doc(db, 'movements', d.id));
        }

        for (const p of DEFAULT_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), p);
        }

        for (const m of INITIAL_MOVEMENTS) {
          await setDoc(doc(db, 'movements', m.id), m);
        }

        setVisualizeProduct(undefined);
        navigateWithHash('admin', 'catalog');
      } catch (e) {
        console.error("Error resetting factory defaults:", e);
      }
    }
  };

  // Seamless click from catalog item shortcuts to visualizer
  const handleTriggerVisualizer = (tile: Product) => {
    setVisualizeProduct(tile);
    navigateWithHash('admin', 'visualizer');
  };

  // Jumps from Landing page straight into studio with selected tile
  const handleLandingTriggerVisualizer = (tile: Product) => {
    setVisualizeProduct(tile);
    setPublicTab('visualizer');
    setCurrentView('landing');
    window.location.hash = ''; // Stay on landing page URL hash
  };

  // Render Client Landing Showroom or Executive Management Admin Console
  if (currentView === 'admin' && !isAdminAuthenticated) {
    return (
      <AdminLogin
        language={language}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('ceramica_admin_logged_in', 'true');
        }}
        onCancel={() => {
          navigateWithHash('landing');
        }}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-50" id="landing-container">
        {/* Simple top navbar for Landing Page branding & entry point to Admin and POS */}
        <header className="bg-white/95 backdrop-blur border-b border-stone-200/50 sticky top-0 z-40 px-6 py-4 shadow-sm" id="landing-header">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Brand Logo Identity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setPublicTab('home'); navigateWithHash('landing'); }}>
                <div className="w-9 h-9 bg-stone-900 rotate-12 flex items-center justify-center rounded-lg shadow font-serif text-sm italic text-amber-500 font-black">
                  R
                </div>
                <div>
                  <h1 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-sans leading-none flex items-center">
                    <span>RP Tiles</span>
                  </h1>
                  <p className="text-[10px] text-stone-450 mt-1 font-mono tracking-wide leading-none">Luxury Stone & Vitrified Showroom</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs for Public Frontend */}
            <div className="flex items-center space-x-1 border border-stone-200/60 p-1 rounded-xl bg-stone-50 w-full lg:w-auto overflow-x-auto select-none no-scrollbar">
              <button
                onClick={() => setPublicTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 lg:flex-none ${
                  publicTab === 'home'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-605 hover:text-stone-900 hover:bg-stone-100/50'
                }`}
              >
                Home Overview
              </button>
              <button
                id="tab-public-showroom"
                onClick={() => setPublicTab('showroom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 lg:flex-none ${
                  publicTab === 'showroom'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-605 hover:text-stone-900 hover:bg-stone-100/50'
                }`}
              >
                Digital Showroom
              </button>
              <button
                id="tab-public-studio"
                onClick={() => {
                  if (!visualizeProduct) {
                    const tiles = products.filter(p => p.category === 'Tiles');
                    if (tiles.length > 0) setVisualizeProduct(tiles[0]);
                  }
                  setPublicTab('visualizer');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 lg:flex-none ${
                  publicTab === 'visualizer'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-605 hover:text-stone-900 hover:bg-stone-100/50'
                }`}
              >
                Interactive Tiling Studio
              </button>
            </div>

            {/* Language switcher + Enter Admin Console button */}
            <div className="flex items-center space-x-3.5 self-end lg:self-auto">
              {/* Language switcher pills */}
              <div className="flex items-center space-x-1 border border-stone-200/80 p-1 rounded-xl bg-stone-50 select-none shadow-3xs" id="lang-switcher-landing">
                {(['en', 'hi', 'hinglish'] as const).map((l) => {
                  const labels = { en: 'EN', hi: 'हिंदी', hinglish: 'Hinglish' };
                  return (
                    <button
                      key={l}
                      onClick={() => {
                        setLanguage(l);
                        localStorage.setItem('ceramica_language', l);
                      }}
                      className={`px-2.5 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                        language === l
                          ? 'bg-stone-950 text-amber-400 shadow-sm'
                          : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      {labels[l]}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => navigateWithHash('admin', 'catalog')}
                className="px-4 py-2 text-xs font-bold bg-stone-950 text-white rounded-xl hover:bg-stone-900 shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>{TRANSLATIONS[language].accessPos}</span>
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic sub-tab switcher for client public paths */}
        {publicTab === 'home' && (
          <LandingPage 
            products={products} 
            language={language}
            onOpenVisualizer={handleLandingTriggerVisualizer}
            onNavigateToAdmin={(tab) => {
              if (tab === 'catalog') {
                setPublicTab('showroom');
              } else if (tab === 'visualizer') {
                setPublicTab('visualizer');
              } else {
                navigateWithHash('admin', tab);
              }
            }}
          />
        )}

        {publicTab === 'showroom' && (
          <div className="flex-1 flex flex-col justify-between" id="public-showroom-layout">
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 mb-12 animate-fadeIn flex-1">
              <div className="mb-6 bg-white border border-stone-200/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-black text-stone-950 flex items-center gap-2">
                    <span>Vitrified & Luxury Stone Showroom Catalog</span>
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold bg-amber-100 text-amber-805 px-2 py-0.5 rounded-lg">Public Floor Stock</span>
                  </h2>
                  <p className="text-stone-500 text-xs mt-1">
                    Browse our live physical inventory below. Click **"Specs"** or titles to view item dimensions, finishes, and carton sizes.
                  </p>
                </div>
                <button
                  onClick={() => setPublicTab('home')}
                  className="self-start md:self-auto px-3.5 py-1.5 border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 rounded-xl text-xs text-stone-700 font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
              <CatalogView 
                products={products} 
                language={language}
                onOpenVisualizer={handleLandingTriggerVisualizer} 
              />
            </div>

            {/* Public footer */}
            <footer className="bg-stone-950 text-stone-500 py-10 border-t border-stone-900 px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 text-center md:text-left">
                <div>
                  <span className="font-serif font-black text-stone-200 uppercase text-sm tracking-widest text-[#f59e0b]">RP TILES SHOWROOM</span>
                  <p className="text-[10.5px] mt-1.5 font-medium text-stone-300">RP Tiles, NH-57, Bus Stand, Near Pawan Motors, Araria - 854311</p>
                  <p className="text-[9.5px] mt-1 font-mono text-stone-500">Luxury Ceramics • Tiles • Bathware • Fittings</p>
                </div>
                <div>
                  &copy; 2026 RP Tiles. All rights reserved. Managed under global specifications.
                </div>
                <div className="flex gap-4 font-mono text-[10px] justify-center md:justify-end">
                  <span className="cursor-pointer hover:text-stone-300 animate-pulse underline" onClick={() => navigateWithHash('admin', 'catalog')}>Admin Log In</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-stone-300 underline" onClick={() => navigateWithHash('admin', 'billing')}>Access POS</span>
                  <span>•</span>
                  <span className="cursor-pointer text-amber-400 hover:text-amber-300 underline font-bold" onClick={() => navigateWithHash('admin', 'proposal')}>View ERP Proposal (120K)</span>
                </div>
              </div>
            </footer>
          </div>
        )}

        {publicTab === 'visualizer' && (
          <div className="flex-1 flex flex-col justify-between" id="public-studio-layout">
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 mb-12 animate-fadeIn flex-1">
              <div className="mb-6 bg-white border border-stone-200/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-black text-stone-950 flex items-center gap-2">
                    <span>Interactive Ceramic Tiling Studio</span>
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold bg-emerald-100 text-emerald-805 px-2 py-0.5 rounded-lg">Layout Simulator</span>
                  </h2>
                  <p className="text-stone-500 text-xs mt-1">
                    Interactive real-time layout rendering. Switch tiles, change grout sizing, grout alignment offsets, and try custom grout shade mixers.
                  </p>
                </div>
                <button
                  onClick={() => setPublicTab('home')}
                  className="self-start md:self-auto px-3.5 py-1.5 border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 rounded-xl text-xs text-stone-700 font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
              <TileVisualizer 
                products={products} 
                language={language}
                selectedProduct={visualizeProduct} 
                onSelectProduct={setVisualizeProduct} 
              />
            </div>

            {/* Public footer */}
            <footer className="bg-stone-950 text-stone-500 py-10 border-t border-stone-900 px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 text-center md:text-left">
                <div>
                  <span className="font-serif font-black text-stone-200 uppercase text-sm tracking-widest text-[#f59e0b]">RP TILES SHOWROOM</span>
                  <p className="text-[10.5px] mt-1.5 font-medium text-stone-300">RP Tiles, NH-57, Bus Stand, Near Pawan Motors, Araria - 854311</p>
                  <p className="text-[9.5px] mt-1 font-mono text-stone-500">Luxury Ceramics • Tiles • Bathware • Fittings</p>
                </div>
                <div>
                  &copy; 2026 RP Tiles. All rights reserved. Managed under global specifications.
                </div>
                <div className="flex gap-4 font-mono text-[10px] justify-center md:justify-end">
                  <span className="cursor-pointer hover:text-stone-300 animate-pulse underline" onClick={() => navigateWithHash('admin', 'catalog')}>Admin Log In</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-stone-300 underline" onClick={() => navigateWithHash('admin', 'billing')}>Access POS</span>
                  <span>•</span>
                  <span className="cursor-pointer text-amber-400 hover:text-amber-300 underline font-bold" onClick={() => navigateWithHash('admin', 'proposal')}>View ERP Proposal (120K)</span>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    );
  }

  // Else: Render Admin console mode with POS billing
  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 font-sans flex flex-col justify-between" id="app-wrapper">
      
      {/* Top Brand Nav Header */}
      <header className="bg-white border-b border-stone-200 pl-6 pr-6 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm" id="main-header">
        
        {/* Brand Identity / back option */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWithHash('landing')}
            className="p-1.5 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-600 transition-all cursor-pointer flex items-center justify-center"
            title="Return back to public website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateWithHash('landing')}>
            <div className="w-9 h-9 bg-stone-900 rotate-12 flex items-center justify-center rounded-lg shadow font-serif text-sm italic text-amber-500 font-black">
              R
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-sans leading-none flex items-center">
                <span>RP Tiles</span>
              </h1>
              <p className="text-[10px] text-stone-450 mt-1 font-mono tracking-wide leading-none">Administrative Panel Console</p>
            </div>
          </div>
        </div>

        {/* Real-time shop clock */}
        <div className="hidden md:flex items-center space-x-2 bg-stone-50 border border-stone-200/60 px-3 py-1.5 rounded-xl text-[10.5px] font-medium text-stone-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{currentTime || 'Showroom Terminal'}</span>
        </div>

        {/* Factory Reset Tool Shortcut & Language Selector */}
        <div className="flex items-center space-x-2.5">
          {/* Admin panel language pills */}
          <div className="flex items-center space-x-1 border border-stone-250 p-0.5 rounded-lg bg-stone-50 select-none text-[10px]" id="lang-switcher-admin">
            {(['en', 'hi', 'hinglish'] as const).map((l) => {
              const labels = { en: 'EN', hi: 'हिंदी', hinglish: 'Hinglish' };
              return (
                <button
                  key={l}
                  onClick={() => {
                    setLanguage(l);
                    localStorage.setItem('ceramica_language', l);
                  }}
                  className={`px-2 py-0.5 font-bold rounded transition-all cursor-pointer ${
                    language === l
                      ? 'bg-stone-900 text-amber-400 shadow-3xs text-[10px]'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {labels[l]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigateWithHash('landing')}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-bold hover:bg-stone-50 transition-all cursor-pointer"
          >
            <span>Public Site</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 rounded-xl font-bold transition-all cursor-pointer shadow-sm"
            title="Scan custom showroom barcodes using your mobile phone camera!"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect Phone</span>
          </button>

          <button
            id="btn-factory-reset"
            onClick={handleFactoryReset}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-900 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all cursor-pointer"
            title="Reset back to standard preset products"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          {currentUser && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-mono border border-stone-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="max-w-[140px] truncate font-semibold" title={currentUser.email}>{currentUser.email}</span>
            </div>
          )}

          <button
            id="btn-admin-logout"
            onClick={async () => {
              try {
                await signOut(auth);
                navigateWithHash('landing');
              } catch (e) {
                console.error("Error signing out:", e);
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 rounded-xl transition-all cursor-pointer font-bold"
            title="Safely end administrative session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Primary Category Hub Select bar */}
      <nav className="bg-white border-b border-stone-200 px-6 py-2.5 flex flex-wrap items-center justify-between" id="nav-tabs">
        <div className="flex flex-wrap gap-1.5" id="navigation-tabs-alignment">
          
          {/* Catalog tab */}
          <button
            id="tab-catalog"
            onClick={() => navigateWithHash('admin', 'catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'catalog'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{TRANSLATIONS[language].digitalShowroom}</span>
          </button>

          {/* Visualizer tab */}
          <button
            id="tab-visualizer"
            onClick={() => {
              // Ensure we fallback if undefined
              if (!visualizeProduct) {
                const tiles = products.filter(p => p.category === 'Tiles');
                if (tiles.length > 0) setVisualizeProduct(tiles[0]);
              }
              navigateWithHash('admin', 'visualizer');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'visualizer'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{TRANSLATIONS[language].tilingStudio}</span>
          </button>

          {/* Inventory tab */}
          <button
            id="tab-inventory"
            onClick={() => navigateWithHash('admin', 'inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'inventory'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <Package className="w-4 h-4 text-sky-400" />
            <span>{TRANSLATIONS[language].warehouseInventory}</span>
          </button>

          {/* New POS Billing System tab */}
          <button
            id="tab-billing"
            onClick={() => navigateWithHash('admin', 'billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'billing'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <Receipt className="w-4 h-4 text-rose-400" />
            <span>{TRANSLATIONS[language].posBilling}</span>
          </button>

          {/* Customer Ledger Book tab */}
          <button
            id="tab-ledger"
            onClick={() => navigateWithHash('admin', 'ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'ledger'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{TRANSLATIONS[language].customerLedger}</span>
          </button>

          {/* ERP Commercial Proposal Draft tab */}
          <button
            id="tab-proposal"
            onClick={() => navigateWithHash('admin', 'proposal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'proposal'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{TRANSLATIONS[language].commercialProposal}</span>
          </button>

          {/* Warehouse Dispatch / Store Counter Delivery tab */}
          <button
            id="tab-dispatch"
            onClick={() => navigateWithHash('admin', 'dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'dispatch'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-650 hover:bg-stone-50 hover:text-stone-950'
            }`}
          >
            <Truck className="w-4 h-4 text-[#f43f5e]" />
            <span>{TRANSLATIONS[language].warehouseDispatch}</span>
          </button>
        </div>

        {/* Small hint label */}
        <div className="text-[11px] text-stone-400 font-sans italic hidden lg:block mr-2">
          {activeTab === 'catalog' && '🛍️ Click "Specs" or product titles to open live pricing sheets.'}
          {activeTab === 'visualizer' && '📐 Change layout offsets, rotations and grout color mixers instantly.'}
          {activeTab === 'inventory' && '📊 Quick restock alerts and transactional audits logged securely.'}
          {activeTab === 'billing' && '🧾 Cart updates immediately subtract stock units with tax invoice printouts.'}
          {activeTab === 'ledger' && '💼 View historical outstanding client debt registers and issue cash clears.'}
          {activeTab === 'proposal' && '📑 Live interactive quotation builder customized for tile showroom contracts.'}
          {activeTab === 'dispatch' && '🚚 Verify and checkout customer orders securely at godown gates.'}
        </div>
      </nav>

      {/* Main content body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 mb-12">
        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            language={language}
            onOpenVisualizer={handleTriggerVisualizer}
            onUpdateProductStock={handleDirectStockUpdate}
          />
        )}

        {activeTab === 'visualizer' && (
          <TileVisualizer
            products={products}
            language={language}
            selectedProduct={visualizeProduct}
            onSelectProduct={setVisualizeProduct}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            language={language}
            movements={movements}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'billing' && (
          <BillingSystem
            products={products}
            language={language}
            onUpdateStock={handleUpdateStock}
            onConnectPhone={() => setShowConnectModal(true)}
          />
        )}

        {activeTab === 'ledger' && (
          <CustomerLedger
            products={products}
            language={language}
          />
        )}

        {activeTab === 'proposal' && (
          <CommercialProposal
            language={language}
          />
        )}

        {activeTab === 'dispatch' && (
          <WarehouseDispatch
            products={products}
            language={language}
          />
        )}
      </main>

      {/* Footnote details */}
      <footer className="bg-stone-900 text-stone-500 py-6 border-t border-stone-850 px-6" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10.5px]">Active RP Tiles database systems online</span>
          </div>
          
          <div className="text-center font-sans text-stone-400">
            &copy; 2026 RP Tiles. Managed under premium enterprise specifications.
          </div>
          
          <div className="font-mono text-[11px] text-stone-550 flex items-center space-x-3">
            <span>Terminal ID: RPT-SYS-A9C5</span>
            <span>•</span>
            <span className="cursor-pointer underline" onClick={() => navigateWithHash('landing')}>View Public Landing Site</span>
          </div>
        </div>
      </footer>

      {/* 📱 CONNECT PHONE SCANNER MODAL OVERLAY */}
      {showConnectModal && (
        <div 
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowConnectModal(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-stone-150 shadow-2xl max-w-md w-full overflow-hidden relative animate-scaleUp text-stone-900"
            onClick={(e) => e.stopPropagation()} // Stop closing click bubbling
          >
            {/* Elegant luxury gold header accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#9A7B56] to-stone-900" />
            
            {/* Close button top right */}
            <button 
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 p-1.5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8 text-center">
              {/* Phone and Qr Code layered badge */}
              <div className="relative mx-auto w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 border border-emerald-150">
                <Smartphone className="w-7 h-7" />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 rounded-full p-1 border-2 border-white">
                  <QrCode className="w-3.5 h-3.5" />
                </span>
              </div>

              <h3 className="text-lg font-serif font-black text-stone-950 tracking-tight leading-snug">
                Connect Your Phone Camera
              </h3>
              <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Seamlessly scan vitrified/floor stone sample labels on your mobile device to test showroom checkout capabilities.
              </p>

              {/* Holographic Glowing QR Code viewport */}
              <div className="my-6 relative inline-block p-4 bg-stone-50 rounded-2xl border border-stone-200/80 shadow-inner">
                {/* Simulated scan frame alignment crosshairs */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500 rounded-tl" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500 rounded-br" />

                {connectQrUrl ? (
                  <img 
                    src={connectQrUrl} 
                    alt="Scan to open on phone" 
                    className="w-48 h-48 mx-auto mix-blend-multiply" 
                  />
                ) : (
                  <div className="w-48 h-48 bg-stone-100 flex items-center justify-center text-stone-400 font-mono text-xs animate-pulse rounded">
                    Rendering access code...
                  </div>
                )}
              </div>

              {/* Step-by-Step guides */}
              <div className="text-left bg-stone-50 rounded-xl p-4 border border-stone-150 space-y-3.5 text-[11px] leading-relaxed">
                <div className="flex items-start space-x-2.5">
                  <span className="w-4.5 h-4.5 bg-stone-900 text-white font-black rounded-full flex items-center justify-center shrink-0">1</span>
                  <p className="text-stone-750 font-medium pt-0.5">
                    Open your iPhone or Android standard camera lens and aim straight at the code.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2.5">
                  <span className="w-4.5 h-4.5 bg-stone-900 text-white font-black rounded-full flex items-center justify-center shrink-0">2</span>
                  <p className="text-stone-750 font-medium pt-0.5">
                    Tap the popup link to launch this RP Tiles application securely over HTTPS.
                  </p>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-4.5 h-4.5 bg-stone-900 text-white font-black rounded-full flex items-center justify-center shrink-0">3</span>
                  <p className="text-stone-750 font-medium pt-0.5">
                    Head to <strong className="text-stone-950 font-extrabold text-[11.5px]">POS Billing Desk</strong>, click <strong className="text-emerald-700">🔌 Power On</strong>, switch to <strong className="text-emerald-700">📸 Active Camera</strong> and start scanning showroom item tags!
                  </p>
                </div>
              </div>

              {/* Alternative clipboard link button */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col space-y-2">
                <p className="text-[10px] text-stone-400 font-mono">OR LAUNCH VIA KEY DIRECT LINK:</p>
                <div className="flex items-center space-x-1">
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.origin + window.location.pathname + '#admin?tab=billing'}
                    className="flex-1 bg-stone-50 border border-stone-205 rounded-lg px-2.5 py-1 text-[9.5px] font-mono text-stone-600 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#admin?tab=billing');
                      alert("Copied custom Direct Phone link to your clipboard!");
                    }}
                    className="bg-stone-900 hover:bg-stone-950 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom active status bar */}
            <div className="bg-stone-950 text-stone-400 text-[10px] font-mono py-2.5 px-4 flex items-center justify-between border-t border-stone-900">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                PREVIEW HOST ACTIVE
              </span>
              <span>RP-SYS-v2.6</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
