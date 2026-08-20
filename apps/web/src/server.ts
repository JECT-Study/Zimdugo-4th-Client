import { paraglideMiddleware } from "@repo/i18n/server";
import handler from "@tanstack/react-start/server-entry";
import { resolveLocaleRequest } from "#/shared/i18n/server-locale-guard";

import { handleLocationDiagnosticRequest } from "#/shared/lib/location-diagnostics-server";

export default {
  async fetch(req: Request): Promise<Response> {
    const locationDiagnosticResponse =
      await handleLocationDiagnosticRequest(req);
    if (locationDiagnosticResponse) return locationDiagnosticResponse;

    const guard = resolveLocaleRequest(req);

    if (guard.kind === "redirect") {
      return guard.response;
    }

    const { middlewareRequest } = guard;

    return paraglideMiddleware(middlewareRequest, () =>
      handler.fetch(middlewareRequest),
    );
  },
};
