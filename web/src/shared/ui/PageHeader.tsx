import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: ReactNode;
  crumbs?: string[];
  subtitle?: ReactNode;
  actions?: ReactNode;
  extra?: ReactNode;
};

export function PageHeader({ title, crumbs, subtitle, actions, extra }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-title-group">
        <h1 className="page-title">{title}</h1>
        {crumbs?.length ? (
          <div className="page-breadcrumb">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`}>
                {index > 0 ? <i className="fas fa-chevron-right"></i> : null}
                {crumb}
              </span>
            ))}
          </div>
        ) : null}
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {extra}
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
