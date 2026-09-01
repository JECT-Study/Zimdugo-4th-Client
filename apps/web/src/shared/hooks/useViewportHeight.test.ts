import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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

afterEach(() => {
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

  it("떼어내면 리스너를 남기지 않는다", () => {
    const { result, unmount } = renderHook(() => useViewportHeight());
    const heightBeforeUnmount = result.current;

    unmount();

    act(() => {
      setInnerHeight(200);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(heightBeforeUnmount);
  });
});
