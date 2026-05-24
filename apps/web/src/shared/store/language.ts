import { setLanguageTag } from "@repo/i18n";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "ko" | "en" | "ja" | "zh";

const APP_LANGUAGE_STORAGE_KEY = "app-language";
const APP_LANGUAGE_COOKIE_KEY = "PARAGLIDE_LOCALE";
const APP_LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const APP_LANGUAGES: readonly AppLanguage[] = ["ko", "en", "ja", "zh"];

const normalizeLanguage = (value?: string | null): AppLanguage | null => {
  if (!value) return null;

  const lower = value.toLowerCase();
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";

  return null;
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

  document.cookie =
    `${APP_LANGUAGE_COOKIE_KEY}=${language};path=/;max-age=${APP_LANGUAGE_COOKIE_MAX_AGE};SameSite=Lax`;
};

interface AppLanguageState {
  appLanguage: AppLanguage;
  hasInitialized: boolean;
  hasHydrated: boolean;
  initializeLanguage: (urlLanguage?: string | null) => void;
  setAppLanguage: (language: AppLanguage) => void;
}

export const useAppLanguageStore = create<AppLanguageState>()(
  persist(
    (set, get) => ({
      appLanguage: "ko",
      hasInitialized: false,
      hasHydrated: false,
      initializeLanguage: (urlLanguage) => {
        if (get().hasInitialized) {
          return;
        }

        const hydratedLanguage = get().hasHydrated ? get().appLanguage : null;
        const fallbackUrlLanguage = normalizeLanguage(urlLanguage);
        const fallbackSystemLanguage = getSystemLanguage();
        const nextLanguage =
          fallbackUrlLanguage ?? hydratedLanguage ?? fallbackSystemLanguage ?? "ko";

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
        if (!state) {
          return;
        }

        state.hasInitialized = false;
        state.hasHydrated = true;
      },
    },
  ),
);

export const appLanguageLabelMap: Record<AppLanguage, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};
