import { AnalystDossierDrawer } from './AnalystDossierDrawer';
import { AnomalyDrawer } from './AnomalyDrawer';
import { AgentDossierDrawer } from './AgentDossierDrawer';
import { InspectionDrawer } from './InspectionDrawer';
import { ComplementsDrawer } from './ComplementsDrawer';
import { ClientRequestDrawer } from './ClientRequestDrawer';
import { ScheduleDrawer } from './ScheduleDrawer';
import { SignedPvDrawer } from './SignedPvDrawer';

export function LegacyDrawers() {
  return (
    <>
      <AnalystDossierDrawer />
      <AnomalyDrawer />
      <AgentDossierDrawer />
      <InspectionDrawer />
      <ComplementsDrawer />
      <ClientRequestDrawer />
      <ScheduleDrawer />
      <SignedPvDrawer />
    </>
  );
}
