import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MediaListener = (event: MediaQueryListEvent) => void;

const listeners = new Set<MediaListener>();

const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      addEventListener: (_: string, listener: MediaListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_: string, listener: MediaListener) => {
        listeners.delete(listener);
      },
    })),
  );
};

const emitSystemChange = (matches: boolean) => {
  for (const listener of listeners) {
    listener({ matches } as MediaQueryListEvent);
  }
};

/** 스토어가 모듈 단위 싱글턴이라 케이스마다 새로 읽는다. */
const importStore = async () => {
  vi.resetModules();
  return import("./map-color-scheme-store");
};

beforeEach(() => {
  listeners.clear();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("map-color-scheme-store", () => {
  it("저장값이 없으면 기기 설정을 따른다", async () => {
    stubMatchMedia(true);
    const { useMapColorScheme } = await importStore();

    const { result } = renderHook(() => useMapColorScheme());

    expect(result.current.colorScheme).toBe("dark");
  });

  it("기기 설정을 따르는 동안에는 그 변화를 즉시 반영한다", async () => {
    stubMatchMedia(false);
    const { useMapColorScheme } = await importStore();

    const { result } = renderHook(() => useMapColorScheme());
    expect(result.current.colorScheme).toBe("light");

    act(() => emitSystemChange(true));

    expect(result.current.colorScheme).toBe("dark");
  });

  it("직접 고르면 기기 설정을 더 따르지 않는다", async () => {
    stubMatchMedia(true);
    const { useMapColorScheme, useMapColorSchemePreference } =
      await importStore();

    const { result } = renderHook(() => ({
      ...useMapColorScheme(),
      ...useMapColorSchemePreference(),
    }));

    act(() => result.current.setPreference("light"));

    expect(result.current.colorScheme).toBe("light");

    act(() => emitSystemChange(true));

    expect(result.current.colorScheme).toBe("light");
  });

  it("헤더 전환은 지금 보이는 색의 반대를 고른다", async () => {
    stubMatchMedia(true);
    const { useMapColorScheme, useMapColorSchemePreference } =
      await importStore();

    const { result } = renderHook(() => ({
      ...useMapColorScheme(),
      ...useMapColorSchemePreference(),
    }));
    expect(result.current.preference).toBe("system");

    act(() => result.current.toggleColorScheme());

    expect(result.current.preference).toBe("light");
    expect(result.current.colorScheme).toBe("light");
  });

  it("헤더 전환이 기기 설정과 같아지면 시스템 기본값으로 되돌린다", async () => {
    stubMatchMedia(true);
    const { useMapColorScheme, useMapColorSchemePreference } =
      await importStore();

    const { result } = renderHook(() => ({
      ...useMapColorScheme(),
      ...useMapColorSchemePreference(),
    }));

    // 기기가 다크다. 한 번 누르면 라이트로 고정된다.
    act(() => result.current.toggleColorScheme());
    expect(result.current.preference).toBe("light");

    // 다시 누르면 다크가 되는데 기기 설정과 같으므로 고정하지 않는다.
    act(() => result.current.toggleColorScheme());
    expect(result.current.preference).toBe("system");
    expect(result.current.colorScheme).toBe("dark");
  });

  it("고른 값을 저장해 다음 방문에 되살린다", async () => {
    stubMatchMedia(true);
    const first = await importStore();

    const { result } = renderHook(() => first.useMapColorSchemePreference());
    act(() => result.current.setPreference("dark"));

    const second = await importStore();
    const revisited = renderHook(() => second.useMapColorSchemePreference());

    expect(revisited.result.current.preference).toBe("dark");
  });
});
