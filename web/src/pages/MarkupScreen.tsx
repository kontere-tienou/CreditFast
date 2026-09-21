import { HtmlView } from '@/shared/ui/HtmlView';
import { appTables } from '@/shared/tables/registry';

type MarkupScreenProps = {
  html: string;
  viewId: string;
};

export function MarkupScreen({ html, viewId }: MarkupScreenProps) {
  return <HtmlView html={html} viewId={viewId} slots={appTables} />;
}
