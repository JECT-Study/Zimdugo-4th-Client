import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import type { MapSheetRestorableSession } from "./map-sheet-session-storage";
import {
  DEFAULT_SEARCH_COORDINATES,
  type MapSheetSessionInput,
  resolveInitialMapSheetSession,
} from "./useMapSheetSession";

const detail = (overrides: Partial<LockerDetailItem> = {}): LockerDetailItem =>
  ({
    lockerId: 164,
    title: "강남역 1번 출구",
    latitude: 37.5,
    longitude: 127.03,
    ...overrides,
  }) as LockerDetailItem;

const session = (
  overrides: Partial<MapSheetRestorableSession> = {},
): MapSheetRestorableSession => ({
  mapPlaceId: null,
  mapDetailBack: null,
  listKind: null,
  searchPlaceId: null,
  searchDetailBack: null,
  ...overrides,
});

const input = (
  overrides: Partial<MapSheetSessionInput> = {},
): MapSheetSessionInput => ({
  lockerIdFromQuery: undefined,
  deepLinkDetail: null,
  hasSearchQueryEntry: false,
  hasSearchPlaceEntry: false,
  searchPlaceIdFromUrl: undefined,
  restoredSession: null,
  ...overrides,
});

describe("resolveInitialMapSheetSession", () => {
  it("아무 표시도 없으면 홈에서 시작한다", () => {
    const initial = resolveInitialMapSheetSession(input());

    expect(initial.sheetMode).toBe("idle");
    expect(initial.context).toBe("idle");
    expect(initial.activeLockerId).toBeNull();
    expect(initial.selectedMapPin).toBeNull();
  });

  it("딥링크로 들어오면 상세를 연 채로 시작한다", () => {
    const initial = resolveInitialMapSheetSession(
      input({ lockerIdFromQuery: 164, deepLinkDetail: detail() }),
    );

    expect(initial.sheetMode).toBe("detail");
    expect(initial.context).toBe("map");
    expect(initial.activeLockerId).toBe(164);
    expect(initial.mapDetailBack).toBe("idle");
    expect(initial.selectedMapPin).toMatchObject({
      pinType: "LOCKER",
      lockerId: 164,
      latitude: 37.5,
      longitude: 127.03,
    });
  });

  /**
   * 열 것이 없는데 상세로 시작하면 빈 시트가 뜬다. 없는 번호이거나 서버가 실패한 경우다.
   */
  it("딥링크 번호가 있어도 상세를 못 받았으면 상세로 열지 않는다", () => {
    const initial = resolveInitialMapSheetSession(
      input({ lockerIdFromQuery: 164, deepLinkDetail: null }),
    );

    expect(initial.sheetMode).toBe("idle");
    expect(initial.context).toBe("idle");
    expect(initial.activeLockerId).toBeNull();
    expect(initial.selectedMapPin).toBeNull();
  });

  it("좌표가 없는 보관함이면 기준점으로 핀을 세운다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        lockerIdFromQuery: 164,
        deepLinkDetail: detail({ latitude: undefined, longitude: undefined }),
      }),
    );

    expect(initial.selectedMapPin).toMatchObject({
      latitude: DEFAULT_SEARCH_COORDINATES.lat,
      longitude: DEFAULT_SEARCH_COORDINATES.lng,
    });
  });

  it("검색어로 들어오면 결과 목록을 연 채로 시작한다", () => {
    const initial = resolveInitialMapSheetSession(
      input({ hasSearchQueryEntry: true }),
    );

    expect(initial.sheetMode).toBe("list");
    expect(initial.context).toBe("search");
    expect(initial.listKind).toBe("keyword");
  });

  it("장소로 들어오면 장소 목록으로 시작한다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        hasSearchQueryEntry: true,
        hasSearchPlaceEntry: true,
        searchPlaceIdFromUrl: 900,
      }),
    );

    expect(initial.listKind).toBe("place");
    expect(initial.searchPlaceId).toBe(900);
  });

  it("주소에 표시가 없으면 되살린 세션을 따른다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        restoredSession: session({ listKind: "place", searchPlaceId: 900 }),
      }),
    );

    expect(initial.listKind).toBe("place");
    expect(initial.searchPlaceId).toBe(900);
  });

  /**
   * 특정 보관함을 가리켜 들어온 사람에게 지난번 화면을 되돌려 주면, 요청한 것과 다른
   * 것을 보여 주게 된다. 딥링크가 되살린 세션을 이긴다.
   */
  it("딥링크로 들어오면 되살린 세션이 화면을 덮지 않는다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        lockerIdFromQuery: 164,
        deepLinkDetail: detail(),
        restoredSession: session({ listKind: "place", searchPlaceId: 900 }),
      }),
    );

    expect(initial.sheetMode).toBe("detail");
    expect(initial.mapDetailBack).toBe("idle");
  });

  it("검색 주소로 들어오면 되살린 목록 종류를 덮는다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        hasSearchQueryEntry: true,
        restoredSession: session({ listKind: "place", searchPlaceId: 900 }),
      }),
    );

    expect(initial.listKind).toBe("keyword");
  });
});
