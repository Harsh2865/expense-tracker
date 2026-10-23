/**
 * Transaction filtering utilities.
 * Pure functions — never mutate the input array.
 */

/**
 * Comparator for newest-first sorting.
 * Chain: date desc → createdAt desc → id asc.
 */
export function newestFirstComparator(a, b) {
  if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;
  if (a.createdAt > b.createdAt) return -1;
  if (a.createdAt < b.createdAt) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

/**
 * Comparator for oldest-first sorting.
 */
export function oldestFirstComparator(a, b) {
  return -newestFirstComparator(a, b);
}

/**
 * Applies all filters and returns a new sorted array.
 *
 * filters: { search, type, category, monthScope, sortOrder }
 * selectedMonth: YYYY-MM string for "selected" monthScope
 */
export function applyFilters(transactions, filters, selectedMonth) {
  let result = [...transactions];

  // Month scope
  if (filters.monthScope === 'selected') {
    result = result.filter((t) => t.date.slice(0, 7) === selectedMonth);
  }

  // Type
  if (filters.type && filters.type !== 'all') {
    result = result.filter((t) => t.type === filters.type);
  }

  // Category
  if (filters.category && filters.category !== 'all') {
    result = result.filter((t) => t.category === filters.category);
  }

  // Search (case-insensitive across title and notes)
  if (filters.search && filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query)),
    );
  }

  // Sort
  const comparator =
    filters.sortOrder === 'oldest' ? oldestFirstComparator : newestFirstComparator;
  result.sort(comparator);

  return result;
}

/**
 * Default filter state.
 */
export const DEFAULT_FILTERS = {
  search: '',
  type: 'all',
  category: 'all',
  monthScope: 'selected',
  sortOrder: 'newest',
};
