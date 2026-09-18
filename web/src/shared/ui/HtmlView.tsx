import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { hydrateLegacyPage } from '@/app/legacy-runtime';

type HtmlViewProps = {
  html: string;
  viewId?: string;
  slots?: Record<string, ReactNode>;
};

function rewriteMarkup(html: string, viewId?: string): string {
  let markup = html
    .replaceAll('src="images/', 'src="/images/')
    .replaceAll("src='images/", "src='/images/")
    .replaceAll('url("images/', 'url("/images/')
    .replaceAll("url('images/", "url('/images/")
    .replace(/border-left:\s*4px\s+solid\s+[^;"']+;?\s*/gi, '');

  if (!viewId) {
    return markup.replace(/style="display:\s*none;?"/gi, '');
  }

  markup = markup.replace(/class="app-view"/g, 'class="app-view" hidden');
  const showPattern = new RegExp(`id="${viewId}" class="app-view" hidden`);
  markup = markup.replace(showPattern, `id="${viewId}" class="app-view"`);

  return markup;
}

export function HtmlView({ html, viewId, slots }: HtmlViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markup = rewriteMarkup(html, viewId);
  const [mountVersion, setMountVersion] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {
      return;
    }

    const hidden = root.querySelectorAll<HTMLElement>('.app-view[hidden]');
    hidden.forEach((node) => {
      node.style.display = 'none';
    });

    if (viewId) {
      const active = root.querySelector<HTMLElement>(`#${viewId}`);
      if (active) {
        active.style.display = 'block';
        active.removeAttribute('hidden');
      }
    }

    const frame = window.requestAnimationFrame(() => {
      hydrateLegacyPage(viewId);
    });

    setMountVersion((current) => current + 1);
    return () => window.cancelAnimationFrame(frame);
  }, [markup, viewId]);

  const portals =
    slots && mountVersion > 0
      ? Object.entries(slots).flatMap(([key, node]) => {
          const target = containerRef.current?.querySelector(`[data-app-table="${key}"]`);
          return target ? [createPortal(node, target, key)] : [];
        })
      : null;

  return (
    <>
      <div className="page-container" ref={containerRef} dangerouslySetInnerHTML={{ __html: markup }} />
      {portals}
    </>
  );
}
