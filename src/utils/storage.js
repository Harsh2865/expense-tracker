/**
 * Local Storage persistence and recovery.
 *
 * Key: expense-tracker-transactions-v1
 *
 * loadTransactions() is a PURE READ operation — it never writes, creates
 * backups, or otherwise mutates Local Storage.
 *
 * Backup creation and explicit recovery operations are separate functions.
 */

import { isValidDate } from './dates.js';
import { isCategoryValidForType } from './categories.js';

export const STORAGE_KEY = 'expense-tracker-transactions-v1';
const BACKUP_PREFIX = 'expense-tracker-transactions-v1-corrupt-backup-';

/**
 * Validates a single transaction record from storage.
 */
function isValidRecord(record) {
  if (!record || typeof record !== 'object') return false;
  if (typeof record.id !== 'string' || !record.id) return false;
  if (typeof record.title !== 'string' || !record.title.trim()) return false;
  if (typeof record.amount !== 'number' || !isFinite(record.amount) || record.amount <= 0) return false;
  if (record.type !== 'income' && record.type !== 'expense') return false;
  if (typeof record.category !== 'string' || !isCategoryValidForType(record.category, record.type)) return false;
  if (!isValidDate(record.date)) return false;
  if (typeof record.createdAt !== 'string') return false;
  if (typeof record.updatedAt !== 'string') return false;
  return true;
}

/**
 * Normalizes a valid record from storage (ensures isSample boolean, notes string).
 */
function normalizeRecord(record) {
  return {
    ...record,
    notes: typeof record.notes === 'string' ? record.notes : '',
    isSample: record.isSample === true,
  };
}

/**
 * Loads transactions from Local Storage. Pure read — never writes.
 *
 * Returns:
 * {
 *   transactions: [],        // validated records
 *   status: string,          // "empty" | "ok" | "corrupt" | "partial" | "unavailable"
 *   rawValue: string | null, // original raw string
 *   skippedCount: number,    // number of invalid records skipped
 *   recoveryId: string|null  // stable identifier for this recovery attempt
 * }
 */
export function loadTransactions() {
  let rawValue = null;
  try {
    rawValue = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      transactions: [],
      status: 'unavailable',
      rawValue: null,
      skippedCount: 0,
      recoveryId: null,
    };
  }

  if (rawValue === null) {
    return {
      transactions: [],
      status: 'empty',
      rawValue: null,
      skippedCount: 0,
      recoveryId: null,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    // Invalid JSON — corrupt
    return {
      transactions: [],
      status: 'corrupt',
      rawValue,
      skippedCount: 0,
      recoveryId: `corrupt-${Date.now()}`,
    };
  }

  if (!Array.isArray(parsed)) {
    // Valid JSON but not an array — corrupt
    return {
      transactions: [],
      status: 'corrupt',
      rawValue,
      skippedCount: 0,
      recoveryId: `corrupt-${Date.now()}`,
    };
  }

  const valid = [];
  let skippedCount = 0;
  for (const record of parsed) {
    if (isValidRecord(record)) {
      valid.push(normalizeRecord(record));
    } else {
      skippedCount++;
    }
  }

  if (skippedCount > 0) {
    return {
      transactions: valid,
      status: 'partial',
      rawValue,
      skippedCount,
      recoveryId: `partial-${Date.now()}`,
    };
  }

  return {
    transactions: valid,
    status: 'ok',
    rawValue: null,
    skippedCount: 0,
    recoveryId: null,
  };
}

/**
 * Creates a key-safe timestamp string for backup keys.
 */
function makeTimestampKey() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Creates a timestamped, never-overwritten backup of the raw value.
 * Returns { success: boolean, backupKey: string | null }.
 */
export function createBackup(rawValue) {
  if (!rawValue) {
    return { success: false, backupKey: null };
  }

  try {
    let baseKey = `${BACKUP_PREFIX}${makeTimestampKey()}`;
    let key = baseKey;
    let counter = 0;

    // Ensure we never overwrite an existing backup
    while (localStorage.getItem(key) !== null) {
      counter++;
      key = `${baseKey}-${counter}`;
    }

    localStorage.setItem(key, rawValue);

    // Verify the write succeeded
    if (localStorage.getItem(key) === rawValue) {
      return { success: true, backupKey: key };
    }
    return { success: false, backupKey: null };
  } catch {
    return { success: false, backupKey: null };
  }
}

/**
 * Saves transactions to Local Storage.
 * Returns { success: boolean }.
 */
export function saveTransactions(transactions) {
  try {
    const json = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, json);
    return { success: true };
  } catch {
    return { success: false };
  }
}
