// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  type MapSheetSessionSnapshot,
  readMapSheetSessionSnapshot,
  readRestoredSessionForTabReturn,
  writeMapSheetSessionSnapshot,
} from "./map-sheet-session-storage";

const MAP_SHEET_SESSION_STORAGE_KEY = "zimdugo-map-sheet-session-v1";

const createSnapshot = (
  overrides: Partial<MapSheetSessionSnapshot> = {},
): MapSheetSessionSnapshot => ({
  sheetMode: "detail",
  context: "map",
  activeLockerId: 101,
  selectedLockerDetail: null,
  selectedMapPin: {
    pinType: "LOCKER",
    lockerId: 101,
    placeId: null,
    latitude: 37.5,
    longitude: 127,
    isFavorite: null,
    lockerCount: null,
    pinCount: null,
    bounds: null,
  },
  mapPlaceId: 77,
  mapDetailBack: "placeList",
  listKind: "place",
  searchPlaceId: 88,
  searchDetailBack: {
    listKind: "place",
    placeId: 88,
  },
  ...overrides,
});

describe("map sheet session storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("일반 홈 복귀용 세션은 selection 필드를 복원하지 않는다", () => {
    writeMapSheetSessionSnapshot(createSnapshot());

    expect(readRestoredSessionForTabReturn()).toEqual({
      mapPlaceId: 77,
      mapDetailBack: "placeList",
      listKind: "place",
      searchPlaceId: 88,
      searchDetailBack: {
        listKind: "place",
        placeId: 88,
      },
    });
  });

  it("일반 홈 복귀용 세션이 없으면 null을 반환한다", () => {
    expect(readRestoredSessionForTabReturn()).toBeNull();
  });

  it("깨진 JSON snapshot은 제거하고 null을 반환한다", () => {
    window.sessionStorage.setItem(MAP_SHEET_SESSION_STORAGE_KEY, "{");

    expect(readRestoredSessionForTabReturn()).toBeNull();
    expect(
      window.sessionStorage.getItem(MAP_SHEET_SESSION_STORAGE_KEY),
    ).toBeNull();
  });

  it("idle snapshot write는 기존처럼 저장값을 제거한다", () => {
    writeMapSheetSessionSnapshot(createSnapshot());
    writeMapSheetSessionSnapshot(createSnapshot({ sheetMode: "idle" }));

    expect(readMapSheetSessionSnapshot()).toBeNull();
  });
});
