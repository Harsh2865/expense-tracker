import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  loadTransactions,
  saveTransactions,
  createBackup,
} from '../utils/storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('handles no existing key (empty storage)', () => {
    const result = loadTransactions();
    expect(result.status).toBe('empty');
    expect(result.transactions).toEqual([]);
    expect(result.rawValue).toBeNull();
    expect(result.skippedCount).toBe(0);
    // Pure read: storage must NOT be modified
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('loads valid array of transactions', () => {
    const validData = [
      {
        id: 'tx-1',
        title: 'Salary',
        amount: 50000,
        type: 'income',
        category: 'Salary',
        date: '2026-10-01',
        notes: 'Monthly pay',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
        isSample: false,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));

    const result = loadTransactions();
    expect(result.status).toBe('ok');
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].id).toBe('tx-1');
    expect(result.skippedCount).toBe(0);
  });

  it('handles corrupted JSON (syntax error) with preserved raw string', () => {
    const corruptString = '{ "invalid_json": true, incomplete...';
    localStorage.setItem(STORAGE_KEY, corruptString);

    const result = loadTransactions();
    expect(result.status).toBe('corrupt');
    expect(result.transactions).toEqual([]);
    expect(result.rawValue).toBe(corruptString);
    // Crucial: loadTransactions is pure read — main key untouched!
    expect(localStorage.getItem(STORAGE_KEY)).toBe(corruptString);
  });

  it('creates timestamped backup of corrupted raw data and does not overwrite main key', () => {
    const corruptString = 'not-json-content-here';
    localStorage.setItem(STORAGE_KEY, corruptString);

    const backupResult = createBackup(corruptString);
    expect(backupResult.success).toBe(true);
    expect(backupResult.backupKey).toMatch(
      /^expense-tracker-transactions-v1-corrupt-backup-/,
    );
    // Backup exists with raw string
    expect(localStorage.getItem(backupResult.backupKey)).toBe(corruptString);
    // Original key remains completely untouched
    expect(localStorage.getItem(STORAGE_KEY)).toBe(corruptString);
  });

  it('never overwrites existing backup key upon collision (appends counter suffix)', () => {
    const raw1 = 'data-version-1';
    const raw2 = 'data-version-2';

    // Mock Date so both backups attempt identical timestamps
    const mockDate = new Date('2026-10-23T12:00:00.000Z');
    vi.setSystemTime(mockDate);

    const res1 = createBackup(raw1);
    const res2 = createBackup(raw2);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res1.backupKey).not.toBe(res2.backupKey);
    expect(localStorage.getItem(res1.backupKey)).toBe(raw1);
    expect(localStorage.getItem(res2.backupKey)).toBe(raw2);

    vi.useRealTimers();
  });

  it('handles corrupted JSON that is valid JSON but not an array (e.g. object)', () => {
    const nonArrayJson = JSON.stringify({ message: 'not an array' });
    localStorage.setItem(STORAGE_KEY, nonArrayJson);

    const result = loadTransactions();
    expect(result.status).toBe('corrupt');
    expect(result.transactions).toEqual([]);
    expect(result.rawValue).toBe(nonArrayJson);
  });

  it('handles partially invalid array by keeping valid records and counting skipped', () => {
    const mixedData = [
      {
        id: 'valid-1',
        title: 'Lunch',
        amount: 250,
        type: 'expense',
        category: 'Food',
        date: '2026-10-15',
        notes: '',
        createdAt: '2026-10-15T00:00:00Z',
        updatedAt: '2026-10-15T00:00:00Z',
        isSample: false,
      },
      {
        id: 'invalid-missing-title',
        title: '', // empty title -> invalid
        amount: 500,
        type: 'expense',
        category: 'Food',
        date: '2026-10-15',
      },
      {
        id: 'invalid-negative-amount',
        title: 'Refund',
        amount: -100, // negative amount -> invalid
        type: 'income',
        category: 'Salary',
        date: '2026-10-15',
      },
      {
        id: 'valid-2',
        title: 'Freelance Design',
        amount: 15000,
        type: 'income',
        category: 'Freelance',
        date: '2026-10-18',
        notes: 'Project alpha',
        createdAt: '2026-10-18T00:00:00Z',
        updatedAt: '2026-10-18T00:00:00Z',
        isSample: false,
      },
    ];

    const raw = JSON.stringify(mixedData);
    localStorage.setItem(STORAGE_KEY, raw);

    const result = loadTransactions();
    expect(result.status).toBe('partial');
    expect(result.transactions.length).toBe(2);
    expect(result.transactions[0].id).toBe('valid-1');
    expect(result.transactions[1].id).toBe('valid-2');
    expect(result.skippedCount).toBe(2);
    expect(result.rawValue).toBe(raw);
    // Original key must not be modified during loading
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it('returns unavailable status when reading localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access denied');
    });

    const result = loadTransactions();
    expect(result.status).toBe('unavailable');
    expect(result.transactions).toEqual([]);
  });

  it('returns failure when saving to localStorage throws (e.g. QuotaExceededError)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = saveTransactions([{ id: '1' }]);
    expect(result.success).toBe(false);
  });
});
