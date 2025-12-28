
export function formatCurrency(amount: number, currencyCode: string): string {
  // Guard against missing currency code to prevent "AED" fallback bugs
  if (!currencyCode) return amount.toString();

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
  }).format(amount);
}

// Helper for refined UI formatting (lighter symbol, bold value)
export function splitCurrency(amount: number, currencyCode: string) {
  const formatted = formatCurrency(amount, currencyCode);
  // Improved regex to handle various currency positions (prefix/suffix)
  const match = formatted.match(/([^0-9,.\s]+)?\s?([0-9,.]+)\s?([^0-9,.\s]+)?/);

  return {
    symbol: match ? (match[1] || match[3] || '') : '',
    value: match ? match[2] : formatted
  };
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
    case 'active':
    case 'in-stock':
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'cancelled':
    case 'out-of-stock':
    case 'archived':
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getOrderAge(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { text: `${mins}m ago`, level: mins > 30 ? 'warning' : 'normal' };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { text: `${hrs}h ago`, level: hrs > 2 ? 'critical' : 'warning' };
  return { text: `${Math.floor(hrs / 24)}d ago`, level: 'normal' };
}

/** 
 * Helper to compare two dates (ISO strings or Date objects) 
 * for the same local day (Year, Month, Day).
 */
export function isSameLocalDay(dateA: string | Date, dateB: string | Date): boolean {
  const d1 = new Date(dateA);
  const d2 = new Date(dateB);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
