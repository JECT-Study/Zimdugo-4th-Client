import { describe, expect, it } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import { applyFavoriteOverlayToPins } from "./map-pin-favorite";

type LockerPin = Extract<LockerPinItemResponse, { pinType: "LOCKER" }>;
type PlacePin = Extract<LockerPinItemResponse, { pinType: "PLACE" }>;

const createLockerPin = (overrides: Partial<LockerPin> = {}): LockerPin => ({
  pinType: "LOCKER",
  lockerId: 101,
  placeId: null,
  latitude: 37.5,
  longitude: 127,
  isFavorite: null,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  ...overrides,
});

const createPlacePin = (overrides: Partial<PlacePin> = {}): PlacePin => ({
  pinType: "PLACE",
  lockerId: null,
  placeId: 201,
  latitude: 37.5,
  longitude: 127,
  isFavorite: null,
  lockerCount: 3,
  pinCount: null,
  bounds: null,
  ...overrides,
});

describe("applyFavoriteOverlayToPins", () => {
  it("아직 서버에 닿지 않은 토글을 핀에 비춘다", () => {
    // 즐겨찾기를 누르면 목록의 별은 곧바로 바뀌는데, 핀은 이 덧입히기가 없어서
    // 서버 응답이 올 때까지 예전 도안 그대로였다.
    const pins = applyFavoriteOverlayToPins(
      [createLockerPin({ lockerId: 101, isFavorite: false })],
      (lockerId) => lockerId === 101,
    );

    expect(pins[0]?.isFavorite).toBe(true);
  });

  it("해제한 즐겨찾기도 그대로 비춘다", () => {
    const pins = applyFavoriteOverlayToPins(
      [createLockerPin({ lockerId: 101, isFavorite: true })],
      () => false,
    );

    expect(pins[0]?.isFavorite).toBe(false);
  });

  it("서버 값을 그대로 넘겨 대기 중인 토글이 없으면 유지한다", () => {
    const pins = applyFavoriteOverlayToPins(
      [createLockerPin({ lockerId: 101, isFavorite: true })],
      (_lockerId, serverIsFavorite) => serverIsFavorite === true,
    );

    expect(pins[0]?.isFavorite).toBe(true);
  });

  it("장소 핀은 건드리지 않는다", () => {
    const placePin = createPlacePin();
    const pins = applyFavoriteOverlayToPins([placePin], () => true);

    expect(pins[0]).toBe(placePin);
    expect(pins[0]?.isFavorite).toBeNull();
  });

  it("보관함 핀과 장소 핀이 섞여 있어도 보관함만 바꾼다", () => {
    const pins = applyFavoriteOverlayToPins(
      [createPlacePin(), createLockerPin({ lockerId: 101 })],
      () => true,
    );

    expect(pins[0]?.isFavorite).toBeNull();
    expect(pins[1]?.isFavorite).toBe(true);
  });

  it("클러스터 핀은 건드리지 않는다", () => {
    // 클러스터는 여러 보관함을 묶은 것이라 lockerId 가 없고 즐겨찾기 도안도 없다.
    // 줌아웃 상태에서는 덧입혀도 달라지는 게 없다.
    const clusterPin = {
      pinType: "CLUSTER" as const,
      lockerId: null,
      placeId: null,
      latitude: 37.5,
      longitude: 127,
      isFavorite: null,
      lockerCount: null,
      pinCount: 12,
      bounds: { swLat: 37.4, swLng: 126.9, neLat: 37.6, neLng: 127.1 },
    };

    const pins = applyFavoriteOverlayToPins([clusterPin], () => true);

    expect(pins[0]).toBe(clusterPin);
    expect(pins[0]?.isFavorite).toBeNull();
  });
});
