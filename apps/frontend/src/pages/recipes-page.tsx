import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Euro } from 'lucide-react';
import { api } from '../services/api';
import { ingredientsService } from '../services/ingredients.service';
import { PageHeader } from '../components/ui/page-header';
import type { Recipe, CreateRecipeDto, Ingredient } from '@chefai/shared';

const recipesService = {
  getAll: async (): Promise<Recipe[]> => {
    const { data } = await api.get<Recipe[]>('/recipes');
    return data;
  },
  create: async (dto: CreateRecipeDto): Promise<Recipe> => {
    const { data } = await api.post<Recipe>('/recipes', dto);
    return data;
  },
  remove: async (id: string) => {
    await api.delete(`/recipes/${id}`);
  },
};

export function RecipesPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: recipes = [] } = useQuery({ queryKey: ['recipes'], queryFn: recipesService.getAll });

  const createMutation = useMutation({
    mutationFn: recipesService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recipes'] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: recipesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Recettes"
        subtitle={`${recipes.length} recette(s)`}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            <Plus size={16} /> Nouvelle recette
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map((recipe) => {
          return (
            <div key={recipe.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{recipe.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{recipe.category}</p>
                </div>
                <button
                  onClick={() => { if (confirm('Supprimer cette recette ?')) deleteMutation.mutate(recipe.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-700">
                  <Euro size={13} /> {Number(recipe.sellingPrice).toFixed(2)}
                </span>
                {recipe.portions > 1 && (
                  <span className="text-gray-500">{recipe.portions} portion(s)</span>
                )}
              </div>
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  {recipe.ingredients.length} ingrédient(s)
                </div>
              )}
            </div>
          );
        })}
        {recipes.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            Aucune recette · cliquez sur Nouvelle recette
          </div>
        )}
      </div>

      {showForm && (
        <RecipeModal
          onSubmit={(dto) => createMutation.mutate(dto)}
          onClose={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function RecipeModal({
  onSubmit,
  onClose,
  loading,
}: {
  onSubmit: (dto: CreateRecipeDto) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientsService.getAll });
  const [form, setForm] = useState({ name: '', category: '', sellingPrice: '', portions: '1', description: '' });
  const [lines, setLines] = useState<{ ingredientId: string; quantity: string }[]>([{ ingredientId: '', quantity: '' }]);

  const addLine = () => setLines((l) => [...l, { ingredientId: '', quantity: '' }]);
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    onSubmit({
      name: form.name,
      category: form.category,
      sellingPrice: parseFloat(form.sellingPrice),
      portions: parseInt(form.portions),
      description: form.description || undefined,
      ingredients: lines
        .filter((l) => l.ingredientId && l.quantity)
        .map((l) => ({ ingredientId: l.ingredientId, quantity: parseFloat(l.quantity) })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvelle recette</h2>
        <div className="space-y-4">
          <Field label="Nom"><input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input" /></Field>
          <Field label="Catégorie"><input type="text" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix de vente (€)"><input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm(f => ({ ...f, sellingPrice: e.target.value }))} className="input" /></Field>
            <Field label="Portions"><input type="number" min="1" value={form.portions} onChange={(e) => setForm(f => ({ ...f, portions: e.target.value }))} className="input" /></Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Ingrédients</label>
              <button onClick={addLine} className="text-xs text-brand-600 hover:underline">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <select value={line.ingredientId} onChange={(e) => setLines(l => l.map((x, idx) => idx === i ? { ...x, ingredientId: e.target.value } : x))}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="">Ingrédient...</option>
                    {ingredients.map((ing: Ingredient) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                  </select>
                  <input type="number" min="0" step="0.001" placeholder="Qté" value={line.quantity}
                    onChange={(e) => setLines(l => l.map((x, idx) => idx === i ? { ...x, quantity: e.target.value } : x))}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                  <button onClick={() => removeLine(i)} className="p-1.5 text-gray-400 hover:text-red-600 transition"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={loading || !form.name || !form.sellingPrice}
            className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 transition">
            {loading ? 'Enregistrement...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>;
}
