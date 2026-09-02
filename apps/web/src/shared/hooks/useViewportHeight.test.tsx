import { act, renderHook } from "@testing-library/react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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

function HeightProbe() {
  return <span>{useViewportHeight()}</span>;
}

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
  /**
   * 커밋이 끝난 자리에서 재면 useEffect 로 바꿔도 통과한다. `renderHook` 은 렌더를
   * act 로 감싸 passive effect 까지 돌린 뒤 값을 주기 때문이다.
   *
   * 그래서 passive effect 가 아직 돌지 않은 시점, 즉 flushSync 가 끝난 직후의 DOM 을
   * 본다. layout effect 로 재면 그 안에서 다시 그려져 실제 값이 이미 들어 있고,
   * useEffect 로 재면 이 시점에는 기본값이 남아 있다.
   */
  it("첫 그림이 그려지기 전에 실제 창 높이로 맞춘다", () => {
    setInnerHeight(640);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const previousActEnvironment = (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT;
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = false;

    try {
      flushSync(() => root.render(<HeightProbe />));

      expect(container.textContent).toBe("640");
    } finally {
      (
        globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
      ).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
      flushSync(() => root.unmount());
      container.remove();
    }
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

  /**
   * 서버 렌더는 이펙트를 돌리지 않는다. 창을 못 보는 그 렌더가 무엇을 내는지 직접
   * 확인해야, 초기값이 창에서 오도록 바뀌었을 때 여기서 걸린다. 상수만 비교하면
   * 훅이 창을 읽어도 상수가 812 인 한 통과한다.
   */
  it("창을 볼 수 없는 첫 렌더에는 설계 기준 높이를 쓴다", () => {
    setInnerHeight(768);

    expect(renderToString(<HeightProbe />)).toContain(
      String(VIEWPORT_HEIGHT_FALLBACK_PX),
    );
  });

  it("떼어내면 붙여 둔 resize 리스너를 걷어간다", () => {
    const resizeListeners = trackResizeListeners();

    const { unmount } = renderHook(() => useViewportHeight());
    expect(resizeListeners.size).toBe(1);

    unmount();

    expect(resizeListeners.size).toBe(0);
  });
});
