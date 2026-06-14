import { setLanguageTag } from "@repo/i18n";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  APP_LOCALES,
  type AppLocale,
  BASE_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  LOCALE_PATH_PREFIX,
  normalizeLocale,
  resolveBrowserLanguageCandidates,
} from "#/shared/i18n/locales";

export const APP_LANGUAGES = APP_LOCALES;

export type AppLanguage = AppLocale;

const APP_LANGUAGE_STORAGE_KEY = "app-language";
const DEFAULT_APP_LANGUAGE: AppLanguage = BASE_LOCALE;
const HREF_PARSE_BASE_ORIGIN = "http://zimdugo.local";

export const normalizeLanguage = normalizeLocale;

export const getUrlLanguage = (href: string): AppLanguage | null => {
  const isProtocolRelative = href.startsWith("//");
  const url = new URL(
    href,
    isProtocolRelative ? `http:${href}` : HREF_PARSE_BASE_ORIGIN,
  );
  const firstSegment = url.pathname.split("/").filter(Boolean)[0];

  return normalizeLanguage(firstSegment);
};

export const getLocalizedHref = (
  href: string,
  language: AppLanguage,
): string => {
  const isProtocolRelative = href.startsWith("//");
  const isAbsolute = /^[a-z][a-z\d+\-.]*:/i.test(href);
  const url = new URL(
    href,
    isProtocolRelative ? `http:${href}` : HREF_PARSE_BASE_ORIGIN,
  );
  const basePathname = url.pathname.replace(LOCALE_PATH_PREFIX, "") || "/";
  const localizedPathname =
    language === DEFAULT_APP_LANGUAGE
      ? basePathname
      : `/${language}${basePathname === "/" ? "" : basePathname}`;

  url.pathname = localizedPathname;

  if (isProtocolRelative) {
    return `//${url.host}${url.pathname}${url.search}${url.hash}`;
  }

  if (isAbsolute) {
    return url.href;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

const getSystemLanguage = (): AppLanguage | null => {
  if (typeof navigator === "undefined" || !navigator.language) {
    return null;
  }

  return resolveBrowserLanguageCandidates([
    navigator.language,
    ...(navigator.languages ?? []),
  ]);
};

const setLanguageCookie = (language: AppLanguage) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_NAME}=${language};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
};

interface AppLanguageState {
  appLanguage: AppLanguage;
  hasInitialized: boolean;
  hasHydrated: boolean;
  initializeLanguage: (urlLanguage?: string | null) => void;
  setAppLanguage: (language: AppLanguage) => void;
  markHydrated: () => void;
}

export const useAppLanguageStore = create<AppLanguageState>()(
  persist(
    (set, get) => ({
      appLanguage: DEFAULT_APP_LANGUAGE,
      hasInitialized: false,
      hasHydrated: false,
      initializeLanguage: (urlLanguageParam) => {
        const urlLanguage = normalizeLanguage(urlLanguageParam);

        if (get().hasInitialized) {
          const nextLanguage = urlLanguage ?? DEFAULT_APP_LANGUAGE;
          if (nextLanguage !== get().appLanguage) {
            set({ appLanguage: nextLanguage });
            setLanguageTag(nextLanguage, { reload: false });
            setLanguageCookie(nextLanguage);
          }
          return;
        }

        const hydratedLanguage = get().hasHydrated ? get().appLanguage : null;
        const fallbackSystemLanguage = getSystemLanguage();
        const nextLanguage =
          urlLanguage ??
          hydratedLanguage ??
          fallbackSystemLanguage ??
          DEFAULT_APP_LANGUAGE;

        set({
          appLanguage: nextLanguage,
          hasInitialized: true,
        });
        setLanguageTag(nextLanguage, { reload: false });
        setLanguageCookie(nextLanguage);
      },
      setAppLanguage: (language) => {
        if (!APP_LANGUAGES.includes(language)) {
          return;
        }

        set({ appLanguage: language, hasInitialized: true });
        setLanguageTag(language, { reload: false });
        setLanguageCookie(language);
      },
      markHydrated: () => {
        set({ hasInitialized: false, hasHydrated: true });
      },
    }),
    {
      name: APP_LANGUAGE_STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : window.localStorage,
      ),
      partialize: (state) => ({ appLanguage: state.appLanguage }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export const appLanguageLabelMap: Record<AppLanguage, string> = {
  ko: "\uD55C\uAD6D\uC5B4",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  zh: "\u7B80\u4F53\u4E2D\u6587",
  "zh-TW": "\u7E41\u9AD4\u4E2D\u6587",
};
