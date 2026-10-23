import { Inbox } from 'lucide-react';

/**
 * Empty state component displayed when there are no items to show.
 */
export default function EmptyState({
  title = 'No transactions yet',
  message = 'Start by adding your first transaction.',
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {action && actionLabel && (
          <button
            onClick={action}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
        {secondaryAction && secondaryActionLabel && (
          <button
            onClick={secondaryAction}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
