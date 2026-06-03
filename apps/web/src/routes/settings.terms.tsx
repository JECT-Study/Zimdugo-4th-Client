import { createFileRoute } from "@tanstack/react-router";
import { NotFoundComponent } from "#/shared/ui/NotFound";

export const Route = createFileRoute("/settings/terms")({
  component: SettingsTermsPage,
});

function SettingsTermsPage() {
  return <NotFoundComponent />;
}
