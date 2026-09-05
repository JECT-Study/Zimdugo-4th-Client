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

/**
 * jsdom 의 visibilityState 는 읽기 전용이라 defineProperty 로 덮어야 한다. 덮은 것은
 * vi.restoreAllMocks 로 되돌아오지 않으므로, 원래 descriptor 를 들고 있다가 직접 되돌린다.
 * 안 그러면 이 파일의 뒤 테스트들이 영영 "hidden" 인 문서를 보게 된다.
 */
const originalVisibilityState = Object.getOwnPropertyDescriptor(
  Document.prototype,
  "visibilityState",
);

const setVisibilityState = (value: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => value,
  });
};

afterEach(() => {
  // 자동 정리가 걸려 있지 않아, 남은 훅의 이탈 리스너가 다음 테스트에서 함께 울린다.
  cleanup();
  vi.restoreAllMocks();

  Reflect.deleteProperty(document, "visibilityState");
  if (originalVisibilityState) {
    Object.defineProperty(
      Document.prototype,
      "visibilityState",
      originalVisibilityState,
    );
  }
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
      setVisibilityState("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(saveFromMap).toHaveBeenCalledWith(map);
  });

  it("탭이 다시 보이는 것만으로는 저장하지 않는다", () => {
    renderPersistence(fakeMap("returning"));

    act(() => {
      setVisibilityState("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(saveFromMap).not.toHaveBeenCalled();
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

  it("지도가 바뀐 뒤 떠나면 바뀐 지도를 저장한다", () => {
    const first = fakeMap("first");
    const second = fakeMap("second");
    const { rerender } = renderPersistence(first);

    rerender({ current: second });

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(saveFromMap).toHaveBeenCalledWith(second);
    expect(saveFromMap).not.toHaveBeenCalledWith(first);
  });

  /**
   * 훅이 지도를 state 가 아니라 getMap 함수로 받는 이유가 이것이다. 저장 콜백의 identity 가
   * 지도에 묶이면 지도가 바뀔 때마다 이탈 리스너를 떼었다 붙이게 된다. 바뀐 지도를 저장하는
   * 것만으로는 두 구현이 갈리지 않아, 리스너가 그대로인지를 직접 잰다.
   */
  it("지도가 바뀌어도 이탈 리스너를 다시 붙이지 않는다", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const countPagehide = (spy: typeof addSpy) =>
      spy.mock.calls.filter(([type]) => type === "pagehide").length;

    const { rerender } = renderPersistence(fakeMap("first"));
    const addedAfterMount = countPagehide(addSpy);

    rerender({ current: fakeMap("second") });

    expect(countPagehide(addSpy)).toBe(addedAfterMount);
    expect(countPagehide(removeSpy)).toBe(0);
  });
});
