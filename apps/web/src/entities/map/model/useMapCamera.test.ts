// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as currentLocation from "./current-location";
import * as mapBounds from "./map-bounds";
import { useMapCamera } from "./useMapCamera";

const focusSpy = vi.spyOn(currentLocation, "focusNaverMapOnCoordinates");
const fitSpy = vi.spyOn(mapBounds, "fitNaverMapToBounds");

beforeEach(() => {
  focusSpy.mockReset().mockReturnValue(true);
  fitSpy.mockReset().mockReturnValue(true);
});

afterEach(() => {
  cleanup();
});

const fakeMap = (zoom?: number) =>
  ({ getZoom: () => zoom }) as unknown as naver.maps.Map;

const renderCamera = (map: naver.maps.Map | null) =>
  renderHook(
    ({ current }: { current: naver.maps.Map | null }) =>
      useMapCamera({ getMap: () => current }),
    { initialProps: { current: map } },
  );

describe("useMapCamera", () => {
  it("좌표를 비추면 지금 지도에 그 좌표를 넘긴다", () => {
    const map = fakeMap(15);
    const { result } = renderCamera(map);

    act(() => {
      result.current.focusOn({ lat: 37.5, lng: 127 }, { zoom: 17 });
    });

    expect(focusSpy).toHaveBeenCalledWith({
      map,
      coordinates: { lat: 37.5, lng: 127 },
      zoom: 17,
    });
  });

  it("범위에 맞추면 지금 지도에 그 범위를 넘긴다", () => {
    const map = fakeMap(15);
    const bounds = { swLat: 37.4, swLng: 127.0, neLat: 37.6, neLng: 127.2 };
    const { result } = renderCamera(map);

    act(() => {
      result.current.fitBounds(bounds, { bottomPadding: 200 });
    });

    expect(fitSpy).toHaveBeenCalledWith({ map, bounds, bottomPadding: 200 });
  });

  /**
   * 지도가 없을 때 아무것도 하지 않는 판단은 헬퍼가 이미 하고 있다. 훅이 자기 가드를
   * 따로 세우면 판단이 두 곳으로 갈리므로, 넘기기만 하고 결과를 그대로 돌려준다.
   */
  it("지도가 없어도 명령을 삼키지 않고 헬퍼에 맡긴다", () => {
    focusSpy.mockReturnValue(false);
    const { result } = renderCamera(null);

    let returned: boolean | undefined;
    act(() => {
      returned = result.current.focusOn({ lat: 37.5, lng: 127 });
    });

    expect(focusSpy).toHaveBeenCalledWith({
      map: null,
      coordinates: { lat: 37.5, lng: 127 },
    });
    expect(returned).toBe(false);
  });

  it("지도가 바뀌면 그 뒤 명령은 바뀐 지도로 간다", () => {
    const first = fakeMap(15);
    const second = fakeMap(15);
    const { result, rerender } = renderCamera(first);

    rerender({ current: second });
    act(() => {
      result.current.focusOn({ lat: 37.5, lng: 127 });
    });

    expect(focusSpy).toHaveBeenCalledWith(
      expect.objectContaining({ map: second }),
    );
  });

  it("줌을 물으면 지금 지도의 줌을 준다", () => {
    const { result } = renderCamera(fakeMap(14));

    expect(result.current.getZoom()).toBe(14);
  });

  /**
   * 줌 0 은 실제로 있을 수 있는 값이라, 없다는 뜻을 0 으로 돌려주면 호출부가 둘을
   * 가르지 못한다. 없을 때는 null 이어야 한다.
   */
  it("지도가 없으면 줌을 0 이 아니라 null 로 답한다", () => {
    const { result } = renderCamera(null);

    expect(result.current.getZoom()).toBeNull();
  });

  it("줌이 0 이면 0 을 그대로 준다", () => {
    const { result } = renderCamera(fakeMap(0));

    expect(result.current.getZoom()).toBe(0);
  });

  /**
   * 이 객체를 의존성으로 쥔 콜백과 이펙트가 열몇 곳이다. 매 렌더 새 객체를 주면 그것들이
   * 전부 다시 만들어진다.
   */
  it("지도가 바뀌어도 명령 묶음은 같은 객체다", () => {
    const { result, rerender } = renderCamera(fakeMap(15));
    const before = result.current;

    rerender({ current: fakeMap(16) });

    expect(result.current).toBe(before);
  });
});
