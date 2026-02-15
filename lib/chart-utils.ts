// Chart utility functions for formatting, data transformation, and configuration

/**
 * Format currency value in Indian format (Lakhs/Crores)
 */
export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(decimals)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(decimals)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(decimals)}K`;
  } else {
    return `₹${value.toLocaleString('en-IN')}`;
  }
}

/**
 * Format large numbers with K/L/Cr suffix
 */
export function formatNumber(value: number, decimals = 1): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(decimals)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(decimals)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  } else {
    return value.toLocaleString('en-IN');
  }
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1, includeSign = false): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format date for chart axis
 */
export function formatChartDate(date: string | Date, format: 'short' | 'medium' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  switch (format) {
    case 'short':
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    case 'medium':
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    case 'long':
      return `${monthsFull[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    default:
      return d.toLocaleDateString('en-IN');
  }
}

/**
 * Generate mock monthly data for time-series charts
 */
export function generateMonthlyData(months: number, baseValue: number, variationPercent = 10): Array<{ month: string; value: number }> {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const variation = (Math.random() - 0.5) * 2 * (variationPercent / 100);
    const value = baseValue * (1 + variation * (months - i) / months);

    data.push({
      month: formatChartDate(date, 'short'),
      value: Math.round(value),
    });
  }

  return data;
}

/**
 * Calculate trend direction and percentage change
 */
export function calculateTrend(current: number, previous: number): { direction: 'up' | 'down' | 'neutral'; percentage: number } {
  if (previous === 0) {
    return { direction: 'neutral', percentage: 0 };
  }

  const change = ((current - previous) / previous) * 100;

  return {
    direction: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral',
    percentage: Math.abs(change),
  };
}

/**
 * Aggregate data by key
 */
export function aggregateByKey<T extends Record<string, any>>(
  data: T[],
  key: keyof T,
  valueKey: keyof T
): Array<{ name: string; value: number }> {
  const aggregated: Record<string, number> = {};

  data.forEach(item => {
    const groupKey = String(item[key]);
    aggregated[groupKey] = (aggregated[groupKey] || 0) + Number(item[valueKey]);
  });

  return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
}

/**
 * Group data by month
 */
export function groupByMonth<T extends { date: string; amount: number }>(
  data: T[]
): Array<{ month: string; amount: number; count: number }> {
  const grouped: Record<string, { amount: number; count: number }> = {};

  data.forEach(item => {
    const month = formatChartDate(item.date, 'short');

    if (!grouped[month]) {
      grouped[month] = { amount: 0, count: 0 };
    }

    grouped[month].amount += item.amount;
    grouped[month].count += 1;
  });

  return Object.entries(grouped).map(([month, { amount, count }]) => ({
    month,
    amount,
    count,
  }));
}

/**
 * Calculate percentage distribution
 */
export function calculatePercentages<T extends { value: number }>(
  data: T[]
): (T & { percentage: number })[] {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) return data.map(item => ({ ...item, percentage: 0 }));

  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

/**
 * Sort data by value
 */
export function sortByValue<T extends { value: number }>(
  data: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...data].sort((a, b) =>
    order === 'desc' ? b.value - a.value : a.value - b.value
  );
}

/**
 * Get responsive chart height based on viewport
 */
export function getResponsiveChartHeight(): number {
  if (typeof window === 'undefined') return 400;

  const width = window.innerWidth;

  if (width < 768) return 300;  // Mobile
  if (width < 1024) return 350; // Tablet
  return 400;                    // Desktop
}

/**
 * Custom tooltip formatter for Recharts
 */
export function customTooltipFormatter(value: number, name: string, type: 'currency' | 'number' | 'percentage' = 'number'): [string, string] {
  let formattedValue: string;

  switch (type) {
    case 'currency':
      formattedValue = formatCurrency(value);
      break;
    case 'percentage':
      formattedValue = formatPercentage(value);
      break;
    default:
      formattedValue = formatNumber(value);
  }

  return [formattedValue, name];
}

/**
 * Get gradient ID for area charts
 */
export function getGradientId(color: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'blueGradient',
    '#10b981': 'greenGradient',
    '#8b5cf6': 'purpleGradient',
    '#d4a853': 'goldGradient',
    '#ef4444': 'redGradient',
  };

  return colorMap[color] || 'blueGradient';
}

/**
 * Default Recharts margin
 */
export const DEFAULT_CHART_MARGIN = {
  top: 10,
  right: 30,
  left: 0,
  bottom: 0,
};

/**
 * Default Recharts animation config
 */
export const DEFAULT_ANIMATION_CONFIG = {
  animationDuration: 800,
  animationEasing: 'ease-in-out' as const,
};

/**
 * Responsive font sizes for charts
 */
export const CHART_FONT_SIZES = {
  axis: {
    mobile: 10,
    tablet: 11,
    desktop: 12,
  },
  legend: {
    mobile: 11,
    tablet: 12,
    desktop: 13,
  },
  tooltip: {
    label: 13,
    value: 14,
  },
};
