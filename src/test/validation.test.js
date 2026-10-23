import { describe, it, expect } from 'vitest';
import {
  validateAmountString,
  amountStringToPaise,
  validateTransaction,
} from '../utils/validation.js';

describe('validation.js', () => {
  describe('validateAmountString', () => {
    it('accepts valid integers and 1-2 decimal places', () => {
      expect(validateAmountString('1500').valid).toBe(true);
      expect(validateAmountString('1500.5').valid).toBe(true);
      expect(validateAmountString('1500.50').valid).toBe(true);
      expect(validateAmountString('0.05').valid).toBe(true);
      expect(validateAmountString('100.99').valid).toBe(true);
    });

    it('converts valid string to exact integer paise', () => {
      expect(amountStringToPaise('1500')).toBe(150000);
      expect(amountStringToPaise('1500.5')).toBe(150050);
      expect(amountStringToPaise('1500.50')).toBe(150050);
      expect(amountStringToPaise('0.05')).toBe(5);
      expect(amountStringToPaise('0.5')).toBe(50);
    });

    it('rejects scientific notation', () => {
      const res = validateAmountString('1e5');
      expect(res.valid).toBe(false);
    });

    it('rejects commas with specific helpful error message', () => {
      const res = validateAmountString('1,000');
      expect(res.valid).toBe(false);
      expect(res.message).toBe(
        'Enter digits only, without commas (for example 1500 or 1500.50).',
      );
    });

    it('rejects more than two decimal places', () => {
      const res = validateAmountString('10.005');
      expect(res.valid).toBe(false);
    });

    it('rejects negative values and zero', () => {
      expect(validateAmountString('-5').valid).toBe(false);
      expect(validateAmountString('0').valid).toBe(false);
      expect(validateAmountString('0.00').valid).toBe(false);
    });

    it('rejects empty or whitespace-only inputs', () => {
      expect(validateAmountString('').valid).toBe(false);
      expect(validateAmountString('   ').valid).toBe(false);
    });

    it('rejects non-numeric characters', () => {
      expect(validateAmountString('abc').valid).toBe(false);
      expect(validateAmountString('$100').valid).toBe(false);
      expect(validateAmountString('12.34.56').valid).toBe(false);
    });

    it('accepts the exact maximum amount ₹99,99,99,999', () => {
      const maxStr = '999999999';
      const res = validateAmountString(maxStr);
      expect(res.valid).toBe(true);
      expect(amountStringToPaise(maxStr)).toBe(99999999900);
    });

    it('rejects amounts strictly over the maximum', () => {
      expect(validateAmountString('1000000000').valid).toBe(false);
      expect(validateAmountString('999999999.01').valid).toBe(false);
    });
  });

  describe('validateTransaction', () => {
    it('validates a complete valid transaction', () => {
      const input = {
        title: '  Grocery Shopping  ',
        amount: '1250.75',
        type: 'expense',
        category: 'Food',
        date: '2026-10-23',
        notes: '  Weekly pantry refill  ',
      };
      const res = validateTransaction(input);
      expect(res.valid).toBe(true);
      expect(res.data).toEqual({
        title: 'Grocery Shopping',
        amount: 1250.75,
        type: 'expense',
        category: 'Food',
        date: '2026-10-23',
        notes: 'Weekly pantry refill',
      });
    });

    it('requires a non-empty trimmed title', () => {
      const res = validateTransaction({
        title: '   ',
        amount: '500',
        type: 'expense',
        category: 'Food',
        date: '2026-10-23',
      });
      expect(res.valid).toBe(false);
      expect(res.errors.title).toBeDefined();
    });

    it('rejects category mismatch for transaction type', () => {
      const res = validateTransaction({
        title: 'Salary Check',
        amount: '50000',
        type: 'income',
        category: 'Food', // Food is an expense category, not income
        date: '2026-10-23',
      });
      expect(res.valid).toBe(false);
      expect(res.errors.category).toBeDefined();
    });
  });
});
