import { useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { hydrateLegacyPage } from '@/app/legacy-runtime';

type ScreenProps = HTMLAttributes<HTMLElement> & {
  viewId: string;
  children: ReactNode;
};

export function Screen({ viewId, children, className, ...props }: ScreenProps) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => hydrateLegacyPage(viewId));
    return () => window.cancelAnimationFrame(frame);
  }, [viewId]);

  return (
    <div className="page-container">
      <section id={viewId} className={['app-view', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </section>
    </div>
  );
}
