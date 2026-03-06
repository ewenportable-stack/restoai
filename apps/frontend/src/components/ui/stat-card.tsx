import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div className={clsx('bg-white rounded-xl p-6 shadow-sm border border-gray-100', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-brand-50 rounded-lg text-brand-600">{icon}</div>
        )}
      </div>
    </div>
  );
}
