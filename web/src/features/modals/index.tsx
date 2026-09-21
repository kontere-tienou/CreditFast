import { InspectionModal } from './InspectionModal';
import { AnalystDossierModal } from './AnalystDossierModal';
import { AppointmentModal } from './AppointmentModal';
import { PaymentModal } from './PaymentModal';
import { CommitteeOverlays } from './CommitteeOverlays';
import { DocLightboxModal } from './DocLightboxModal';
import { QrScannerModal } from './QrScannerModal';
import { SettingsModal } from './SettingsModal';
import { SuccessAnimationModal } from './SuccessAnimationModal';
import { LoanApplicationModal } from './LoanApplicationModal';
import { UploadDocumentModal } from './UploadDocumentModal';

export function LegacyDialogs() {
  return (
    <>
      <InspectionModal />
      <AnalystDossierModal />
      <AppointmentModal />
      <PaymentModal />
      <CommitteeOverlays />
      <DocLightboxModal />
      <QrScannerModal />
      <SettingsModal />
      <SuccessAnimationModal />
      <LoanApplicationModal />
      <UploadDocumentModal />
    </>
  );
}
