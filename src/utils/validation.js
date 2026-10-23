/**
 * Transaction validation utilities.
 * Amount validation uses raw-string regex — never parseFloat for precision checks.
 */

import { isValidDate } from './dates.js';
import { isCategoryValidForType } from './categories.js';

/** Maximum amount in paise: ₹99,99,99,999 (99,999,999,900 paise) */
const MAX_AMOUNT_PAISE = 99_999_999_900;

/**
 * Converts a validated amount string to integer paise.
 * Only call after amountStringValid() returns true.
 */
export function amountStringToPaise(str) {
  const [rupees, fraction = ''] = str.split('.');
  return Number(rupees) * 100 + Number(fraction.padEnd(2, '0'));
}

/**
 * Validates an amount string.
 * Returns { valid: true } or { valid: false, message: string }.
 */
export function validateAmountString(rawStr) {
  if (typeof rawStr !== 'string') {
    return { valid: false, message: 'Amount is required.' };
  }
  const trimmed = rawStr.trim();
  if (trimmed === '') {
    return { valid: false, message: 'Amount is required.' };
  }

  // Check for commas before any other numeric validation
  if (trimmed.includes(',')) {
    return {
      valid: false,
      message: 'Enter digits only, without commas (for example 1500 or 1500.50).',
    };
  }

  // Validate format: digits, optional dot with 1-2 decimal digits
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { valid: false, message: 'Enter a valid amount (for example 1500 or 1500.50).' };
  }

  const paise = amountStringToPaise(trimmed);
  if (paise <= 0) {
    return { valid: false, message: 'Amount must be greater than zero.' };
  }
  if (paise > MAX_AMOUNT_PAISE) {
    return { valid: false, message: 'Amount exceeds the maximum of ₹99,99,99,999.' };
  }

  return { valid: true };
}

/**
 * Validates a complete transaction object for add or edit.
 * Returns { valid: true, data: cleanedTransaction } or { valid: false, errors: { field: message } }.
 */
export function validateTransaction(values) {
  const errors = {};

  // Title
  const title = (values.title || '').trim();
  if (!title) {
    errors.title = 'Title is required.';
  }

  // Type
  if (values.type !== 'income' && values.type !== 'expense') {
    errors.type = 'Select a valid type.';
  }

  // Category
  if (!values.category) {
    errors.category = 'Category is required.';
  } else if (values.type && !isCategoryValidForType(values.category, values.type)) {
    errors.category = 'Category is not valid for the selected type.';
  }

  // Amount
  const amountResult = validateAmountString(values.amount);
  if (!amountResult.valid) {
    errors.amount = amountResult.message;
  }

  // Date
  if (!values.date) {
    errors.date = 'Date is required.';
  } else if (!isValidDate(values.date)) {
    errors.date = 'Enter a valid date between 2000-01-01 and 2100-12-31.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title,
      amount: parseFloat(values.amount.trim()),
      type: values.type,
      category: values.category,
      date: values.date,
      notes: (values.notes || '').trim(),
    },
  };
}
