import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/page-header';
import type { Order } from '@chefai/shared';
import clsx from 'clsx';

const ordersService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  confirmed: 'Confirmée',
  received: 'Reçue',
  cancelled: 'Annulée',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrdersPage() {
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: ordersService.getAll });

  return (
    <div className="p-8">
      <PageHeader
        title="Commandes Fournisseurs"
        subtitle={`${orders.length} commande(s)`}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['#', 'Fournisseur', 'Statut', 'Lignes', 'Total', 'Créée le'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{order.supplierId}</td>
                <td className="px-4 py-3">
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', statusColors[order.status])}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{order.lines?.length ?? 0} ligne(s)</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{Number(order.total).toFixed(2)} €</td>
                <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
