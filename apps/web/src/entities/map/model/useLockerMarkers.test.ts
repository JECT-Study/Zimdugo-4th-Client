import { describe, expect, it, vi } from "vitest";

vi.mock("@repo/ui/vars", () => ({
  vars: {
    color: {
      icon: {
        error: "#FF4D4F",
      },
      palette: {
        gray: {
          100: "#F5F5F5",
        },
        green: {
          500: "#3BD569",
        },
        red: {
          300: "#FF4D4F",
        },
      },
    },
  },
}));

import {
  getLockerPinQueryFromViewport,
  getRadiusFromViewport,
  isLockerPinQueryWithinCapacity,
  MAX_LOCKER_PIN_RADIUS_METERS,
} from "./locker-pin-query";

describe("getRadiusFromViewport", () => {
  it("상단 검색 영역을 제외한 유효 지도 영역의 radius를 계산한다", () => {
    const radius = getRadiusFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.51, lng: 127.01 },
        southWest: { lat: 37.49, lng: 126.99 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });

    expect(radius).toBeGreaterThan(750);
    expect(radius).toBeLessThan(1420);
  });

  it("bounds가 center와 같으면 zoom 기반 fallback을 사용한다", () => {
    const radius = getRadiusFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 17,
      bounds: {
        northEast: { lat: 37.5, lng: 127.0 },
        southWest: { lat: 37.5, lng: 127.0 },
      },
    });

    expect(radius).toBe(250);
  });
});

describe("getLockerPinQueryFromViewport", () => {
  it("상단 검색 영역을 제외하도록 요청 중심을 아래쪽으로 보정한다", () => {
    const query = getLockerPinQueryFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.51, lng: 127.01 },
        southWest: { lat: 37.49, lng: 126.99 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });

    expect(query.lat).toBeLessThan(37.5);
    expect(query.lng).toBe(127);
    expect(query.radius).toBeGreaterThan(750);
  });

  it("미세한 지도 흔들림은 같은 요청 버킷으로 안정화한다", () => {
    const baseQuery = getLockerPinQueryFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.510001, lng: 127.010001 },
        southWest: { lat: 37.490001, lng: 126.990001 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });
    const nextQuery = getLockerPinQueryFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.510002, lng: 127.010002 },
        southWest: { lat: 37.490002, lng: 126.990002 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });

    expect(nextQuery).toEqual(baseQuery);
  });

  it("넓은 뷰포트는 실제 radius를 유지하고 capacity 초과 시 fetch 대상이 아니다", () => {
    const query = getLockerPinQueryFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 10,
      bounds: {
        northEast: { lat: 37.65, lng: 127.15 },
        southWest: { lat: 37.35, lng: 126.85 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });

    expect(query.radius).toBeGreaterThan(MAX_LOCKER_PIN_RADIUS_METERS);
    expect(isLockerPinQueryWithinCapacity(query)).toBe(false);
  });

  it("뷰포트가 좁을 때는 상한값으로 고정하지 않는다", () => {
    const query = getLockerPinQueryFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.510002, lng: 127.010002 },
        southWest: { lat: 37.490002, lng: 126.990002 },
      },
      size: {
        width: 375,
        height: 812,
      },
    });

    expect(query.radius).toBeLessThan(7_000);
    expect(query.radius).toBeGreaterThan(0);
  });
});
