import { describe, expect, it, vi } from "vitest";
import { focusNaverMapOnCoordinates } from "./current-location";

class FakeLatLng {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
  ) {}
}

const createFakeMaps = () =>
  ({ LatLng: FakeLatLng }) as unknown as typeof naver.maps;

/** 1000×800 화면에 위도·경도 각각 0.1 도가 보이는 지도 */
const createFakeMap = () => {
  const panTo = vi.fn();
  const map = {
    getSize: () => ({ width: 1000, height: 800 }),
    getBounds: () => ({
      getNE: () => ({ lat: () => 37.55, lng: () => 127.05 }),
      getSW: () => ({ lat: () => 37.45, lng: () => 126.95 }),
    }),
    getZoom: () => 15,
    panTo,
  } as unknown as naver.maps.Map;

  return { map, panTo };
};

describe("focusNaverMapOnCoordinates", () => {
  it("가린 곳이 없으면 좌표를 그대로 비춘다", () => {
    const { map, panTo } = createFakeMap();

    focusNaverMapOnCoordinates({
      map,
      maps: createFakeMaps(),
      coordinates: { lat: 37.5, lng: 127 },
    });

    const target = panTo.mock.calls[0]?.[0] as FakeLatLng;
    expect(target.latitude).toBe(37.5);
    expect(target.longitude).toBe(127);
  });

  it("왼쪽이 가려지면 남은 지도의 가운데에 오도록 중심을 서쪽으로 옮긴다", () => {
    const { map, panTo } = createFakeMap();

    focusNaverMapOnCoordinates({
      map,
      maps: createFakeMaps(),
      coordinates: { lat: 37.5, lng: 127 },
      leftInsetPx: 400,
    });

    const target = panTo.mock.calls[0]?.[0] as FakeLatLng;
    // 400/2 = 200px 오른쪽이 남은 지도의 가운데. 화면 폭 1000px 에 0.1 도라 0.02 도.
    expect(target.latitude).toBe(37.5);
    expect(target.longitude).toBeCloseTo(126.98, 10);
  });
});
