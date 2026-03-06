import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { ingredientsService } from '../services/ingredients.service';
import { PageHeader } from '../components/ui/page-header';
import type { CreateIngredientDto, Ingredient, StockUnit } from '@chefai/shared';

const UNITS: StockUnit[] = ['kg', 'g', 'l', 'ml', 'unit', 'portion'];
const CATEGORIES = ['Viandes', 'Poissons', 'Légumes', 'Fruits', 'Produits laitiers', 'Épicerie', 'Boissons', 'Autre'];

export function IngredientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const qc = useQueryClient();

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ingredientsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateIngredientDto> }) =>
      ingredientsService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: ingredientsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Ingrédients"
        subtitle={`${ingredients.length} ingrédient(s) en base`}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            <Plus size={16} /> Ajouter
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nom', 'Catégorie', 'Unité', 'Coût unitaire', 'Stock actuel', 'Seuil alerte', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ingredients.map((ing) => {
              const isLow = Number(ing.currentStock) <= Number(ing.reorderThreshold);
              return (
                <tr key={ing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    {isLow && <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />}
                    {ing.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ing.category}</td>
                  <td className="px-4 py-3 text-gray-700">{ing.unit}</td>
                  <td className="px-4 py-3 text-gray-900">{Number(ing.unitCost).toFixed(4)} €</td>
                  <td className={`px-4 py-3 font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                    {ing.currentStock} {ing.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ing.reorderThreshold} {ing.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setEditing(ing)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Supprimer cet ingrédient ?')) deleteMutation.mutate(ing.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {ingredients.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun ingrédient · cliquez sur Ajouter</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(showForm || editing) && (
        <IngredientModal
          initial={editing}
          onSubmit={(dto) => {
            if (editing) updateMutation.mutate({ id: editing.id, dto });
            else createMutation.mutate(dto as CreateIngredientDto);
          }}
          onClose={() => { setShowForm(false); setEditing(null); }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function IngredientModal({
  initial,
  onSubmit,
  onClose,
  loading,
}: {
  initial: Ingredient | null;
  onSubmit: (dto: Partial<CreateIngredientDto>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<CreateIngredientDto>>({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    unit: initial?.unit ?? 'kg',
    unitCost: initial?.unitCost ?? 0,
    reorderThreshold: initial?.reorderThreshold ?? 0,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {initial ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}
        </h2>
        <div className="space-y-4">
          <Field label="Nom">
            <input type="text" value={form.name ?? ''} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" placeholder="Ex: Bœuf entrecôte" />
          </Field>
          <Field label="Catégorie">
            <select value={form.category ?? ''} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="input">
              <option value="">Sélectionner...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Unité">
            <select value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value as StockUnit }))}
              className="input">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Coût unitaire (€)">
            <input type="number" min="0" step="0.0001" value={form.unitCost ?? ''} onChange={(e) => setForm(f => ({ ...f, unitCost: parseFloat(e.target.value) }))}
              className="input" />
          </Field>
          <Field label="Seuil de réapprovisionnement">
            <input type="number" min="0" step="0.001" value={form.reorderThreshold ?? ''} onChange={(e) => setForm(f => ({ ...f, reorderThreshold: parseFloat(e.target.value) }))}
              className="input" />
          </Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={loading || !form.name || !form.category}
            className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 transition"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
