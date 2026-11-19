import { createFileRoute } from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { ServiceGuidePage } from "#/features/settings/service-guide/ui/ServiceGuidePage";

export const Route = createFileRoute("/settings/service-guide")({
  head: createNoIndexNoFollowHead,
  component: ServiceGuidePage,
});
