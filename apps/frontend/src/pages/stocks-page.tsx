import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { stocksService } from '../services/stocks.service';
import { ingredientsService } from '../services/ingredients.service';
import { PageHeader } from '../components/ui/page-header';
import { AlertBadge } from '../components/ui/alert-badge';
import type { CreateStockLotDto } from '@chefai/shared';

type Tab = 'movements' | 'lots' | 'dlc';

export function StocksPage() {
  const [tab, setTab] = useState<Tab>('lots');
  const [showAddLot, setShowAddLot] = useState(false);
  const qc = useQueryClient();

  const { data: lots = [] } = useQuery({ queryKey: ['lots'], queryFn: stocksService.getLots });
  const { data: movements = [] } = useQuery({ queryKey: ['movements'], queryFn: () => stocksService.getMovements() });
  const { data: dlcAlerts = [] } = useQuery({ queryKey: ['dlc-alerts'], queryFn: stocksService.getDlcAlerts });
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientsService.getAll });

  const addLotMutation = useMutation({
    mutationFn: stocksService.addLot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lots'] });
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAddLot(false);
    },
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'lots', label: 'Lots en stock', count: lots.length },
    { id: 'movements', label: 'Mouvements', count: movements.length },
    { id: 'dlc', label: 'Alertes DLC', count: dlcAlerts.length },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Gestion des Stocks"
        subtitle="Suivi en temps réel de vos entrées et sorties"
        action={
          <button
            onClick={() => setShowAddLot(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            <Plus size={16} /> Réception lot
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lots */}
      {tab === 'lots' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Ingrédient', 'Lot', 'Quantité restante', 'Date expiration', 'Reçu le'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{lot.ingredient?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{lot.lotNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${Number(lot.remainingQuantity) < 1 ? 'text-red-600' : 'text-gray-900'}`}>
                      {lot.remainingQuantity} {lot.ingredient?.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(lot.expiryDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(lot.receivedAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun lot en stock</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Movements */}
      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Type', 'Ingrédient', 'Quantité', 'Raison', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {m.type === 'in' ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium"><ArrowUp size={14} /> Entrée</span>
                    ) : m.type === 'waste' ? (
                      <span className="flex items-center gap-1 text-red-600 font-medium"><Trash2 size={14} /> Déchet</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600 font-medium"><ArrowDown size={14} /> Sortie</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.ingredient?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{m.quantity} {m.ingredient?.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{m.reason ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun mouvement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DLC Alerts */}
      {tab === 'dlc' && (
        <div className="space-y-3">
          {dlcAlerts.map((alert, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{alert.ingredient.name}</p>
                <p className="text-sm text-gray-500">
                  Lot · {alert.lot.remainingQuantity} {alert.ingredient.unit} restants ·
                  Expire le {new Date(alert.expiryDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <AlertBadge
                severity={alert.severity}
                label={alert.daysUntilExpiry <= 0 ? 'Expiré' : `J-${alert.daysUntilExpiry}`}
              />
            </div>
          ))}
          {dlcAlerts.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              Aucune alerte DLC 🎉
            </div>
          )}
        </div>
      )}

      {/* Add Lot Modal */}
      {showAddLot && (
        <AddLotModal
          ingredients={ingredients}
          onSubmit={(dto) => addLotMutation.mutate(dto)}
          onClose={() => setShowAddLot(false)}
          loading={addLotMutation.isPending}
        />
      )}
    </div>
  );
}

function AddLotModal({
  ingredients,
  onSubmit,
  onClose,
  loading,
}: {
  ingredients: import('@chefai/shared').Ingredient[];
  onSubmit: (dto: CreateStockLotDto) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateStockLotDto>({
    ingredientId: '',
    quantity: 0,
    expiryDate: '',
    lotNumber: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Réception d'un lot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingrédient</label>
            <select
              value={form.ingredientId}
              onChange={(e) => setForm((f) => ({ ...f, ingredientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Sélectionner...</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
            <input
              type="number"
              min="0"
              step="0.001"
              value={form.quantity || ''}
              onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (DLC)</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° de lot (optionnel)</label>
            <input
              type="text"
              value={form.lotNumber ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, lotNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={loading || !form.ingredientId || !form.quantity || !form.expiryDate}
            className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 transition"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
