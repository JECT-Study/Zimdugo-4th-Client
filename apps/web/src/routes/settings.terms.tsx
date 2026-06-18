import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "#/features/settings/legal/ui/LegalDocumentPage";

export const Route = createFileRoute("/settings/terms")({
  component: SettingsTermsPage,
});

function SettingsTermsPage() {
  return <LegalDocumentPage documentType="TERMS" />;
}
