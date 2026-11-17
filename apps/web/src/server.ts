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

import { resolveLegacyLockerPath } from "#/shared/lib/legacy-locker-url";
import { handleLocationDiagnosticRequest } from "#/shared/lib/location-diagnostics-server";

export default {
  async fetch(req: Request): Promise<Response> {
    const locationDiagnosticResponse =
      await handleLocationDiagnosticRequest(req);
    if (locationDiagnosticResponse) return locationDiagnosticResponse;

    /*
     * 구 상세 주소(`/?locker=…`, `/?openLockerId=…`)를 새 경로로 영구 이동시킨다.
     * 사이트맵이 색인시켰고 사용자가 공유한 모양이라, 검색엔진이 순위를 새 주소로
     * 옮기도록 301 로 답한다.
     *
     * 로케일 판정보다 먼저 한다. 구 주소가 이미 접두사를 달고 있으면 그대로 옮기고,
     * 접두사가 없으면 새 주소에서 다시 로케일 가드를 거친다. 순서를 바꾸면 로케일
     * 리다이렉트와 이 리다이렉트가 한 번씩 따로 일어난다.
     *
     * 이 요청이 여기까지 오는 것은 `vite.config.ts` 의 Vercel 라우트 덕분이다.
     * 홈은 프리렌더된 정적 파일이라 그 규칙이 없으면 이 함수가 아예 불리지 않는다.
     */
    const legacyLockerPath = resolveLegacyLockerPath(new URL(req.url));
    if (legacyLockerPath) {
      return new Response(null, {
        status: 301,
        headers: { location: legacyLockerPath },
      });
    }

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
