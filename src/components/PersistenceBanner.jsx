import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Persistent warning banner when Local Storage is unavailable or a write fails.
 * Informs the user that changes are in memory-only mode and may not survive a reload.
 * Provides a Retry button.
 */
export default function PersistenceBanner({
  recoveryState,
  onRetry,
}) {
  if (recoveryState !== 'storageUnavailable') {
    return null;
  }

  return (
    <div
      role="alert"
      className="bg-red-500 text-white px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium shadow-sm flex items-center justify-between gap-3 flex-wrap"
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="shrink-0" />
        <span>
          Storage is unavailable. Changes are currently held in memory only and will not survive a page refresh.
        </span>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 hover:bg-red-50 rounded-md font-semibold text-xs transition-colors shrink-0 shadow-xs"
      >
        <RefreshCw size={13} />
        Retry Saving
      </button>
    </div>
  );
}
