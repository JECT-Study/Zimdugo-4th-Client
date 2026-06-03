import { paraglideMiddleware } from "@repo/i18n/server";
import handler from "@tanstack/react-start/server-entry";
import {
  finalizeLocaleResponse,
  resolveLocaleRequest,
} from "#/shared/i18n/server-locale-guard";

export default {
  async fetch(req: Request): Promise<Response> {
    const guard = resolveLocaleRequest(req);

    if (guard.kind === "redirect") {
      return guard.response;
    }

    const { middlewareRequest, pathLocale } = guard;
    const response = await paraglideMiddleware(middlewareRequest, () =>
      handler.fetch(middlewareRequest),
    );

    return finalizeLocaleResponse(response, pathLocale);
  },
};
