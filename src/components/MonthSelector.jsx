import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { formatMonthYear, canGoPrevious, canGoNext } from '../utils/dates.js';

/**
 * Month selector with previous/next/current-month controls.
 */
export default function MonthSelector({ selectedMonth, onMonthChange, currentMonth }) {
  const canPrev = canGoPrevious(selectedMonth);
  const canNext = canGoNext(selectedMonth);
  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={() => {
          if (canPrev) {
            const [y, m] = selectedMonth.split('-').map(Number);
            const prev = m === 1
              ? `${y - 1}-12`
              : `${y}-${String(m - 1).padStart(2, '0')}`;
            onMonthChange(prev);
          }
        }}
        disabled={!canPrev}
        aria-disabled={!canPrev}
        aria-label="Previous month"
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm font-semibold text-gray-700 min-w-[130px] text-center select-none">
        {formatMonthYear(selectedMonth)}
      </span>

      <button
        onClick={() => {
          if (canNext) {
            const [y, m] = selectedMonth.split('-').map(Number);
            const next = m === 12
              ? `${y + 1}-01`
              : `${y}-${String(m + 1).padStart(2, '0')}`;
            onMonthChange(next);
          }
        }}
        disabled={!canNext}
        aria-disabled={!canNext}
        aria-label="Next month"
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => onMonthChange(currentMonth)}
          aria-label="Current month"
          title="Go to current month"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-indigo-600 transition-colors ml-1"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}
