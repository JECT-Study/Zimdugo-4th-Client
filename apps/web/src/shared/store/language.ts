import {
  deLocalizeHref,
  extractLocaleFromUrl,
  localizeHref,
  setLanguageTag,
} from "@repo/i18n";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  APP_LOCALES,
  type AppLocale,
  BASE_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
} from "#/shared/i18n/locales";

export const APP_LANGUAGES = APP_LOCALES;

export type AppLanguage = AppLocale;

const APP_LANGUAGE_STORAGE_KEY = "app-language";
const DEFAULT_APP_LANGUAGE: AppLanguage = BASE_LOCALE;

export const normalizeLanguage = normalizeLocale;

export const getUrlLanguage = (href: string): AppLanguage | null => {
  return normalizeLanguage(extractLocaleFromUrl(href));
};

export const getLocalizedHref = (
  href: string,
  language: AppLanguage,
): string => {
  return localizeHref(deLocalizeHref(href), { locale: language });
};

const getSystemLanguage = (): AppLanguage | null => {
  if (typeof navigator === "undefined" || !navigator.language) {
    return null;
  }

  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const candidate of candidates) {
    const normalized = normalizeLanguage(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
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
      initializeLanguage: (urlLanguage) => {
        const fallbackUrlLanguage =
          normalizeLanguage(urlLanguage) ?? DEFAULT_APP_LANGUAGE;

        if (get().hasInitialized) {
          if (fallbackUrlLanguage !== get().appLanguage) {
            set({ appLanguage: fallbackUrlLanguage });
            setLanguageTag(fallbackUrlLanguage);
            setLanguageCookie(fallbackUrlLanguage);
          }
          return;
        }

        const hydratedLanguage = get().hasHydrated ? get().appLanguage : null;
        const fallbackSystemLanguage = getSystemLanguage();
        const nextLanguage =
          fallbackUrlLanguage ??
          hydratedLanguage ??
          fallbackSystemLanguage ??
          DEFAULT_APP_LANGUAGE;

        set({
          appLanguage: nextLanguage,
          hasInitialized: true,
        });
        setLanguageTag(nextLanguage);
        setLanguageCookie(nextLanguage);
      },
      setAppLanguage: (language) => {
        if (!APP_LANGUAGES.includes(language)) {
          return;
        }

        set({ appLanguage: language, hasInitialized: true });
        setLanguageTag(language);
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
  zh: "\u4E2D\u6587",
};
