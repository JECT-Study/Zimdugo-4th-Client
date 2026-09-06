// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useLocationIntent } from "./useLocationIntent";

afterEach(() => {
  cleanup();
});

const render = () => renderHook(() => useLocationIntent()).result;

describe("useLocationIntent", () => {
  it("아무 요청도 없으면 꺼낼 것이 없다", () => {
    const { current } = render();

    expect(current.isUserInitiated()).toBe(false);
    expect(current.consumeCenterOnce()).toBe(false);
    expect(current.consumeOrientationStart()).toBe(false);
  });

  it("한 번 비추기를 요청하면 사용자 요청으로도 표시된다", () => {
    const { current } = render();

    current.requestCenterOnce();

    expect(current.isUserInitiated()).toBe(true);
    expect(current.consumeCenterOnce()).toBe(true);
  });

  it("방향 추적을 요청하면 사용자 요청으로도 표시된다", () => {
    const { current } = render();

    current.requestOrientationStart();

    expect(current.isUserInitiated()).toBe(true);
    expect(current.consumeOrientationStart()).toBe(true);
  });

  /**
   * 위치는 계속 들어온다. 꺼낸 요청이 남아 있으면 두 번째 위치에서도 카메라가 움직여
   * 사용자가 그 사이 옮겨 둔 화면을 덮는다.
   */
  it("꺼낸 요청은 두 번 쓰이지 않는다", () => {
    const { current } = render();

    current.requestCenterOnce();

    expect(current.consumeCenterOnce()).toBe(true);
    expect(current.consumeCenterOnce()).toBe(false);
  });

  it("두 요청은 서로를 꺼내지 않는다", () => {
    const { current } = render();

    current.requestCenterOnce();

    expect(current.consumeOrientationStart()).toBe(false);
    expect(current.consumeCenterOnce()).toBe(true);
  });

  it("지우면 사용자 요청 표시까지 함께 사라진다", () => {
    const { current } = render();
    current.requestOrientationStart();

    current.clear();

    expect(current.isUserInitiated()).toBe(false);
    expect(current.consumeOrientationStart()).toBe(false);
  });

  /**
   * 성공했을 때는 "사용자가 눌렀다" 만 내리고 하려던 일은 남긴다. 위치가 왔다고 해서
   * 아직 비추지 않았기 때문이다.
   */
  it("사용자 요청만 내려도 하려던 일은 남는다", () => {
    const { current } = render();
    current.requestCenterOnce();

    current.clearUserInitiated();

    expect(current.isUserInitiated()).toBe(false);
    expect(current.consumeCenterOnce()).toBe(true);
  });

  it("렌더가 바뀌어도 같은 창구다", () => {
    const { result, rerender } = renderHook(() => useLocationIntent());
    const before = result.current;

    rerender();

    expect(result.current).toBe(before);
  });
});
