import { describe, expect, it } from "vitest";

import {
  isMapCenterNearCoordinates,
  VIEWPORT_USER_ALIGNMENT_THRESHOLD_M,
} from "./map-viewport-alignment";

describe("map-viewport-alignment", () => {
  it("treats a map center within 80m of the target as aligned", () => {
    expect(
      isMapCenterNearCoordinates({ lat: 0, lng: 0 }, { lat: 0.0007, lng: 0 }),
    ).toBe(true);
  });

  it("does not treat a map center beyond 80m as aligned", () => {
    expect(
      isMapCenterNearCoordinates({ lat: 0, lng: 0 }, { lat: 0.0008, lng: 0 }),
    ).toBe(false);
  });

  it("uses the provided threshold", () => {
    expect(
      isMapCenterNearCoordinates(
        { lat: 0, lng: 0 },
        { lat: 0.0009, lng: 0 },
        VIEWPORT_USER_ALIGNMENT_THRESHOLD_M + 30,
      ),
    ).toBe(true);
  });
});
