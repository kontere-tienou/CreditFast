import { Screen } from '@/shared/ui/Screen';
import { BorrowerProfileForm } from './BorrowerProfileForm';

export function ClientProfilePage() {
  return (
    <Screen viewId="view-client-profile">
      <BorrowerProfileForm />
    </Screen>
  );
}
