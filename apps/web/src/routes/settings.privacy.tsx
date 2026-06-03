import { createFileRoute } from "@tanstack/react-router";
import { privacyDocument } from "#/features/settings/legal/model/legal-documents";
import { LegalDocumentPage } from "#/features/settings/legal/ui/LegalDocumentPage";

export const Route = createFileRoute("/settings/privacy")({
  component: SettingsPrivacyPage,
});

function SettingsPrivacyPage() {
  return <LegalDocumentPage legalDocument={privacyDocument} />;
}
