import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { financeService } from '../services/finance.service';
import { stocksService } from '../services/stocks.service';
import { StatCard } from '../components/ui/stat-card';
import { AlertBadge } from '../components/ui/alert-badge';
import { PageHeader } from '../components/ui/page-header';
import { useAuthStore } from '../store/auth.store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: financeService.getDashboard,
  });

  const { data: dlcAlerts = [] } = useQuery({
    queryKey: ['dlc-alerts'],
    queryFn: stocksService.getDlcAlerts,
  });

  const criticalAlerts = dlcAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = dlcAlerts.filter((a) => a.severity === 'warning');

  return (
    <div className="p-8">
      <PageHeader
        title={`Bonjour, ${user?.firstName} 👋`}
        subtitle="Voici l'état de votre cuisine en temps réel"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Ingrédients en stock"
          value={dashboard?.totalIngredients ?? '—'}
          icon={<Package size={20} />}
        />
        <StatCard
          label="Alertes stock bas"
          value={dashboard?.lowStockAlerts ?? '—'}
          icon={<AlertTriangle size={20} />}
          className={dashboard?.lowStockAlerts ? 'border-yellow-200' : ''}
        />
        <StatCard
          label="Alertes DLC"
          value={dashboard?.dlcAlerts ?? '—'}
          icon={<Clock size={20} />}
          className={dashboard?.dlcAlerts ? 'border-red-200' : ''}
        />
        <StatCard
          label="Food cost moyen"
          value={dashboard ? `${dashboard.avgFoodCostRatio.toFixed(1)}%` : '—'}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* DLC Alerts */}
      {dlcAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock size={18} className="text-red-500" />
            <h2 className="font-semibold text-gray-900">Alertes DLC</h2>
            {criticalAlerts.length > 0 && (
              <AlertBadge severity="critical" label={`${criticalAlerts.length} critique(s)`} />
            )}
            {warningAlerts.length > 0 && (
              <AlertBadge severity="warning" label={`${warningAlerts.length} avertissement(s)`} />
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {dlcAlerts.slice(0, 8).map((alert, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{alert.ingredient.name}</p>
                  <p className="text-xs text-gray-500">
                    Expire le {new Date(alert.expiryDate).toLocaleDateString('fr-FR')} ·{' '}
                    {alert.lot.remainingQuantity} {alert.ingredient.unit} restants
                  </p>
                </div>
                <AlertBadge
                  severity={alert.severity}
                  label={
                    alert.daysUntilExpiry <= 0
                      ? 'Expiré'
                      : alert.daysUntilExpiry === 1
                      ? 'Demain'
                      : `J-${alert.daysUntilExpiry}`
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top / Bottom recipes */}
      {(dashboard?.topProfitRecipe || dashboard?.topLossRecipe) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dashboard.topProfitRecipe && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                Meilleure marge
              </p>
              <p className="font-bold text-gray-900">{dashboard.topProfitRecipe.recipeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                Marge : <span className="text-green-600 font-semibold">
                  {(dashboard.topProfitRecipe.grossMarginRatio * 100).toFixed(1)}%
                </span>
                {' '}· Food cost : {dashboard.topProfitRecipe.foodCost.toFixed(2)} €
              </p>
            </div>
          )}
          {dashboard.topLossRecipe && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                À optimiser
              </p>
              <p className="font-bold text-gray-900">{dashboard.topLossRecipe.recipeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                Marge : <span className="text-red-600 font-semibold">
                  {(dashboard.topLossRecipe.grossMarginRatio * 100).toFixed(1)}%
                </span>
                {' '}· Food cost : {dashboard.topLossRecipe.foodCost.toFixed(2)} €
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
