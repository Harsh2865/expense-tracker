import { Search, X, Filter } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories.js';
import { formatMonthYear } from '../utils/dates.js';

/**
 * Transaction filters with search, type, category, month scope, and sort controls.
 */
export default function TransactionFilters({
  filters,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onMonthScopeChange,
  onSortChange,
  onClearFilters,
  selectedMonth,
}) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.monthScope !== 'selected';

  // Build category options based on selected type
  let categories;
  if (filters.type === 'income') {
    categories = INCOME_CATEGORIES;
  } else if (filters.type === 'expense') {
    categories = EXPENSE_CATEGORIES;
  } else {
    categories = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          id="filter-search"
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or notes..."
          aria-label="Search transactions"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-gray-400 shrink-0" />

        {/* Type */}
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label="Filter by type"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Category */}
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Month scope */}
        <select
          id="filter-month-scope"
          value={filters.monthScope}
          onChange={(e) => onMonthScopeChange(e.target.value)}
          aria-label="Month scope"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="selected">
            {formatMonthYear(selectedMonth)}
          </option>
          <option value="all">All months</option>
        </select>

        {/* Sort */}
        <select
          id="filter-sort"
          value={filters.sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort order"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
