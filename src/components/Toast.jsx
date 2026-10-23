import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Toast notification component.
 * Uses aria-live="polite" for screen reader announcements.
 */
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={18} className="shrink-0" />,
    error: <AlertCircle size={18} className="shrink-0" />,
    info: <Info size={18} className="shrink-0" />,
  };

  const colors = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[60] max-w-sm"
    >
      <div
        key={toast.id}
        className={`toast-enter flex items-center gap-2 px-4 py-3 rounded-lg border shadow-md ${colors[toast.type] || colors.info}`}
      >
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium flex-1">{toast.message}</span>
        <button
          onClick={onDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
