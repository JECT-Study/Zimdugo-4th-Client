import {
  type AppLocale,
  BASE_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
} from "#/shared/i18n/locales";

const isDocumentRequest = (req: Request): boolean => {
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

const getPathLocale = (pathname: string): AppLocale | null => {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment && isAppLocale(firstSegment) ? firstSegment : null;
};

const getCookieLocale = (cookieHeader: string | null): AppLocale | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name !== LOCALE_COOKIE_NAME) continue;

    return normalizeLocale(decodeURIComponent(valueParts.join("=")));
  }

  return null;
};

const getAcceptLanguageLocale = (
  acceptLanguageHeader: string | null,
): AppLocale | null => {
  if (!acceptLanguageHeader) return null;

  const candidates = acceptLanguageHeader
    .split(",")
    .map((part) => part.trim().split(";")[0]);

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return null;
};

const getLocalizedPath = (url: URL, locale: AppLocale): string => {
  if (locale === BASE_LOCALE) {
    return `${url.pathname}${url.search}`;
  }

  return `/${locale}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
};

const getLocaleCookie = (locale: AppLocale): string => {
  return `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
};

const getRequestCookieHeader = (
  currentCookie: string | null,
  locale: AppLocale,
): string => {
  const preservedCookies = currentCookie
    ? currentCookie
        .split(";")
        .map((cookie) => cookie.trim())
        .filter((cookie) => cookie.split("=")[0] !== LOCALE_COOKIE_NAME)
    : [];

  return [...preservedCookies, `${LOCALE_COOKIE_NAME}=${locale}`].join("; ");
};

const withLocaleCookieHeader = (req: Request, locale: AppLocale): Request => {
  const headers = new Headers(req.headers);
  headers.set("Cookie", getRequestCookieHeader(headers.get("Cookie"), locale));

  // Nitro/prerender Request는 `new Request(req, …)` 복제 시 undici #state 오류가 난다.
  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    init.duplex = "half";
  }

  return new Request(req.url, init);
};

const withLocaleCookieResponse = (
  response: Response,
  locale: AppLocale,
): Response => {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", getLocaleCookie(locale));

  const hasNoBody = response.status === 204 || response.status === 304;

  return new Response(hasNoBody ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const getLocaleRedirectResponse = (url: URL, locale: AppLocale): Response => {
  return new Response(null, {
    status: 307,
    headers: {
      Location: getLocalizedPath(url, locale),
      "Set-Cookie": getLocaleCookie(locale),
    },
  });
};

export type LocaleGuardResult =
  | { kind: "redirect"; response: Response }
  | {
      kind: "continue";
      middlewareRequest: Request;
      pathLocale: AppLocale | null;
    };

export const resolveLocaleRequest = (req: Request): LocaleGuardResult => {
  const url = new URL(req.url);
  const pathLocale = getPathLocale(url.pathname);

  if (isDocumentRequest(req) && !pathLocale) {
    const preferredLocale =
      getCookieLocale(req.headers.get("Cookie")) ??
      getAcceptLanguageLocale(req.headers.get("Accept-Language")) ??
      BASE_LOCALE;

    if (preferredLocale !== BASE_LOCALE) {
      return {
        kind: "redirect",
        response: getLocaleRedirectResponse(url, preferredLocale),
      };
    }
  }

  return {
    kind: "continue",
    middlewareRequest: pathLocale
      ? withLocaleCookieHeader(req, pathLocale)
      : req,
    pathLocale,
  };
};

export const finalizeLocaleResponse = (
  response: Response,
  pathLocale: AppLocale | null,
): Response => {
  return pathLocale ? withLocaleCookieResponse(response, pathLocale) : response;
};
