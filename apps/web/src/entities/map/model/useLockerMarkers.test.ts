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
  isLockerPinQueryWithinCapacity,
} from "./locker-pin-query";
import { getLockerPinSearchSignature } from "./useLockerMarkers";

describe("getLockerPinQueryFromViewport", () => {
  it("상단 검색 영역을 제외한 bounds를 반환한다", () => {
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

    expect(query.neLat).toBe(37.5082);
    expect(query.swLat).toBeCloseTo(37.49, 3);
    expect(query.swLng).toBeCloseTo(126.99, 3);
    expect(query.neLng).toBeCloseTo(127.01, 3);
    expect(query.zoom).toBe(15);
  });

  it("미세한 지도 흔들림은 같은 요청 파라미터로 안정화한다", () => {
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

  it("유효한 bounds는 capacity 체크를 통과한다", () => {
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

    expect(isLockerPinQueryWithinCapacity(query)).toBe(true);
  });

  it("zoom level을 그대로 전달한다", () => {
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

    expect(query.zoom).toBe(10);
    expect(isLockerPinQueryWithinCapacity(query)).toBe(true);
  });
});

describe("getLockerPinSearchSignature", () => {
  it("검색 좌표가 달라도 같은 검색 조건이면 같은 시그니처를 반환한다", () => {
    const baseSignature = getLockerPinSearchSignature({
      lat: 37.5,
      lng: 127,
      keyword: "잠실",
      sizeTypes: ["SMALL"],
      indoorOutdoorTypes: ["INDOOR"],
      lockerTypes: ["SUBWAY_STATION"],
    });

    const movedSignature = getLockerPinSearchSignature({
      lat: 37.5004,
      lng: 127.0004,
      keyword: "잠실",
      sizeTypes: ["SMALL"],
      indoorOutdoorTypes: ["INDOOR"],
      lockerTypes: ["SUBWAY_STATION"],
    });

    expect(movedSignature).toBe(baseSignature);
  });

  it("minPrice, maxPrice, isFree 조건이 다르면 다른 시그니처를 반환한다", () => {
    const baseSignature = getLockerPinSearchSignature({
      lat: 37.5,
      lng: 127,
      keyword: "잠실",
      minPrice: 1000,
      maxPrice: 5000,
      isFree: false,
    });

    const differentPriceSignature = getLockerPinSearchSignature({
      lat: 37.5,
      lng: 127,
      keyword: "잠실",
      minPrice: 2000,
      maxPrice: 5000,
      isFree: false,
    });

    const differentFreeSignature = getLockerPinSearchSignature({
      lat: 37.5,
      lng: 127,
      keyword: "잠실",
      minPrice: 1000,
      maxPrice: 5000,
      isFree: true,
    });

    expect(differentPriceSignature).not.toBe(baseSignature);
    expect(differentFreeSignature).not.toBe(baseSignature);
  });
});
