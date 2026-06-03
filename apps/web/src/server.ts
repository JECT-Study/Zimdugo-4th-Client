import { paraglideMiddleware } from "@repo/i18n/server";
import handler from "@tanstack/react-start/server-entry";

const APP_LOCALES = ["ko", "en", "ja", "zh"] as const;
const BASE_LOCALE = "ko";
const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type AppLocale = (typeof APP_LOCALES)[number];

const isAppLocale = (value: string): value is AppLocale => {
  return APP_LOCALES.includes(value as AppLocale);
};

const normalizeLocale = (value?: string | null): AppLocale | null => {
  if (!value) return null;

  const lower = value.toLowerCase();
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";

  return null;
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

  return new Request(req, { headers });
};

const withLocaleCookieResponse = (
  response: Response,
  locale: AppLocale,
): Response => {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", getLocaleCookie(locale));

  return new Response(response.body, {
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

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathLocale = getPathLocale(url.pathname);

    if (isDocumentRequest(req) && !pathLocale) {
      const preferredLocale =
        getCookieLocale(req.headers.get("Cookie")) ??
        getAcceptLanguageLocale(req.headers.get("Accept-Language")) ??
        BASE_LOCALE;

      if (preferredLocale !== BASE_LOCALE) {
        return getLocaleRedirectResponse(url, preferredLocale);
      }
    }

    const middlewareRequest = pathLocale
      ? withLocaleCookieHeader(req, pathLocale)
      : req;
    const response = await paraglideMiddleware(middlewareRequest, () =>
      handler.fetch(req),
    );

    return pathLocale
      ? withLocaleCookieResponse(response, pathLocale)
      : response;
  },
};
