import { useState, type ReactNode } from 'react';

export type DossierViewMode = 'list' | 'icons';

export type DossierTile = {
  id: string;
  title: string;
  meta: string;
  hint?: string;
};

type DossierBrowserProps = {
  heading?: string;
  items: DossierTile[];
  listView: ReactNode;
  onOpen: (id: string) => void;
  toolbar?: ReactNode;
  defaultView?: DossierViewMode;
};

export function DossierViewToggle({
  view,
  onChange,
}: {
  view: DossierViewMode;
  onChange: (view: DossierViewMode) => void;
}) {
  return (
    <div className="cf-dossier-view-toggle" role="group" aria-label="Mode d'affichage">
      <button type="button" className={view === 'list' ? 'is-active' : undefined} title="Vue liste" onClick={() => onChange('list')}>
        <i className="fas fa-list"></i>
      </button>
      <button type="button" className={view === 'icons' ? 'is-active' : undefined} title="Vue icônes" onClick={() => onChange('icons')}>
        <i className="fas fa-grip"></i>
      </button>
    </div>
  );
}

export function DossierIconGrid({ items, onOpen }: { items: DossierTile[]; onOpen: (id: string) => void }) {
  return (
    <div className="cf-dossier-grid">
      {items.map((item) => (
        <button key={item.id} type="button" className="cf-dossier-tile" onClick={() => onOpen(item.id)}>
          <span className="cf-dossier-tile-icon" aria-hidden>
            <i className="fas fa-folder"></i>
          </span>
          <span className="cf-dossier-tile-copy">
            <span className="cf-dossier-tile-title">{item.title}</span>
            <span className="cf-dossier-tile-meta">{item.meta}</span>
            {item.hint ? <span className="cf-dossier-tile-hint">{item.hint}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export function DossierBrowser({ heading = 'Dossiers', items, listView, onOpen, toolbar, defaultView = 'list' }: DossierBrowserProps) {
  const [view, setView] = useState<DossierViewMode>(defaultView);

  return (
    <div className="cf-dossier-browser">
      <div className="cf-dossier-browser-bar">
        <div className="cf-dossier-browser-bar-main">
          {heading ? <h3 className="cf-dossier-browser-title">{heading}</h3> : null}
          {toolbar}
        </div>
        <DossierViewToggle view={view} onChange={setView} />
      </div>
      {view === 'list' ? listView : <DossierIconGrid items={items} onOpen={onOpen} />}
    </div>
  );
}
