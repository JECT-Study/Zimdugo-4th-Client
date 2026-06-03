import { createFileRoute } from "@tanstack/react-router";
import { NotFoundComponent } from "#/shared/ui/NotFound";

export const Route = createFileRoute("/settings/notices")({
  component: SettingsNoticesPage,
});

function SettingsNoticesPage() {
  return <NotFoundComponent />;
}
