import { useEffect } from "react";
import { create } from "zustand";

import {
  DEFAULT_MAP_COLOR_SCHEME,
  type MapColorScheme,
} from "./naver-map-style";

const STORAGE_KEY = "zimdugo:map-color-scheme";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const MAP_COLOR_SCHEME_PREFERENCES = [
  "system",
  "light",
  "dark",
] as const;

export type MapColorSchemePreference =
  (typeof MAP_COLOR_SCHEME_PREFERENCES)[number];

/** 저장값이 없으면 기기 설정을 따른다. */
const DEFAULT_PREFERENCE: MapColorSchemePreference = "system";

const isPreference = (value: unknown): value is MapColorSchemePreference =>
  MAP_COLOR_SCHEME_PREFERENCES.includes(value as MapColorSchemePreference);

const readStoredPreference = (): MapColorSchemePreference => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(stored) ? stored : DEFAULT_PREFERENCE;
  } catch {
    // 프라이빗 모드나 저장소 차단 환경에서는 접근 자체가 막힌다.
    return DEFAULT_PREFERENCE;
  }
};

const savePreference = (preference: MapColorSchemePreference) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // 저장에 실패해도 이번 세션 동안은 그대로 동작한다.
  }
};

const readSystemColorScheme = (): MapColorScheme =>
  window.matchMedia?.(DARK_SCHEME_QUERY).matches
    ? "dark"
    : DEFAULT_MAP_COLOR_SCHEME;

const resolveColorScheme = (
  preference: MapColorSchemePreference,
  systemColorScheme: MapColorScheme,
): MapColorScheme => (preference === "system" ? systemColorScheme : preference);

interface MapColorSchemeStore {
  preference: MapColorSchemePreference;
  systemColorScheme: MapColorScheme;
  isHydrated: boolean;
  setPreference: (preference: MapColorSchemePreference) => void;
  toggleColorScheme: () => void;
  hydrate: () => void;
  setSystemColorScheme: (systemColorScheme: MapColorScheme) => void;
}

/**
 * 서버에서는 저장값도 기기 설정도 알 수 없어 기본값으로 시작한다. 렌더 중에
 * 읽으면 서버와 결과가 달라지므로 마운트 뒤 hydrate 로 맞춘다.
 */
const useMapColorSchemeStore = create<MapColorSchemeStore>((set, get) => ({
  preference: DEFAULT_PREFERENCE,
  systemColorScheme: DEFAULT_MAP_COLOR_SCHEME,
  isHydrated: false,
  setPreference: (preference) => {
    savePreference(preference);
    set({ preference });
  },
  toggleColorScheme: () => {
    // 헤더 버튼은 지금 보이는 색의 반대로 넘긴다.
    //
    // 넘어간 색이 기기 설정과 같아지면 명시적으로 고정하지 않고 "시스템 기본값"
    // 으로 되돌린다. 고정해 버리면 한 번 누른 뒤로는 기기 설정을 영영 따르지
    // 않게 되고, 되돌리려면 설정 화면까지 들어가야 한다.
    const { preference, systemColorScheme } = get();
    const next =
      resolveColorScheme(preference, systemColorScheme) === "dark"
        ? "light"
        : "dark";

    get().setPreference(next === systemColorScheme ? "system" : next);
  },
  hydrate: () => {
    if (get().isHydrated) return;
    set({
      preference: readStoredPreference(),
      systemColorScheme: readSystemColorScheme(),
      isHydrated: true,
    });
  },
  setSystemColorScheme: (systemColorScheme) => set({ systemColorScheme }),
}));

/**
 * 기기 설정을 따라가는 중이면 그 변화도 즉시 반영한다.
 *
 * 구독은 시스템을 따르는지와 무관하게 걸어 둔다. "시스템 따름" 으로 바꾸는
 * 순간 이미 값이 최신이어야 하기 때문이다.
 */
const useMapColorSchemeSync = () => {
  const hydrate = useMapColorSchemeStore((state) => state.hydrate);
  const setSystemColorScheme = useMapColorSchemeStore(
    (state) => state.setSystemColorScheme,
  );

  useEffect(() => {
    hydrate();

    const query = window.matchMedia?.(DARK_SCHEME_QUERY);
    if (!query) return;

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemColorScheme(event.matches ? "dark" : "light");
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [hydrate, setSystemColorScheme]);
};

/** 지도에 실제로 적용할 색과 헤더 버튼용 전환. */
export const useMapColorScheme = () => {
  useMapColorSchemeSync();

  const preference = useMapColorSchemeStore((state) => state.preference);
  const systemColorScheme = useMapColorSchemeStore(
    (state) => state.systemColorScheme,
  );
  const toggleColorScheme = useMapColorSchemeStore(
    (state) => state.toggleColorScheme,
  );

  return {
    colorScheme: resolveColorScheme(preference, systemColorScheme),
    toggleColorScheme,
  };
};

/** 설정 화면에서 세 가지 중 하나를 고를 때. */
export const useMapColorSchemePreference = () => {
  useMapColorSchemeSync();

  const preference = useMapColorSchemeStore((state) => state.preference);
  const setPreference = useMapColorSchemeStore((state) => state.setPreference);

  return { preference, setPreference };
};
