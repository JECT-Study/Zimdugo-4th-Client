import { describe, expect, it, vi } from "vitest";

import {
  MIN_FIT_BOUNDS_RADIUS_METERS,
  fitNaverMapToBounds,
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
});
