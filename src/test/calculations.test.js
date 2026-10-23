import { describe, it, expect } from 'vitest';
import {
  sumPaise,
  getTotalIncomePaise,
  getTotalExpensesPaise,
  getCurrentBalancePaise,
  getMonthlySummary,
  getMonthlySeries,
  getCategoryTotals,
  getRecentTransactions,
} from '../utils/calculations.js';

describe('calculations.js', () => {
  it('handles empty data', () => {
    expect(sumPaise([])).toBe(0);
    expect(getTotalIncomePaise([])).toBe(0);
    expect(getTotalExpensesPaise([])).toBe(0);
    expect(getCurrentBalancePaise([])).toBe(0);
    expect(getMonthlySummary([], '2026-10')).toEqual({
      incomePaise: 0,
      expensesPaise: 0,
      savingsPaise: 0,
    });
    expect(getCategoryTotals([], '2026-10')).toEqual([]);
    expect(getRecentTransactions([])).toEqual([]);
  });

  it('handles income only', () => {
    const tx = [
      { id: '1', amount: 1000, type: 'income', date: '2026-10-01' },
      { id: '2', amount: 500, type: 'income', date: '2026-10-02' },
    ];
    expect(getTotalIncomePaise(tx)).toBe(150000);
    expect(getTotalExpensesPaise(tx)).toBe(0);
    expect(getCurrentBalancePaise(tx)).toBe(150000);
  });

  it('handles expenses only', () => {
    const tx = [
      { id: '1', amount: 250, type: 'expense', date: '2026-10-01', category: 'Food' },
      { id: '2', amount: 750, type: 'expense', date: '2026-10-02', category: 'Transport' },
    ];
    expect(getTotalIncomePaise(tx)).toBe(0);
    expect(getTotalExpensesPaise(tx)).toBe(100000);
    expect(getCurrentBalancePaise(tx)).toBe(-100000);
  });

  it('handles mixed income and expenses', () => {
    const tx = [
      { id: '1', amount: 5000, type: 'income', date: '2026-10-01' },
      { id: '2', amount: 1200, type: 'expense', date: '2026-10-02' },
      { id: '3', amount: 800, type: 'expense', date: '2026-10-03' },
    ];
    expect(getCurrentBalancePaise(tx)).toBe(300000);
  });

  it('handles decimal amounts with exact paise precision (e.g., 0.1 + 0.2)', () => {
    const tx = [
      { id: '1', amount: 0.1, type: 'income', date: '2026-10-01' },
      { id: '2', amount: 0.2, type: 'income', date: '2026-10-02' },
    ];
    // In IEEE 754 float, 0.1 + 0.2 is 0.30000000000000004
    // Math.round(0.1*100) = 10, Math.round(0.2*100) = 20 -> sum = 30 paise
    expect(sumPaise(tx)).toBe(30);
    expect(getTotalIncomePaise(tx)).toBe(30);
  });

  it('handles maximum amount without precision loss', () => {
    const maxRupees = 999999999;
    const tx = [{ id: '1', amount: maxRupees, type: 'income', date: '2026-10-01' }];
    expect(sumPaise(tx)).toBe(99999999900);
  });

  it('computes monthly totals correctly for selectedMonth and excludes other months', () => {
    const tx = [
      { id: '1', amount: 1000, type: 'income', date: '2026-10-15' },
      { id: '2', amount: 400, type: 'expense', date: '2026-10-20' },
      { id: '3', amount: 5000, type: 'income', date: '2026-09-10' },
      { id: '4', amount: 2000, type: 'expense', date: '2026-11-01' },
    ];
    const summaryOct = getMonthlySummary(tx, '2026-10');
    expect(summaryOct.incomePaise).toBe(100000);
    expect(summaryOct.expensesPaise).toBe(40000);
    expect(summaryOct.savingsPaise).toBe(60000);
  });

  it('computes negative net savings when expenses exceed income', () => {
    const tx = [
      { id: '1', amount: 1000, type: 'income', date: '2026-10-15' },
      { id: '2', amount: 2500, type: 'expense', date: '2026-10-20' },
    ];
    const summary = getMonthlySummary(tx, '2026-10');
    expect(summary.savingsPaise).toBe(-150000);
  });

  it('current balance includes all transactions regardless of selected month', () => {
    const tx = [
      { id: '1', amount: 1000, type: 'income', date: '2026-08-01' },
      { id: '2', amount: 2000, type: 'income', date: '2026-09-01' },
      { id: '3', amount: 500, type: 'expense', date: '2026-10-01' },
    ];
    // Balance should be (1000+2000 - 500) = 2500 -> 250000 paise
    expect(getCurrentBalancePaise(tx)).toBe(250000);
  });

  it('generates a 6-month series including zero months', () => {
    const tx = [
      { id: '1', amount: 1000, type: 'income', date: '2026-10-01' },
      { id: '2', amount: 300, type: 'expense', date: '2026-08-15' },
    ];
    const series = getMonthlySeries(tx, '2026-10');
    expect(series.length).toBe(6);
    expect(series.map((s) => s.month)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
    // May, June, July, September have zero transactions
    expect(series[0].incomePaise).toBe(0);
    expect(series[0].expensesPaise).toBe(0);
    expect(series[3].expensesPaise).toBe(30000);
    expect(series[5].incomePaise).toBe(100000);
  });

  it('aggregates category totals correctly for expense transactions', () => {
    const tx = [
      { id: '1', amount: 500, type: 'expense', category: 'Food', date: '2026-10-01' },
      { id: '2', amount: 300, type: 'expense', category: 'Food', date: '2026-10-02' },
      { id: '3', amount: 200, type: 'expense', category: 'Bills', date: '2026-10-03' },
      { id: '4', amount: 1000, type: 'income', category: 'Salary', date: '2026-10-04' },
      { id: '5', amount: 400, type: 'expense', category: 'Food', date: '2026-09-01' }, // different month
    ];
    const totals = getCategoryTotals(tx, '2026-10');
    expect(totals).toEqual([
      { category: 'Food', totalPaise: 80000 },
      { category: 'Bills', totalPaise: 20000 },
    ]);
  });

  it('orders recent transactions by date desc, createdAt desc, id asc, and limits to 5', () => {
    const tx = [
      { id: 'b', title: 'B', amount: 10, type: 'income', date: '2026-10-10', createdAt: '2026-10-10T10:00:00Z' },
      { id: 'a', title: 'A', amount: 10, type: 'income', date: '2026-10-10', createdAt: '2026-10-10T10:00:00Z' }, // tie on date & createdAt, 'a' < 'b'
      { id: 'c', title: 'C', amount: 10, type: 'income', date: '2026-10-10', createdAt: '2026-10-10T11:00:00Z' }, // newer createdAt
      { id: 'd', title: 'D', amount: 10, type: 'income', date: '2026-10-12', createdAt: '2026-10-09T00:00:00Z' }, // newest date
      { id: 'e', title: 'E', amount: 10, type: 'income', date: '2026-10-01', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'f', title: 'F', amount: 10, type: 'income', date: '2026-09-01', createdAt: '2026-09-01T00:00:00Z' },
      { id: 'g', title: 'G', amount: 10, type: 'income', date: '2026-08-01', createdAt: '2026-08-01T00:00:00Z' },
    ];
    const recent = getRecentTransactions(tx);
    expect(recent.length).toBe(5);
    expect(recent[0].id).toBe('d'); // newest date 2026-10-12
    expect(recent[1].id).toBe('c'); // date 2026-10-10, newer createdAt 11:00
    expect(recent[2].id).toBe('a'); // date 2026-10-10, 10:00, id 'a' < 'b'
    expect(recent[3].id).toBe('b'); // date 2026-10-10, 10:00, id 'b'
    expect(recent[4].id).toBe('e'); // date 2026-10-01
  });

  it('never mutates input arrays', () => {
    const original = [
      { id: '2', amount: 200, type: 'expense', date: '2026-10-01', createdAt: '2026-10-01T00:00:00Z' },
      { id: '1', amount: 100, type: 'income', date: '2026-10-02', createdAt: '2026-10-02T00:00:00Z' },
    ];
    const copy = JSON.parse(JSON.stringify(original));
    getRecentTransactions(original);
    expect(original).toEqual(copy);
  });
});
