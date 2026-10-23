import { useState, useCallback, useMemo } from 'react';
import { Plus, ArrowRight, Trash2, Database } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import MobileNav from './components/MobileNav.jsx';
import Header from './components/Header.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import TransactionList from './components/TransactionList.jsx';
import TransactionFilters from './components/TransactionFilters.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import MonthlyChart from './components/MonthlyChart.jsx';
import CategoryChart from './components/CategoryChart.jsx';
import RecoveryNotice from './components/RecoveryNotice.jsx';
import PersistenceBanner from './components/PersistenceBanner.jsx';
import Toast from './components/Toast.jsx';

import { useTransactions } from './hooks/useTransactions.js';
import { useTransactionFilters } from './hooks/useTransactionFilters.js';
import {
  getCurrentBalancePaise,
  getMonthlySummary,
  getRecentTransactions,
} from './utils/calculations.js';
import { applyFilters } from './utils/filters.js';
import { getCurrentMonth, formatMonthYear } from './utils/dates.js';
import { generateSampleData } from './utils/sampleData.js';

export default function App() {
  // ── Navigation & View ─────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('dashboard');

  // ── Global Selected Month (YYYY-MM) ──────────────────────────────
  const currentLocalMonth = useMemo(() => getCurrentMonth(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentLocalMonth);

  // ── Transaction state & persistence hook ──────────────────────────
  const {
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
    dismissToast,
  } = useTransactions();

  // ── Transaction filter state hook ─────────────────────────────────
  const {
    filters,
    setSearch,
    setType,
    setCategory,
    setMonthScope,
    setSortOrder,
    clearFilters,
  } = useTransactionFilters();

  // ── Dialog states ─────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    transaction: null,
  });

  const [sampleDeleteConfirm, setSampleDeleteConfirm] = useState(false);

  // ── Financial metrics ─────────────────────────────────────────────
  const currentBalancePaise = useMemo(
    () => getCurrentBalancePaise(transactions),
    [transactions],
  );

  const monthlySummary = useMemo(
    () => getMonthlySummary(transactions, selectedMonth),
    [transactions, selectedMonth],
  );

  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions),
    [transactions],
  );

  const filteredTransactions = useMemo(
    () => applyFilters(transactions, filters, selectedMonth),
    [transactions, filters, selectedMonth],
  );

  const monthLabel = useMemo(
    () => formatMonthYear(selectedMonth),
    [selectedMonth],
  );

  // ── Form handlers ─────────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    if (!canMutate) return;
    setEditingTransaction(null);
    setIsFormOpen(true);
  }, [canMutate]);

  const handleOpenEdit = useCallback(
    (transaction) => {
      if (!canMutate) return;
      setEditingTransaction(transaction);
      setIsFormOpen(true);
    },
    [canMutate],
  );

  const handleFormSubmit = useCallback(
    (data) => {
      if (editingTransaction) {
        editTransaction(editingTransaction.id, data);
      } else {
        addTransaction(data);
      }
      setIsFormOpen(false);
      setEditingTransaction(null);
    },
    [editingTransaction, editTransaction, addTransaction],
  );

  // ── Delete handlers ───────────────────────────────────────────────
  const handleOpenDelete = useCallback(
    (transaction) => {
      if (!canMutate) return;
      setDeleteConfirm({ isOpen: true, transaction });
    },
    [canMutate],
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirm.transaction) {
      deleteTransaction(deleteConfirm.transaction.id);
    }
    setDeleteConfirm({ isOpen: false, transaction: null });
  }, [deleteConfirm.transaction, deleteTransaction]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ isOpen: false, transaction: null });
  }, []);

  // ── Sample data handlers ──────────────────────────────────────────
  const handleLoadSample = useCallback(() => {
    if (!canMutate) return;
    const sample = generateSampleData();
    loadSampleData(sample);
  }, [canMutate, loadSampleData]);

  const handleConfirmRemoveSample = useCallback(() => {
    removeSampleData();
    setSampleDeleteConfirm(false);
  }, [removeSampleData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col antialiased text-gray-900 pb-16 lg:pb-0">
      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Storage Unavailable Warning Banner */}
      <PersistenceBanner
        recoveryState={recoveryState}
        onRetry={retryPersistence}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar (lg and above) */}
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Header */}
          <Header
            currentView={currentView}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            currentMonth={currentLocalMonth}
            onAddTransaction={handleOpenAdd}
            canMutate={canMutate}
            mutationBlockedReason={mutationBlockedReason}
          />

          {/* Recovery Notice (Corrupt / Partial data) */}
          <RecoveryNotice
            recoveryState={recoveryState}
            loadStatus={loadStatus}
            backupKey={backupKey}
            skippedCount={skippedCount}
            onAcknowledge={acknowledgeRecovery}
          />

          {/* View Container */}
          <div className="p-4 sm:p-6 pb-28 lg:pb-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* ── DASHBOARD VIEW ────────────────────────────────────── */}
            {currentView === 'dashboard' && (
              <>
                {/* Summary Cards Grid */}
                <section
                  aria-label="Financial overview"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <SummaryCard
                    type="balance"
                    amountPaise={currentBalancePaise}
                  />
                  <SummaryCard
                    type="income"
                    amountPaise={monthlySummary.incomePaise}
                    monthLabel={monthLabel}
                  />
                  <SummaryCard
                    type="expenses"
                    amountPaise={monthlySummary.expensesPaise}
                    monthLabel={monthLabel}
                  />
                  <SummaryCard
                    type="savings"
                    amountPaise={monthlySummary.savingsPaise}
                    monthLabel={monthLabel}
                  />
                </section>

                {/* Sample Data Controls Bar */}
                {sampleCount > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-amber-600 shrink-0" />
                      <span>
                        Showing {sampleCount} sample {sampleCount === 1 ? 'transaction' : 'transactions'}.
                      </span>
                    </div>
                    <button
                      onClick={() => setSampleDeleteConfirm(true)}
                      disabled={!canMutate}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 self-start sm:self-auto"
                    >
                      <Trash2 size={13} />
                      Remove Sample Data
                    </button>
                  </div>
                )}

                {/* Charts Grid */}
                <section
                  aria-label="Financial charts"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <MonthlyChart
                    transactions={transactions}
                    selectedMonth={selectedMonth}
                  />
                  <CategoryChart
                    transactions={transactions}
                    selectedMonth={selectedMonth}
                  />
                </section>

                {/* Recent Transactions Section */}
                <section
                  aria-label="Recent transactions"
                  className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Recent Transactions
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Latest 5 transactions across all months
                      </p>
                    </div>

                    {transactions.length > 0 && (
                      <button
                        onClick={() => setCurrentView('transactions')}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        View all
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>

                  <TransactionList
                    transactions={recentTransactions}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    canMutate={canMutate}
                    mutationBlockedReason={mutationBlockedReason}
                    emptyTitle="No transactions yet"
                    emptyMessage="Get started by recording your first transaction or loading sample data."
                    emptyAction={handleOpenAdd}
                    emptyActionLabel="Add Transaction"
                    emptySecondaryAction={handleLoadSample}
                    emptySecondaryActionLabel="Load Sample Data"
                  />
                </section>
              </>
            )}

            {/* ── TRANSACTIONS VIEW ─────────────────────────────────── */}
            {currentView === 'transactions' && (
              <div className="space-y-4">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      All Transactions
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {filteredTransactions.length} of {transactions.length} transactions displayed
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {sampleCount > 0 && (
                      <button
                        onClick={() => setSampleDeleteConfirm(true)}
                        disabled={!canMutate}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Remove Sample Data ({sampleCount})
                      </button>
                    )}

                    <button
                      id="view-add-transaction"
                      onClick={handleOpenAdd}
                      disabled={!canMutate}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Plus size={16} />
                      Add Transaction
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <TransactionFilters
                  filters={filters}
                  onSearchChange={setSearch}
                  onTypeChange={setType}
                  onCategoryChange={setCategory}
                  onMonthScopeChange={setMonthScope}
                  onSortChange={setSortOrder}
                  onClearFilters={clearFilters}
                  selectedMonth={selectedMonth}
                />

                {/* Filtered Transactions List */}
                <TransactionList
                  transactions={filteredTransactions}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  canMutate={canMutate}
                  mutationBlockedReason={mutationBlockedReason}
                  emptyTitle={
                    transactions.length === 0
                      ? 'No transactions recorded'
                      : 'No matching transactions'
                  }
                  emptyMessage={
                    transactions.length === 0
                      ? 'Add your first transaction or load realistic sample data.'
                      : 'Try adjusting your filters or search keywords to find what you are looking for.'
                  }
                  emptyAction={
                    transactions.length === 0 ? handleOpenAdd : clearFilters
                  }
                  emptyActionLabel={
                    transactions.length === 0 ? 'Add Transaction' : 'Clear Filters'
                  }
                  emptySecondaryAction={
                    transactions.length === 0 ? handleLoadSample : undefined
                  }
                  emptySecondaryActionLabel={
                    transactions.length === 0 ? 'Load Sample Data' : undefined
                  }
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation (below lg) */}
      <MobileNav
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* Floating Action Button (Mobile/Tablet only) */}
      <button
        id="floating-add-transaction"
        onClick={handleOpenAdd}
        disabled={!canMutate}
        aria-label="Add transaction"
        aria-describedby={!canMutate ? 'recovery-notice' : undefined}
        title={!canMutate ? mutationBlockedReason : 'Add transaction'}
        className="sm:hidden fixed right-4 bottom-20 z-40 w-13 h-13 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Plus size={24} />
      </button>

      {/* Add / Edit Transaction Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
      />

      {/* Single Transaction Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Transaction"
        message={
          deleteConfirm.transaction
            ? `Are you sure you want to delete "${deleteConfirm.transaction.title}" (₹${deleteConfirm.transaction.amount.toFixed(2)})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Sample Data Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={sampleDeleteConfirm}
        title="Remove Sample Data"
        message={`Are you sure you want to remove all ${sampleCount} sample transactions? Any transactions you created or customized will be kept.`}
        confirmLabel="Remove Sample Data"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemoveSample}
        onCancel={() => setSampleDeleteConfirm(false)}
      />
    </div>
  );
}
