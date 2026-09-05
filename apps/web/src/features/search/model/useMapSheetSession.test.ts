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
   * MapSheetRestorableSession 이 sheetMode·context 를 일부러 빼고 있다. 탭에 돌아왔을 때
   * 되살리는 것은 "어느 목록·장소를 보고 있었나"뿐이고, 시트를 여는 일은 주소가 정한다.
   * 세션만으로 시트가 열리면 주소가 요구하지 않은 화면이 뜬다.
   */
  it("되살린 세션만으로는 시트를 열지 않는다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        restoredSession: session({
          listKind: "place",
          searchPlaceId: 900,
          mapPlaceId: 900,
          mapDetailBack: "idle",
        }),
      }),
    );

    expect(initial.sheetMode).toBe("idle");
    expect(initial.context).toBe("idle");
    expect(initial.activeLockerId).toBeNull();
    expect(initial.selectedLockerDetail).toBeNull();
  });

  /**
   * 딥링크 진입에서 되살린 세션이 섞이지 않는 것은 호출부가 null 을 넘겨 지켜진다.
   * 이 함수는 받은 것을 그대로 쓰므로, 계약이 지켜졌을 때의 결과를 고정해 둔다.
   */
  it("딥링크 진입에 세션이 없으면 복원 필드가 비어 있다", () => {
    const initial = resolveInitialMapSheetSession(
      input({
        lockerIdFromQuery: 164,
        deepLinkDetail: detail(),
        restoredSession: null,
      }),
    );

    expect(initial.mapPlaceId).toBeNull();
    expect(initial.searchDetailBack).toBeNull();
    expect(initial.listKind).toBeNull();
    expect(initial.searchPlaceId).toBeNull();
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
