/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Product, VisualizationSettings } from '../types';
import { Layers, Maximize, Paintbrush, Sliders, LayoutGrid, Sparkles } from 'lucide-react';

interface TileVisualizerProps {
  products: Product[];
  selectedProduct?: Product;
  onSelectProduct?: (product: Product) => void;
}

export default function TileVisualizer({
  products,
  selectedProduct,
  onSelectProduct
}: TileVisualizerProps) {
  const tileProducts = products.filter(p => p.category === 'Tiles');
  
  // Default to first tile if none selected
  const activeTile = selectedProduct && selectedProduct.category === 'Tiles'
    ? selectedProduct
    : tileProducts[0] || null;

  const [settings, setSettings] = useState<VisualizationSettings>({
    groutColor: '#E5E7EB', // light gray
    groutWidth: 2, // 2mm
    layoutPattern: 'grid',
    viewMode: 'wall',
    tileAngle: 0
  });

  const groutColorOptions = [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Silver Gray', hex: '#D1D5DB' },
    { name: 'Concrete Gray', hex: '#9CA3AF' },
    { name: 'Charcoal Black', hex: '#374151' },
    { name: 'Beige Sand', hex: '#E5E0D8' },
    { name: 'Rich Gold', hex: '#EAB308' }
  ];

  const patterns = [
    { id: 'grid', name: 'Stack Bond (Grid)', desc: 'Modern stacked clean look' },
    { id: 'running-bond', name: 'Brick Bond (Staggered)', desc: 'Classic 50% shift layout' }
  ] as const;

  const handlePatternChange = (pattern: 'grid' | 'running-bond') => {
    setSettings(prev => ({ ...prev, layoutPattern: pattern }));
  };

  const getTileTexture = (tile: Product) => {
    switch (tile.id) {
      case 'p1': // Calacatta Gold
        return (
          <div className="w-full h-full relative bg-neutral-50 overflow-hidden select-none hover:brightness-105 transition-all">
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/30 pointer-events-none" />
            {/* Marble Veins */}
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M-10,35 C30,45 40,25 70,10 C80,5 95,20 110,15" stroke="#78716C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
              <path d="M-5,40 C35,48 45,28 75,13 C82,8 97,23 112,18" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
              <path d="M20,110 C40,70 65,80 85,45 C95,30 110,40 120,30" stroke="#78716C" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.2" />
            </svg>
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-zinc-400 opacity-20">{tile.size}</div>
          </div>
        );
      case 'p2': // Charcoal Slate
        return (
          <div className="w-full h-full relative bg-zinc-800 border-[1px] border-zinc-900/10 shadow-inner select-none hover:brightness-105 transition-all">
            {/* Raw textured cleft overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700/50 via-zinc-800 to-zinc-900 pointer-events-none" />
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,20 L100,30 M0,50 L100,45 M0,80 L100,85" stroke="#18181B" strokeWidth="3" fill="none" opacity="0.4" />
              <path d="M10,0 L15,100 M60,0 L50,100" stroke="#18181B" strokeWidth="1" fill="none" opacity="0.2" />
            </svg>
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-zinc-500 opacity-25">{tile.size}</div>
          </div>
        );
      case 'p3': // Olive Subway
        return (
          <div className="w-full h-full relative bg-emerald-900 overflow-hidden select-none hover:brightness-105 transition-all">
            {/* Highly glossy wet glaze */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 via-emerald-950 to-emerald-900" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/30 blur-[0.5px]" />
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-950/40" />
            <div className="absolute left-0 w-[2px] h-full bg-white/20 blur-[0.5px]" />
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-emerald-300 opacity-20">{tile.size}</div>
          </div>
        );
      case 'p4': // Terrazzo
        return (
          <div className="w-full h-full relative bg-neutral-200 overflow-hidden select-none hover:brightness-105 transition-all">
            {/* Spec speckled design */}
            <div className="absolute inset-0 pointer-events-none opacity-80">
              {/* Speckled SVG representation and noise */}
              <svg className="w-full h-full opacity-70" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#E5E5E5" />
                {/* Speckles */}
                <circle cx="10" cy="20" r="3" fill="#D4D4D4" />
                <circle cx="15" cy="55" r="2.5" fill="#171717" opacity="0.6" />
                <circle cx="85" cy="15" r="4" fill="#a8a29e" />
                <circle cx="60" cy="30" r="2" fill="#78716c" />
                <circle cx="40" cy="80" r="3.5" fill="#262626" opacity="0.4" />
                <circle cx="75" cy="70" r="5" fill="#f5f5f4" />
                <circle cx="30" cy="45" r="2" fill="#a1a1aa" />
                <circle cx="90" cy="85" r="3" fill="#171717" opacity="0.5" />
                <circle cx="50" cy="10" r="2.5" fill="#f5f5f4" />
                <circle cx="5" cy="85" r="4" fill="#78716c" />
                <circle cx="65" cy="90" r="1.5" fill="#262626" />
                <circle cx="48" cy="55" r="3.2" fill="#a8a29e" />
              </svg>
            </div>
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-zinc-500 opacity-25">{tile.size}</div>
          </div>
        );
      case 'p5': // Wood Look
        return (
          <div className="w-full h-full relative bg-amber-800 overflow-hidden select-none hover:brightness-105 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900/90" />
            {/* Wood grains */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,10 H100 M0,20 H100 M0,25 H100 M0,45 H100 M0,55 H100 M0,75 H100 M0,85 H100 M0,95 H100" stroke="#451a03" strokeWidth="1" />
                {/* Knot */}
                <ellipse cx="60" cy="40" rx="15" ry="3" stroke="#451a03" strokeWidth="1.5" fill="none" />
                <ellipse cx="60" cy="40" rx="9" ry="1.5" stroke="#451a03" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-amber-200/40">{tile.size}</div>
          </div>
        );
      case 'p6': // Moroccan
        return (
          <div className="w-full h-full relative bg-stone-100 overflow-hidden flex items-center justify-center select-none hover:brightness-105 transition-all">
            <div className="absolute inset-0 opacity-15">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#fffbef" />
              </svg>
            </div>
            {/* Moroccan Encaustic vector motif */}
            <svg className="w-[80%] h-[80%] text-sky-850 opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              {/* Outer boundary */}
              <rect x="5" y="5" width="90" height="90" strokeWidth="1" rx="2" />
              <path d="M50 0 L50 100 M0 50 L100 50" strokeWidth="0.8" opacity="0.5" />
              {/* Diamond and floral center */}
              <polygon points="50,15 85,50 50,85 15,50" strokeWidth="2" stroke="#1d4ed8" />
              <circle cx="50" cy="50" r="16" strokeWidth="2.5" stroke="#eab308" />
              {/* Corners */}
              <path d="M5,5 Q25,25 25,5" strokeWidth="1.5" stroke="#1d4ed8" />
              <path d="M95,5 Q75,25 75,5" strokeWidth="1.5" stroke="#1d4ed8" />
              <path d="M5,95 Q25,75 25,95" strokeWidth="1.5" stroke="#1d4ed8" />
              <path d="M95,95 Q75,75 75,95" strokeWidth="1.5" stroke="#1d4ed8" />
              {/* Center point */}
              <circle cx="50" cy="50" r="3" fill="#eab308" />
            </svg>
            <div className="absolute bottom-1 right-2 font-mono text-[8px] text-zinc-400 opacity-30">{tile.size}</div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-zinc-350 select-none text-zinc-650">
            {tile.name}
          </div>
        );
    }
  };

  const getOverlayScene = () => {
    if (settings.viewMode === 'wall') {
      return (
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full font-mono font-semibold">Bathroom Scene Mockup</span>
              <h4 className="text-sm font-semibold font-sans">Aura Fluted Basin & Brushed Brass Faucet</h4>
              <p className="text-xs text-stone-300">Superimposed sanitary ware on active tiled wall</p>
            </div>
            {/* Floating physical model visual */}
            <div className="flex items-center space-x-2 bg-stone-900/80 p-2.5 rounded-lg border border-stone-700/60 shadow-lg pointer-events-auto">
              <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80" 
                alt="Aura Basin" 
                className="w-10 h-10 object-cover rounded border border-stone-800"
                referrerPolicy="no-referrer"
              />
              <div className="text-left font-sans">
                <div className="text-[10px] font-bold text-zinc-100">Aura Basin (Pastel)</div>
                <div className="text-[9px] text-zinc-400 font-mono">$185.00 • In Stock</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-sky-400 bg-sky-900/60 px-2 py-0.5 rounded-full font-mono font-semibold">Interior Flooring View</span>
              <h4 className="text-sm font-semibold font-sans">Living Room / Lobby Lounge Setup</h4>
              <p className="text-xs text-stone-300">Rendered flooring layout perspective</p>
            </div>
            {/* Elegant Chair Accent */}
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-700/60 shadow-lg flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-700 border-2 border-stone-800 flex items-center justify-center text-[10px] font-bold text-white">OAK</div>
              <div className="text-left text-[9px]">
                <div className="font-bold">Honey Accents</div>
                <div className="text-zinc-400">Warm wood contrasts</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Generate matrix grid of items for tiling
  const renderTileGrid = () => {
    if (!activeTile) return null;

    const rowsCount = settings.viewMode === 'wall' ? 6 : 8;
    const colsCount = settings.viewMode === 'wall' ? 8 : 10;
    
    // Grid alignment style utilizing borders & colors
    const tileStyle = {
      marginRight: `${activeTile.id === 'p3' ? settings.groutWidth * 0.75 : settings.groutWidth}px`,
      marginBottom: `${settings.groutWidth}px`,
      width: activeTile.id === 'p3' ? '80px' : activeTile.id === 'p5' ? '140px' : '90px',
      height: activeTile.id === 'p3' ? '30px' : activeTile.id === 'p5' ? '30px' : '90px',
    };

    return (
      <div 
        id="tiling-canvas-container"
        className="w-full h-full overflow-hidden flex flex-wrap justify-center items-center content-center relative"
        style={{ backgroundColor: settings.groutColor }}
      >
        <div 
          className="flex flex-col relative"
          style={{ 
            transform: `rotate(${settings.tileAngle}deg) scale(1.1)`,
            transition: 'transform 0.4s ease'
          }}
        >
          {Array.from({ length: rowsCount }).map((_, rIdx) => {
            // Apply offset for brick/running-bond offset pattern on alternating rows
            const needOffset = settings.layoutPattern === 'running-bond' && rIdx % 2 !== 0;
            const offsetStyle = needOffset 
              ? { transform: `translateX(-${activeTile.id === 'p5' ? 70 : 45}px)` }
              : {};

            return (
              <div 
                key={rIdx} 
                className="flex flex-row whitespace-nowrap"
                style={offsetStyle}
              >
                {Array.from({ length: colsCount }).map((_, cIdx) => (
                  <div 
                    key={cIdx} 
                    style={tileStyle} 
                    className="flex-shrink-0 relative group"
                  >
                    {getTileTexture(activeTile)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {getOverlayScene()}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="tile-visualizer-main">
      {/* Control panel left */}
      <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-zinc-900 font-sans font-semibold mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100" />
            <h3 className="text-lg">Tiling Studio</h3>
          </div>
          <p className="text-xs text-stone-500">
            Instantly render any tile in our digital room catalog with real-time customizable grout setups.
          </p>
        </div>

        {/* Tile selector dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-550 block">1. Selected Premium Tile</label>
          <div className="grid grid-cols-2 gap-2">
            {tileProducts.map(tile => {
              const matches = activeTile?.id === tile.id;
              return (
                <button
                  key={tile.id}
                  id={`btn-select-tile-${tile.id}`}
                  onClick={() => onSelectProduct?.(tile)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all outline-none ${
                    matches
                      ? 'border-amber-600 bg-amber-50/20 ring-1 ring-amber-600'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <div className="overflow-hidden rounded-md h-12 w-full mb-1.5 bg-neutral-100 border border-stone-200 relative">
                    <img 
                      src={tile.image} 
                      alt={tile.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 right-1 px-1 bg-stone-900/70 text-[7px] text-white rounded font-mono font-bold">
                      {tile.finish}
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[11px] font-bold text-stone-900 line-clamp-1 leading-tight">{tile.name}</div>
                    <div className="text-[9px] text-stone-500 font-mono mt-0.5">₹{tile.price.toLocaleString('en-IN')}/sqft</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-550 block">2. Perspective Scene</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="viewmode-wall"
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'wall' }))}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                settings.viewMode === 'wall'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bathroom Wall</span>
            </button>
            <button
              id="viewmode-floor"
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'floor' }))}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                settings.viewMode === 'floor'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Maximize className="w-4 h-4 rotate-45" />
              <span>Room Flooring</span>
            </button>
          </div>
        </div>

        {/* Pattern style selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-550 block">3. Layout Arrangement</label>
          <div className="space-y-1.5">
            {patterns.map(p => {
              const matched = settings.layoutPattern === p.id;
              return (
                <button
                  key={p.id}
                  id={`layoutpattern-${p.id}`}
                  onClick={() => handlePatternChange(p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    matched
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${matched ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-950">{p.name}</div>
                      <div className="text-[10px] text-stone-550 mt-0.5">{p.desc}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${matched ? 'border-amber-600 bg-amber-600' : 'border-stone-300'}`}>
                    {matched && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grout selections */}
        <div className="space-y-3.5 pt-3 border-t border-stone-200/80">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider text-stone-550">4. Grout Joint Width</label>
              <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">{settings.groutWidth} mm</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 2, 5, 8].map(w => (
                <button
                  key={w}
                  id={`groutwidth-${w}mm`}
                  onClick={() => setSettings(prev => ({ ...prev, groutWidth: w }))}
                  className={`p-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                    settings.groutWidth === w
                      ? 'border-stone-950 bg-stone-950 text-white font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {w === 0 ? 'None' : `${w}mm`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-550">
              <Paintbrush className="w-3.5 h-3.5" />
              <span>5. Grout Color Mix</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groutColorOptions.map(c => {
                const isSelected = settings.groutColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    id={`groutcolor-${c.name.split(' ')[0]}`}
                    title={c.name}
                    onClick={() => setSettings(prev => ({ ...prev, groutColor: c.hex }))}
                    className={`h-7 px-2.5 rounded-full border text-[10px] font-medium flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'border-stone-900 shadow-sm font-bold ring-2 ring-stone-900/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 flex-shrink-0" 
                      style={{ backgroundColor: c.hex }} 
                    />
                    <span className="text-stone-700">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suggestion alert */}
        {activeTile?.groutSuggestion && (
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 flex space-x-2.5 items-start">
            <Sliders className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-stone-650 leading-relaxed">
              <span className="font-bold text-stone-850">Expert Suggestion:</span> Best laid with{' '}
              <span className="underline font-medium text-stone-950">{activeTile.groutSuggestion}</span> to achieve seamless continuity, blending flawlessly with the {activeTile.finish.toLowerCase()} finish.
            </div>
          </div>
        )}
      </div>

      {/* Render Frame right */}
      <div className="lg:col-span-8 flex flex-col bg-zinc-900 rounded-2xl overflow-hidden shadow-md aspect-[4/3] relative min-h-[400px]">
        {/* Top bar controls */}
        <div className="bg-stone-900/90 backdrop-blur border-b border-stone-800 px-4 py-2.5 flex items-center justify-between text-stone-300 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider font-mono text-[10px] text-stone-100">Live Preview Floor & Wall Engine</span>
          </div>
          {activeTile && (
            <div className="font-semibold text-white truncate max-w-[240px]">
              {activeTile.name}
            </div>
          )}
          <div className="flex items-center space-x-1">
            <button
              id="rotate-tile-ccw"
              onClick={() => setSettings(prev => ({ ...prev, tileAngle: (prev.tileAngle - 45) % 360 }))}
              title="Rotate 45° CCW"
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 font-mono text-[10px] hover:text-white"
            >
              ↶ 45°
            </button>
            <button
              id="rotate-tile-cw"
              onClick={() => setSettings(prev => ({ ...prev, tileAngle: (prev.tileAngle + 45) % 360 }))}
              title="Rotate 45° CW"
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 font-mono text-[10px] hover:text-white"
            >
              45° ↷
            </button>
          </div>
        </div>

        {/* Main Render Grid */}
        <div className="flex-1 relative bg-stone-950">
          {renderTileGrid()}
        </div>
      </div>
    </div>
  );
}
