import { createFileRoute } from "@tanstack/react-router";
import { NotFoundComponent } from "#/shared/ui/NotFound";

export const Route = createFileRoute("/settings/privacy")({
  component: SettingsPrivacyPage,
});

function SettingsPrivacyPage() {
  return <NotFoundComponent />;
}
