import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('border border-dashed border-border p-layout-xl text-center', className)}>
      {icon ? <div className="mx-auto grid h-control-lg w-control-lg place-items-center text-primary">{icon}</div> : null}
      <p className="mt-component-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 text-body-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-component-lg">{action}</div> : null}
    </div>
  );
}
