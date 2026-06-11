import { createFileRoute } from "@tanstack/react-router";
import { noticeDocument } from "#/features/settings/legal/model/legal-documents";
import { LegalDocumentPage } from "#/features/settings/legal/ui/LegalDocumentPage";

export const Route = createFileRoute("/settings/notices")({
  component: SettingsNoticesPage,
});

function SettingsNoticesPage() {
  return <LegalDocumentPage legalDocument={noticeDocument} />;
}
