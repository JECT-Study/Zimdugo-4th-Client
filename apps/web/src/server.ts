import { paraglideMiddleware } from "@repo/i18n/server";
import handler from "@tanstack/react-start/server-entry";
import { resolveLoginRequest } from "#/features/auth/sign-in/model/server-login-guard";
import { resolveProtectedRequest } from "#/features/auth/sign-in/model/server-protected-route-guard";
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

    // 로케일 정규화가 끝난 요청으로 판단해야 리다이렉트 주소에 로케일이 유지된다.
    const loginRedirect = resolveLoginRequest(middlewareRequest);
    if (loginRedirect) {
      return loginRedirect;
    }

    const protectedRedirect = resolveProtectedRequest(middlewareRequest);
    if (protectedRedirect) {
      return protectedRedirect;
    }

    return paraglideMiddleware(middlewareRequest, () =>
      handler.fetch(middlewareRequest),
    );
  },
};
