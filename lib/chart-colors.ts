// Chart color constants for consistent visualization across the application
// Matches asset classes, tiers, transaction types, and semantic meanings

export const CHART_COLORS = {
  // Client Tiers
  tiers: {
    tier_1: '#3b82f6',    // Blue - Premium tier (>5 Cr)
    tier_2: '#8b5cf6',    // Purple - Mid tier (2-5 Cr)
    tier_3: '#10b981',    // Green - Standard tier (<2 Cr)
    prospect: '#6b7280',  // Gray - Prospects
  },

  // Asset Classes
  assets: {
    equity: '#3b82f6',      // Blue
    debt: '#10b981',        // Green
    mutual_fund: '#8b5cf6', // Purple
    gold: '#f59e0b',        // Amber/Gold
    real_estate: '#f97316', // Orange
    cash: '#6b7280',        // Gray
    alternative: '#ec4899', // Pink
  },

  // Transaction Types
  transactions: {
    buy: '#3b82f6',         // Blue
    sell: '#ef4444',        // Red
    dividend: '#10b981',    // Green
    interest: '#10b981',    // Green
    deposit: '#3b82f6',     // Blue
    withdrawal: '#ef4444',  // Red
  },

  // Performance Indicators
  performance: {
    positive: '#10b981',    // Green
    negative: '#ef4444',    // Red
    neutral: '#6b7280',     // Gray
    benchmark: '#f59e0b',   // Amber
  },

  // Service Types
  services: {
    nrp_360: '#1e3a5f',     // Navy (brand color)
    nrp_light: '#d4a853',   // Gold (brand color)
  },

  // Risk Profiles
  risk: {
    conservative: '#10b981',      // Green
    moderate: '#3b82f6',          // Blue
    balanced: '#8b5cf6',          // Purple
    growth: '#f59e0b',            // Amber
    aggressive: '#f97316',        // Orange
    very_aggressive: '#ef4444',   // Red
  },

  // Meeting/Event Types
  events: {
    meeting: '#3b82f6',     // Blue
    call: '#8b5cf6',        // Purple
    deadline: '#ef4444',    // Red
    review: '#10b981',      // Green
  },

  // Priority Levels
  priority: {
    low: '#3b82f6',         // Blue
    medium: '#f59e0b',      // Amber
    high: '#f97316',        // Orange
    urgent: '#ef4444',      // Red
  },

  // Gradients (for area charts)
  gradients: {
    blue: 'url(#blueGradient)',
    green: 'url(#greenGradient)',
    purple: 'url(#purpleGradient)',
    gold: 'url(#goldGradient)',
    red: 'url(#redGradient)',
  },
};

// Grid/Axis colors
export const GRID_COLORS = {
  light: '#e5e5e5',
  dark: '#343434',
};

// Tooltip colors
export const TOOLTIP_COLORS = {
  background: {
    light: 'rgba(255, 255, 255, 0.95)',
    dark: 'rgba(23, 23, 23, 0.95)',
  },
  border: {
    light: '#dedede',
    dark: '#343434',
  },
};

// Legend colors
export const LEGEND_COLORS = {
  text: {
    light: '#474343',
    dark: '#a1a1a1',
  },
  inactive: {
    light: '#a1a1a1',
    dark: '#737373',
  },
};

// Get color by category and key
export function getChartColor(category: keyof typeof CHART_COLORS, key: string): string {
  const categoryColors = CHART_COLORS[category] as Record<string, string>;
  return categoryColors[key] || CHART_COLORS.performance.neutral;
}
