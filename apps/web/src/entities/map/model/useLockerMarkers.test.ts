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
      },
    },
  },
}));

import { getRadiusFromViewport } from "./useLockerMarkers";

describe("getRadiusFromViewport", () => {
  it("지도 bounds 모서리를 포함하는 radius를 계산한다", () => {
    const radius = getRadiusFromViewport({
      center: { lat: 37.5, lng: 127.0 },
      zoom: 15,
      bounds: {
        northEast: { lat: 37.51, lng: 127.01 },
        southWest: { lat: 37.49, lng: 126.99 },
      },
    });

    expect(radius).toBeGreaterThan(1300);
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
