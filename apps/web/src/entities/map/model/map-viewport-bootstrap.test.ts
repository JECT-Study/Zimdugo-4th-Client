import { describe, expect, it } from "vitest";

import {
  GPS_BOOTSTRAP_WAIT_MS,
  haversineDistanceM,
  isMapViewportCacheStale,
  MAP_VIEWPORT_STALE_DISTANCE_M,
  MAP_VIEWPORT_STALE_MS,
  resolveMapBootstrapViewport,
  shouldWaitForGpsBootstrap,
  type MapViewportCache,
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
    expect(result.source).toBe("deeplink");
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
    expect(result.source).toBe("cache");
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
    expect(result.source).toBe("gps");
  });

  it("GPS가 없으면 기본 좌표를 사용한다", () => {
    const result = resolveMapBootstrapViewport({
      permission: "prompt",
      gps: null,
    });

    expect(result.source).toBe("default");
  });

  it("권한 허용·GPS 없음·캐시 없음이면 GPS fix까지 지도 mount를 지연한다", () => {
    expect(
      shouldWaitForGpsBootstrap({
        permission: "granted",
        gps: null,
      }),
    ).toBe(true);
  });

  it("GPS fix가 오면 지도 mount 대기를 해제한다", () => {
    expect(
      shouldWaitForGpsBootstrap({
        permission: "granted",
        gps: { lat: 37.5, lng: 127.0 },
      }),
    ).toBe(false);
  });

  it("대기 시간이 지나면 기본 좌표로 mount한다", () => {
    expect(
      shouldWaitForGpsBootstrap({
        permission: "granted",
        gps: null,
        timedOut: true,
      }),
    ).toBe(false);
    expect(GPS_BOOTSTRAP_WAIT_MS).toBeGreaterThan(0);
  });

  it("30분이 지나면 캐시를 stale로 본다", () => {
    const cache = createCache({ savedAt: 1_000 });
    expect(
      isMapViewportCacheStale(cache, {
        now: 1_000 + MAP_VIEWPORT_STALE_MS + 1,
      }),
    ).toBe(true);
  });

  it("저장 시 GPS와 현재 GPS가 2km 이상이면 stale로 본다", () => {
    const savedGps = { lat: 37.5, lng: 127.0 };
    const cache = createCache({
      center: { lat: 37.55, lng: 127.05 },
      savedAt: Date.now(),
      gpsAtSave: savedGps,
    });
    const traveledGps = { lat: 37.52, lng: 127.0 };

    expect(
      haversineDistanceM(savedGps, traveledGps),
    ).toBeGreaterThan(MAP_VIEWPORT_STALE_DISTANCE_M);

    expect(
      isMapViewportCacheStale(cache, {
        permission: "granted",
        gps: traveledGps,
      }),
    ).toBe(true);
  });

  it("지도 center는 GPS와 멀어도 사용자가 이동하지 않았으면 캐시를 유지한다", () => {
    const savedGps = { lat: 37.5, lng: 127.0 };
    const cache = createCache({
      center: { lat: 37.55, lng: 127.05 },
      savedAt: Date.now(),
      gpsAtSave: savedGps,
    });

    expect(
      isMapViewportCacheStale(cache, {
        permission: "granted",
        gps: savedGps,
      }),
    ).toBe(false);

    const result = resolveMapBootstrapViewport({
      cache,
      permission: "granted",
      gps: savedGps,
    });

    expect(result.center).toEqual(cache.center);
    expect(result.source).toBe("cache");
  });
});
