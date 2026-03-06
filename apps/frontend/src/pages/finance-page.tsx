import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { financeService } from '../services/finance.service';
import { PageHeader } from '../components/ui/page-header';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function FinancePage() {
  const { data: profitability = [], isLoading } = useQuery({
    queryKey: ['profitability'],
    queryFn: financeService.getProfitability,
  });

  const sorted = [...profitability].sort((a, b) => b.grossMarginRatio - a.grossMarginRatio);
  const chartData = sorted.map((r) => ({
    name: r.recipeName.length > 20 ? r.recipeName.slice(0, 18) + '…' : r.recipeName,
    foodCost: Math.round(r.foodCostRatio * 1000) / 10,
    margin: Math.round(r.grossMarginRatio * 1000) / 10,
    raw: r,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Analyse Financière"
        subtitle="Rentabilité et food cost de vos recettes en temps réel"
      />

      {isLoading && (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      )}

      {!isLoading && profitability.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          Aucune recette configurée. Créez des recettes pour voir leur rentabilité.
        </div>
      )}

      {profitability.length > 0 && (
        <>
          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Marge brute par recette (%)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.margin >= 70 ? '#22c55e' : entry.margin >= 50 ? '#f97316' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Recette', 'Prix de vente', 'Food cost', 'Food cost %', 'Marge brute', 'Marge %'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((r) => {
                  const marginPct = Math.round(r.grossMarginRatio * 1000) / 10;
                  const isGood = marginPct >= 70;
                  return (
                    <tr key={r.recipeId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                        {isGood
                          ? <TrendingUp size={14} className="text-green-500" />
                          : <TrendingDown size={14} className="text-red-500" />}
                        {r.recipeName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.sellingPrice.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-gray-700">{r.foodCost.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${r.foodCostRatio > 0.35 ? 'text-red-600' : 'text-gray-700'}`}>
                          {Math.round(r.foodCostRatio * 1000) / 10}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">{r.grossMargin.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${isGood ? 'text-green-600' : marginPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {marginPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
