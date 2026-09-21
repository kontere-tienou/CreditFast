import type { ReactNode } from 'react';

type TooltipProps = {
  title: string;
  children: ReactNode;
};

export function TooltipTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ title, children }: TooltipProps) {
  return (
    <span className="cf-table-tooltip" title={title}>
      {children}
    </span>
  );
}
