/**
 * Financial calculation utilities.
 * All monetary calculations use integer paise internally.
 * Never uses repeated floating-point addition of rupee values.
 */

import { getSixMonthRange, formatShortMonth } from './dates.js';

/**
 * Sums an array of transactions' amounts in paise.
 */
export function sumPaise(transactions) {
  return transactions.reduce(
    (total, t) => total + Math.round(t.amount * 100),
    0,
  );
}

/**
 * Total income in paise from all given transactions.
 */
export function getTotalIncomePaise(transactions) {
  return sumPaise(transactions.filter((t) => t.type === 'income'));
}

/**
 * Total expenses in paise from all given transactions.
 */
export function getTotalExpensesPaise(transactions) {
  return sumPaise(transactions.filter((t) => t.type === 'expense'));
}

/**
 * Current balance in paise: totalIncome - totalExpenses across ALL transactions.
 */
export function getCurrentBalancePaise(transactions) {
  return getTotalIncomePaise(transactions) - getTotalExpensesPaise(transactions);
}

/**
 * Returns monthly income, expenses, and savings in paise for a given month.
 */
export function getMonthlySummary(transactions, selectedMonth) {
  const monthTx = transactions.filter(
    (t) => t.date.slice(0, 7) === selectedMonth,
  );
  const incomePaise = getTotalIncomePaise(monthTx);
  const expensesPaise = getTotalExpensesPaise(monthTx);
  return {
    incomePaise,
    expensesPaise,
    savingsPaise: incomePaise - expensesPaise,
  };
}

/**
 * Returns an array of { month, label, incomePaise, expensesPaise }
 * for six consecutive months ending at endMonth. Zero months included.
 */
export function getMonthlySeries(transactions, endMonth) {
  const months = getSixMonthRange(endMonth);
  return months.map((month) => {
    const monthTx = transactions.filter(
      (t) => t.date.slice(0, 7) === month,
    );
    return {
      month,
      label: formatShortMonth(month),
      incomePaise: getTotalIncomePaise(monthTx),
      expensesPaise: getTotalExpensesPaise(monthTx),
    };
  });
}

/**
 * Returns an array of { category, totalPaise } for expense transactions
 * in the given month, sorted by totalPaise descending.
 */
export function getCategoryTotals(transactions, selectedMonth) {
  const expenseTx = transactions.filter(
    (t) => t.type === 'expense' && t.date.slice(0, 7) === selectedMonth,
  );
  const map = {};
  expenseTx.forEach((t) => {
    const paise = Math.round(t.amount * 100);
    map[t.category] = (map[t.category] || 0) + paise;
  });
  return Object.entries(map)
    .map(([category, totalPaise]) => ({ category, totalPaise }))
    .sort((a, b) => b.totalPaise - a.totalPaise);
}

/**
 * Returns the five newest transactions across all months.
 * Sorting: date desc, createdAt desc, id asc.
 */
export function getRecentTransactions(transactions) {
  const sorted = [...transactions].sort((a, b) => {
    // Date descending
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    // createdAt descending
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    // id ascending
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
  return sorted.slice(0, 5);
}
