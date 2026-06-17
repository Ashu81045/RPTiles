/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { Product, Category, StockMovement } from '../types';
import { 
  Plus, Minus, TrendingUp, AlertTriangle, Package, IndianRupee, 
  Trash2, Edit, Save, RotateCcw, PlusCircle, Check, HelpCircle, X, Download,
  Printer, QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

// Interactive High-Fidelity SKU QR Code label renderer
interface SkuQrCodeProps {
  sku: string;
  size?: number;
}

export function SkuQrCode({ sku, size = 130 }: SkuQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!sku) return;
    QRCode.toDataURL(sku, {
      margin: 1.5,
      width: size,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff'
      }
    })
    .then(url => {
      setQrDataUrl(url);
    })
    .catch(err => {
      console.error('Error rendering QR Code SKU:', err);
    });
  }, [sku, size]);

  if (!sku) return null;

  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-stone-200/60 shadow-inner">
      {qrDataUrl ? (
        <img 
          src={qrDataUrl} 
          alt={`Bar QR SKU Code ${sku}`} 
          className="object-contain" 
          style={{ width: size, height: size }} 
        />
      ) : (
        <div 
          style={{ width: size, height: size }} 
          className="bg-stone-50 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-stone-400 font-mono"
        >
          Compiling Matrix...
        </div>
      )}
    </div>
  );
}

