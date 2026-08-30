import { useEffect } from "react";
import { create } from "zustand";

import {
  DEFAULT_MAP_COLOR_SCHEME,
  type MapColorScheme,
} from "./naver-map-style";

const STORAGE_KEY = "zimdugo:map-color-scheme";

const isMapColorScheme = (value: unknown): value is MapColorScheme =>
  value === "light" || value === "dark";

/**
 * 저장해 둔 선택이 있으면 그것을, 없으면 기기 설정을 따른다.
 *
 * 서버에서는 둘 다 알 수 없어 기본값을 쓴다. 그래서 첫 렌더는 항상 기본값이고,
 * 마운트 뒤에 hydrate 로 맞춘다. 렌더 중에 읽으면 서버와 결과가 달라진다.
 */
const readInitialColorScheme = (): MapColorScheme => {
  if (typeof window === "undefined") {
    return DEFAULT_MAP_COLOR_SCHEME;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isMapColorScheme(stored)) {
      return stored;
    }
  } catch {
    // 프라이빗 모드나 저장소 차단 환경에서는 접근 자체가 막힌다.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : DEFAULT_MAP_COLOR_SCHEME;
};

const saveColorScheme = (colorScheme: MapColorScheme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, colorScheme);
  } catch {
    // 저장에 실패해도 이번 세션 동안은 그대로 동작한다.
  }
};

interface MapColorSchemeStore {
  colorScheme: MapColorScheme;
  isHydrated: boolean;
  setColorScheme: (colorScheme: MapColorScheme) => void;
  toggleColorScheme: () => void;
  hydrate: () => void;
}

const useMapColorSchemeStore = create<MapColorSchemeStore>((set, get) => ({
  colorScheme: DEFAULT_MAP_COLOR_SCHEME,
  isHydrated: false,
  setColorScheme: (colorScheme) => {
    saveColorScheme(colorScheme);
    set({ colorScheme });
  },
  toggleColorScheme: () => {
    get().setColorScheme(get().colorScheme === "dark" ? "light" : "dark");
  },
  hydrate: () => {
    if (get().isHydrated) return;
    set({ colorScheme: readInitialColorScheme(), isHydrated: true });
  },
}));

export const useMapColorScheme = () => {
  const colorScheme = useMapColorSchemeStore((state) => state.colorScheme);
  const toggleColorScheme = useMapColorSchemeStore(
    (state) => state.toggleColorScheme,
  );
  const hydrate = useMapColorSchemeStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { colorScheme, toggleColorScheme };
};
