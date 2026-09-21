import type { ReactNode } from 'react';

export const Dropdown = {
  Root: ({ children }: { children: ReactNode }) => <div className="cf-dropdown">{children}</div>,
  DotsButton: () => (
    <button type="button" className="cf-button-utility cf-button-utility-tertiary" aria-label="Actions">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <circle cx="12" cy="5" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="12" cy="19" r="1.6" />
      </svg>
    </button>
  ),
  Popover: ({ children }: { children: ReactNode; className?: string }) => <>{children}</>,
  Menu: ({ children }: { children: ReactNode }) => <div className="cf-dropdown-menu">{children}</div>,
  Item: ({ children }: { children: ReactNode; icon?: unknown }) => <div className="cf-dropdown-item">{children}</div>,
};
