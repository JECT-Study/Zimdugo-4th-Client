import { describe, expect, it, vi } from "vitest";

import {
  CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX,
  CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  CLUSTER_FIT_BOUNDS_TOP_PADDING_PX,
  fitNaverMapToBounds,
  focusNaverMapOnClusterBounds,
  getFitBoundsZoom,
  MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
  MIN_FIT_BOUNDS_RADIUS_METERS,
  normalizeLockerBounds,
} from "./map-bounds";

class FakeLatLng {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
  ) {}
}

class FakeLatLngBounds {
  constructor(
    readonly southWest: FakeLatLng,
    readonly northEast: FakeLatLng,
  ) {}
}

const createFakeMaps = () =>
  ({
    LatLng: FakeLatLng,
    LatLngBounds: FakeLatLngBounds,
  }) as unknown as typeof naver.maps;

describe("normalizeLockerBounds", () => {
  it("점에 가까운 범위를 최소 반경까지 넓힌다", () => {
    const normalized = normalizeLockerBounds({
      swLat: 37.497958,
      swLng: 127.027539,
      neLat: 37.497958,
      neLng: 127.027539,
    });

    expect(normalized.swLat).toBeLessThan(37.497958);
    expect(normalized.swLng).toBeLessThan(127.027539);
    expect(normalized.neLat).toBeGreaterThan(37.497958);
    expect(normalized.neLng).toBeGreaterThan(127.027539);
  });

  it("넉넉한 검색 범위는 그대로 둔다", () => {
    const bounds = {
      swLat: 37.496068,
      swLng: 127.027539,
      neLat: 37.517185,
      neLng: 127.04122,
    };

    const normalized = normalizeLockerBounds(bounds);

    expect(normalized.swLat).toBeCloseTo(bounds.swLat);
    expect(normalized.swLng).toBeCloseTo(bounds.swLng);
    expect(normalized.neLat).toBeCloseTo(bounds.neLat);
    expect(normalized.neLng).toBeCloseTo(bounds.neLng);
  });
});

describe("focusNaverMapOnClusterBounds", () => {
  it("최소·최대 줌 안에서 맞춘 줌으로 범위 중심까지 움직인다", () => {
    const morph = vi.fn();
    const map = {
      getZoom: vi.fn(() => 10),
      getSize: vi.fn(() => ({ width: 375, height: 812 })),
      morph,
    } as unknown as naver.maps.Map;
    const maps = createFakeMaps();
    const bounds = {
      swLat: 37.45,
      swLng: 126.95,
      neLat: 37.55,
      neLng: 127.05,
    };

    focusNaverMapOnClusterBounds({
      map,
      maps,
      bounds,
    });

    const [latLng, zoom, options] = morph.mock.calls[0] ?? [];
    const center = latLng as FakeLatLng;
    const expectedZoom = Math.min(
      Math.max(
        Math.min(
          getFitBoundsZoom({
            bounds: normalizeLockerBounds(
              bounds,
              MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
            ),
            mapSize: { width: 375, height: 812 },
            topPadding: CLUSTER_FIT_BOUNDS_TOP_PADDING_PX,
            rightPadding: CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
            bottomPadding: CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX,
            leftPadding: CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
          }),
          14,
        ),
        12,
      ),
      16,
    );

    expect(morph).toHaveBeenCalledTimes(1);
    expect(center.latitude).toBeCloseTo(37.5);
    expect(center.longitude).toBe(127);
    expect(zoom).toBe(expectedZoom);
    expect(options).toMatchObject({
      duration: 800,
      easing: "easeOutCubic",
    });
  });

  it("클러스터 범위가 아주 좁아도 최대 줌을 넘지 않는다", () => {
    const morph = vi.fn();
    const map = {
      getZoom: vi.fn(() => 15),
      getSize: vi.fn(() => ({ width: 375, height: 812 })),
      morph,
    } as unknown as naver.maps.Map;

    focusNaverMapOnClusterBounds({
      map,
      maps: createFakeMaps(),
      bounds: {
        swLat: 37.497958,
        swLng: 127.027539,
        neLat: 37.497958,
        neLng: 127.027539,
      },
      maxZoom: 16,
      minRadiusMeters: 1,
    });

    expect(morph.mock.calls[0]?.[1]).toBe(16);
  });

  it("최소 줌보다 두 단계 높은 값을 쓴다", () => {
    const morph = vi.fn();
    const map = {
      getZoom: vi.fn(() => 6),
      morph,
    } as unknown as naver.maps.Map;

    focusNaverMapOnClusterBounds({
      map,
      maps: createFakeMaps(),
      bounds: {
        swLat: 33,
        swLng: 126,
        neLat: 38,
        neLng: 129,
      },
    });

    expect(morph.mock.calls[0]?.[1]).toBe(8);
  });

  it("줌 9 위에서도 최소보다 두 단계 높은 값을 쓴다", () => {
    const morph = vi.fn();
    const map = {
      getZoom: vi.fn(() => 10),
      morph,
    } as unknown as naver.maps.Map;

    focusNaverMapOnClusterBounds({
      map,
      maps: createFakeMaps(),
      bounds: {
        swLat: 33,
        swLng: 126,
        neLat: 38,
        neLng: 129,
      },
    });

    expect(morph.mock.calls[0]?.[1]).toBe(12);
  });

  it("현재 줌에서 네 단계 넘게 움직이지 않는다", () => {
    const morph = vi.fn();
    const map = {
      getZoom: vi.fn(() => 10),
      getSize: vi.fn(() => ({ width: 375, height: 812 })),
      morph,
    } as unknown as naver.maps.Map;

    focusNaverMapOnClusterBounds({
      map,
      maps: createFakeMaps(),
      bounds: {
        swLat: 37.497958,
        swLng: 127.027539,
        neLat: 37.497958,
        neLng: 127.027539,
      },
      maxZoom: 16,
      minRadiusMeters: 1,
    });

    expect(morph.mock.calls[0]?.[1]).toBe(14);
  });

  it("부드러운 이동을 못 쓰면 중심과 줌을 함께 지정한다", () => {
    const setCenter = vi.fn();
    const setZoom = vi.fn();
    const map = {
      getZoom: vi.fn(() => 10),
      getSize: vi.fn(() => ({ width: 375, height: 812 })),
      setCenter,
      setZoom,
    } as unknown as naver.maps.Map;

    focusNaverMapOnClusterBounds({
      map,
      maps: createFakeMaps(),
      bounds: {
        swLat: 37.45,
        swLng: 126.95,
        neLat: 37.55,
        neLng: 127.05,
      },
    });

    const [latLng] = setCenter.mock.calls[0] ?? [];
    const center = latLng as FakeLatLng;

    expect(setCenter).toHaveBeenCalledTimes(1);
    expect(center.latitude).toBeCloseTo(37.5);
    expect(center.longitude).toBe(127);
    expect(setZoom).toHaveBeenCalledTimes(1);
    expect(setZoom.mock.calls[0]?.[0]).toBeTypeOf("number");
  });
});

