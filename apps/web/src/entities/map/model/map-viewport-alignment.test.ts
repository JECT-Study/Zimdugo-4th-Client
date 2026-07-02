import { describe, expect, it } from "vitest";

import {
  isMapCenterNearCoordinates,
  shouldClearViewportUserAlignment,
  VIEWPORT_USER_ALIGNMENT_THRESHOLD_M,
} from "./map-viewport-alignment";

describe("map-viewport-alignment", () => {
  it("지도 중심과 대상 좌표가 80m 이내이면 aligned로 본다", () => {
    expect(
      isMapCenterNearCoordinates({ lat: 0, lng: 0 }, { lat: 0.0007, lng: 0 }),
    ).toBe(true);
  });

  it("지도 중심과 대상 좌표가 80m를 넘으면 aligned로 보지 않는다", () => {
    expect(
      isMapCenterNearCoordinates({ lat: 0, lng: 0 }, { lat: 0.0008, lng: 0 }),
    ).toBe(false);
  });

  it("임계값 경계는 aligned로 본다", () => {
    expect(
      isMapCenterNearCoordinates(
        { lat: 0, lng: 0 },
        { lat: 0.0009, lng: 0 },
        VIEWPORT_USER_ALIGNMENT_THRESHOLD_M + 30,
      ),
    ).toBe(true);
  });

  it("사용자가 드래그하면 aligned를 해제한다", () => {
    expect(
      shouldClearViewportUserAlignment({
        isDragging: true,
        didFitBounds: false,
        mapCenter: { lat: 37.5, lng: 127 },
        userLocation: { lat: 37.5, lng: 127 },
      }),
    ).toBe(true);
  });

  it("검색 결과 bounds를 맞추면 aligned를 해제한다", () => {
    expect(
      shouldClearViewportUserAlignment({
        isDragging: false,
        didFitBounds: true,
        mapCenter: { lat: 37.5, lng: 127 },
        userLocation: { lat: 37.5, lng: 127 },
      }),
    ).toBe(true);
  });

  it("지도 중심이 사용자 위치에서 멀어지면 aligned를 해제한다", () => {
    expect(
      shouldClearViewportUserAlignment({
        isDragging: false,
        didFitBounds: false,
        mapCenter: { lat: 37.5, lng: 127 },
        userLocation: { lat: 37.501, lng: 127 },
      }),
    ).toBe(true);
  });
});
