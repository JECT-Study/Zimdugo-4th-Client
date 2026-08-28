import {
  type AppLocale,
  BASE_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_INTENT_COOKIE_MAX_AGE,
  LOCALE_INTENT_COOKIE_NAME,
  LOCALE_PATH_PREFIX,
  normalizeLocale,
  parsePathLocale,
  stripLocalePathPrefix,
  UNSUPPORTED_LOCALE_FALLBACK,
} from "#/shared/i18n/locales";

export const isDocumentRequest = (req: Request): boolean => {
  if (!["GET", "HEAD"].includes(req.method)) return false;

  const url = new URL(req.url);
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/oauth2/") ||
    url.pathname.startsWith("/login/oauth2/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    /\.[a-z0-9]+$/i.test(url.pathname)
  ) {
    return false;
  }

  const fetchDestination = req.headers.get("Sec-Fetch-Dest");
  if (fetchDestination === "document") return true;

  return req.headers.get("Accept")?.includes("text/html") ?? false;
};

const getPathLocale = (pathname: string): AppLocale | null =>
  parsePathLocale(pathname);

const getCookieLocale = (cookieHeader: string | null): AppLocale | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name !== LOCALE_COOKIE_NAME) continue;

    try {
      return normalizeLocale(decodeURIComponent(valueParts.join("=")));
    } catch {
      return null;
    }
  }

  return null;
};

const getAcceptLanguageLocale = (
  acceptLanguageHeader: string | null,
): AppLocale | null => {
  if (!acceptLanguageHeader) return null;

  const candidates = acceptLanguageHeader
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;

      return { tag: tag.trim(), q };
    })
    .filter(({ q }) => !Number.isNaN(q) && q > 0)
    .sort((a, b) => b.q - a.q)
    .map(({ tag }) => tag);

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return null;
};

const resolvePreferredDocumentLocale = (req: Request): AppLocale => {
  const cookieLocale = getCookieLocale(req.headers.get("Cookie"));
  if (cookieLocale) {
    return cookieLocale;
  }

  const acceptLanguageHeader = req.headers.get("Accept-Language");
  if (acceptLanguageHeader) {
    return (
      getAcceptLanguageLocale(acceptLanguageHeader) ??
      UNSUPPORTED_LOCALE_FALLBACK
    );
  }

  return BASE_LOCALE;
};

/**
 * 마커가 가리키는 목적지. 마커는 Path=/ 쿠키라 이름만 보고 소비하면, 같은
 * 브라우저에서 동시에 진행되는 다른 무접두 탐색이 먼저 집어삼킬 수 있다.
 * 값에 목적지를 담아 그 요청에서만 소비되게 묶는다.
 */
const getLocaleIntentTarget = (cookieHeader: string | null): string | null => {
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name !== LOCALE_INTENT_COOKIE_NAME) continue;

    const value = valueParts.join("=");
    if (!value) return null;

    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  return null;
};

const getRequestPath = (url: URL): string => `${url.pathname}${url.search}`;

const buildLocaleIntentCookie = (url: URL, value: string): string => {
  const maxAge = value === "" ? 0 : LOCALE_INTENT_COOKIE_MAX_AGE;
  const secure = url.protocol === "https:" ? "; Secure" : "";

  return `${LOCALE_INTENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly${secure}`;
};

/**
 * 마커를 소비한 응답에서 마커를 지운다. 이 응답은 마커 유무에 따라 내용이
 * 달라지므로 공용 캐시가 섞지 않도록 Vary 도 함께 붙인다.
 */
