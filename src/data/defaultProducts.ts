/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Calacatta Gold Polished Porcelain Tile',
    sku: 'TL-CAL-GC6012',
    category: 'Tiles',
    subcategory: 'Porcelain Tiles',
    price: 4.85,
    unit: 'sqft',
    size: '60x120 cm',
    stock: 1450,
    minStock: 300,
    description: 'Breathtaking luxurious Italian-inspired marble-look porcelain tile with dramatic golden and warm gray veining. Highly polished finish that amplifies light and brings timeless grandeur to any space.',
    features: [
      'Rectified edges for seamless micro-grout lines (under 2mm)',
      'Highly dense porcelain with water absorption <0.5%',
      'Stain-resistant and highly polished glazing layer',
      'Perfect for heavy residential and light commercial wall & flooring'
    ],
    color: 'White & Gold',
    finish: 'Polished',
    material: 'Porcelain',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Warm Gray / Off-White (1.5mm)',
    boxCoverage: 15.5 // sqft per box
  },
  {
    id: 'p2',
    name: 'Charcoal Slate Structured Stone Tile',
    sku: 'TL-SLT-CC3060',
    category: 'Tiles',
    subcategory: 'Natural Stone / Porcelain',
    price: 3.95,
    unit: 'sqft',
    size: '30x60 cm',
    stock: 2100,
    minStock: 400,
    description: 'Deep carbon anthracite gray tile with physical cleft texture mimicking natural slate slabs. Offers phenomenal slip resistance (R11) making it ideal for wet rooms, walk-in showers, patios, and modern spas.',
    features: [
      'R11 Slip resistance rating for utmost safety in wet areas',
      'Rich structural variations so no two tiles look identical',
      'Freeze-thaw resistant, fully suitable for indoor and outdoor environments',
      'Compatible with underfloor heating systems'
    ],
    color: 'Dark Gray',
    finish: 'Textured',
    material: 'Porcelain',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Anthracite / Charcoal (3mm)',
    boxCoverage: 11.6
  },
  {
    id: 'p3',
    name: 'Olive Green Glossy Subway Tile',
    sku: 'TL-SUB-OG0724',
    category: 'Tiles',
    subcategory: 'Ceramic Wall Tiles',
    price: 5.20,
    unit: 'sqft',
    size: '7.5x30 cm',
    stock: 820,
    minStock: 200,
    description: 'Organic olive green ceramic tile with a wavy, hand-crafted artisan edge and a glossy liquid-effect glaze that creates beautiful light reflections. Perfect for kitchen backsplashes or statement bathroom walls.',
    features: [
      'Wavy handmade aesthetic with rich color pooling layers',
      'Deep translucent gloss finish for ultimate water-beading sheen',
      'Highly customizable pattern layout: Herringbone, Vertical brick, Stack bond',
      'Suitable strictly for interior dry & wet wall surfaces'
    ],
    color: 'Olive Green',
    finish: 'Glossy',
    material: 'Ceramic',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Beige / Light Sand (2mm)',
    boxCoverage: 10.0
  },
  {
    id: 'p4',
    name: 'Terrazzo Grigio Matte Porcelain Tile',
    sku: 'TL-TRZ-GR6060',
    category: 'Tiles',
    subcategory: 'Porcelain Tiles',
    price: 4.10,
    unit: 'sqft',
    size: '60x60 cm',
    stock: 120, // Low stock warning!
    minStock: 250,
    description: 'Modern Italian-style terrazzo speckled porcelain tile featuring multi-toned flecks of cool gray, granite black, and marble-white chips. A favorite among modern minimalist architects and interior designers.',
    features: [
      'High glaze wear rating (PEI Class 4) for heavy traffic areas',
      'Silky matte finish with premium soft touch-feel',
      'Pre-sealed material requiring zero chemical sealing treatments',
      'Extremely easy to clean with basic pH-neutral cleaners'
    ],
    color: 'Speckled Cool Gray',
    finish: 'Matt',
    material: 'Porcelain',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Medium Gray (2mm)',
    boxCoverage: 15.5
  },
  {
    id: 'p5',
    name: 'Natural Oak Wood-Look Tile Planks',
    sku: 'TL-WOD-OK2012',
    category: 'Tiles',
    subcategory: 'Porcelain Timber Planks',
    price: 4.45,
    unit: 'sqft',
    size: '20x120 cm',
    stock: 1680,
    minStock: 350,
    description: 'Combines the breathtaking biological warmth of natural white hardwood timber with the absolute indestructibility of rectified vitrified porcelain. Imbued with 3D realistic woodgrain relief and knot textures.',
    features: [
      'HD digital printing with 24 distinct woodgrain patterns to avoid repetition',
      'Full-body rectified porcelain, practically impenetrable to water and spills',
      'Zero warping, zero splintering, completely scratch-resistant',
      'Staggered layout (1/3 overlap bond) recommended'
    ],
    color: 'Honey Oak',
    finish: 'Matt',
    material: 'Porcelain',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Oak Brown (2mm)',
    boxCoverage: 12.9
  },
  {
    id: 'p6',
    name: 'Moroccan Encaustic Floral Decor',
    sku: 'TL-ENC-MF2020',
    category: 'Tiles',
    subcategory: 'Patterned Decor Tiles',
    price: 6.50,
    unit: 'sqft',
    size: '20x20 cm',
    stock: 540,
    minStock: 150,
    description: 'A masterpiece tile recreating ancient hand-pressed cement tile artistry. Perfect coordinates of bold royal cobalt blue, dusty golden ochre, and warm chalky sand designs that join in mesmerizing geometric repetitions.',
    features: [
      'Encaustic look printed on premium vitrified ceramic core',
      'Smooth velvet matte touch finish with non-slip qualities',
      'Instantly creates a striking focal point for entryway floors or kitchen walls',
      'Can be installed on both high-moisture walls and floorings'
    ],
    color: 'Blue, Yellow & White',
    finish: 'Matt',
    material: 'Ceramic',
    image: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'White / Pearl Gray (2mm)',
    boxCoverage: 11.0
  },
  {
    id: 'p7',
    name: 'Royal Freestanding Matte Stone Tub',
    sku: 'BW-TUB-MS1775',
    category: 'Bathware',
    subcategory: 'Bathtubs',
    price: 1890.00,
    unit: 'pcs',
    size: '170x75x58 cm',
    stock: 12,
    minStock: 5,
    description: 'Constructed from premium composite solid-surface minerals, this oval slipper tub boasts seamless, thick insulated walls to maintain hot bathwater temperatures double as long as conventional acrylic tubs.',
    features: [
      'Homogeneous composite solid surface: non-porous and highly scratch-buffable',
      'Sleek, integrated linear overflow slit with concealed brass draining',
      'Exceptional thermal heat retention system built straight into stone structure',
      'Ergonomic lumbar slope angle meticulously calculated for dual-ended relaxation'
    ],
    color: 'Matte White',
    finish: 'Matt',
    material: 'Stone Resin',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  },
  {
    id: 'p8',
    name: 'Brushed Champagne Gold Rain Shower Column',
    sku: 'BW-SHW-CG920',
    category: 'Bathware',
    subcategory: 'Shower Systems',
    price: 495.00,
    unit: 'pcs',
    size: '120x45 cm',
    stock: 45,
    minStock: 10,
    description: 'Exquisite brushed PVD metal finish thermostatic shower set. Outfitted with an expansive 30cm overhead rain head, an adjustable hand-piece, and precision anti-scald technology safeguarding hot water thresholds.',
    features: [
      'State-of-the-art Vernet ceramic cartridge ensures lifetime drip-free seals',
      'High-grade brass distribution blocks with luxurious brushed PVD surface',
      'Smart anti-limestone silicone nozzles designed for immediate fingertip rubbing',
      'Thermostatic safety override locked at a comfortable 38°C (100°F)'
    ],
    color: 'Brushed Champagne Gold',
    finish: 'Satin',
    material: 'Brass & Stainless Steel',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  },
  {
    id: 'p9',
    name: 'Matte Charcoal Wall-Hung Toilet WC',
    sku: 'SW-TOL-MC5436',
    category: 'Sanitaryware',
    subcategory: 'Water Closets / Toilets',
    price: 620.00,
    unit: 'pcs',
    size: '54x36x35 cm',
    stock: 24,
    minStock: 8,
    description: 'Minimalist wall-mounted sleek D-shape toilet WC. Features a rimless hyper-tornado flush vortex for maximum hygiene with minimal water use, bound in a stunning matte velvet charcoal ceramic glaze.',
    features: [
      'Ultra-hygienic rimless design: wipes clean in one sweep and keeps bacteria away',
      'Whisper-quiet UF slim soft-closing heavy-duty seat with quick metal release',
      'Supreme nano-glazed matte ceramic repels persistent dirt deposits and water scales',
      'Dual flush eco-system (3L / 4.5L) saving significant utility and water bills'
    ],
    color: 'Matte Charcoal',
    finish: 'Matt',
    material: 'Vitreous China',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  },
  {
    id: 'p10',
    name: 'Nero Portoro Marble Pedestal Basin',
    sku: 'SW-BSN-NP9045',
    category: 'Sanitaryware',
    subcategory: 'Basins & Sinks',
    price: 740.00,
    unit: 'pcs',
    size: '45x45x85 cm',
    stock: 6, // Low stock warning!
    minStock: 8,
    description: 'Chiseled monolith pedestal basin carved from a solid single block of genuine Nero Portoro black marble, featuring heavy glittering golden lightning veins. A majestic architectural piece that commands attention.',
    features: [
      'Crafted from 100% natural, hand-selected luxury Italian black marble block',
      'High-gloss polished internal basin basin bowl contrasting rough split-face exterior',
      'Reinforced stone seal treatment pre-applied to shield against oils and stains',
      'Universal floor or wall-plummed waste outlet design'
    ],
    color: 'Black & Gold Marble',
    finish: 'Polished / Raw',
    material: 'Natural Marble',
    image: 'https://images.unsplash.com/photo-1620626011161-997c51447094?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  },
  {
    id: 'p11',
    name: 'Aura Countertop Fluted Ceramic Basin',
    sku: 'SW-BSN-AC4040',
    category: 'Sanitaryware',
    subcategory: 'Basins & Sinks',
    price: 185.00,
    unit: 'pcs',
    size: '40x40x12 cm',
    stock: 82,
    minStock: 15,
    description: 'Stunning drum-shaped countertop basin featuring elegant fluted exterior ridges. Wrapped in a matte pastel sage green glaze, it brings subtle organic texture and a highly contemporary architectural mood.',
    features: [
      'Ultra-thin lip detail (only 4mm thickness) exhibiting delicate, sharp lines',
      'Fluted geometric ribbed exterior for striking side-cast shadow highlights',
      'Heat-fired at 1280°C for immense structural toughness against hard impacts',
      'Scratch-resistant glaze layer resistant to acidic cosmetics'
    ],
    color: 'Sage Green',
    finish: 'Matt',
    material: 'Ceramic',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  },
  {
    id: 'p12',
    name: 'Brushed Brass Deck-Mounted Basin Mixer',
    sku: 'FT-TAP-BB220',
    category: 'Fittings',
    subcategory: 'Faucets / Taps',
    price: 165.00,
    unit: 'pcs',
    size: '22x18 cm',
    stock: 110,
    minStock: 20,
    description: 'Sleek, slim neck swan-concept deck basin mixer. Its state-of-the-art Neoperl aerator reduces splattering and ensures a bubbly, foam-cushion water flow coated in a stunning, finger-print resistant brass finish.',
    features: [
      'Premium physical vapor deposition (PVD) gold plating resists corrosion',
      'Neoperl Swiss aerator guarantees steady, splash-protected water conservation flow',
      'Precision single-lever thermal and volume mixer cartridge',
      'Includes high-grade flexible anti-twist water braids'
    ],
    color: 'Brushed Brass',
    finish: 'Satin',
    material: 'Solid Brass',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=600&q=80',
    groutSuggestion: 'Not Applicable'
  }
];
