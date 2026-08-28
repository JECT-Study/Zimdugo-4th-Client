import { paraglideMiddleware } from "@repo/i18n/server";
import handler from "@tanstack/react-start/server-entry";
import { resolveLoginRequest } from "#/features/auth/sign-in/model/server-login-guard";
import {
  resolveProtectedRequest,
  withProtectedDocumentHeaders,
} from "#/features/auth/sign-in/model/server-protected-route-guard";
import {
  resolveLocaleRequest,
  withForwardedLocaleIntent,
} from "#/shared/i18n/server-locale-guard";

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
    // 다만 base locale 은 접두사가 URL 에 남지 않으므로, 마커를 소비한 요청이면
    // 여기서 돌아가는 리다이렉트에도 의도를 다시 실어 보낸다.
    const forwardLocaleIntent = (redirect: Response): Response =>
      guard.consumedLocaleIntent
        ? withForwardedLocaleIntent(middlewareRequest, redirect)
        : redirect;

    const loginRedirect = resolveLoginRequest(middlewareRequest);
    if (loginRedirect) {
      return forwardLocaleIntent(loginRedirect);
    }

    const protectedRedirect = resolveProtectedRequest(middlewareRequest);
    if (protectedRedirect) {
      return forwardLocaleIntent(protectedRedirect);
    }

    const response = await paraglideMiddleware(middlewareRequest, () =>
      handler.fetch(middlewareRequest),
    );

    // 라우터도 리다이렉트를 돌려준다(/my → /settings 등). 인증 가드와 같은
    // 이유로 목적지에 의도를 이어줘야 한다.
    return withProtectedDocumentHeaders(
      middlewareRequest,
      forwardLocaleIntent(response),
    );
  },
};
