/**
 * useTransactions — centralized transaction state, CRUD, and persistence.
 *
 * Follows all persistence/recovery rules:
 * - Synchronous, read-only initialization via useState(() => ...)
 * - Never writes on mount or under StrictMode
 * - Functional state updates for all mutations
 * - Explicit recovery states with idempotent backup creation
 * - Mutation gating during unacknowledged recovery
 * - Latest-state persistence (no stale writes)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadTransactions, saveTransactions, createBackup } from '../utils/storage.js';
import { generateId } from '../utils/sampleData.js';

/**
 * Recovery states:
 * - normal: no recovery needed
 * - recoveryPending: corrupt/partial data detected; mutations disabled, original key untouched
 * - backupInProgress: attempting backup
 * - recoveryAcknowledged: user acknowledged; normal operations resume
 * - persistenceBlocked: backup failed; writes blocked until explicit risk acknowledgment
 * - storageUnavailable: storage read/write failed; memory-only mode
 */

const RECOVERY_NORMAL = 'normal';
const RECOVERY_PENDING = 'recoveryPending';
const RECOVERY_ACKNOWLEDGED = 'recoveryAcknowledged';
const PERSISTENCE_BLOCKED = 'persistenceBlocked';
const STORAGE_UNAVAILABLE = 'storageUnavailable';

export function useTransactions() {
  // ── Synchronous, read-only initialization ─────────────────────────
  const [initResult] = useState(() => loadTransactions());

  const [transactions, setTransactions] = useState(() => initResult.transactions);

  const [recoveryState, setRecoveryState] = useState(() => {
    if (initResult.status === 'unavailable') return STORAGE_UNAVAILABLE;
    if (initResult.status === 'corrupt' || initResult.status === 'partial') return RECOVERY_PENDING;
    return RECOVERY_NORMAL;
  });

  const [backupKey, setBackupKey] = useState(null);
  const [skippedCount] = useState(() => initResult.skippedCount);
  const [loadStatus] = useState(() => initResult.status);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Track whether a real mutation has occurred to trigger persistence
  const [pendingWrite, setPendingWrite] = useState(false);

  // Track recovery backup idempotency
  const backupAttemptedRef = useRef(false);

  // ── Toast helper ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  // ── Recovery backup (runs once after mount when needed) ───────────
  useEffect(() => {
    if (
      recoveryState !== RECOVERY_PENDING ||
      backupAttemptedRef.current ||
      !initResult.rawValue
    ) {
      return;
    }

    backupAttemptedRef.current = true;

    const result = createBackup(initResult.rawValue);
    if (result.success) {
      setBackupKey(result.backupKey);
      // Stay in recoveryPending — user must acknowledge
    } else {
      setRecoveryState(PERSISTENCE_BLOCKED);
    }
  }, [recoveryState, initResult.rawValue]);

  // ── Persistence effect — only after real user mutations ───────────
  useEffect(() => {
    if (!pendingWrite) return;
    if (recoveryState === RECOVERY_PENDING || recoveryState === PERSISTENCE_BLOCKED) return;
    if (recoveryState === STORAGE_UNAVAILABLE) {
      // Attempt anyway — might succeed now
      const result = saveTransactions(transactions);
      if (result.success) {
        setRecoveryState(RECOVERY_NORMAL);
        setPendingWrite(false);
        showToast('Changes saved successfully.');
      } else {
        setPendingWrite(false);
      }
      return;
    }

    const result = saveTransactions(transactions);
    if (result.success) {
      setPendingWrite(false);
    } else {
      setRecoveryState(STORAGE_UNAVAILABLE);
      setPendingWrite(false);
    }
  }, [pendingWrite, transactions, recoveryState, showToast]);

  // ── Mutation check ────────────────────────────────────────────────
  const canMutate =
    recoveryState === RECOVERY_NORMAL ||
    recoveryState === RECOVERY_ACKNOWLEDGED;

  const mutationBlockedReason =
    recoveryState === RECOVERY_PENDING
      ? 'Please acknowledge the data recovery notice before making changes.'
      : recoveryState === PERSISTENCE_BLOCKED
        ? 'Please acknowledge the persistence warning before making changes.'
        : null;

  // ── CRUD operations ───────────────────────────────────────────────
  const addTransaction = useCallback(
    (data) => {
      if (!canMutate) return;
      const now = new Date().toISOString();
      const newTransaction = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        isSample: false,
      };
      setTransactions((prev) => [...prev, newTransaction]);
      setPendingWrite(true);
      showToast('Transaction added successfully.');
    },
    [canMutate, showToast],
  );

  const editTransaction = useCallback(
    (id, data) => {
      if (!canMutate) return;
      const now = new Date().toISOString();
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, updatedAt: now, isSample: false }
            : t,
        ),
      );
      setPendingWrite(true);
      showToast('Transaction updated successfully.');
    },
    [canMutate, showToast],
  );

  const deleteTransaction = useCallback(
    (id) => {
      if (!canMutate) return;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setPendingWrite(true);
      showToast('Transaction deleted.');
    },
    [canMutate, showToast],
  );

  // ── Sample data ───────────────────────────────────────────────────
  const loadSampleData = useCallback(
    (sampleTransactions) => {
      if (!canMutate) return;
      setTransactions((prev) => [...prev, ...sampleTransactions]);
      setPendingWrite(true);
      showToast('Sample data loaded successfully.');
    },
    [canMutate, showToast],
  );

  const removeSampleData = useCallback(() => {
    if (!canMutate) return;
    setTransactions((prev) => prev.filter((t) => !t.isSample));
    setPendingWrite(true);
    showToast('Sample data removed.');
  }, [canMutate, showToast]);

  const sampleCount = transactions.filter((t) => t.isSample).length;

  // ── Recovery acknowledgment ───────────────────────────────────────
  const acknowledgeRecovery = useCallback(() => {
    if (recoveryState === RECOVERY_PENDING) {
      setRecoveryState(RECOVERY_ACKNOWLEDGED);
    } else if (recoveryState === PERSISTENCE_BLOCKED) {
      // User explicitly accepts the risk
      setRecoveryState(RECOVERY_ACKNOWLEDGED);
    }
  }, [recoveryState]);

  // ── Retry persistence ─────────────────────────────────────────────
  const retryPersistence = useCallback(() => {
    if (recoveryState === RECOVERY_PENDING || recoveryState === PERSISTENCE_BLOCKED) return;
    setPendingWrite(true);
  }, [recoveryState]);

  return {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    loadSampleData,
    removeSampleData,
    sampleCount,
    canMutate,
    mutationBlockedReason,
    recoveryState,
    backupKey,
    skippedCount,
    loadStatus,
    acknowledgeRecovery,
    retryPersistence,
    toast,
    showToast,
    dismissToast,
  };
}
