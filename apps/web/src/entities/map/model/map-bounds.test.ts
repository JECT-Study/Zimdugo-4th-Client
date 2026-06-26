import { describe, expect, it, vi } from "vitest";

import {
  CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX,
  CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  CLUSTER_FIT_BOUNDS_TOP_PADDING_PX,
  MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
  MIN_FIT_BOUNDS_RADIUS_METERS,
  focusNaverMapOnClusterBounds,
  fitNaverMapToBounds,
  getFitBoundsZoom,
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
  it("expands point-like bounds to a minimum visible radius", () => {
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

  it("keeps broad search bounds unchanged", () => {
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
  it("morphs to the bounds center using a fit zoom within min and max zoom", () => {
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

  it("does not zoom past the max zoom for tiny cluster bounds", () => {
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

  it("uses the minimum +2 zoom", () => {
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

  it("uses the minimum +2 zoom above zoom level 9", () => {
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

  it("does not zoom more than four levels from the current zoom", () => {
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
});

describe("fitNaverMapToBounds", () => {
  it("uses normalized bounds before calling fitBounds", () => {
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

  it("allows callers to override the minimum radius", () => {
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

  it("can use the cluster minimum radius before fitting bounds", () => {
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

    expect(37.497958 - normalizedBounds.southWest.latitude).toBeGreaterThan(
      MIN_FIT_BOUNDS_RADIUS_METERS / 111_320,
    );
  });
});
