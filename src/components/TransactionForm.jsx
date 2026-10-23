import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { getCategoriesForType, isCategoryValidForType } from '../utils/categories.js';
import { validateTransaction } from '../utils/validation.js';
import { getLocalDateString } from '../utils/dates.js';

/**
 * Accessible modal form for adding/editing transactions.
 * - Uses text input with inputMode="decimal" for amounts
 * - Category resets when type changes to invalidate selection
 * - Validation errors use aria-describedby and aria-invalid
 * - Focus trap with Escape to close and focus return
 */
export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: getLocalDateString(),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const openerRef = useRef(null);

  const isEditing = !!editingTransaction;

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement;
      if (editingTransaction) {
        setFormData({
          title: editingTransaction.title,
          amount: String(editingTransaction.amount),
          type: editingTransaction.type,
          category: editingTransaction.category,
          date: editingTransaction.date,
          notes: editingTransaction.notes || '',
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          type: 'expense',
          category: 'Food',
          date: getLocalDateString(),
          notes: '',
        });
      }
      setErrors({});
      // Focus after animation
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen, editingTransaction]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [isOpen]);

  // Focus trap and Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
  }, [isOpen, onClose]);

  // Category-reset on type change
  const handleTypeChange = useCallback((newType) => {
    setFormData((prev) => {
      const categories = getCategoriesForType(newType);
      const categoryValid = isCategoryValidForType(prev.category, newType);
      return {
        ...prev,
        type: newType,
        category: categoryValid ? prev.category : categories[0],
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.type;
      delete next.category;
      return next;
    });
  }, []);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const result = validateTransaction(formData);
      if (!result.valid) {
        setErrors(result.errors);
        return;
      }
      onSubmit(result.data);
      onClose();
    },
    [formData, onSubmit, onClose],
  );

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  const categories = getCategoriesForType(formData.type);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id="transaction-form-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="tx-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              id="tx-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'tx-title-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g. Grocery shopping"
              autoComplete="off"
            />
            {errors.title && (
              <p id="tx-title-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="tx-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="tx-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'tx-amount-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g. 1500.50"
            />
            {errors.amount && (
              <p id="tx-amount-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="flex gap-3" role="radiogroup" aria-label="Transaction type">
              {['expense', 'income'].map((t) => (
                <label
                  key={t}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    formData.type === t
                      ? t === 'expense'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={formData.type === t}
                    onChange={() => handleTypeChange(t)}
                    className="sr-only"
                  />
                  <span>{t === 'expense' ? '− Expense' : '+ Income'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="tx-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <select
              id="tx-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'tx-category-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p id="tx-category-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="tx-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="tx-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'tx-date-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p id="tx-date-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.date}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="tx-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="tx-notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Additional details..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
