/**
 * Date utilities — local calendar dates, month operations, validation.
 * Never uses new Date(dateString) for month comparisons.
 * Never uses new Date().toISOString().slice(0, 10) for today's date.
 */

/**
 * Returns today's date as YYYY-MM-DD using local time (not UTC).
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current local month as YYYY-MM.
 */
export function getCurrentMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns the previous month in YYYY-MM format.
 */
export function getPreviousMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

/**
 * Returns the next month in YYYY-MM format.
 */
export function getNextMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * Formats a YYYY-MM string as "Month YYYY".
 */
export function formatMonthYear(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${monthNames[m - 1]} ${y}`;
}

/**
 * Short month name for chart labels.
 */
export function formatShortMonth(yearMonth) {
  const [, m] = yearMonth.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[m - 1];
}

const MIN_MONTH = '2000-01';
const MAX_MONTH = '2100-12';

export function canGoPrevious(yearMonth) {
  return yearMonth > MIN_MONTH;
}

export function canGoNext(yearMonth) {
  return yearMonth < MAX_MONTH;
}

/**
 * Checks if a year is a leap year.
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the number of days in a given month (1-indexed).
 */
export function daysInMonth(year, month) {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

/**
 * Validates a date string is a real calendar date in YYYY-MM-DD format
 * between 2000-01-01 and 2100-12-31. Future dates are allowed.
 */
export function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;

  return true;
}

/**
 * Returns an array of six consecutive YYYY-MM strings ending with endMonth.
 */
export function getSixMonthRange(endMonth) {
  const months = [];
  let current = endMonth;
  for (let i = 0; i < 6; i++) {
    months.unshift(current);
    current = getPreviousMonth(current);
  }
  return months;
}
