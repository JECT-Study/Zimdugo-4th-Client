// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_MAP_CENTER } from "./map-viewport-bootstrap";
import { useMapViewportStore } from "./map-viewport-store";
import { useMapInitialCamera } from "./useMapInitialCamera";

const FALLBACK = { lat: 37.4979, lng: 127.0276 };
const DETAIL_ZOOM = 17;
const GPS = { lat: 37.5665, lng: 126.978 };
const DEEP_LINK = { lat: 35.1796, lng: 129.0756 };

type Options = Parameters<typeof useMapInitialCamera>[0];

const options = (overrides: Partial<Options> = {}): Options => ({
  lockerId: undefined,
  focusLat: null,
  focusLng: null,
  detail: null,
  fallbackCenter: FALLBACK,
  detailZoom: DETAIL_ZOOM,
  permission: "prompt",
  location: null,
  remountKey: 0,
  ...overrides,
});

beforeEach(() => {
  useMapViewportStore.getState().setCache(null);
});

afterEach(() => {
  cleanup();
  useMapViewportStore.getState().setCache(null);
});

describe("useMapInitialCamera", () => {
  it("아무 단서가 없으면 기본 자리에서 뜬다", () => {
    const { result } = renderHook(() => useMapInitialCamera(options()));

    expect(result.current.center).toEqual(DEFAULT_MAP_CENTER);
  });

  it("권한이 있으면 GPS 자리에서 뜬다", () => {
    const { result } = renderHook(() =>
      useMapInitialCamera(options({ permission: "granted", location: GPS })),
    );

    expect(result.current.center).toEqual(GPS);
  });

  it("로더가 가져온 상세가 있으면 그 좌표를 상세 배율로 비춘다", () => {
    const { result } = renderHook(() =>
      useMapInitialCamera(
        options({
          lockerId: 164,
          detail: { latitude: 35.1796, longitude: 129.0756 },
          permission: "granted",
          location: GPS,
        }),
      ),
    );

    expect(result.current).toEqual({ center: DEEP_LINK, zoom: DETAIL_ZOOM });
  });

  /** 좌표가 비어 있어도 상세를 보고 있다는 사실은 그대로다. 떨어질 자리로 간다. */
  it("상세에 좌표가 없으면 떨어질 자리로 간다", () => {
    const { result } = renderHook(() =>
      useMapInitialCamera(
        options({ lockerId: 164, detail: { latitude: null, longitude: null } }),
      ),
    );

    expect(result.current).toEqual({ center: FALLBACK, zoom: DETAIL_ZOOM });
  });

  it("딥링크 좌표는 GPS 보다 앞선다", () => {
    const { result } = renderHook(() =>
      useMapInitialCamera(
        options({
          focusLat: DEEP_LINK.lat,
          focusLng: DEEP_LINK.lng,
          permission: "granted",
          location: GPS,
        }),
      ),
    );

    expect(result.current.center).toEqual(DEEP_LINK);
  });

  /**
   * 딥링크로 상세를 열면 URL 이 `?locker=…` 로 다시 쓰이며 좌표가 사라진다. 그 뒤에
   * 테마를 바꾸면 지도를 다시 만드는데, 잊으면 엉뚱한 곳에서 다시 뜬다.
   */
  it("URL 에서 딥링크 좌표가 지워져도 상세를 보는 동안은 기억한다", () => {
    const { result, rerender } = renderHook(
      (props: Options) => useMapInitialCamera(props),
      {
        initialProps: options({
          lockerId: 164,
          focusLat: DEEP_LINK.lat,
          focusLng: DEEP_LINK.lng,
        }),
      },
    );

    rerender(options({ lockerId: 164, remountKey: 1 }));

    expect(result.current.center).toEqual(DEEP_LINK);
  });

  it("상세를 닫으면 딥링크 좌표를 잊는다", () => {
    const { result, rerender } = renderHook(
      (props: Options) => useMapInitialCamera(props),
      {
        initialProps: options({
          lockerId: 164,
          focusLat: DEEP_LINK.lat,
          focusLng: DEEP_LINK.lng,
        }),
      },
    );

    rerender(options({ remountKey: 1 }));

    expect(result.current.center).toEqual(DEFAULT_MAP_CENTER);
  });

  /**
   * 홈을 그냥 열었을 때는 저장된 뷰포트를 쓰지 않는다. 집에서 나와 회사에서 열면
   * 어제 보던 자리가 아니라 지금 있는 자리를 보여야 한다.
   */
  it("홈을 그냥 열면 저장된 뷰포트를 쓰지 않는다", () => {
    useMapViewportStore
      .getState()
      .setCache({ center: DEEP_LINK, zoom: 12, savedAt: Date.now() });

    const { result } = renderHook(() => useMapInitialCamera(options()));

    expect(result.current.center).toEqual(DEFAULT_MAP_CENTER);
  });

  it("상세를 보고 있으면 저장된 뷰포트를 쓴다", () => {
    useMapViewportStore
      .getState()
      .setCache({ center: DEEP_LINK, zoom: 12, savedAt: Date.now() });

    const { result } = renderHook(() =>
      useMapInitialCamera(options({ lockerId: 164 })),
    );

    expect(result.current).toEqual({ center: DEEP_LINK, zoom: 12 });
  });

  /**
   * 지도를 다시 만들 때 초기 카메라를 새로 계산해야 한다.
   *
   * 리마운트 키 **하나만** 바꾼다. 다른 입력을 함께 바꾸면 그것 때문에 다시 계산된
   * 것인지 키 때문인지 가릴 수 없어, 키를 빼도 통과하는 단언이 된다.
   */
  it("다른 입력이 그대로여도 리마운트 키가 오르면 초기 카메라를 새로 잰다", () => {
    const { result, rerender } = renderHook(
      (props: Options) => useMapInitialCamera(props),
      { initialProps: options({ lockerId: 164 }) },
    );
    expect(result.current.center).toEqual(DEFAULT_MAP_CENTER);

    // 지도를 다시 만들기 직전에 지금 보던 자리가 저장된다.
    useMapViewportStore
      .getState()
      .setCache({ center: DEEP_LINK, zoom: 12, savedAt: Date.now() });
    rerender(options({ lockerId: 164, remountKey: 1 }));

    expect(result.current).toEqual({ center: DEEP_LINK, zoom: 12 });
  });
});
