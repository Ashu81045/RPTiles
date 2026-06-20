/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';
import { 
  Building, ShieldCheck, Compass, MapPin, Phone, Mail, 
  HelpCircle, ChevronRight, Layers, Sparkles, Star, ArrowRight,
  Gem, Eye, Truck, Heart, MessageSquare, ClipboardCheck, ArrowUpRight,
  X, CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  products: Product[];
  language: Language;
  onOpenVisualizer: (product: Product) => void;
  onNavigateToAdmin: (tab?: 'catalog' | 'visualizer' | 'inventory' | 'billing') => void;
}

export default function LandingPage({ products, language, onOpenVisualizer, onNavigateToAdmin }: LandingPageProps) {
  const [selectedInquiryTile, setSelectedInquiryTile] = useState<Product | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  
  // Showcase premium key tile variants on landing (pick first 4 or highly aesthetic ones)
  const premiumShowcase = products.slice(0, 4);

  // Simple Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [generalSubmitted, setGeneralSubmitted] = useState(false);

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    }, 3000);
  };

  const handleTileInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setSelectedInquiryTile(null);
    }, 3000);
  };

  return (
    <div className="bg-stone-50/40 text-stone-900 font-sans min-h-screen flex flex-col justify-between" id="landing-main">
      
      {/* Luxurious Hero Header Space */}
      <section className="bg-white border-b border-stone-200/60 pb-16 pt-12 relative overflow-hidden" id="landing-hero">
        {/* Abstract vector patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-150 rounded-full blur-3xl -mr-20 -mt-20 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column Text details */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-stone-700 tracking-wider uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Architectural Stone & Premium Porcelain Studio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-950 font-black tracking-tight leading-none">
              Sophisticated Tiling <br />
              <span className="text-amber-600 block sm:inline">Crafted for Posterity.</span>
            </h1>

            <p className="text-stone-600 text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to <strong>RP Tiles</strong>. We formulate extraordinary surfaces for modern residences, premium commercial showrooms, and elite landscape renovations. Instantly layout patterns online, evaluate real-time inventory levels, and compile pro-billing estimates.
            </p>

            {/* Micro Call to actions */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigateToAdmin('visualizer')}
                className="px-6 py-3.5 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Launch Interactive Tiling Studio</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById('premium-collection');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Browse Signature Gallery</span>
              </button>
            </div>

            {/* Trust factors */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-100 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-serif font-black text-stone-950">98%</span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Pristine Grout Fit</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-serif font-black text-stone-950">14K+</span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Sqft Ready Stock</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-serif font-black text-stone-950">24Hr</span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Site Truck Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Isometric Image Frame */}
          <div className="lg:col-span-5 relative flex justify-center" id="landing-hero-graphics">
            <div className="relative group max-w-md w-full">
              {/* Outer frame glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-[32px] blur-2xl group-hover:scale-105 transition-transform"></div>
              
              {/* Image Frame */}
              <div className="relative bg-white border-2 border-stone-200 shadow-xl rounded-[32px] overflow-hidden p-3.5">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85"
                  alt="RP Tiles Showroom Residence"
                  className="w-full h-80 object-cover rounded-[22px] shadow-inner"
                  referrerPolicy="no-referrer"
                />
                
                {/* Float Badge 1 */}
                <div className="absolute top-8 right-8 bg-white/95 backdrop-blur border border-stone-200 px-3 py-2 rounded-2xl shadow-lg flex items-center space-x-2 text-xs font-bold text-stone-900 animate-bounce">
                  <Gem className="w-4 h-4 text-amber-500" />
                  <span>Statuario Gold Series</span>
                </div>

                {/* Float Badge 2 */}
                <div className="absolute bottom-8 left-8 bg-stone-900/95 backdrop-blur px-3 py-2 rounded-2xl shadow-lg flex items-center space-x-2 text-[11px] font-mono text-stone-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Batch Lot Shade Verified</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full" id="landing-services">
        <div className="text-center space-y-3 mb-14">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 uppercase">OUR COMMERCIAL PROMISE</span>
          <h2 className="text-3xl font-serif font-bold text-stone-950 tracking-tight">Showroom Excellence & Corporate Services</h2>
          <p className="text-stone-500 text-xs max-w-lg mx-auto leading-relaxed">
            RP Tiles blends digital interactive simulators with meticulous logistical precision. We guarantee batch-shade match verification across heavy volume purchases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Expert Design Consultation",
              desc: "Our resident architects evaluate your layouts and blueprint dimensions to suggest ideal tile scales and grout suggestions.",
              icon: Compass,
              color: "text-amber-500 bg-amber-50"
            },
            {
              title: "3D Custom Tile Visualizer",
              desc: "Graft, spin and realign grout patterns instantly on our digital sandbox engine before loading onto your project purchase order.",
              icon: Layers,
              color: "text-emerald-500 bg-emerald-50"
            },
            {
              title: "Heavy-Duty Crane Dispatch",
              desc: "We operate dedicated truck convoys with custom protective framing to safe-keep thick slab materials from cracking during transit.",
              icon: Truck,
              color: "text-sky-500 bg-sky-50"
            },
            {
              title: "Contractor Batch Calibration",
              desc: "We test batch lots in our facility to verify tile thickness offsets stay below 0.2mm for flush alignment in zero-grout layouts.",
              icon: ShieldCheck,
              color: "text-stone-850 bg-stone-100"
            }
          ].map((srv, index) => {
            const IconComp = srv.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all space-y-4"
              >
                <div className={`w-10 h-10 ${srv.color} rounded-xl flex items-center justify-center`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">{srv.title}</h3>
                <p className="text-xs text-stone-550 leading-relaxed">{srv.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signature Collections and Interactive Simulation shortcuts */}
      <section className="bg-stone-100/70 border-t border-b border-stone-200/50 py-20 w-full" id="premium-collection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 uppercase">CURATED SELECTIONS</span>
              <h2 className="text-3xl font-serif font-black text-stone-950 tracking-tight">Active Showroom Showcase</h2>
              <p className="text-stone-500 text-xs max-w-md leading-relaxed">
                Explore a selected subset of active products on our floor inventory. Press **"Try in Tiling Studio"** to see how any of these tiles layout on a full wall or floor blueprint dynamically.
              </p>
            </div>
            
            <button
              onClick={() => onNavigateToAdmin('catalog')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-stone-900 border border-stone-300 rounded-xl bg-white hover:bg-stone-50"
            >
              <span>View Full Digital Showroom Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumShowcase.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Img area */}
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge Category overlay */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {prod.subcategory}
                    </span>

                    {/* Stock quick status */}
                    <span className={`absolute bottom-3 right-3 text-[10px] font-bold py-0.5 px-2 rounded-full shadow ${
                      prod.stock <= 0 
                        ? 'bg-red-500 text-white' 
                        : prod.stock <= prod.minStock 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-stone-900/80 text-white'
                    }`}>
                      {prod.stock <= 0 ? 'Warranted' : `${prod.stock} ${prod.unit} in Stock`}
                    </span>
                  </div>

                  {/* Card Info details */}
                  <div className="p-5 space-y-2">
                    <h4 className="text-xs font-black text-stone-950 truncate" title={prod.name}>
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed min-h-[32px]">
                      {prod.description}
                    </p>

                    <div className="text-xs font-mono text-stone-500 grid grid-cols-2 pt-2 border-t border-stone-100 gap-1">
                      <div>Finish: <span className="font-bold text-stone-800">{prod.finish}</span></div>
                      <div>Material: <span className="font-bold text-stone-800">{prod.material}</span></div>
                      <div>Size: <span className="font-bold text-stone-800">{prod.size}</span></div>
                      <div>Price: <span className="font-bold text-stone-950">₹{prod.price.toLocaleString('en-IN')}/{prod.unit}</span></div>
                    </div>
                  </div>
                </div>

                {/* Card Button triggers */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedInquiryTile(prod);
                      setInquirySubmitted(false);
                    }}
                    className="py-2 text-[10.5px] border border-stone-200 hover:border-stone-400 font-bold text-stone-700 rounded-xl hover:bg-stone-50 transition-all text-center cursor-pointer"
                  >
                    Quick Inquiry
                  </button>

                  <button
                    onClick={() => onOpenVisualizer(prod)}
                    className="py-2 text-[10.5px] bg-stone-950 hover:bg-stone-900 font-bold text-white rounded-xl transition-all text-center flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Try on Wall</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Double Column: Client Testimonials & Quick Inquiry Booking */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full" id="landing-social-and-contact">
        
        {/* Left Aspect: Social Trust and reviews */}
        <div className="lg:col-span-6 space-y-6" id="social-reviews">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 uppercase">TESTIMONIAL STORIES</span>
          <h2 className="text-3xl font-serif font-bold text-stone-950 tracking-tight leading-none">
            Architectural Alignment Verified by Pro Contractors
          </h2>
          <p className="text-stone-505 text-xs leading-relaxed max-w-md">
            Read comments from our recurring contractor teams, bespoke interior creators and luxury developers who trust RP Tiles for elite finishes.
          </p>

          <div className="space-y-4 pt-2">
            {[
              {
                text: "“RP Tiles has radically lowered our material layout disputes. Loading our chosen large-scale porcelain tiles directly on their 3D Interactive Tiling Studio allows our mason leads to view tile angles and grout widths beforehand. We ordered 1,400 sqft with zero batch mismatch.”",
                author: "Marcus Vance",
                role: "Senior Project Partner, Vance Architectural Partners",
                stars: 5
              },
              {
                text: "“The real-time billing desk is unmatched. We finalized an on-site client selection, double-checked active warehouse stock immediately on the catalog console, and processed an estimated printout receipt. The custom grout suggester makes our orders bulletproof.”",
                author: "Leah Chen",
                role: "Bespoke Residential Stylist",
                stars: 5
              }
            ].map((test, i) => (
              <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex gap-1">
                  {[...Array(test.stars)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-650 text-xs italic leading-relaxed">{test.text}</p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-900">{test.author}</span>
                  <span className="text-stone-400">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Aspect: Direct Inquiry Formulation Form */}
        <div className="lg:col-span-6 bg-stone-900 text-stone-100 rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl relative overflow-hidden flex flex-col justify-between" id="inquiry-form-card">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider font-mono font-bold">Showroom Booking Box</span>
            </div>
            
            <h3 className="text-xl font-serif text-white font-semibold">Reserve Showroom Consultation</h3>
            <p className="text-stone-400 text-xs leading-relaxed">
              Plan your layout appointment or custom heavy trucking estimate. Fill out our corporate reserve channel and our material engineers will reach back within three business hours.
            </p>

            {generalSubmitted ? (
              <div className="bg-stone-850 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2 mt-6">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Consultation Reserved Successfully</h4>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                  Your reference reservation has been logged. Our material supervisors will calibrate shadow batch sheets and ring you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGeneralSubmit} className="space-y-3.5 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Asim Bakhtiyar"
                      className="w-full bg-stone-800/80 border border-stone-700 focus:border-amber-500 px-3.5 py-2 rounded-xl text-xs focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 700-1492"
                      className="w-full bg-stone-800/80 border border-stone-700 focus:border-amber-500 px-3.5 py-2 rounded-xl text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Email Address (Architectural Bid Specs)</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. architect@luxuryportfolio.com"
                    className="w-full bg-stone-800/80 border border-stone-700 focus:border-amber-500 px-3.5 py-2 rounded-xl text-xs focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Detailed Message / Project Scale</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="e.g. Need 400 sqft of Calacatta Gold for hotel bathroom corridor project. Need thickness custom matched to 9.5mm."
                    className="w-full bg-stone-800/80 border border-stone-700 focus:border-amber-500 px-3.5 py-2 rounded-xl text-xs focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Book Showroom Consultation Desk
                </button>
              </form>
            )}
          </div>
        </div>

      </section>

      {/* Floating Segmented Tile Inquiry Modal Sheet */}
      {selectedInquiryTile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden">
            
            {/* Modal Head */}
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                SPECIFIC ITEM REQUISITION
              </span>
              <button onClick={() => setSelectedInquiryTile(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Info and Form */}
            <div className="p-5 space-y-4">
              <div className="flex gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <img 
                  src={selectedInquiryTile.image} 
                  alt="" 
                  className="w-12 h-12 object-cover rounded-lg border border-stone-200/70"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-stone-900 truncate">{selectedInquiryTile.name}</h4>
                  <p className="text-[10px] font-mono text-stone-450 mt-0.5">{selectedInquiryTile.sku} • ₹{selectedInquiryTile.price.toLocaleString('en-IN')}/{selectedInquiryTile.unit}</p>
                </div>
              </div>

              {inquirySubmitted ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h5 className="text-xs font-bold text-stone-900">Inquiry Bid Document Dispatched</h5>
                  <p className="text-[10.5px] text-stone-500 max-w-xs mx-auto">
                    We has successfully marked the specific batch code for {selectedInquiryTile.name}. One of our floor engineers will reach out to schedule site dimension checks.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTileInquirySubmit} className="space-y-3">
                  <p className="text-[10.5px] text-stone-500">
                    Submit custom dimensions or requested quantity for immediate price bids and slab lot reservations.
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-400">Your Contact Details</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Your Name / Organization" 
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-400">Qty Needed ({selectedInquiryTile.unit})</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        placeholder="e.g. 50" 
                        className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-400">Required By</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl mt-2 cursor-pointer"
                  >
                    Send Reservation Request
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Mini CTA footer block */}
      <footer className="bg-stone-950 text-stone-500 py-10 mt-16 border-t border-stone-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <span className="font-serif font-black text-stone-200 uppercase text-sm tracking-widest text-[#f59e0b]">RP TILES SHOWROOM</span>
            <p className="text-[10.5px] mt-1.5 font-medium text-stone-300">RP Tiles, NH-57, Bus Stand, Near Pawan Motors, Araria - 854311</p>
            <p className="text-[9.5px] mt-1 font-mono text-stone-500">Luxury Ceramics • Tiles • Bathware • Fittings</p>
          </div>
          <div>
            &copy; 2026 RP Tiles. All rights reserved. Managed under global specifications.
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="cursor-pointer hover:text-stone-300" onClick={() => onNavigateToAdmin()}>Admin Log In</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-stone-300" onClick={() => window.location.hash = 'admin'}>Access POS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
