import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  parseLegalReturnSearch,
  type LegalReturnSearch,
} from "#/features/settings/legal/model/legal-return-search";
import { LegalDocumentPage } from "#/features/settings/legal/ui/LegalDocumentPage";

export const Route = createFileRoute("/settings/privacy")({
  validateSearch: parseLegalReturnSearch,
  component: SettingsPrivacyPage,
});

function SettingsPrivacyPage() {
  const returnSearch = useSearch({ from: "/settings/privacy" }) as LegalReturnSearch;

  return (
    <LegalDocumentPage
      documentType="PRIVACY"
      returnSearch={returnSearch}
    />
  );
}
