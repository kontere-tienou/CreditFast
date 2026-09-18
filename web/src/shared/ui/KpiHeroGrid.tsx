import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

type KpiHeroGridProps = {
  children: ReactNode;
};

export function KpiHeroGrid({ children }: KpiHeroGridProps) {
  const items = Children.toArray(children);
  const [featured, ...secondary] = items;

  const featuredCard = isValidElement(featured)
    ? cloneElement(featured as ReactElement<{ featured?: boolean }>, { featured: true })
    : featured;

  return (
    <div className="kpi-hero-grid">
      <div className="kpi-hero-featured">{featuredCard}</div>
      <div className="kpi-hero-stack">{secondary}</div>
    </div>
  );
}