export const withConsumedLocaleIntentHeaders = (
  req: Request,
  response: Response,
): Response => {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", buildLocaleIntentCookie(new URL(req.url), ""));
  headers.set("Vary", "Cookie, Accept-Language");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * base locale 의 정규 주소. 접두사를 떼어낸 경로다.
 *
 * `/ko//evil.example/x` 처럼 접두사 뒤가 슬래시로 시작하면 결과가
 * `//evil.example/x` 가 되고, Location 에 넣는 순간 프로토콜 상대 URL 로
 * 해석돼 외부 호스트로 나가는 오픈 리다이렉트가 된다. 슬래시를 하나로 접는다.
 */
const getBaseLocalePath = (url: URL): string =>
  `${stripLocalePathPrefix(url.pathname).replace(/^\/+/, "/")}${url.search}`;

const getLocalizedPath = (url: URL, locale: AppLocale): string => {
  if (locale === BASE_LOCALE) {
    return `${url.pathname}${url.search}`;
  }

  return `/${locale}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
};

/**
 * `/zh-tw` 처럼 표기만 다른 로케일 경로를 정규 표기(`/zh-TW`)로 되돌린다.
 * LOCALE_PATH_PREFIX 는 대소문자를 무시하지만 라우터의 URL 패턴은 구분하므로,
 * 정규 표기가 아니면 SSR 로케일만 맞고 라우트 매칭은 실패한다.
 */
const getCanonicalLocalePath = (url: URL, locale: AppLocale): string | null => {
  const match = url.pathname.match(LOCALE_PATH_PREFIX);

  if (!match || match[0] === `/${locale}`) {
    return null;
  }

  return `/${locale}${url.pathname.slice(match[0].length)}${url.search}`;
};

/**
 * 리다이렉트든 렌더든 서버는 로케일 선호 쿠키를 쓰지 않는다.
 * 쿠키는 사용자가 설정 화면이나 홈 검색바에서 언어를 직접 고를 때만 기록된다.
 * 로케일 URL 방문이나 Accept-Language 감지는 "선택"이 아니라서다.
 */
const getLocaleRedirectResponse = (
  location: string,
  extraHeaders?: Record<string, string>,
): Response => {
  return new Response(null, {
    status: 307,
    headers: {
      Location: location,
      ...extraHeaders,
    },
  });
};

export type LocaleGuardResult =
  | { kind: "redirect"; response: Response }
  | {
      kind: "continue";
      middlewareRequest: Request;
      pathLocale: AppLocale | null;
      /** 마커를 읽었으니 응답에서 지워야 한다는 표시. */
      consumedLocaleIntent: boolean;
    };

export const resolveLocaleRequest = (req: Request): LocaleGuardResult => {
  const url = new URL(req.url);
  const pathLocale = getPathLocale(url.pathname);

  if (pathLocale === BASE_LOCALE && isDocumentRequest(req)) {
    /**
     * base locale 은 무접두가 정규 주소다. 접두사를 그대로 두면 paraglide 가
     * 떼어내는데, 그 순간 "URL 이 로케일을 명시했다"는 사실이 사라져 다음
     * 요청이 Accept-Language 로 넘어간다. 여기서 직접 떼면서 의도를 일회용
     * 마커에 실어 보내면 리다이렉트도 한 번으로 줄고 의도도 살아남는다.
     */
    const baseLocalePath = getBaseLocalePath(url);

    return {
      kind: "redirect",
      response: getLocaleRedirectResponse(baseLocalePath, {
        "Set-Cookie": buildLocaleIntentCookie(
          url,
          encodeURIComponent(baseLocalePath),
        ),
      }),
    };
  }

  if (pathLocale) {
    const canonicalPath = getCanonicalLocalePath(url, pathLocale);

    if (canonicalPath) {
      // 표기 정규화는 경로만 보고 정하므로 요청 헤더에 따라 달라지지 않는다.
      return {
        kind: "redirect",
        response: getLocaleRedirectResponse(canonicalPath),
      };
    }
  } else if (isDocumentRequest(req)) {
    const intentTarget = getLocaleIntentTarget(req.headers.get("Cookie"));

    if (intentTarget !== null && intentTarget === getRequestPath(url)) {
      // 방금 /ko 를 떼고 온 요청이다. 선호 감지를 건너뛰고 base locale 로 둔다.
      return {
        kind: "continue",
        middlewareRequest: req,
        pathLocale: BASE_LOCALE,
        consumedLocaleIntent: true,
      };
    }

    const preferredLocale = resolvePreferredDocumentLocale(req);

    if (preferredLocale !== BASE_LOCALE) {
      return {
        kind: "redirect",
        // 목적지가 쿠키와 Accept-Language 에 따라 달라진다. 공용 캐시가
        // 한 사용자의 결과를 다른 사용자에게 주지 않도록 Vary 를 붙인다.
        response: getLocaleRedirectResponse(
          getLocalizedPath(url, preferredLocale),
          { Vary: "Cookie, Accept-Language" },
        ),
      };
    }
  }

  return {
    kind: "continue",
    middlewareRequest: req,
    pathLocale,
    consumedLocaleIntent: false,
  };
};