interface InventoryManagerProps {
  products: Product[];
  movements: StockMovement[];
  onAddProduct: (payload: Omit<Product, 'id'>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (id: string, amount: number, type: 'IN' | 'OUT' | 'ADJUST', reason: string) => void;
}

export default function InventoryManager({
  products,
  movements,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateStock
}: InventoryManagerProps) {
  
  // Tabs for Inventory View
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'alerts' | 'history'>('all');

  // Form states for Add/Edit Dialog modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Field states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Tiles');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formPrice, setFormPrice] = useState('0.00');
  const [formUnit, setFormUnit] = useState('sqft');
  const [formSize, setFormSize] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('100');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formFinish, setFormFinish] = useState('Matt');
  const [formMaterial, setFormMaterial] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formGroutSuggestion, setFormGroutSuggestion] = useState('');
  const [formBoxCoverage, setFormBoxCoverage] = useState('10');
  
  // Advanced pricing basis and packaging specifications
  const [formSellUnitBasis, setFormSellUnitBasis] = useState<'sqft' | 'box' | 'pcs' | 'meter' | 'bags'>('sqft');
  const [formItemsPerBox, setFormItemsPerBox] = useState('4');
  const [formWeightPerBox, setFormWeightPerBox] = useState('22.5');

  // QR Modal viewer active item
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);

  // Stock Quick Adjust Tool
  const [selectedAdjustId, setSelectedAdjustId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('50');
  const [adjustReason, setAdjustReason] = useState('Restock shipment received');

  // Analytical Calculations
  const totalSkuCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const outOfStockItems = products.filter(p => p.stock === 0);

  // Calculate valuations per major category for custom graphical rendering
  const categorySummary = products.reduce((acc, p) => {
    const val = p.stock * p.price;
    acc[p.category] = (acc[p.category] || 0) + val;
    return acc;
  }, {} as Record<Category, number>);

  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);

  const openAddForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('TL-' + Math.random().toString(36).substring(2, 7).toUpperCase());
    setFormCategory('Tiles');
    setFormSubcategory('Porcelain Tiles');
    setFormPrice('5.00');
    setFormUnit('sqft');
    setFormSize('60x60 cm');
    setFormStock('500');
    setFormMinStock('150');
    setFormDescription('Luxury decorative tile designed for modern boutique layouts.');
    setFormColor('Multi-color');
    setFormFinish('Matt');
    setFormMaterial('Porcelain');
    setFormImage('https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80');
    setFormGroutSuggestion('Gray (2mm)');
    setFormBoxCoverage('12.5');
    setFormSellUnitBasis('sqft');
    setFormItemsPerBox('4');
    setFormWeightPerBox('22.5');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory);
    setFormPrice(p.price.toString());
    setFormUnit(p.unit);
    setFormSize(p.size);
    setFormStock(p.stock.toString());
    setFormMinStock(p.minStock.toString());
    setFormDescription(p.description);
    setFormColor(p.color);
    setFormFinish(p.finish);
    setFormMaterial(p.material);
    setFormImage(p.image);
    setFormGroutSuggestion(p.groutSuggestion || '');
    setFormBoxCoverage(p.boxCoverage?.toString() || '0');
    setFormSellUnitBasis(p.sellUnitBasis || (p.category === 'Tiles' ? 'sqft' : 'pcs'));
    setFormItemsPerBox(p.itemsPerBox?.toString() || '4');
    setFormWeightPerBox(p.weightPerBox?.toString() || '22.5');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const productPayload: Omit<Product, 'id'> = {
      name: formName || 'Unnamed Product',
      sku: formSku || 'SKU-TEMP',
      category: formCategory,
      subcategory: formSubcategory || 'Standard',
      price: parseFloat(formPrice) || 0,
      unit: formUnit,
      size: formSize || 'Standard',
      stock: parseInt(formStock) || 0,
      minStock: parseInt(formMinStock) || 0,
      description: formDescription || '',
      features: [
        'Premium grade finish standards',
        'Built for residential or corporate architectures',
        'Durable composition with minimal retention profiles'
      ],
      color: formColor || 'Neutral',
      finish: formFinish,
      material: formMaterial || 'Composite',
      image: formImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
      groutSuggestion: formGroutSuggestion || undefined,
      boxCoverage: parseFloat(formBoxCoverage) || undefined,
      sellUnitBasis: formSellUnitBasis,
      itemsPerBox: parseInt(formItemsPerBox) || undefined,
      weightPerBox: parseFloat(formWeightPerBox) || undefined
    };

    if (editingProduct) {
      onUpdateProduct({ ...productPayload, id: editingProduct.id });
    } else {
      onAddProduct(productPayload);
    }
    setIsFormOpen(false);
  };

  const executeStockAdjust = (id: string, type: 'IN' | 'OUT' | 'ADJUST') => {
    const amt = parseInt(adjustAmount);
    if (!isNaN(amt) && amt > 0) {
      onUpdateStock(id, amt, type, adjustReason);
      setSelectedAdjustId(null);
    }
  };

  const exportInventoryCSV = () => {
    const headers = 'SKU,Name,Category,Subcategory,Price,Stock,Valuation\n';
    const rows = products.map(p => 
      `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.subcategory}",${p.price},${p.stock},${(p.price * p.stock).toFixed(2)}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `RPT_Tiles_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div id="inventory-manager-root" className="space-y-6">

      {/* Analytical KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="inventory-kpis">
        <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-50 rounded-xl text-stone-900 border border-stone-100">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Portfolio Valuation</span>
            <span className="text-xl font-bold font-sans text-stone-900 tracking-tight">
              ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-50 rounded-xl text-stone-910 border border-stone-100">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Unified Stock Load</span>
            <span className="text-xl font-bold font-sans text-stone-900 tracking-tight">
              {totalStockCount.toLocaleString()} <span className="text-xs text-stone-400 font-normal">units</span>
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-50 rounded-xl text-stone-910 border border-stone-100">
            <TrendingUp className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Active Catalog SKUs</span>
            <span className="text-xl font-bold font-sans text-stone-900 tracking-tight">
              {totalSkuCount} <span className="text-xs text-stone-400 font-normal">items</span>
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200/85 p-4 rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden">
          <div className={`p-3 rounded-xl border ${lowStockItems.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-stone-50 border-stone-100 text-stone-450'}`}>
            <AlertTriangle className={`w-6 h-6 ${lowStockItems.length > 0 ? 'animate-bounce text-amber-600' : 'text-stone-400'}`} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Low-stock Alert SKU</span>
            <span className="text-xl font-bold font-sans text-stone-955 tracking-tight">
              {lowStockItems.length === 0 ? (
                <span className="text-emerald-750 text-base font-semibold">All Healthy</span>
              ) : (
                <span className="text-amber-600">{lowStockItems.length} Warnings</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Custom SVG Bar Chart - Stacked Category Valuations */}
        <div className="lg:col-span-8 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold font-sans text-stone-950">Valuation Analytics (₹)</h4>
              <p className="text-[11px] text-stone-500">Asset investment ratios by major stock catalog category</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-stone-505">
              <span className="inline-block w-2.5 h-2.5 bg-amber-600 rounded-full" />
              <span>Investment Weighting</span>
            </div>
          </div>

          {/* SVG Custom Render Graph */}
          <div className="pt-2 h-48 flex items-end justify-between space-x-6 px-4 relative">
            
            {/* Grid Lines in background */}
            <div className="absolute inset-x-0 bottom-6 top-2 flex flex-col justify-between pointer-events-none opacity-5 pr-8">
              <div className="border-b border-black w-full" />
              <div className="border-b border-black w-full" />
              <div className="border-b border-black w-full" />
            </div>

            {(['Tiles', 'Bathware', 'Sanitaryware', 'Fittings'] as Category[]).map(cat => {
              const val = categorySummary[cat] || 0;
              const count = categoryCounts[cat] || 0;
              // Determine height percentage relative to total valuation or maximum value
              const maxVal = Math.max(...Object.values(categorySummary), 1000);
              const heightPct = (val / maxVal) * 80; // scale to fit inside h-48

              return (
                <div key={cat} className="flex-1 flex flex-col items-center group relative z-10">
                  
                  {/* Hover detail tooltips */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-stone-900 text-white rounded px-2.5 py-1 text-[10px] text-center shadow-lg font-mono leading-tight whitespace-nowrap">
                    <strong className="block text-amber-400">₹{val.toLocaleString('en-IN')}</strong>
                    {count} products listed
                  </div>

                  {/* Rounded Progress bar vertical */}
                  <div className="w-12 sm:w-16 bg-stone-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-32 border border-stone-200/40 shadow-inner">
                    <div 
                      className="bg-gradient-to-t from-stone-900 to-amber-600 group-hover:brightness-110 transition-all rounded-t-sm"
                      style={{ height: `${Math.max(1, heightPct)}%` }}
                    />
                  </div>
                  
                  {/* Labels underneath */}
                  <span className="text-[11px] font-bold text-stone-800 font-sans mt-2.5 block truncate max-w-full text-center">
                    {cat}
                  </span>
                  <span className="text-[10px] text-stone-450 font-mono mt-0.5 whitespace-nowrap block">
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights side panel */}
        <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-semibold font-sans text-stone-950">Inventory Actions</h4>
            <p className="text-[11px] text-stone-500">Fast administrative operations</p>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <button
              id="btn-add-product-modal"
              onClick={openAddForm}
              className="w-full h-11 bg-stone-900 border border-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 text-amber-500" />
              <span>Add New Catalog Item</span>
            </button>
            
            <button
              id="btn-export-csv"
              onClick={exportInventoryCSV}
              className="w-full h-11 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Export CSV Spreadsheet</span>
            </button>
          </div>

          <div className="bg-stone-50/80 border border-stone-200/50 p-3 rounded-xl">
            <div className="text-[10.5px] uppercase tracking-wider text-stone-400 font-bold block mb-1">Database Health</div>
            <div className="text-[11.5px] text-stone-650 leading-relaxed font-sans">
              Local system synchronized with browser storage. Current database holding{' '}
              <strong className="text-stone-900">{totalSkuCount} SKUs</strong> over{' '}
              <strong className="text-stone-900">4 divisions</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Main Table and Logs Frame */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden" id="inventory-tabbed-frame">
        
        {/* Navigation Tabs bar inside inventory */}
        <div className="border-b border-stone-100 bg-stone-50/50 px-4 py-2 flex flex-wrap items-center justify-between">
          <div className="flex space-x-2.5">
            <button
              id="subtab-all"
              onClick={() => setActiveSubTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'all'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-205'
                  : 'text-stone-550 hover:text-stone-900'
              }`}
            >
              All Unified Inventory
            </button>
            <button
              id="subtab-alerts"
              onClick={() => setActiveSubTab('alerts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeSubTab === 'alerts'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-550 hover:text-stone-900 flex items-center space-x-1.5'
              }`}
            >
              <span>Low Stock Alerts</span>
              {lowStockItems.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {lowStockItems.length}
                </span>
              )}
            </button>
            <button
              id="subtab-history"
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'history'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-205'
                  : 'text-stone-550 hover:text-stone-900'
              }`}
            >
              Transaction Audit Logs
            </button>
          </div>

          <div className="text-[11px] font-mono font-medium text-stone-500">
            Audit logs stored: {movements.length} files
          </div>
        </div>

        {/* Tab content 1: All items table */}
        {activeSubTab === 'all' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-stone-55/40 border-b border-stone-200 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                  <th className="py-2.5 px-4">Item Details</th>
                  <th className="py-2.5 px-4 text-center">SKU</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-center">Stock level</th>
                  <th className="py-2.5 px-4 text-right">Total Value</th>
                  <th className="py-2.5 px-4 text-right">Modify Stock / Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => {
                  const isLow = p.stock <= p.minStock;
                  const isOut = p.stock === 0;
                  const value = p.stock * p.price;
                  const isAdjusting = selectedAdjustId === p.id;

                  return (
                    <tr key={p.id} id={`admin-row-${p.id}`} className="hover:bg-amber-50/10">
                      
                      {/* Name image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3 max-w-[280px]">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-8 h-8 object-cover rounded border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <span className="text-stone-900 font-semibold text-sm block truncate">{p.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono italic block">{p.subcategory} • {p.size}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] font-bold text-stone-600">{p.sku}</td>

                      {/* Category Label */}
                      <td className="py-3 px-4">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700/80 border border-stone-200/45">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-medium text-stone-850">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                      {/* Stock Level in units */}
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-250">UNAVAILABLE (0)</span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-250 animate-pulse">{p.stock} ({p.unit})</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-850 text-[10px] font-bold border border-emerald-200/50">{p.stock} ({p.unit})</span>
                        )}
                      </td>

                      {/* Value multiplier */}
                      <td className="py-3 px-4 text-right font-semibold text-stone-950">₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                      {/* Actions cell */}
                      <td className="py-3 px-4 text-right">
                        {isAdjusting ? (
                          
                          /* Compact adjustment controls open inline */
                          <div className="flex items-center space-x-1.5 justify-end" id={`stock-adjust-form-${p.id}`}>
                            <input
                              type="number"
                              title="Count Adjustment"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              className="w-16 h-8 text-xs border border-amber-300 rounded px-1.5 font-bold font-mono text-center outline-none"
                            />
                            <button
                              id={`btn-apply-stock-in-${p.id}`}
                              onClick={() => executeStockAdjust(p.id, 'IN')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8 px-2 rounded"
                              title="Restock IN (Add)"
                            >
                              + IN
                            </button>
                            <button
                              id={`btn-apply-stock-out-${p.id}`}
                              onClick={() => executeStockAdjust(p.id, 'OUT')}
                              className="bg-neutral-800 hover:bg-neutral-900 text-white text-[10px] font-bold h-8 px-2 rounded"
                              title="Dispatch OUT (Deduct)"
                            >
                              - OUT
                            </button>
                            <button
                              onClick={() => setSelectedAdjustId(null)}
                              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center space-x-1.5">
                            <button
                              id={`btn-trigger-adjust-${p.id}`}
                              onClick={() => { setSelectedAdjustId(p.id); setAdjustAmount(p.category === 'Tiles' ? '150' : '10'); }}
                              className="px-2 py-1 bg-stone-900 hover:bg-stone-850 text-white text-[10.5px] rounded-lg font-bold shadow-sm"
                              title="Bulk inbound/outbound adjustments"
                            >
                              Change Stock
                            </button>
                            
                            <button
                              id={`btn-view-qr-${p.id}`}
                              onClick={() => setSelectedQrProduct(p)}
                              className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-200/50 flex-shrink-0"
                              title="Display retail QR Code / labels"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            <button
                              id={`btn-edit-product-${p.id}`}
                              onClick={() => openEditForm(p)}
                              className="p-1.5 text-stone-605 bg-stone-50 hover:bg-stone-150 rounded-lg border border-stone-200 flex-shrink-0"
                              title="Edit product parameters"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              id={`btn-delete-product-${p.id}`}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete SKU: ${p.sku} from the catalog? This action is irreversible.`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-550 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/50 flex-shrink-0"
                              title="Remove from shop listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab content 2: Warnings alerts restock dashboard */}
        {activeSubTab === 'alerts' && (
          <div className="p-4 space-y-4">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 space-y-3 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h5 className="font-bold text-stone-950">System Stocks Healthy</h5>
                  <p className="text-xs text-stone-500">Every single SKU is safely above its defined minimum replenishment trigger levels.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl text-xs text-amber-800 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Replenishment needed: </strong> 
                    {lowStockItems.length} products require restocking soon to prevent order delays and lead-time shortages. Use the instant stock loader buttons below to replenish catalog.
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-100">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 text-xs text-stone-500 font-bold">
                      <tr>
                        <th className="py-2 px-3">Item Details</th>
                        <th className="py-2 px-3">Current Stock</th>
                        <th className="py-2 px-3">Trigger Alert Point</th>
                        <th className="py-2 px-3">Shortage Deficit</th>
                        <th className="py-2 px-3 text-right">Express restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {lowStockItems.map(p => {
                        const deficit = p.minStock - p.stock;
                        const defaultRefill = p.category === 'Tiles' ? 300 : 25;

                        return (
                          <tr key={p.id} className="hover:bg-amber-50/10">
                            <td className="py-3 px-3 flex items-center space-x-2.5">
                              <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-semibold text-stone-900 block text-xs truncate max-w-[220px]">{p.name}</span>
                                <span className="text-[9px] text-stone-400 font-mono block">{p.sku} • {p.category}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-xs font-bold text-rose-600">
                              {p.stock} / {p.unit}
                            </td>
                            <td className="py-3 px-3 font-mono text-xs text-stone-500">{p.minStock} {p.unit}</td>
                            <td className="py-3 px-3 font-mono text-xs text-stone-800">
                              -{deficit} {p.unit} Deficit
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                id={`quick-replenish-${p.id}`}
                                onClick={() => onUpdateStock(p.id, defaultRefill, 'IN', 'Instant Restock Shipment Received')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold active:scale-95 transition-all shadow-sm flex items-center space-x-1.5 ml-auto"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Refill +{defaultRefill} {p.unit}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab content 3: History audit logging */}
        {activeSubTab === 'history' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">Chronological transaction record of showroom dispatches and warehouse arrivals.</span>
              <button
                id="btn-clear-movements"
                onClick={() => {
                  if (window.confirm("Verify: Clear entire historical stock movement logs? Note: Core inventory stock balances will remain active.")) {
                    // Quick clear or empty handled in App.tsx
                    onUpdateStock('', 0, 'ADJUST', 'CLEAR_ALL_LOGS');
                  }
                }}
                className="px-2 py-1.5 text-[10px] font-bold text-stone-550 border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-850"
              >
                Clear History Logs
              </button>
            </div>

            {movements.length === 0 ? (
              <div className="text-center py-12 text-stone-450 text-xs">
                No recent stock movements logged yet. Adjust catalog balances to populate tracking files.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {[...movements].reverse().map(log => {
                  const isAdd = log.type === 'IN';
                  const isDeduct = log.type === 'OUT';

                  return (
                    <div 
                      key={log.id} 
                      className="p-3 bg-stone-50 border border-stone-200/50 rounded-xl flex items-center justify-between space-x-4 text-xs font-sans"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded font-bold font-mono text-[9px] w-[64px] text-center ${
                          isAdd 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isDeduct 
                            ? 'bg-zinc-800 text-stone-200' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.type === 'IN' ? 'RECEIVED' : log.type === 'OUT' ? 'DISPATCH' : 'ADJUSTED'}
                        </span>
                        
                        <div>
                          <p className="font-semibold text-stone-900 leading-tight">
                            {log.quantity > 0 && (isAdd ? '+' : isDeduct ? '-' : '')}{log.quantity > 0 ? log.quantity : ''} {log.productName}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[10px] text-stone-400 mt-1">
                            <span className="font-mono font-bold text-stone-500">{log.sku}</span>
                            <span>•</span>
                            <span>Reason: {log.reason}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 font-mono text-[10px] text-stone-450">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="block text-[8.5px] mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CRUD Product Dialog Form (Add / Edit) overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="inventory-crud-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Form Header */}
            <div className="p-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-black font-sans text-stone-900 uppercase tracking-wider">
                  {editingProduct ? '📑 Edit Catalog Specifications' : '✨ Enlist New Product SKU'}
                </h3>
                <p className="text-[10px] text-stone-450">Complete key values representing product inventory parameters.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full text-stone-450 hover:bg-stone-100 hover:text-stone-705"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-605 block">Merchant Name</label>
                  <input
                    id="form-product-name"
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Carrara Gold Satin Wall Tile"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">SKU Code</label>
                  <input
                    id="form-product-sku"
                    required
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. TL-CAR-80"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Core Category</label>
                  <select
                    id="form-product-category"
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as Category;
                      setFormCategory(cat);
                      setFormUnit(cat === 'Tiles' ? 'sqft' : 'pcs');
                    }}
                    className="w-full h-9.5 rounded-lg border border-stone-200 px-2.5 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Tiles">Tiles (Squared floor/walls)</option>
                    <option value="Bathware">Bathware (Bathtubs & Showers)</option>
                    <option value="Sanitaryware">Sanitaryware (Closets & Basins)</option>
                    <option value="Fittings">Fittings (Taps, Faucets & Sinks)</option>
                  </select>
                </div>

                {/* Sub-category details */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Subcategory Label</label>
                  <input
                    id="form-product-subcategory"
                    required
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="e.g. Vitrified Porcelain"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Unit dimensions */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Dimensions / Form Size</label>
                  <input
                    id="form-product-size"
                    required
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g. 60x120 cm"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Wholsale Unit Price */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Wholesale Unit Price (₹)</label>
                  <input
                    id="form-product-price"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Showroom measure unit */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Showroom sales unit</label>
                  <select
                    id="form-product-unit"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full h-9.5 rounded-lg border border-stone-200 px-2.5 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="sqft">Square feet (sqft)</option>
                    <option value="pcs">Single pieces (pcs)</option>
                    <option value="sqm">Square meter (sqm)</option>
                  </select>
                </div>

                {/* Warehouse Stock counts */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Warehouse Initial Stock</label>
                  <input
                    id="form-product-stock"
                    required
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Replenishment trigger alerting point */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Min stock alert trigger point</label>
                  <input
                    id="form-product-minstock"
                    required
                    type="number"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Glaze finishing type */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Glaze Surface Finish</label>
                  <select
                    id="form-product-finish"
                    value={formFinish}
                    onChange={(e) => setFormFinish(e.target.value)}
                    className="w-full h-9.5 rounded-lg border border-stone-200 px-2.5 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Matt">Matte (Raw slip-resistant)</option>
                    <option value="Polished">Polished (Glossy High reflection)</option>
                    <option value="Glossy">Glossy (Reflective glaze)</option>
                    <option value="Satin">Satin (Silky semi-reflective)</option>
                    <option value="Textured">Textured (Structured Natural Slate)</option>
                  </select>
                </div>

                {/* Material composition */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Base Material composition</label>
                  <input
                    id="form-product-material"
                    required
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="e.g. Vitreous China / Solid Stone Resin"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Surface color */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Surface color Tone</label>
                  <input
                    id="form-product-color"
                    required
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. Alabaster White"
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Catalog photo Unsplash link */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Display catalog Photo URL</label>
                  <input
                    id="form-product-image"
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />                {/* Box Packing square footage coverage for tiles */}
                {formCategory === 'Tiles' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-stone-605 block">Pack box Carton coverage (sqft)</label>
                      <input
                        id="form-product-box-coverage"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formBoxCoverage}
                        onChange={(e) => setFormBoxCoverage(e.target.value)}
                        className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-bold text-stone-605 block">Grout Line Suggested Style</label>
                      <input
                        id="form-product-grout"
                        type="text"
                        value={formGroutSuggestion}
                        onChange={(e) => setFormGroutSuggestion(e.target.value)}
                        placeholder="e.g. Charcoal Grout (2mm)"
                        className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </>
                )}

                {/* Sell Pricing Basis configuration */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Invoicing Pricing Model</label>
                  <select
                    id="form-product-sell-basis"
                    value={formSellUnitBasis}
                    onChange={(e) => {
                      const basis = e.target.value as any;
                      setFormSellUnitBasis(basis);
                    }}
                    className="w-full h-9.5 rounded-lg border border-stone-200 px-2.5 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="sqft">Sqft basis (Charge by Area size)</option>
                    <option value="box">Box basis (Charge by pre-packed carton)</option>
                    <option value="pcs">Pcs basis (Charge per item unit count)</option>
                    <option value="meter">Meter basis (Charge by length)</option>
                    <option value="bags">Bags basis (Charge by container bag)</option>
                  </select>
                </div>

                {/* Carton packing conversion metrics */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Items per Box Carton</label>
                  <input
                    id="form-product-items-per-box"
                    type="number"
                    min="1"
                    value={formItemsPerBox}
                    onChange={(e) => setFormItemsPerBox(e.target.value)}
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-605 block">Pack Weight per Box (KGs)</label>
                  <input
                    id="form-product-weight-per-box"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formWeightPerBox}
                    onChange={(e) => setFormWeightPerBox(e.target.value)}
                    className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 bg-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Instant QR label preview inside details pane for immediate compliance verification */}
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <SkuQrCode sku={formSku || 'TEMP-PREVIEW'} size={85} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9.5px] uppercase font-mono font-bold text-amber-801 block">Automated QR Generation</span>
                    <h5 className="text-[11px] font-bold text-stone-900 font-mono truncate mt-0.5">{formSku || 'Empty SKU'}</h5>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                      This QR Code is created instantly and allows hand-held laser scanners to instantly check-in and scan this tile in checkout!
                    </p>
                  </div>
                </div>

                {/* Description details */}
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-605 block">Catalog spec Description</label>
                  <textarea
                    id="form-product-description"
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Specify physical details, design inspirations, and placement recommendations."
                    className="w-full rounded-lg border border-stone-200 p-2.5 bg-white outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
              </div>

              {/* Form Actions bottom inside modal */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-product-crud"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-500" />
                  <span>{editingProduct ? 'Update Product specifications' : 'Enlist Product in Catalog'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable QR Code / Retail Label Sheet modal popup */}
      {selectedQrProduct && (
        <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="qr-label-viewer-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider">Showroom Product QR Label</h4>
                <p className="text-[10px] text-stone-450">Print or register physical QR tags for items in showroom</p>
              </div>
              <button
                onClick={() => setSelectedQrProduct(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Label Body (Aesthetic print card styling) */}
            <div className="p-6 flex flex-col items-center justify-center bg-stone-100/40">
              <div className="bg-white p-5 border-2 border-stone-900/90 rounded-2xl shadow-md w-full flex flex-col items-center text-center space-y-4 relative">
                {/* Decorative Scissors dash border representing paper trim line */}
                <div className="absolute inset-2 border border-dashed border-stone-200 rounded-xl pointer-events-none" />

                {/* Brand header */}
                <div className="w-full pb-2 border-b border-stone-200 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9A7B56] leading-none">RP TILES SHOWROOM</span>
                  <p className="text-[9px] text-stone-400 font-mono mt-0.5 uppercase tracking-tight">Luxury Stone & Sanitaryware</p>
                </div>

                {/* SKU Barcode QR Container */}
                <div className="relative p-1">
                  <SkuQrCode sku={selectedQrProduct.sku} size={150} />
                </div>

                {/* SKU Code block details */}
                <div className="w-full space-y-1">
                  <span className="bg-stone-900 text-amber-500 font-mono text-[13px] font-bold py-1 px-4 rounded-md tracking-wider inline-block">
                    {selectedQrProduct.sku}
                  </span>
                  <h3 className="text-xs font-bold text-stone-900 line-clamp-2 pt-1">
                    {selectedQrProduct.name}
                  </h3>
                  <p className="text-[9.5px] text-stone-450 uppercase font-bold tracking-wider">
                    {selectedQrProduct.subcategory} • {selectedQrProduct.size}
                  </p>
                </div>

                {/* Custom Packaging details */}
                <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-stone-150 text-left text-[10px]">
                  <div>
                    <span className="text-stone-400 block text-[8px] uppercase font-bold tracking-tight">Showroom Price</span>
                    <strong className="text-stone-800 text-[11px]">
                      ₹{selectedQrProduct.price.toLocaleString('en-IN')}/{selectedQrProduct.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[8px] uppercase font-bold tracking-tight">Pricing Model</span>
                    <strong className="text-stone-850 capitalize text-[11px]">
                      {selectedQrProduct.sellUnitBasis || selectedQrProduct.unit} basis
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[8px] uppercase font-bold tracking-tight">Carton Specs</span>
                    <strong className="text-stone-800 text-[11px]">
                      {selectedQrProduct.category === 'Tiles' ? `${selectedQrProduct.boxCoverage || 'N/A'} sqft/Box` : `${selectedQrProduct.itemsPerBox || 1} pcs/Box`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[8px] uppercase font-bold tracking-tight">Weight & Count</span>
                    <strong className="text-stone-800 text-[11px]">
                      {selectedQrProduct.itemsPerBox || 'N/A'} Items ({selectedQrProduct.weightPerBox ? `${selectedQrProduct.weightPerBox}kg` : 'N/A'})
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedQrProduct(null)}
                className="px-3.5 py-1.5 border border-stone-250 text-stone-700 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close View
              </button>
              
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                <span>Print Shelf Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
