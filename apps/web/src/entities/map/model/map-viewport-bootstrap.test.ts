import { describe, expect, it } from "vitest";

import {
  haversineDistanceM,
  isMapViewportCacheStale,
  MAP_VIEWPORT_STALE_DISTANCE_M,
  MAP_VIEWPORT_STALE_MS,
  type MapViewportCache,
  resolveMapBootstrapViewport,
} from "./map-viewport-bootstrap";

const createCache = (
  overrides: Partial<MapViewportCache> = {},
): MapViewportCache => ({
  center: { lat: 37.5, lng: 127.0 },
  zoom: 14,
  savedAt: Date.now(),
  ...overrides,
});

describe("map-viewport-bootstrap", () => {
  it("딥링크 좌표가 캐시보다 우선한다", () => {
    const result = resolveMapBootstrapViewport({
      deepLinkCenter: { lat: 37.51, lng: 127.05 },
      cache: createCache(),
    });

    expect(result.center).toEqual({ lat: 37.51, lng: 127.05 });
  });

  it("유효한 캐시가 있으면 center/zoom을 복원한다", () => {
    const cache = createCache({
      center: { lat: 37.55, lng: 127.02 },
      zoom: 13,
    });

    const result = resolveMapBootstrapViewport({
      cache,
      now: cache.savedAt + 1_000,
    });

    expect(result.center).toEqual(cache.center);
    expect(result.zoom).toBe(13);
  });

  it("GPS가 있으면 유효한 캐시보다 GPS를 우선한다", () => {
    const cache = createCache({
      center: { lat: 37.55, lng: 127.02 },
      zoom: 13,
    });
    const gps = { lat: 37.56, lng: 127.03 };

    const result = resolveMapBootstrapViewport({
      cache,
      permission: "granted",
      gps,
      now: cache.savedAt + 1_000,
    });

    expect(result.center).toEqual(cache.center);
    expect(result.zoom).toBe(13);
  });

  it("캐시가 stale이면 GPS로 초기 center를 잡는다", () => {
    const cache = createCache({
      center: { lat: 37.5, lng: 127.0 },
      savedAt: 1_000,
    });
    const gps = { lat: 37.52, lng: 127.0 };

    const result = resolveMapBootstrapViewport({
      cache,
      permission: "granted",
      gps,
      now: 1_000 + MAP_VIEWPORT_STALE_MS + 1,
    });

    expect(result.center).toEqual(gps);
  });

  it("30분이 지나면 캐시를 stale로 본다", () => {
    const cache = createCache({ savedAt: 1_000 });
    expect(
      isMapViewportCacheStale(cache, {
        now: 1_000 + MAP_VIEWPORT_STALE_MS + 1,
      }),
    ).toBe(true);
  });

  it("GPS와 캐시 중심이 2km 이상이면 stale로 본다", () => {
    const cache = createCache({
      center: { lat: 37.5, lng: 127.0 },
      savedAt: Date.now(),
    });
    const farGps = { lat: 37.52, lng: 127.0 };

    expect(haversineDistanceM(cache.center, farGps)).toBeGreaterThan(
      MAP_VIEWPORT_STALE_DISTANCE_M,
    );

    expect(
      isMapViewportCacheStale(cache, {
        permission: "granted",
        gps: farGps,
      }),
    ).toBe(true);
  });
});
