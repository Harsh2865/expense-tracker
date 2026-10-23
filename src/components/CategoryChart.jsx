import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { getCategoryTotals } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatters.js';
import { formatMonthYear } from '../utils/dates.js';
import { CATEGORY_COLORS } from '../utils/categories.js';

/**
 * Custom tooltip for the category doughnut chart.
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-2.5 border border-gray-200 rounded-lg shadow-md text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-semibold text-gray-800">{data.name}</span>
        </div>
        <p className="text-gray-900 font-bold">
          {formatCurrency(data.value)} ({data.payload.percent}%)
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Chart B: Expense breakdown by category for the global selectedMonth.
 */
export default function CategoryChart({ transactions, selectedMonth }) {
  const categoryTotals = getCategoryTotals(transactions, selectedMonth);

  const totalExpensePaise = categoryTotals.reduce(
    (sum, c) => sum + c.totalPaise,
    0,
  );

  const data = categoryTotals.map((item) => {
    const rupees = item.totalPaise / 100;
    const percent =
      totalExpensePaise > 0
        ? Math.round((item.totalPaise / totalExpensePaise) * 100)
        : 0;
    return {
      name: item.category,
      value: rupees,
      percent,
      fill: CATEGORY_COLORS[item.category] || '#64748b',
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">
          Expense Breakdown — {formatMonthYear(selectedMonth)}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Distribution of expenses across categories
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            No expenses recorded for {formatMonthYear(selectedMonth)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Expenses added for this month will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Doughnut Chart */}
          <div className="w-full sm:w-1/2 h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible Category Table / Legend */}
          <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left" aria-label="Category expense breakdown">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium">
                  <th scope="col" className="pb-1.5 font-normal">Category</th>
                  <th scope="col" className="pb-1.5 font-normal text-right">Amount</th>
                  <th scope="col" className="pb-1.5 font-normal text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50/50">
                    <td className="py-1.5 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-700 truncate max-w-[100px]">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-1.5 text-right font-semibold text-gray-900">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="py-1.5 text-right text-gray-500 font-mono">
                      {item.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
