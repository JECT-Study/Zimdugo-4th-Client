import { createFileRoute } from "@tanstack/react-router";
import { LocationDiagnosticsPanel } from "#/entities/map/ui/LocationDiagnosticsPanel";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";

export const Route = createFileRoute("/location-diagnostics")({
  head: createNoIndexNoFollowHead,
  component: LocationDiagnosticsPage,
});

function LocationDiagnosticsPage() {
  return <LocationDiagnosticsPanel isEnabled />;
}
