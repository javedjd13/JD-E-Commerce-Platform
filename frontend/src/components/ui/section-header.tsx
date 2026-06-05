import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-component-sm">
      <div>
        <h2 className="text-title-md text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-body-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
