// Single source of truth for all UI colors.
// Import via: import { COLORS } from './design/colors.js';

export const COLORS = {
    // Primary palette
    amber:       '#FFC174',
    amberDim:    'rgba(255,193,116,0.5)',
    amberLine:   'rgba(255,193,116,0.2)',
    amberFaint:  'rgba(255,193,116,0.08)',
  
    // Surfaces
    bg:            '#080808',
    surface:       '#111111',
    surfaceHigh:   '#1e1e1e',
    surfaceHigher: '#262626',
  
    // Semantic
    green:  '#22c55e',
    red:    '#ef4444',
    cyan:   '#00d4ff',
    purple: '#a855f7',
    gold:   '#ffd700',
    orange: '#f97316',
  
    // Special
    zeroMessage: '#88ffaa',
  };
  
  // District color mapping — maps your CITY_MAP zone IDs to COLORS.
  // Keep in sync with CITY_MAP.js DISTRICTS.
  export const DISTRICT_COLORS = {
    Z1: COLORS.amber,
    Z2: COLORS.orange,
    Z3: COLORS.cyan,
    Z4: COLORS.purple,
    Z5: COLORS.red,
    Z6: COLORS.green,
    Z7: '#888899',
  };

