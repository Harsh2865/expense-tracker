/**
 * Sample data generator.
 * Generates transactions covering six calendar months ending with the current local month.
 */

import { getCurrentMonth, getPreviousMonth, daysInMonth } from './dates.js';

/**
 * Generates a unique ID. Uses crypto.randomUUID when available, with a fallback.
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SAMPLE_EXPENSES = [
  { title: 'Grocery shopping', category: 'Food', min: 500, max: 3000 },
  { title: 'Restaurant dinner', category: 'Food', min: 300, max: 2000 },
  { title: 'Bus pass', category: 'Transport', min: 500, max: 1500 },
  { title: 'Cab ride', category: 'Transport', min: 100, max: 800 },
  { title: 'Online course', category: 'Education', min: 500, max: 5000 },
  { title: 'Textbooks', category: 'Education', min: 200, max: 2000 },
  { title: 'New headphones', category: 'Shopping', min: 1000, max: 5000 },
  { title: 'Clothing', category: 'Shopping', min: 500, max: 4000 },
  { title: 'Electricity bill', category: 'Bills', min: 800, max: 3000 },
  { title: 'Internet bill', category: 'Bills', min: 500, max: 1500 },
  { title: 'Movie tickets', category: 'Entertainment', min: 200, max: 1000 },
  { title: 'Streaming subscription', category: 'Entertainment', min: 200, max: 700 },
  { title: 'Doctor visit', category: 'Health', min: 300, max: 2000 },
  { title: 'Pharmacy', category: 'Health', min: 100, max: 1000 },
  { title: 'Miscellaneous', category: 'Other Expense', min: 100, max: 1500 },
];

const SAMPLE_INCOMES = [
  { title: 'Monthly salary', category: 'Salary', min: 30000, max: 60000 },
  { title: 'Freelance project', category: 'Freelance', min: 5000, max: 25000 },
  { title: 'Scholarship payment', category: 'Scholarship', min: 5000, max: 15000 },
  { title: 'Part-time work', category: 'Business', min: 3000, max: 10000 },
  { title: 'Gift money', category: 'Other Income', min: 1000, max: 5000 },
];

function randomAmount(min, max) {
  const amount = min + Math.random() * (max - min);
  return Math.round(amount * 100) / 100;
}

function randomDay(year, month) {
  const maxDay = daysInMonth(year, month);
  return Math.floor(Math.random() * maxDay) + 1;
}

/**
 * Generates sample transactions covering six months ending with the current local month.
 * At least 2 transactions per month, mix of income and expense.
 */
export function generateSampleData() {
  const now = new Date();
  const currentMonth = getCurrentMonth(now);

  // Build the six months
  const months = [currentMonth];
  let m = currentMonth;
  for (let i = 0; i < 5; i++) {
    m = getPreviousMonth(m);
    months.unshift(m);
  }

  const transactions = [];
  const baseTime = now.getTime();

  months.forEach((monthStr, monthIdx) => {
    const [year, month] = monthStr.split('-').map(Number);

    // 1 income per month
    const incomeTemplate = SAMPLE_INCOMES[monthIdx % SAMPLE_INCOMES.length];
    const incomeDay = randomDay(year, month);
    const incomeDateStr = `${year}-${String(month).padStart(2, '0')}-${String(incomeDay).padStart(2, '0')}`;
    transactions.push({
      id: generateId(),
      title: incomeTemplate.title,
      amount: randomAmount(incomeTemplate.min, incomeTemplate.max),
      type: 'income',
      category: incomeTemplate.category,
      date: incomeDateStr,
      notes: '',
      createdAt: new Date(baseTime - (6 - monthIdx) * 86400000 - 7200000).toISOString(),
      updatedAt: new Date(baseTime - (6 - monthIdx) * 86400000 - 7200000).toISOString(),
      isSample: true,
    });

    // 2-4 expenses per month
    const numExpenses = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numExpenses; i++) {
      const expenseTemplate = SAMPLE_EXPENSES[(monthIdx * 3 + i) % SAMPLE_EXPENSES.length];
      const expenseDay = randomDay(year, month);
      const expenseDateStr = `${year}-${String(month).padStart(2, '0')}-${String(expenseDay).padStart(2, '0')}`;
      transactions.push({
        id: generateId(),
        title: expenseTemplate.title,
        amount: randomAmount(expenseTemplate.min, expenseTemplate.max),
        type: 'expense',
        category: expenseTemplate.category,
        date: expenseDateStr,
        notes: '',
        createdAt: new Date(baseTime - (6 - monthIdx) * 86400000 - 3600000 + i * 1000).toISOString(),
        updatedAt: new Date(baseTime - (6 - monthIdx) * 86400000 - 3600000 + i * 1000).toISOString(),
        isSample: true,
      });
    }
  });

  return transactions;
}
