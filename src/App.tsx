/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, Category, StockMovement } from './types';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import CatalogView from './components/CatalogView';
import TileVisualizer from './components/TileVisualizer';
import InventoryManager from './components/InventoryManager';
import BillingSystem from './components/BillingSystem';
import LandingPage from './components/LandingPage';
import { 
  Building, BookOpen, Layers, Settings, AppWindow, Clock, 
  RotateCcw, Info, Compass, HelpCircle, Package, Receipt, ArrowLeft
} from 'lucide-react';

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
  // Support state-based routing + URL Hash sync
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>(() => {
    return window.location.hash.startsWith('#admin') ? 'admin' : 'landing';
  });
  const [activeTab, setActiveTab] = useState<'catalog' | 'visualizer' | 'inventory' | 'billing'>('catalog');
  // Public sub-tabs: Home overview, digital showroom catalog, interactive tiling simulator
  const [publicTab, setPublicTab] = useState<'home' | 'showroom' | 'visualizer'>('home');
  
  // Real product state backed by local storage
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Selected tile passing to Tiling visualizer
  const [visualizeProduct, setVisualizeProduct] = useState<Product | undefined>(undefined);

  // Time state
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Load products
    const savedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }

    // Load transactional movements
    const savedMovements = localStorage.getItem(LOCAL_STORAGE_MOVEMENTS_KEY);
    if (savedMovements) {
      try {
        setMovements(JSON.parse(savedMovements));
      } catch (e) {
        setMovements(INITIAL_MOVEMENTS);
      }
    } else {
      setMovements(INITIAL_MOVEMENTS);
    }

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
        if (tab === 'catalog' || tab === 'visualizer' || tab === 'inventory' || tab === 'billing') {
          setActiveTab(tab as any);
        }
      } else {
        setCurrentView('landing');
        setPublicTab('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update localStorage when lists change
  const saveToLocalStorage = (newProducts: Product[]) => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const saveMovementsToLocalStorage = (newMovs: StockMovement[]) => {
    localStorage.setItem(LOCAL_STORAGE_MOVEMENTS_KEY, JSON.stringify(newMovs));
    setMovements(newMovs);
  };

  // Switch hash route helper
  const navigateWithHash = (view: 'landing' | 'admin', tab?: 'catalog' | 'visualizer' | 'inventory' | 'billing') => {
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
  const handleAddProduct = (payload: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...payload,
      id: 'p-' + Math.random().toString(36).substring(2, 9)
    };
    const updated = [newProduct, ...products];
    saveToLocalStorage(updated);

    // Also write a transaction movement
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
    saveMovementsToLocalStorage([...movements, movementLog]);
  };

  // Update an existing product
  const handleUpdateProduct = (updatedProd: Product) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    saveToLocalStorage(updated);
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) return;

    const updated = products.filter(p => p.id !== id);
    saveToLocalStorage(updated);

    // Track movement
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
    saveMovementsToLocalStorage([...movements, log]);
  };

  // Adjust stock totals (Plus / Minus / Audit reset)
  const handleUpdateStock = (
    id: string, 
    quantity: number, 
    type: 'IN' | 'OUT' | 'ADJUST', 
    reason: string
  ) => {
    // If clearing logs requested
    if (reason === 'CLEAR_ALL_LOGS') {
      saveMovementsToLocalStorage([]);
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

    const updatedCatalog = products.map(p => {
      if (p.id === id) {
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveToLocalStorage(updatedCatalog);

    // Log the transaction movement safely
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
    saveMovementsToLocalStorage([...movements, log]);
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
  const handleFactoryReset = () => {
    if (window.confirm('Reset catalog database back to standard default collections? Your custom items, adjustments, billing history and logs will be wiped.')) {
      localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_MOVEMENTS_KEY);
      setProducts(DEFAULT_PRODUCTS);
      setMovements(INITIAL_MOVEMENTS);
      setVisualizeProduct(undefined);
      navigateWithHash('admin', 'catalog');
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

            {/* Quick action redirecting directly to specific hash paths */}
            <div className="flex items-center space-x-3 self-end lg:self-auto">
              <button
                onClick={() => navigateWithHash('admin', 'catalog')}
                className="px-4 py-2 text-xs font-bold bg-stone-950 text-white rounded-xl hover:bg-stone-900 shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Enter Admin Console & POS</span>
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic sub-tab switcher for client public paths */}
        {publicTab === 'home' && (
          <LandingPage 
            products={products} 
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

        {/* Factory Reset Tool Shortcut */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWithHash('landing')}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-bold hover:bg-stone-50 transition-all cursor-pointer"
          >
            <span>Public Site</span>
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
            <span>Digital Showroom</span>
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
            <span>Interactive Tiling Studio</span>
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
            <span>Warehouse Inventory Console</span>
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
            <span>POS Billing Desk</span>
          </button>
        </div>

        {/* Small hint label */}
        <div className="text-[11px] text-stone-400 font-sans italic hidden lg:block mr-2">
          {activeTab === 'catalog' && '🛍️ Click "Specs" or product titles to open live pricing sheets.'}
          {activeTab === 'visualizer' && '📐 Change layout offsets, rotations and grout color mixers instantly.'}
          {activeTab === 'inventory' && '📊 Quick restock alerts and transactional audits logged securely.'}
          {activeTab === 'billing' && '🧾 Cart updates immediately subtract stock units with tax invoice printouts.'}
        </div>
      </nav>

      {/* Main content body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 mb-12">
        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            onOpenVisualizer={handleTriggerVisualizer}
            onUpdateProductStock={handleDirectStockUpdate}
          />
        )}

        {activeTab === 'visualizer' && (
          <TileVisualizer
            products={products}
            selectedProduct={visualizeProduct}
            onSelectProduct={setVisualizeProduct}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
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
            onUpdateStock={handleUpdateStock}
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

    </div>
  );
}
