import { Plus } from 'lucide-react';
import MonthSelector from './MonthSelector.jsx';
import { formatHeaderDate } from '../utils/formatters.js';

/**
 * Page header with title, date, month selector, and Add Transaction button.
 */
export default function Header({
  currentView,
  selectedMonth,
  onMonthChange,
  currentMonth,
  onAddTransaction,
  canMutate,
  mutationBlockedReason,
}) {
  const title = currentView === 'dashboard' ? 'Dashboard' : 'Transactions';

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{formatHeaderDate()}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
            currentMonth={currentMonth}
          />

          <button
            id="header-add-transaction"
            onClick={onAddTransaction}
            disabled={!canMutate}
            aria-describedby={!canMutate ? 'recovery-notice' : undefined}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title={!canMutate ? mutationBlockedReason : 'Add a new transaction'}
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>
    </header>
  );
}
