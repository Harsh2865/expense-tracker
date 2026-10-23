import { formatMonthYear, formatShortMonth } from './dates.js';

export { formatMonthYear, formatShortMonth };

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats paise as INR currency string. E.g., 2485000 → "₹24,850.00"
 */
export function formatCurrencyPaise(paise) {
  return currencyFormatter.format(paise / 100);
}

/**
 * Formats a rupee amount as INR currency string.
 */
export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

/**
 * Formats a YYYY-MM-DD date string for display.
 */
export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

/**
 * Formats today's date for the header display.
 */
export function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
