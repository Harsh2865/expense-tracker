/**
 * useTransactionFilters — filter state management for the Transactions view.
 */

import { useState, useCallback } from 'react';
import { DEFAULT_FILTERS } from '../utils/filters.js';

export function useTransactionFilters() {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const setSearch = useCallback((search) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setType = useCallback((type) => {
    setFilters((prev) => ({ ...prev, type, category: 'all' }));
  }, []);

  const setCategory = useCallback((category) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setMonthScope = useCallback((monthScope) => {
    setFilters((prev) => ({ ...prev, monthScope }));
  }, []);

  const setSortOrder = useCallback((sortOrder) => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return {
    filters,
    setSearch,
    setType,
    setCategory,
    setMonthScope,
    setSortOrder,
    clearFilters,
  };
}
