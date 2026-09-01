import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useViewportHeight,
  VIEWPORT_HEIGHT_FALLBACK_PX,
} from "./useViewportHeight";

const setInnerHeight = (height: number) => {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
};

/**
 * 지금 창에 붙어 있는 resize 리스너.
 *
 * 훅이 떼어 갔는지 보려면 실제로 붙고 떨어진 것을 세야 한다. 언마운트한 훅의
 * setter 는 React 가 삼키므로, resize 를 쏘고 값이 그대로인지 보는 것으로는
 * 리스너가 남아 있어도 통과한다.
 */
const trackResizeListeners = () => {
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const add = window.addEventListener.bind(window);
  const remove = window.removeEventListener.bind(window);

  vi.spyOn(window, "addEventListener").mockImplementation(
    (type, listener, options) => {
      if (type === "resize" && listener) listeners.add(listener);
      return add(type, listener, options);
    },
  );
  vi.spyOn(window, "removeEventListener").mockImplementation(
    (type, listener, options) => {
      if (type === "resize" && listener) listeners.delete(listener);
      return remove(type, listener, options);
    },
  );

  return listeners;
};

beforeEach(() => {
  setInnerHeight(768);
});

afterEach(() => {
  vi.restoreAllMocks();
  setInnerHeight(768);
});

describe("useViewportHeight", () => {
  it("그리기 전에 실제 창 높이로 맞춘다", () => {
    setInnerHeight(640);

    const { result } = renderHook(() => useViewportHeight());

    expect(result.current).toBe(640);
  });

  it("창 크기가 바뀌면 따라간다", () => {
    setInnerHeight(812);
    const { result } = renderHook(() => useViewportHeight());

    act(() => {
      setInnerHeight(390);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(390);
  });

  it("창을 알 수 없는 첫 렌더에는 설계 기준 높이를 쓴다", () => {
    // 서버가 그리는 값이다. 클라이언트가 첫 렌더부터 다른 값을 쓰면 마크업이 갈린다.
    expect(VIEWPORT_HEIGHT_FALLBACK_PX).toBe(812);
  });

  it("떼어내면 붙여 둔 resize 리스너를 걷어간다", () => {
    const resizeListeners = trackResizeListeners();

    const { unmount } = renderHook(() => useViewportHeight());
    expect(resizeListeners.size).toBe(1);

    unmount();

    expect(resizeListeners.size).toBe(0);
  });
});
