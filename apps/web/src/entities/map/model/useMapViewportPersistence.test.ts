// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMapViewportStore } from "./map-viewport-store";
import { useMapViewportPersistence } from "./useMapViewportPersistence";

const saveFromMap = vi.fn();

beforeEach(() => {
  saveFromMap.mockClear();
  vi.spyOn(useMapViewportStore, "getState").mockReturnValue({
    saveFromMap,
  } as unknown as ReturnType<typeof useMapViewportStore.getState>);
});

afterEach(() => {
  // 자동 정리가 걸려 있지 않아, 남은 훅의 이탈 리스너가 다음 테스트에서 함께 울린다.
  cleanup();
  vi.restoreAllMocks();
});

const fakeMap = (label: string) => ({ label }) as unknown as naver.maps.Map;

const renderPersistence = (map: naver.maps.Map | null) =>
  renderHook(
    ({ current }: { current: naver.maps.Map | null }) =>
      useMapViewportPersistence({ map: current, getMap: () => current }),
    { initialProps: { current: map } },
  );

describe("useMapViewportPersistence", () => {
  it("곧 버려질 지도를 받으면 그 지도를 저장한다", () => {
    const map = fakeMap("destroying");
    const { result } = renderPersistence(null);

    act(() => result.current.persistMapViewport(map));

    expect(saveFromMap).toHaveBeenCalledWith(map);
  });

  it("탭이 가려지면 지금 지도를 저장한다", () => {
    const map = fakeMap("visible");
    renderPersistence(map);

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(saveFromMap).toHaveBeenCalledWith(map);
  });

  /**
   * 가려지는 것과 떠나는 것은 다른 사건이다. iOS 는 탭을 닫을 때
   * visibilitychange 를 주지 않고 pagehide 만 준다.
   */
  it("페이지를 떠날 때도 저장한다", () => {
    const map = fakeMap("leaving");
    renderPersistence(map);

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(saveFromMap).toHaveBeenCalledWith(map);
  });

  it("지도가 없으면 저장하지 않는다", () => {
    renderPersistence(null);

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(saveFromMap).not.toHaveBeenCalled();
  });

  it("떼어내면 이탈 리스너를 걷어간다", () => {
    const { unmount } = renderPersistence(fakeMap("unmounting"));

    unmount();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(saveFromMap).not.toHaveBeenCalled();
  });
});
