import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrencyPaise } from '../utils/formatters.js';

const CARD_CONFIGS = {
  balance: {
    icon: Wallet,
    label: 'Current Balance',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    valueColor: (paise) => (paise >= 0 ? 'text-violet-700' : 'text-red-600'),
    borderColor: 'border-l-violet-500',
  },
  income: {
    icon: TrendingUp,
    label: 'Income',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: () => 'text-emerald-700',
    borderColor: 'border-l-emerald-500',
    sign: '+',
  },
  expenses: {
    icon: TrendingDown,
    label: 'Expenses',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: () => 'text-red-700',
    borderColor: 'border-l-red-500',
    sign: '−',
  },
  savings: {
    icon: PiggyBank,
    label: 'Net Savings',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: (paise) => (paise >= 0 ? 'text-blue-700' : 'text-red-600'),
    borderColor: 'border-l-blue-500',
  },
};

/**
 * Reusable summary card for financial metrics.
 */
export default function SummaryCard({ type, amountPaise, monthLabel }) {
  const config = CARD_CONFIGS[type];
  if (!config) return null;

  const Icon = config.icon;
  const formatted = formatCurrencyPaise(Math.abs(amountPaise));
  const prefix = config.sign
    ? config.sign
    : amountPaise < 0
      ? '−'
      : '';
  const displayValue = amountPaise < 0 && !config.sign
    ? `−${formatted}`
    : config.sign
      ? `${prefix}${formatted}`
      : formatted;

  const subtitle = type === 'balance'
    ? 'All time'
    : monthLabel || '';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${config.borderColor} p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{config.label}</p>
        <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center`}>
          <Icon size={18} className={config.iconColor} />
        </div>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${config.valueColor(amountPaise)} tracking-tight`}>
        {displayValue}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
