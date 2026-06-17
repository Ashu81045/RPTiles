/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Product, Category } from '../types';
import { Search, Filter, ShieldCheck, Grid, List, Check, Box, X, HelpCircle, ArrowUpRight } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  onOpenVisualizer?: (product: Product) => void;
  onUpdateProductStock?: (productId: string, newStock: number) => void;
}

export default function CatalogView({
  products,
  onOpenVisualizer,
  onUpdateProductStock
}: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedFinish, setSelectedFinish] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Local overlay calculator for tile square footage needed
  const [calcSqft, setCalcSqft] = useState<string>('');
  const [calcBoxes, setCalcBoxes] = useState<number | null>(null);

  // Extract all unique finishes for filter dropdown
  const uniqueFinishes = ['All', ...Array.from(new Set(products.map(p => p.finish)))];

  // Categories list
  const categories: (Category | 'All')[] = ['All', 'Tiles', 'Bathware', 'Sanitaryware', 'Fittings'];

  // Filter products based on search, category and finish
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesFinish = selectedFinish === 'All' || product.finish === selectedFinish;

    return matchesSearch && matchesCategory && matchesFinish;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'price-asc') {
      return a.price - b.price;
    } else if (sortOrder === 'price-desc') {
      return b.price - a.price;
    }
    return 0;
  });

  const handleTileCalcChange = (value: string, coverage: number) => {
    setCalcSqft(value);
    const sqft = parseFloat(value);
    if (!isNaN(sqft) && sqft > 0) {
      // Calculate boxes required with 10% wastage margin included
      const withWastage = sqft * 1.1;
      const boxesNeeded = Math.ceil(withWastage / coverage);
      setCalcBoxes(boxesNeeded);
    } else {
      setCalcBoxes(null);
    }
  };

  return (
    <div id="catalog-view-root" className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Main search input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-stone-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, SKU or material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full flex h-10.5 rounded-xl border border-stone-200 pl-10.5 pr-4 text-sm bg-stone-50/50 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 hover:border-stone-300"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort order */}
          <div className="md:col-span-3 relative">
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full flex h-10.5 px-3.5 rounded-xl border border-stone-200 text-sm bg-stone-50/50 outline-none focus:ring-1 focus:ring-amber-500 hover:bg-stone-50"
            >
              <option value="name">Sort alphabetically (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Finish option filter */}
          <div className="md:col-span-3 relative">
            <select
              id="finish-select"
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value)}
              className="w-full flex h-10.5 px-3.5 rounded-xl border border-stone-200 text-sm bg-stone-50/50 outline-none focus:ring-1 focus:ring-amber-500 hover:bg-stone-50"
            >
              <option value="All">All Finishes</option>
              {uniqueFinishes.filter(f => f !== 'All').map(f => (
                <option key={f} value={f}>{f} Finish</option>
              ))}
            </select>
          </div>

          {/* View mode buttons */}
          <div className="md:col-span-2 flex items-center justify-end space-x-1 border-l border-stone-100 pl-3 md:block hidden">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-all ${
                viewMode === 'grid'
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
              title="Grid View"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-all ml-1.5 ${
                viewMode === 'list'
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
              title="List View"
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Categories Pills Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-2 flex items-center">
            <Filter className="w-3 h-3 mr-1" />
            Categories:
          </span>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-pill-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100/85 border border-stone-200/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
          
          <div className="ml-auto text-[11px] font-mono text-stone-500">
            Showing <span className="font-bold text-stone-900">{sortedProducts.length}</span> of {products.length} products
          </div>
        </div>
      </div>

      {/* Catalog Main Frame */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-sm mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-stone-900 font-semibold mb-1">No products found</h4>
            <p className="text-xs text-stone-500">Try adjusting your keyword filters or switching to another design category.</p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedFinish('All');
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-800"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Display mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" id="catalog-grid-layout">
          {sortedProducts.map(product => {
            const isLowStock = product.stock <= product.minStock;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative"
              >
                {/* Image card preview */}
                <div className="h-48 bg-neutral-100 overflow-hidden relative cursor-pointer" onClick={() => { setSelectedProduct(product); setCalcBoxes(null); setCalcSqft(''); }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-800 shadow-sm border border-stone-200/40">
                    {product.subcategory}
                  </div>
                  
                  {/* Stock tag */}
                  {isOutOfStock ? (
                    <div className="absolute top-3 right-3 bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm">
                      OUT OF STOCK
                    </div>
                  ) : isLowStock ? (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm animate-pulse">
                      LOW STOCK: {product.stock}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm">
                      {product.stock} {product.unit} In Stock
                    </div>
                  )}

                  {/* Surface feature label for tiles */}
                  {product.category === 'Tiles' && (
                    <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono text-zinc-100 tracking-wide font-bold">
                      {product.finish} Finish • {product.size}
                    </div>
                  )}
                </div>

                {/* Info detailing */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="font-mono text-[9px] text-zinc-400 tracking-wider uppercase font-semibold">{product.sku}</div>
                    <h4 
                      onClick={() => { setSelectedProduct(product); setCalcBoxes(null); setCalcSqft(''); }}
                      className="text-stone-900 font-sans font-medium text-sm line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-stone-950 font-bold text-lg">
                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-stone-500 text-xs font-mono"> / {product.unit}</span>
                    </div>

                    <div className="flex space-x-1.5">
                      {product.category === 'Tiles' && (
                        <button
                          id={`visualize-shortcut-${product.id}`}
                          onClick={() => onOpenVisualizer?.(product)}
                          className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 transition-all text-[10px] font-bold flex items-center space-x-1 border border-amber-200/50"
                          title="View on Virtual Room Wall / Floor"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Visualize</span>
                        </button>
                      )}
                      <button
                        id={`btn-details-${product.id}`}
                        onClick={() => { setSelectedProduct(product); setCalcBoxes(null); setCalcSqft(''); }}
                        className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-[10px] text-stone-700 font-bold tracking-wide transition-all border border-stone-200/50"
                      >
                        Specs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* List Display mode */
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm" id="catalog-list-layout">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-xs text-stone-500 uppercase tracking-widest font-bold">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4 text-center">Category</th>
                <th className="py-3 px-4 text-center">Dimensions</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedProducts.map(product => {
                const isLowStock = product.stock <= product.minStock;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr key={product.id} id={`product-row-${product.id}`} className="hover:bg-amber-50/10 transition-colors">
                    <td className="py-3.5 px-4 flex items-center space-x-3.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded border border-stone-200/80"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-stone-950 font-medium text-sm line-clamp-1">{product.name}</div>
                        <div className="text-[10px] font-medium text-stone-400 font-mono">{product.material} • {product.finish} finish</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11.5px] font-semibold text-stone-650">{product.sku}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                        {product.subcategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-stone-600">{product.size}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[10px] text-stone-500 font-normal">/{product.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/50">OUT OF STOCK</span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50 animate-pulse">{product.stock} {product.unit} (LOW)</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">{product.stock} {product.unit}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        {product.category === 'Tiles' && (
                          <button
                            id={`row-visualize-${product.id}`}
                            onClick={() => onOpenVisualizer?.(product)}
                            className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-750 rounded text-xs"
                            title="Visualize room floor/walls"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          id={`row-specs-${product.id}`}
                          onClick={() => { setSelectedProduct(product); setCalcBoxes(null); setCalcSqft(''); }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium rounded-lg border border-stone-200/40"
                        >
                          Specs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Specification Drawer Display popup */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm flex justify-end z-50 transition-opacity" id="product-detail-modal">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative">
            
            {/* Header info */}
            <div className="p-5 border-b border-stone-100 flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {selectedProduct.category} » {selectedProduct.subcategory}
                </span>
                <h3 className="text-lg font-bold font-sans text-stone-950 leading-snug mt-1.5">{selectedProduct.name}</h3>
                <p className="text-xs text-stone-400 font-mono">SKU: {selectedProduct.sku}</p>
              </div>
              <button
                id="close-drawer-btn"
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-50 hover:text-stone-700 ml-3"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Spec Scroller Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Image Preview frame */}
              <div className="aspect-[16/10] bg-neutral-100 rounded-2xl overflow-hidden border border-stone-100 relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {selectedProduct.category === 'Tiles' && (
                  <button
                    id="drawer-visualize-btn"
                    onClick={() => {
                      onOpenVisualizer?.(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="absolute bottom-3 right-3 px-4 py-2 bg-stone-900/95 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4 text-amber-500" />
                    <span>Open in Tiling Visualizer</span>
                  </button>
                )}
              </div>

              {/* Core Description block */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400">Merchant Description</h5>
                <p className="text-xs text-stone-650 leading-relaxed font-sans">{selectedProduct.description}</p>
              </div>

              {/* Attribute Values Grid */}
              <div className="space-y-3.5">
                <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400">Technical Specifications</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 flex flex-col">
                    <span className="text-[10px] text-stone-550 font-medium">Dimensions/Size</span>
                    <span className="text-sm font-semibold text-stone-950 mt-0.5">{selectedProduct.size}</span>
                  </div>
                  
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 flex flex-col">
                    <span className="text-[10px] text-stone-550 font-medium">Primary Material</span>
                    <span className="text-sm font-semibold text-stone-950 mt-0.5">{selectedProduct.material}</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 flex flex-col">
                    <span className="text-[10px] text-stone-550 font-medium">Glaze Finishing</span>
                    <span className="text-sm font-semibold text-stone-950 mt-0.5">{selectedProduct.finish} Finish</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 flex flex-col">
                    <span className="text-[10px] text-stone-550 font-medium">Surface Colorway</span>
                    <span className="text-sm font-semibold text-stone-950 mt-0.5">{selectedProduct.color}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Tile Area Calculator Tool */}
              {selectedProduct.category === 'Tiles' && selectedProduct.boxCoverage && (
                <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <Box className="w-4.5 h-4.5 text-amber-700" />
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Tile Estimation Assistant</h5>
                  </div>
                  <p className="text-[11px] text-stone-605 leading-relaxed">
                    This tile covers exactly <strong className="text-stone-900">{selectedProduct.boxCoverage} sqft</strong> per standard box carton packing.
                  </p>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Target Room Area (sqft)</span>
                      <input
                        id="calculator-sqft-input"
                        type="number"
                        placeholder="e.g. 150"
                        value={calcSqft}
                        onChange={(e) => handleTileCalcChange(e.target.value, selectedProduct.boxCoverage || 15)}
                        className="w-full flex h-9.5 rounded-lg border border-stone-200 px-3 text-xs bg-white mt-1 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    {calcBoxes !== null && (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-center">
                        <span className="text-[9px] uppercase tracking-wide text-zinc-400 block font-bold">Boxes Required</span>
                        <div className="text-sm font-black text-amber-750">{calcBoxes} Carton Boxes</div>
                        <span className="text-[8px] text-stone-500 italic block mt-0.5">Includes 10% wastage buffer</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Features bullet points */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400">Exclusive Ceramic Features</h5>
                <ul className="space-y-1.5 font-sans">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-stone-650 flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Panel Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-stone-400 text-xs block">Wholesale Price</span>
                <span className="text-xl font-bold text-stone-950">₹{selectedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-stone-500 text-xs font-mono"> / {selectedProduct.unit}</span>
              </div>

              {/* Adjust Stock right here shortcut */}
              <div className="flex space-x-2 items-center">
                <div className="text-right mr-1">
                  <span className="text-[10px] text-stone-500 uppercase block font-bold">Showroom stock</span>
                  <span className={`text-xs font-mono font-bold ${selectedProduct.stock <= selectedProduct.minStock ? 'text-amber-600 animate-pulse' : 'text-emerald-700'}`}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </div>
                
                {onUpdateProductStock && (
                  <div className="flex border border-stone-200 rounded-lg bg-white shadow-sm overflow-hidden h-9">
                    <button
                      id="drawer-deduct-stock"
                      onClick={() => onUpdateProductStock(selectedProduct.id, Math.max(0, selectedProduct.stock - 10))}
                      className="px-2 hover:bg-stone-50 text-stone-650 font-bold active:bg-stone-100 text-xs text-center border-r"
                      title="-10 Stock Adjustment"
                    >
                      -10
                    </button>
                    <button
                      id="drawer-add-stock"
                      onClick={() => onUpdateProductStock(selectedProduct.id, selectedProduct.stock + 10)}
                      className="px-2 hover:bg-stone-50 text-stone-650 font-bold active:bg-stone-100 text-xs text-center"
                      title="+10 Stock Adjustment"
                    >
                      +10
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
