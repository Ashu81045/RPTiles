import { useState, FormEvent } from 'react';
import { 
  FileText, Coins, Cpu, Clock, CheckCircle, ArrowRight, Printer, 
  Smartphone, HelpCircle, Save, Check, RefreshCw, Sparkles, Shield,
  Layers, Download, Plus, Minus, Receipt, BookOpen, PenTool, Smile
} from 'lucide-react';

interface ProposalItem {
  id: string;
  category: string;
  description: string;
  billingCycle: string;
  amount: number;
}

interface AddOnComponent {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
}

export default function CommercialProposal({ language }: { language: 'en' | 'hi' | 'hinglish' }) {
  // Baseline proposal setup dynamically targeting 120,000 Net Payable after $5,000 waiver
  const [items, setItems] = useState<ProposalItem[]>([
    {
      id: 'item-1',
      category: 'Core System Setup & Database',
      description: 'Main instance cloud activation, secure database schemas provisioning for tiles, automatic stock-alert thresholds, and digital brand asset mappings.',
      billingCycle: 'One-time Setup',
      amount: 40000
    },
    {
      id: 'item-2',
      category: 'PhonePe-Style Mobile Scan Assist',
      description: 'Bespoke client-side camera scanning processing. Bypasses standard hardware barcode laser guns by letting any showroom operator scan crate SKUs straight from a tablet or smartphone.',
      billingCycle: 'One-time Module',
      amount: 30000
    },
    {
      id: 'item-3',
      category: 'Grout & Waste Calculator Companion',
      description: 'Mathematical system companion. Automatically computes grout bags required based on tile dimensions plus an adjustable 5-10% layout waste tolerance.',
      billingCycle: 'One-time Custom Module',
      amount: 25000
    },
    {
      id: 'item-4',
      category: '3D Tiling Studio Layout Simulator',
      description: 'Interactive room pattern layout web engine (grid, herringbone, staggered joints) with custom grout shade hex mixers and realtime perspective preview limits.',
      billingCycle: 'One-time Design Module',
      amount: 15000
    },
    {
      id: 'item-5',
      category: 'Cloud Support SLA & Backups (AMC)',
      description: 'Includes secure off-site client database archives, priority performance optimization audits, and responsive cashier support SLAs (1-hour critical uptime window).',
      billingCycle: 'Annual Contract (Year 1 Incl.)',
      amount: 15000
    }
  ]);

  // Optional additive enterprise expansion units
  const [addOns, setAddOns] = useState<AddOnComponent[]>([
    {
      id: 'addon-whatsapp',
      name: '💬 WhatsApp & SMS Auto-Invoice Dispatcher',
      description: 'Sends instant PDF khata copies and billing receipt links directly to client smartphones upon cashier checkouts.',
      amount: 12000,
      category: 'Integration Suite'
    },
    {
      id: 'addon-warehouse-sync',
      name: '🏬 Multi-Showroom Warehouse Sync',
      description: 'Unifies stocks across disconnected geographic warehouses with instant transfer routing forms.',
      amount: 18000,
      category: 'Enterprise Scale'
    },
    {
      id: 'addon-offline-mode',
      name: '💾 Smart Client-Side Offline Backup Storage',
      description: 'Guarantees uninterrupted checkouts even during internet blackout periods using IndexedDB web containers.',
      amount: 8000,
      category: 'Security Hub'
    }
  ]);

  // Track checked expansions
  const [activeAddOns, setActiveAddOns] = useState<string[]>([]);
  
  // Custom discount waiver fields
  const [discountAmount, setDiscountAmount] = useState<number>(5000);
  
  // Client sign-off signature blocks
  const [clientSignature, setClientSignature] = useState<string>('');
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'type'>('type');
  const [typedName, setTypedName] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);

  // Hardware toggle estimates
  const [includePrinter, setIncludePrinter] = useState<boolean>(false);
  const [includeTablet, setIncludeTablet] = useState<boolean>(false);

  // Custom added items state to give clients options
  const [newCat, setNewCat] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmt, setNewAmt] = useState<number>(0);

  // Reset to initial baseline of exactly 120,000 INR
  const handleResetBaseline = () => {
    setItems([
      {
        id: 'item-1',
        category: 'Core System Setup & Database',
        description: 'Main instance cloud activation, secure database schemas provisioning for tiles, automatic stock-alert thresholds, and digital brand asset mappings.',
        billingCycle: 'One-time Setup',
        amount: 40000
      },
      {
        id: 'item-2',
        category: 'PhonePe-Style Mobile Scan Assist',
        description: 'Bespoke client-side camera scanning processing. Bypasses standard hardware barcode laser guns by letting any showroom operator scan crate SKUs straight from a tablet or smartphone.',
        billingCycle: 'One-time Module',
        amount: 30000
      },
      {
        id: 'item-3',
        category: 'Grout & Waste Calculator Companion',
        description: 'Mathematical system companion. Automatically computes grout bags required based on tile dimensions plus an adjustable 5-10% layout waste tolerance.',
        billingCycle: 'One-time Custom Module',
        amount: 25000
      },
      {
        id: 'item-4',
        category: '3D Tiling Studio Layout Simulator',
        description: 'Interactive room pattern layout web engine (grid, herringbone, staggered joints) with custom grout shade hex mixers and realtime perspective preview limits.',
        billingCycle: 'One-time Design Module',
        amount: 15000
      },
      {
        id: 'item-5',
        category: 'Cloud Support SLA & Backups (AMC)',
        description: 'Includes secure off-site client database archives, priority performance optimization audits, and responsive cashier support SLAs (1-hour critical uptime window).',
        billingCycle: 'Annual Contract (Year 1 Incl.)',
        amount: 15000
      }
    ]);
    setActiveAddOns([]);
    setDiscountAmount(5000);
    setIncludePrinter(false);
    setIncludeTablet(false);
  };

  // Add Item to the proposal live
  const handleAddNewItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newCat || !newDesc || newAmt <= 0) return;
    const newItem: ProposalItem = {
      id: 'item-custom-' + Date.now(),
      category: newCat,
      description: newDesc,
      billingCycle: 'One-time Component',
      amount: newAmt
    };
    setItems([...items, newItem]);
    setNewCat('');
    setNewDesc('');
    setNewAmt(0);
  };

  // Delete line item
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  // Update specific price cell directly
  const handleUpdatePrice = (id: string, newAmt: number) => {
    setItems(items.map(it => it.id === id ? { ...it, amount: Math.max(0, newAmt) } : it));
  };

  // Dynamic calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const selectedAddOnsTotal = addOns
    .filter(a => activeAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.amount, 0);
  
  const totalSoftwareCost = subtotal + selectedAddOnsTotal - discountAmount;
  
  const hardwareCost = (includePrinter ? 4500 : 0) + (includeTablet ? 15000 : 0);
  const netTotalBudget = totalSoftwareCost + hardwareCost;

  // Toggle addOn selection
  const toggleAddOn = (id: string) => {
    if (activeAddOns.includes(id)) {
      setActiveAddOns(activeAddOns.filter(x => x !== id));
    } else {
      setActiveAddOns([...activeAddOns, id]);
    }
  };

  // Structured tech stacks list with details on implementation tools
  const implementationTools = [
    {
      name: 'React 18 & Vite',
      role: 'Client-side Engine',
      description: 'Enables hot responsive tab switching, and instant catalog queries with near-zero latency.'
    },
    {
      name: 'Tailwind CSS',
      role: 'Modular Design Sheets',
      description: 'Ultra-light utility styling architecture. Builds stunning, tailored displays without bulky external CSS files.'
    },
    {
      name: 'HTML5 Camera QR Stream API',
      role: 'Mobile Scanning Controller',
      description: 'Accesses integrated device camera sensors directly. Saves ₹10,000+ by bypassing heavy laser gun handwear hardware.'
    },
    {
      name: 'LocalStorage Cache Engine',
      role: 'Offline Recovery Container',
      description: 'Maintains cash checkouts, billing receipts, and ledger files persistently inside the operator browser memory.'
    },
    {
      name: 'Lucide Vectors & Recharts Grid',
      role: 'Aesthetic Analytics Systems',
      description: 'Visualizes high-contrast dashboard insights, payment trends, and stock-warning alerts instantly.'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn" id="commercial-proposal-viewport">
      
      {/* 🧾 Document Admin Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-[#8A6F4E] to-stone-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md px-8 print:hidden" id="proposal-interactive-alert-bar">
        <div>
          <span className="text-[10px] uppercase font-mono bg-white/20 px-3 py-1 rounded-full text-amber-200 font-extrabold tracking-wider">
            Enterprise Sales Pitch tool
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight mt-2 flex items-center gap-2">
            <span>📑 Commercial Proposal & RFP Builder</span>
            <span className="text-xs font-mono font-medium opacity-80">(Target: ₹1,20,000)</span>
          </h2>
          <p className="text-white/80 text-xs mt-1.5 max-w-2xl font-medium leading-relaxed">
            Manage your customer sales pitching pipeline. Below is the proposed, fully editable ERP quotation. Tweak baseline prices, append components, configure recommending hardware, and sign the agreement to seal the contract!
          </p>
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          <button
            onClick={handleResetBaseline}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Reset pricing cells to standard baseline matching ₹120,000 perfect quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset 120K Base</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white text-stone-950 hover:bg-stone-100 rounded-xl text-xs font-black shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Print RFP / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Formal Proposal Structure) | Right Column (Interactive Modifiers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Formal Proposal Content Sheet (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden print:border-0 print:shadow-none" id="quotation-formal-sheet">
          {/* Top Elegant Stationery Letterhead */}
          <div className="bg-stone-950 p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-amber-500" id="proposal-stationery-header">
            {/* Visual background accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl" />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-amber-500 rotate-12 flex items-center justify-center rounded-lg shadow font-serif text-xs font-black text-stone-950">
                  RP
                </div>
                <span className="font-serif font-black tracking-widest text-[#f59e0b] uppercase text-sm">ERP INTEGRATION PARTNERS</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-100 tracking-tight">COMMERCIAL PROPOSAL & QUOTATION</h3>
              <p className="text-[11px] font-mono text-stone-400">Custom Cloud Solutions for High-Volume Tile Merchants</p>
            </div>

            <div className="text-left md:text-right font-mono text-[11px] text-stone-300 mt-4 md:mt-0 space-y-1">
              <div><strong className="text-white">Date:</strong> June 20, 2026</div>
              <div><strong className="text-white">Document Ref:</strong> ERP/CERAMICA-POS/2026/04</div>
              <div><strong className="text-white">Status:</strong> Draft Contract</div>
              <div><strong className="text-white">Currency:</strong> INR (₹)</div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 text-stone-850" id="proposal-letterpoint-body">
            
            {/* Project description card */}
            <section className="space-y-2.5">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                1. Executive Summary & Intent
              </h4>
              <p className="text-xs text-stone-650 leading-relaxed font-sans">
                This proposal outlines the implementation of a tailored <strong className="text-stone-950 font-bold">Ceramica POS & Showroom Management System</strong> designed to digitize inventory tracking, accelerate active checkout billing, simplify customer outstanding ledgers (Udhaar/Jama books), and provide real-time sales insight reporting.
              </p>
              <p className="text-xs text-stone-650 leading-relaxed font-sans">
                Unlike generic commercial registers, this solution is custom-tuned specifically for vitrified tile and luxury marble wholesalers. It features advanced wastage tolerance calculation engines, digital visual mockup modules, and a smartphone camera-link gateway to scan showroom items instantly without the expense of dedicated industrial scanning guns.
              </p>
            </section>

            {/* Scope Deliverables listing */}
            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                2. Project Scope & Deliverable Pillars
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase font-mono py-0.5 px-2 bg-rose-100 text-rose-800 rounded">Interactive Counter POS</span>
                  <p className="text-[11.5px] font-bold text-stone-900">Active High-Speed Checkout Billing</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Fast client-side cart compiling with inline tax distribution, automatic SGST/CGST invoice printing, and smart discounts.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase font-mono py-0.5 px-2 bg-amber-100 text-amber-800 rounded">Assist Hardware</span>
                  <p className="text-[11.5px] font-bold text-stone-900">PhonePe-Style Mobile Scan Assist</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Taps straight into the camera feed of any mobile, bypassing laser scanning guns while accelerating countertop checkout flows.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase font-mono py-0.5 px-2 bg-emerald-100 text-emerald-800 rounded">Accounts Ledger</span>
                  <p className="text-[11.5px] font-bold text-stone-900">Showroom Client Ledger Books (Baqaya)</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Consolidates customer histories, displaying live outstanding liabilities (Udhaar) and secure advance collections (Jama).
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase font-mono py-0.5 px-2 bg-sky-100 text-sky-800 rounded">Tile Companion</span>
                  <p className="text-[11.5px] font-bold text-stone-900">Interactive Visual Layout Studio</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Interactive canvas showcasing pattern alignments (Running bond, grid offsets) with grout shades and spacing helpers.
                  </p>
                </div>
              </div>
            </section>

            {/* Custom Tools Section */}
            <section className="space-y-3.5">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                3. High-Performance Implementation Stack & Tools
              </h4>
              <p className="text-xs text-stone-605">
                The showroom billing and core database application uses these modern software frameworks to ensure maximum offline resilience and instantaneous dashboard refresh times:
              </p>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                {implementationTools.map((tool, i) => (
                  <div key={i} className="p-3 bg-stone-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-stone-900 block">{tool.name}</span>
                      <p className="text-[10.5px] text-stone-500 leading-relaxed">{tool.description}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-stone-200 text-stone-650 rounded shrink-0 self-start sm:self-auto">
                      {tool.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Structured Price Schedule (INR) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  4. Budget & Price Schedule (INR)
                </h4>
                <span className="text-[10px] font-mono font-bold text-emerald-605 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  Active Price Audit ✓
                </span>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100/85 text-stone-800 font-bold border-b border-stone-200 font-sans">
                      <th className="p-3 text-[10px] uppercase font-mono">Category & Service Description</th>
                      <th className="p-3 text-[10px] uppercase font-mono text-center">Billing Cycle</th>
                      <th className="p-3 text-[10px] uppercase font-mono text-right w-28">Amount (₹)</th>
                      <th className="p-3 text-[10px] uppercase font-mono text-center w-12 print:hidden">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-sans">
                    {/* Items map */}
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5 space-y-1">
                          <div className="font-bold text-stone-950 flex items-center gap-1.5 text-[11.5px]">
                            <span>{item.category}</span>
                          </div>
                          <div className="text-[10.5px] text-stone-550 leading-relaxed font-normal">
                            {item.description}
                          </div>
                        </td>
                        <td className="p-3.5 text-center text-stone-550 font-medium">
                          {item.billingCycle}
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-stone-950 text-[11.5px]">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center print:hidden">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete this line item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Active Add-Ons (if any) */}
                    {addOns.filter(a => activeAddOns.includes(a.id)).map((addon) => (
                      <tr key={addon.id} className="bg-amber-50/20 text-stone-900 border-l-2 border-l-amber-500">
                        <td className="p-3.5 space-y-1">
                          <div className="font-extrabold text-amber-950 flex items-center gap-1.5 text-[11.5px]">
                            <span>{addon.name}</span>
                            <span className="text-[8.5px] bg-amber-200 text-amber-900 font-extrabold font-mono uppercase px-1.5 rounded">
                              Add-on Included
                            </span>
                          </div>
                          <div className="text-[10.5px] text-stone-550 font-normal leading-relaxed">
                            {addon.description}
                          </div>
                        </td>
                        <td className="p-3.5 text-center text-stone-550 font-medium">
                          One-time Module
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-amber-950 text-[11.5px]">
                          ₹{addon.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center print:hidden">
                          <button
                            onClick={() => toggleAddOn(addon.id)}
                            className="text-amber-700 hover:text-rose-600 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal row */}
                    <tr className="bg-stone-50/80 font-bold border-t-2 border-stone-200">
                      <td colSpan={2} className="p-3 text-[11px] uppercase tracking-wider text-stone-500 font-black text-right">
                        Subtotal Software Lifecycle
                      </td>
                      <td className="p-3 text-right font-mono font-black text-stone-900 text-xs">
                        ₹{(subtotal + selectedAddOnsTotal).toLocaleString('en-IN')}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>

                    {/* Professional Discount/Waiver Row */}
                    {discountAmount > 0 && (
                      <tr className="bg-emerald-50/40 text-emerald-900 italic">
                        <td colSpan={2} className="p-3 text-[11px] uppercase tracking-wider text-emerald-805 font-black text-right">
                          Showroom Promotional Partner Waiver (Discount)
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-700 text-xs text-emerald-805">
                          -₹{discountAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="print:hidden"></td>
                      </tr>
                    )}

                    {/* Total Software row */}
                    <tr className="bg-stone-950 text-white font-bold text-xs uppercase tracking-wider">
                      <td colSpan={2} className="p-3.5 text-right font-black">
                        NET PAYABLE DEVELOPMENT COST (Software License)
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-amber-400 text-sm">
                        ₹{totalSoftwareCost.toLocaleString('en-IN')}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>

                    {/* Hardware recommendations if toggled */}
                    {hardwareCost > 0 && (
                      <>
                        <tr className="bg-stone-50 border-t border-stone-300">
                          <td colSpan={2} className="p-3 text-[10px] text-stone-500 font-bold italic">
                            Included Hardware Recommendations Cost:
                            {includePrinter && <span className="block mt-1 font-mono text-stone-800">• 3-Inch Thermal Receipt Slip Printer x1 (₹4,500)</span>}
                            {includeTablet && <span className="block mt-1 font-mono text-stone-800">• Showroom Operator Tablet (Android, 10-inch) x1 (₹15,000)</span>}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-stone-700">
                            ₹{hardwareCost.toLocaleString('en-IN')}
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                        <tr className="bg-amber-500 text-stone-950 font-black uppercase text-xs">
                          <td colSpan={2} className="p-3.5 text-right tracking-wide">
                            Combined Project Capex (Software + Recommended Hardware)
                          </td>
                          <td className="p-3.5 text-right font-mono font-black text-[13.5px]">
                            ₹{netTotalBudget.toLocaleString('en-IN')}
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Hardware Recommendations Section */}
            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                5. Recommended Hardware Configuration (Zero Setup Constraint)
              </h4>
              <p className="text-xs text-stone-650 leading-relaxed">
                The custom billing platform compiles directly on native Google Chrome browsers, removing any mandate to pay upfront for heavy corporate registers. However, to operate high-intensity customer checkouts, we advise these optional accessories:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5Packed">
                <div className="border border-stone-150 p-3.5 rounded-xl bg-stone-50/50 flex gap-3">
                  <Printer className="w-7 h-7 text-stone-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11.5px] font-bold text-stone-900">Digital Thermal Slip Printer</span>
                    <p className="text-[10px] text-stone-500 font-mono">Cost: ~₹3,500 – ₹5,000</p>
                    <p className="text-[10.5px] text-stone-500 leading-relaxed">Required for printing 2-inch or 3-inch high-speed receipt tickets for counter checkouts.</p>
                  </div>
                </div>

                <div className="border border-stone-150 p-3.5 rounded-xl bg-stone-50/50 flex gap-3">
                  <Smartphone className="w-7 h-7 text-stone-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11.5px] font-bold text-stone-900">Showroom Operator Tablet</span>
                    <p className="text-[10px] text-stone-500 font-mono">Cost: ~₹12,000 – ₹18,000</p>
                    <p className="text-[10.5px] text-stone-500 leading-relaxed">Enables roaming staff to walk along displays, scanning tile crates with customer side-carts.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Standard terms of payment */}
            <section className="space-y-3.5">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                6. Timeline & Standard Commercial Terms
              </h4>
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-stone-200 pb-2 sm:pb-0 sm:pr-2.5">
                    <span className="font-mono text-[9px] text-[#8a6f4e] font-bold uppercase block">Stage 1 (40% Advance)</span>
                    <span className="text-[11px] font-bold text-stone-900">Deposit Reserve</span>
                    <p className="text-[10.5px] text-stone-500">₹{(totalSoftwareCost * 0.4).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-stone-200 pb-2 sm:pb-0 sm:pr-2.5">
                    <span className="font-mono text-[9px] text-[#8a6f4e] font-bold uppercase block">Stage 2 (40% Milestone)</span>
                    <span className="text-[11px] font-bold text-stone-900">Pilot Delivery & Scanner</span>
                    <p className="text-[10.5px] text-stone-500">₹{(totalSoftwareCost * 0.4).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] text-[#8a6f4e] font-bold uppercase block">Stage 3 (20% Go-Live)</span>
                    <span className="text-[11px] font-bold text-stone-900">Staff Training & Wrap</span>
                    <p className="text-[10.5px] text-stone-500">₹{(totalSoftwareCost * 0.2).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="border-t border-stone-200 pt-2.5 space-y-1.5 text-stone-550 text-[11px]">
                  <p><strong>Uptime Commitment:</strong> Normal priority support tickets addressed within 4 business hours; critical cashier counter blockages responded layout priority 1 within 1 hour.</p>
                  <p><strong>Development Period:</strong> Agile 3-week lifecycle rollout from deposit confirmation to counter staff hand-off instructions.</p>
                </div>
              </div>
            </section>

            {/* Signed & Approved Section */}
            <section className="pt-6 border-t border-stone-200 text-xs relative" id="executive-sign-off-pane">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest font-mono mb-4">
                7. Executive Endorsements & Digital Sign-off
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Developer Stamp */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/60 flex flex-col justify-between h-40">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8a6f4e] font-bold uppercase block">DEVELOPMENT PARTNER STAMP</span>
                    <span className="text-xs font-extrabold text-stone-950 font-sans">RP Material Engineers & Co.</span>
                    <p className="text-[10.5px] text-stone-500">Cloud Services Architect Division</p>
                  </div>

                  <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
                    <div>
                      <span className="font-serif italic font-bold text-amber-700 text-sm">Asim Bakhtiyar</span>
                      <p className="text-[9px] text-[#8a6f4e] font-mono font-bold">AUTHORED DIRECT LICENSE ✓</p>
                    </div>
                    <div className="w-10 h-10 border border-amber-300 rounded-lg flex items-center justify-center bg-amber-50 shadow-3xs font-serif text-sm text-amber-600 font-extrabold rotate-3 animate-pulse">
                      SEAL
                    </div>
                  </div>
                </div>

                {/* Client approval signature block */}
                <div className="border-2 border-stone-200 rounded-xl p-4 bg-white flex flex-col justify-between h-40 relative">
                  {isApproved && (
                    <div className="absolute inset-0 bg-stone-950/5 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center select-none pointer-events-none overflow-hidden">
                      <div className="border-4 border-dashed border-emerald-500 text-emerald-500 font-black uppercase text-center px-4 py-1.5 rounded-xl font-mono text-[14px] tracking-wider rotate-12 bg-white shadow-lg animate-scaleUp">
                        APPROVED & STAMPED ✓
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-stone-400 font-bold uppercase block">CLIENT SIGN-OFF & RESERVE AUTHORIZATION</span>
                    <span className="text-xs font-bold text-stone-850">Ceramica Showroom Owner / Proprietor</span>
                  </div>

                  {signatureMethod === 'type' ? (
                    <input
                      type="text"
                      placeholder="Type Executive Name to Sign (e.g. R. K. Gupta)"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      disabled={isApproved}
                      className="w-full px-2.5 h-8 text-[11px] border border-stone-220 bg-stone-50 rounded-lg focus:outline-none focus:border-amber-400 shrink-0 font-bold text-stone-900"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Draw Sign (Type name here for digital print approximation)"
                      value={clientSignature}
                      onChange={(e) => setClientSignature(e.target.value)}
                      disabled={isApproved}
                      className="w-full px-2.5 h-8 text-[11px] border border-stone-220 bg-stone-50 rounded-lg focus:outline-none focus:border-amber-400 shrink-0 font-serif italic text-sm text-stone-900"
                    />
                  )}

                  <div className="border-t border-stone-150 pt-2 flex items-center justify-between">
                    <div>
                      {typedName || clientSignature ? (
                        <span className="font-serif italic font-extrabold text-stone-900 text-md truncate max-w-[140px] block">
                          {signatureMethod === 'type' ? typedName : clientSignature}
                        </span>
                      ) : (
                        <span className="text-[9px] text-stone-400 italic">Signature Pending...</span>
                      )}
                      <p className="text-[9.5px] text-stone-400 font-mono">REPRESENTATIVE ACCEPTANCE</p>
                    </div>

                    <div className="flex gap-1.5 print:hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setSignatureMethod(signatureMethod === 'type' ? 'draw' : 'type')}
                        disabled={isApproved}
                        className="p-1 px-2 border border-stone-200 hover:border-stone-400 bg-stone-50 text-[9.5px] font-bold rounded-md text-stone-600 transition-all cursor-pointer"
                      >
                        Style
                      </button>
                      
                      {(typedName || clientSignature) && (
                        <button
                          type="button"
                          onClick={() => setIsApproved(!isApproved)}
                          className={`px-3 py-1 font-black text-[10px] uppercase rounded-md transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                            isApproved 
                              ? 'bg-rose-600 text-white hover:bg-rose-700' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-bounce'
                          }`}
                        >
                          {isApproved ? 'Revoke' : 'Accept ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Stack: Commercial Tweakers & Modifiers Dashboard (Span 4) */}
        <div className="lg:col-span-4 space-y-6 print:hidden" id="proposal-interactive-sidebar">
          
          {/* Dynamic Budget Tweak box */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-5 rounded-3xl border border-stone-800 text-white space-y-4 shadow-sm" id="pos-proposal-calculator-toolbox">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase tracking-widest block">Live Interactive Panel</span>
              <h4 className="text-sm font-bold font-sans text-stone-100 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                Real-Time Proposal Adjuster
              </h4>
              <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                Want to expand or fine-tune this quotation with your client? Edit existing cells, toggle add-ons, adjust custom discounts, and see the net figures recalculate on the fly!
              </p>
            </div>

            {/* Baseline cells live sliders/inputs */}
            <div className="space-y-3.5 pt-3 border-t border-stone-800">
              <span className="text-[9.5px] font-black uppercase text-amber-400 font-mono tracking-wider block">
                🛠️ Customize Baseline Modules
              </span>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="space-y-1 bg-stone-900/50 p-2.5 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-stone-200 truncate pr-2">{item.category}</span>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-stone-500 hover:text-rose-500 transition-colors text-[9px]"
                      >
                        Purge
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">Price (₹)</span>
                      <input
                        type="number"
                        value={item.amount}
                        step={1000}
                        onChange={(e) => handleUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                        className="flex-1 min-w-0 bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modular Add-ons toggle switches */}
            <div className="space-y-2.5 pt-3 border-t border-stone-800">
              <span className="text-[9.5px] font-black uppercase text-amber-400 font-mono tracking-wider block">
                🔌 Add Premium Showroom Modules
              </span>
              <div className="space-y-2 text-stone-350">
                {addOns.map((add) => {
                  const isChecked = activeAddOns.includes(add.id);
                  return (
                    <label
                      key={add.id}
                      className={`flex items-start gap-2.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-[10.5px] leading-relaxed ${
                        isChecked 
                          ? 'bg-amber-500/10 border-amber-500 text-stone-100 font-bold' 
                          : 'bg-stone-900/30 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddOn(add.id)}
                        className="mt-0.5 rounded border-stone-700 text-amber-500 focus:ring-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span>{add.name}</span>
                          <span className="font-mono text-amber-400 shrink-0 ml-1">₹{add.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[9.5px] text-stone-400 font-medium leading-relaxed">{add.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom adjustment for waivers/promotional credits */}
            <div className="pt-3 border-t border-stone-800 space-y-2.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-black uppercase text-amber-400 font-mono tracking-wider">
                  🎁 Partner Goodwill Waiver Discount
                </span>
                <span className="text-[9px] font-mono font-bold text-stone-400">Reduce to offset capex</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-mono">Amt (₹)</span>
                <input
                  type="number"
                  value={discountAmount}
                  step={500}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 min-w-0 bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Quick Item Injector (Form-based) Component */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 mt-6 shadow-3xs" id="custom-line-injector">
            <h5 className="text-[11px] font-black uppercase text-stone-800 tracking-wider font-sans mb-1">
              ➕ Add custom component to Quote
            </h5>
            <p className="text-[10px] text-stone-500 leading-relaxed mb-4">
              Need to add specialized tasks (e.g. customized multi-shop migration, local API webhook servers)? Enlist them dynamically below:
            </p>

            <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-black block">Component Name</label>
                <input
                  type="text"
                  placeholder="e.g. API Gateway Integration"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-900 bg-stone-50 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-black block">Description Details</label>
                <textarea
                  placeholder="e.g. Hooks directly into third party servers..."
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-900 bg-stone-50 text-[10.5px] font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-black block">Price Amount (₹)</label>
                  <input
                    type="number"
                    value={newAmt || ''}
                    placeholder="e.g. 15000"
                    onChange={(e) => setNewAmt(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg font-mono text-stone-900 bg-stone-50 font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="self-end h-8.5 bg-stone-950 hover:bg-stone-900 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Hardware Configurator Toggle Box */}
          <div className="bg-amber-500/5 p-5 rounded-3xl border-2 border-amber-500/20 text-stone-900 space-y-4 shadow-3xs" id="proposal-recommending-hardware">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono text-[#8a6f4e] font-extrabold uppercase tracking-widest block">Showroom Equipment Bundler</span>
              <h5 className="text-xs font-black uppercase tracking-wider text-stone-950 font-sans flex items-center gap-2">
                <Printer className="w-4 h-4 text-stone-800" />
                Interactive Hardware Upsell
              </h5>
              <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                Add standard client recommendation bundles to present a complete capex outline including thermal counter printouts and staff hardware.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-amber-550/10">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors select-none cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includePrinter}
                  onChange={(e) => setIncludePrinter(e.target.checked)}
                  className="rounded border-amber-300 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div className="flex-1 flex justify-between font-bold">
                  <span>🖨️ 3-Inch Thermal Receipt Printer</span>
                  <span className="font-mono text-stone-700">₹4,500</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors select-none cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeTablet}
                  onChange={(e) => setIncludeTablet(e.target.checked)}
                  className="rounded border-amber-300 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div className="flex-1 flex justify-between font-bold">
                  <span>📱 10-inch Operator Tablet</span>
                  <span className="font-mono text-stone-700">₹15,000</span>
                </div>
              </label>
            </div>
            
            <p className="text-[9px] text-[#8a6f4e] font-sans font-black uppercase tracking-wide">
              *Hardware sourced externally or supplied directly by partner.
            </p>
          </div>

          {/* Customer Pitch Tips Card */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-3xl space-y-3 shadow-3xs" id="proposal-expert-sales-insights">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-stone-950 font-sans flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              💡 Expert Closing Tips
            </h5>
            <ul className="space-y-2.5 text-[10.5px] text-stone-600 leading-relaxed font-sans">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 font-bold">Phone Is The Scanner:</strong> Emphasize that cashiers scan crate labels directly using their existing phones, saving them at least ₹8,000 to ₹10,000 in heavy gun hardware!
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 font-bold">Baqaya Control:</strong> Highlight outstanding khata credit alerts (Udhaar tracker) preventing revenue loss during busy morning counters.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 font-bold">Wastage Calculator:</strong> Talk about the companion grout shade suggestor and wastage cartons, guaranteeing flawless builder deliveries.
                </span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
