import { describe, it, expect } from 'vitest';
import { applyFilters, DEFAULT_FILTERS } from '../utils/filters.js';

describe('filters.js', () => {
  const sampleTransactions = [
    {
      id: '1',
      title: 'Grocery Store Run',
      amount: 1500,
      type: 'expense',
      category: 'Food',
      date: '2026-10-15',
      notes: 'Bought organic apples and milk',
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Salary Credit',
      amount: 60000,
      type: 'income',
      category: 'Salary',
      date: '2026-10-01',
      notes: 'Monthly company salary',
      createdAt: '2026-10-01T09:00:00Z',
    },
    {
      id: '3',
      title: 'Electricity Bill',
      amount: 2200,
      type: 'expense',
      category: 'Bills',
      date: '2026-10-10',
      notes: 'Power utility payment',
      createdAt: '2026-10-10T08:00:00Z',
    },
    {
      id: '4',
      title: 'Freelance Design',
      amount: 15000,
      type: 'income',
      category: 'Freelance',
      date: '2026-09-20',
      notes: 'Client landing page design',
      createdAt: '2026-09-20T12:00:00Z',
    },
    {
      id: '5',
      title: 'Restaurant Dinner',
      amount: 1800,
      type: 'expense',
      category: 'Food',
      date: '2026-09-15',
      notes: 'Weekend meal with family',
      createdAt: '2026-09-15T20:00:00Z',
    },
  ];

  it('performs case-insensitive title search', () => {
    const filters = { ...DEFAULT_FILTERS, search: 'grocery', monthScope: 'all' };
    const res = applyFilters(sampleTransactions, filters, '2026-10');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('1');
  });

  it('searches within notes case-insensitively', () => {
    const filters = { ...DEFAULT_FILTERS, search: 'organic apples', monthScope: 'all' };
    const res = applyFilters(sampleTransactions, filters, '2026-10');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('1');
  });

  it('filters by type correctly', () => {
    const incomeFilters = { ...DEFAULT_FILTERS, type: 'income', monthScope: 'all' };
    const incomes = applyFilters(sampleTransactions, incomeFilters, '2026-10');
    expect(incomes.length).toBe(2);
    expect(incomes.every((t) => t.type === 'income')).toBe(true);

    const expenseFilters = { ...DEFAULT_FILTERS, type: 'expense', monthScope: 'all' };
    const expenses = applyFilters(sampleTransactions, expenseFilters, '2026-10');
    expect(expenses.length).toBe(3);
    expect(expenses.every((t) => t.type === 'expense')).toBe(true);
  });

  it('filters by category correctly', () => {
    const filters = { ...DEFAULT_FILTERS, category: 'Food', monthScope: 'all' };
    const res = applyFilters(sampleTransactions, filters, '2026-10');
    expect(res.length).toBe(2);
    expect(res.every((t) => t.category === 'Food')).toBe(true);
  });

  it('filters by monthScope: "selected" and "all"', () => {
    // "selected" for 2026-10
    const selectedMonthFilters = { ...DEFAULT_FILTERS, monthScope: 'selected' };
    const oct = applyFilters(sampleTransactions, selectedMonthFilters, '2026-10');
    expect(oct.length).toBe(3);
    expect(oct.map((t) => t.id).sort()).toEqual(['1', '2', '3']);

    // "all"
    const allMonthsFilters = { ...DEFAULT_FILTERS, monthScope: 'all' };
    const all = applyFilters(sampleTransactions, allMonthsFilters, '2026-10');
    expect(all.length).toBe(5);
  });

  it('combines multiple active filters with logical AND', () => {
    // month 2026-10 AND type expense AND category Food
    const combined = {
      ...DEFAULT_FILTERS,
      monthScope: 'selected',
      type: 'expense',
      category: 'Food',
      search: 'apples',
    };
    const res = applyFilters(sampleTransactions, combined, '2026-10');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('1');
  });

  it('returns empty array when no transactions match filters', () => {
    const filters = { ...DEFAULT_FILTERS, search: 'nonexistent-query-xyz' };
    const res = applyFilters(sampleTransactions, filters, '2026-10');
    expect(res).toEqual([]);
  });

  it('never mutates the original transaction array', () => {
    const copy = JSON.parse(JSON.stringify(sampleTransactions));
    applyFilters(sampleTransactions, { ...DEFAULT_FILTERS, sortOrder: 'oldest' }, '2026-10');
    expect(sampleTransactions).toEqual(copy);
  });
});
