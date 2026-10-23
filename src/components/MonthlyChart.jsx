import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getMonthlySeries } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatters.js';
import { formatMonthYear } from '../utils/dates.js';

/**
 * Custom tooltip for the monthly income vs expenses bar chart.
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-xs">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2.5 h-2.5 rounded-xs"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 font-medium">{entry.name}:</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Chart A: Monthly Income versus Expenses (6 consecutive months ending at selectedMonth).
 */
export default function MonthlyChart({ transactions, selectedMonth }) {
  const series = getMonthlySeries(transactions, selectedMonth);

  // Convert paise to rupees for display in Recharts
  const data = series.map((item) => ({
    name: item.label,
    monthKey: item.month,
    income: item.incomePaise / 100,
    expenses: item.expensesPaise / 100,
  }));

  const allZero = data.every((d) => d.income === 0 && d.expenses === 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Income vs. Expenses
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            6-month trend ending {formatMonthYear(selectedMonth)}
          </p>
        </div>
      </div>

      {allZero ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            No income or expense data in this 6-month period
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Transactions added in these months will automatically display here
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-gray-700 font-medium">{value}</span>
                )}
              />
              <Bar
                name="+ Income"
                dataKey="income"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                name="− Expense"
                dataKey="expenses"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
