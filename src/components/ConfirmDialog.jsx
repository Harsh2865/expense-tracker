import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Confirmation dialog with accessible modal semantics.
 * Traps keyboard focus, closes on Escape, returns focus to opener.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const openerRef = useRef(null);

  // Capture the element that opened the dialog
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus trap and Escape handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the cancel button when dialog opens
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  if (!isOpen) return null;

  const confirmColors =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="modal-content p-6 max-w-md"
      >
        <div className="flex items-start gap-4">
          {variant === 'danger' && (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
          )}
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-900 mb-1"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-sm text-gray-600"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