describe("fitNaverMapToBounds", () => {
  it("fitBounds 를 부르기 전에 범위를 정규화한다", () => {
    const fitBounds = vi.fn();
    const map = { fitBounds } as unknown as naver.maps.Map;
    const maps = createFakeMaps();

    fitNaverMapToBounds({
      map,
      maps,
      bounds: {
        swLat: 37.497958,
        swLng: 127.027539,
        neLat: 37.497958,
        neLng: 127.027539,
      },
    });

    const [latLngBounds] = fitBounds.mock.calls[0] ?? [];
    const normalizedBounds = latLngBounds as unknown as FakeLatLngBounds;

    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    expect(normalizedBounds.southWest.latitude).toBeLessThan(37.497958);
    expect(normalizedBounds.northEast.latitude).toBeGreaterThan(37.497958);
  });

  it("부르는 쪽이 최소 반경을 바꿔 줄 수 있다", () => {
    const normalized = normalizeLockerBounds(
      {
        swLat: 37.497958,
        swLng: 127.027539,
        neLat: 37.497958,
        neLng: 127.027539,
      },
      MIN_FIT_BOUNDS_RADIUS_METERS * 2,
    );

    expect(37.497958 - normalized.swLat).toBeGreaterThan(
      MIN_FIT_BOUNDS_RADIUS_METERS / 111_320,
    );
  });

  it("범위를 맞추기 전에 클러스터용 최소 반경을 쓸 수 있다", () => {
    const fitBounds = vi.fn();
    const map = { fitBounds } as unknown as naver.maps.Map;
    const maps = createFakeMaps();

    fitNaverMapToBounds({
      map,
      maps,
      bounds: {
        swLat: 37.497958,
        swLng: 127.027539,
        neLat: 37.497958,
        neLng: 127.027539,
      },
      minRadiusMeters: MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
    });

    const [latLngBounds] = fitBounds.mock.calls[0] ?? [];
    const normalizedBounds = latLngBounds as unknown as FakeLatLngBounds;

    expect(37.497958 - normalizedBounds.southWest.latitude).toBeCloseTo(
      MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS / 111_320,
    );
  });
});
