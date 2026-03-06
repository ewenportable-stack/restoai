import clsx from 'clsx';
import type { AlertSeverity } from '@chefai/shared';

interface AlertBadgeProps {
  severity: AlertSeverity;
  label: string;
}

const severityStyles: Record<AlertSeverity, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
};

export function AlertBadge({ severity, label }: AlertBadgeProps) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', severityStyles[severity])}>
      {label}
    </span>
  );
}
