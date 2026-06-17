/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Tiles' | 'Bathware' | 'Sanitaryware' | 'Fittings';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  subcategory: string;
  price: number;
  unit: string; // 'sqft' (or 'sqm') for tiles, 'pcs' for bathware/sanitaryware
  size: string; // e.g. "60x60 cm", "120x240 cm", "170x75x60 cm"
  stock: number;
  minStock: number; // For low-stock alert threshold
  description: string;
  features: string[];
  color: string;
  finish: string; // e.g. "Polished", "Matt", "Glossy", "Satin", "Textured"
  material: string; // e.g. "Porcelain", "Ceramic", "Marble", "Stone Resin", "Vitried Tile", "Brushed Brass"
  image: string; // curated Unsplash URL
  groutSuggestion?: string; // e.g. "Light Gray (2mm)"
  boxCoverage?: number; // for tiles, how many sqft/sqm in one box
  sellUnitBasis?: 'sqft' | 'box' | 'pcs' | 'meter' | 'bags'; // selling model preference
  itemsPerBox?: number; // count of items packed inside each carton
  weightPerBox?: number; // gross weight estimate in KGs
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string;
  timestamp: string; // ISO string
}

export interface VisualizationSettings {
  groutColor: string; // Hex color or class name
  groutWidth: number; // in mm (0, 2, 5, 8)
  layoutPattern: 'grid' | 'running-bond' | 'herringbone'; // tiling patterns
  viewMode: 'wall' | 'floor'; // wall tile or floor tile view zoom
  tileAngle: number; // rotation in degrees
}
