/**
 * Category definitions for income and expense transactions.
 */

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Scholarship',
  'Business',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other Expense',
];

/**
 * Returns valid categories for a given transaction type.
 */
export function getCategoriesForType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/**
 * Checks whether a category is valid for a given type.
 */
export function isCategoryValidForType(category, type) {
  return getCategoriesForType(type).includes(category);
}

/**
 * Category colors for charts and visual indicators.
 */
export const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#f97316',
  Education: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Entertainment: '#06b6d4',
  Health: '#10b981',
  'Other Expense': '#6b7280',
  Salary: '#059669',
  Freelance: '#2563eb',
  Scholarship: '#7c3aed',
  Business: '#0891b2',
  'Other Income': '#64748b',
};
