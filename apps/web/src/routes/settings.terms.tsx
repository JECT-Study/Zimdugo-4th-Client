import { createFileRoute } from "@tanstack/react-router";
import { termsDocument } from "#/features/settings/legal/model/legal-documents";
import { LegalDocumentPage } from "#/features/settings/legal/ui/LegalDocumentPage";

export const Route = createFileRoute("/settings/terms")({
  component: SettingsTermsPage,
});

function SettingsTermsPage() {
  return <LegalDocumentPage legalDocument={termsDocument} />;
}
