import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters.js';

/**
 * Single transaction list item with distinct regions:
 * - Icon region (fixed shrink-0)
 * - Details region (flex-1 min-w-0):
 *   - Row 1: Title and Amount (arranged on first row when space permits, wraps cleanly when narrow)
 *   - Row 2: Category and Date on a dedicated metadata row with controlled wrapping
 *   - Row 3: Notes (wrapped cleanly without horizontal overflow)
 * - Actions region (Edit and Delete buttons with touch-accessible tap targets)
 */
export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  canMutate,
  mutationBlockedReason,
}) {
  const { title, amount, type, category, date, notes, isSample } = transaction;
  const isIncome = type === 'income';

  return (
    <div className="group flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:px-4 sm:py-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
      {/* 1. Icon Region */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
          isIncome ? 'bg-emerald-50' : 'bg-red-50'
        }`}
      >
        {isIncome ? (
          <TrendingUp size={18} className="text-emerald-600" />
        ) : (
          <TrendingDown size={18} className="text-red-600" />
        )}
      </div>

      {/* 2. Details & Amount Region */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Title + Amount (shares row when space permits, amount wraps to separate line on narrow viewports/long titles) */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <div className="flex items-start gap-1.5 min-w-0 max-w-full">
            <p
              className="text-sm font-semibold text-gray-900 break-words line-clamp-2"
              title={title}
            >
              {title}
            </p>
            {isSample && (
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0 mt-0.5">
                Sample
              </span>
            )}
          </div>

          <div className="shrink-0 ml-auto sm:ml-0">
            <p
              className={`text-sm sm:text-base font-bold whitespace-nowrap tracking-tight ${
                isIncome ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {isIncome ? '+' : '−'} {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Row 2: Category and Date on a separate metadata row with controlled wrapping */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500">
          <span
            className="font-medium text-gray-600 break-words"
            title={category}
          >
            {category}
          </span>
          <span className="text-gray-300 shrink-0" aria-hidden="true">
            ·
          </span>
          <span className="whitespace-nowrap shrink-0">{formatDate(date)}</span>
        </div>

        {/* Row 3: Notes if present */}
        {notes && (
          <p
            className="text-xs text-gray-400 mt-1 break-words line-clamp-2"
            title={notes}
          >
            {notes}
          </p>
        )}
      </div>

      {/* 3. Actions Region */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 self-start sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity ml-1 mt-0.5 sm:mt-0">
        <button
          onClick={() => onEdit(transaction)}
          disabled={!canMutate}
          aria-label={`Edit ${title}`}
          aria-describedby={!canMutate ? 'recovery-notice' : undefined}
          title={!canMutate ? mutationBlockedReason : `Edit ${title}`}
          className="p-1.5 sm:p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(transaction)}
          disabled={!canMutate}
          aria-label={`Delete ${title}`}
          aria-describedby={!canMutate ? 'recovery-notice' : undefined}
          title={!canMutate ? mutationBlockedReason : `Delete ${title}`}
          className="p-1.5 sm:p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
