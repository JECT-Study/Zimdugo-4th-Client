// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useMapInstance } from "./useMapInstance";

afterEach(() => {
  cleanup();
});

const fakeMap = (label: string) => ({ label }) as unknown as naver.maps.Map;

const renderMapInstance = () => {
  const mapRef = createRef<naver.maps.Map | null>() as {
    current: naver.maps.Map | null;
  };
  mapRef.current = null;
  return { mapRef, ...renderHook(() => useMapInstance({ mapRef })) };
};

describe("useMapInstance", () => {
  it("지도가 붙기 전에는 로딩 중이고 오류가 없다", () => {
    const { result, mapRef } = renderMapInstance();

    expect(result.current.map).toBeNull();
    expect(mapRef.current).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  /**
   * 읽는 시점이 둘로 갈려서 state 와 ref 를 함께 둔다. 렌더에 반영되어야 하는 곳은
   * state 를, 콜백 안에서 지금 지도를 꺼내 쓰는 곳은 ref 를 본다. 한쪽만 채우면
   * 마커 레이어가 지도를 못 받거나 콜백이 옛 지도를 잡는다.
   */
  it("지도를 붙이면 ref 와 state 양쪽에 넣는다", () => {
    const map = fakeMap("attached");
    const { result, mapRef } = renderMapInstance();

    act(() => result.current.attach(map));

    expect(mapRef.current).toBe(map);
    expect(result.current.map).toBe(map);
  });

  it("지도가 사라지면 ref 와 state 를 함께 비운다", () => {
    const { result, mapRef } = renderMapInstance();
    act(() => result.current.attach(fakeMap("attached")));

    act(() => result.current.attach(null));

    expect(mapRef.current).toBeNull();
    expect(result.current.map).toBeNull();
  });

  it("지도를 바꿔 붙이면 나중 지도가 남는다", () => {
    const first = fakeMap("first");
    const second = fakeMap("second");
    const { result, mapRef } = renderMapInstance();

    act(() => result.current.attach(first));
    act(() => result.current.attach(second));

    expect(mapRef.current).toBe(second);
    expect(result.current.map).toBe(second);
  });

  it("다시 만들라고 하면 리마운트 키가 올라간다", () => {
    const { result } = renderMapInstance();
    const before = result.current.remountKey;

    act(() => result.current.remount());

    expect(result.current.remountKey).toBe(before + 1);
  });

  /**
   * 키는 지도를 다시 만드는 트리거라 부를 때마다 달라져야 한다. 같은 값이 나오면
   * 두 번째 새로고침에서 지도가 다시 만들어지지 않는다.
   */
  it("여러 번 다시 만들어도 키가 겹치지 않는다", () => {
    const { result } = renderMapInstance();
    const before = result.current.remountKey;

    act(() => result.current.remount());
    act(() => result.current.remount());

    expect(result.current.remountKey).toBe(before + 2);
  });

  it("붙이기와 다시 만들기는 렌더가 바뀌어도 같은 함수다", () => {
    const { result, rerender } = renderMapInstance();
    const { attach, remount } = result.current;

    rerender();

    expect(result.current.attach).toBe(attach);
    expect(result.current.remount).toBe(remount);
  });
});
