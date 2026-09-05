import { useState } from "react";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import type { LockerMarkerOffset } from "#/entities/map/model/map-marker";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import type { MapSheetRestorableSession } from "./map-sheet-session-storage";
import type {
  AppMapContext,
  MapDetailBack,
  OverlayReturnContext,
  SearchDetailBackTarget,
  SearchListKind,
  SheetModeForContext,
} from "./sheet-session";

/** 좌표를 모르는 채로 무언가를 물어야 할 때 쓰는 기준점(강남역). */
export const DEFAULT_SEARCH_COORDINATES = { lat: 37.498095, lng: 127.02761 };

export interface MapSheetSessionInput {
  /** `?locker=` 로 들어온 보관함 번호. */
  lockerIdFromQuery: number | undefined;
  /** 그 보관함의 상세. 로더가 서버에서 채운다. */
  deepLinkDetail: LockerDetailItem | null | undefined;
  /** `?q=` 나 `?searchPlaceId=` 로 들어왔는지. */
  hasSearchQueryEntry: boolean;
  hasSearchPlaceEntry: boolean;
  searchPlaceIdFromUrl: number | undefined;
  /**
   * 탭을 떠났다 돌아왔을 때 되살릴 세션.
   *
   * **딥링크로 들어오면 호출부가 `null` 을 넘긴다.** 이 함수가 걸러내는 것이 아니라,
   * 세션을 읽는 자리에서 이미 `hasExplicitLockerEntry` 로 막는다. 여기서 한 번 더
   * 막지 않는 이유는 판단이 두 곳으로 갈리면 어느 쪽이 참인지 알 수 없어서다.
   */
  restoredSession: MapSheetRestorableSession | null;
}

export interface InitialMapSheetSession {
  sheetMode: SheetModeForContext;
  context: AppMapContext;
  activeLockerId: number | null;
  selectedLockerDetail: LockerDetailItem | null;
  selectedMapPin: LockerPinItemResponse | null;
  listKind: SearchListKind | null;
  searchPlaceId: number | null;
  mapPlaceId: number | null;
  searchDetailBack: SearchDetailBackTarget | null;
  mapDetailBack: MapDetailBack | null;
}

/**
 * 첫 화면이 무엇이고 무엇이 선택된 상태인지 정한다.
 *
 * 들어오는 길이 셋이고 서열이 있다.
 *
 * 1. **딥링크**(`?locker=` + 로더가 채운 상세) — 상세를 연 채로 시작한다. 사용자가 특정
 *    보관함을 가리켜 들어온 것이라, 지난번에 보던 화면으로 되돌리면 요청한 것과 다른
 *    것을 보여 주게 된다. 그래서 호출부가 이때 `restoredSession` 을 `null` 로 넘긴다.
 * 2. **검색 주소**(`?q=` · `?searchPlaceId=`) — 결과 목록을 연 채로 시작한다.
 * 3. **되살린 세션** — 위 둘이 아닐 때만. 탭을 떠났다 돌아온 경우다.
 *
 * `?locker=` 가 있어도 로더가 상세를 못 채웠으면(없는 번호이거나 서버가 실패) 딥링크로
 * 치지 않는다. 열 것이 없는데 상세 화면으로 시작하면 빈 시트가 뜬다.
 *
 * **되살린 세션은 시트를 열지 않는다.** `MapSheetRestorableSession` 이 `sheetMode` 와
 * `context` 를 일부러 빼고 있다 — 탭에 돌아왔을 때 되살리는 것은 "어느 목록·장소를 보고
 * 있었나"뿐이고, 시트를 여는 일은 주소가 정한다. 세션만으로 시트가 열리면 주소가
 * 요구하지 않은 화면이 뜬다.
 */
export const resolveInitialMapSheetSession = ({
  lockerIdFromQuery,
  deepLinkDetail,
  hasSearchQueryEntry,
  hasSearchPlaceEntry,
  searchPlaceIdFromUrl,
  restoredSession,
}: MapSheetSessionInput): InitialMapSheetSession => {
  const hasDeepLinkDetail =
    lockerIdFromQuery !== undefined && Boolean(deepLinkDetail);

  return {
    sheetMode: hasDeepLinkDetail
      ? "detail"
      : hasSearchQueryEntry
        ? "list"
        : "idle",
    context: hasDeepLinkDetail
      ? "map"
      : hasSearchQueryEntry
        ? "search"
        : "idle",
    activeLockerId: hasDeepLinkDetail ? (lockerIdFromQuery ?? null) : null,
    // 상세는 로더가 준 값을 그대로 쓴다. lockerIdFromQuery 만 있고 상세가 없으면 null 이라
    // 화면은 비어 있고, 클라이언트가 다시 물어 채운다.
    selectedLockerDetail:
      lockerIdFromQuery !== undefined ? (deepLinkDetail ?? null) : null,
    selectedMapPin:
      hasDeepLinkDetail && deepLinkDetail
        ? {
            pinType: "LOCKER",
            lockerId: lockerIdFromQuery as number,
            placeId: null,
            latitude: deepLinkDetail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
            longitude:
              deepLinkDetail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
            isFavorite: null,
            lockerCount: null,
            pinCount: null,
            bounds: null,
          }
        : null,
    listKind: hasSearchPlaceEntry
      ? "place"
      : hasSearchQueryEntry
        ? "keyword"
        : (restoredSession?.listKind ?? null),
    searchPlaceId: hasSearchPlaceEntry
      ? (searchPlaceIdFromUrl ?? null)
      : (restoredSession?.searchPlaceId ?? null),
    mapPlaceId: restoredSession?.mapPlaceId ?? null,
    searchDetailBack: restoredSession?.searchDetailBack ?? null,
    mapDetailBack: hasDeepLinkDetail
      ? "idle"
      : (restoredSession?.mapDetailBack ?? null),
  };
};

/**
 * "지금 어느 화면이고 무엇이 선택됐나"를 쥐는 자리.
 *
 * 열두 조각이 흩어져 있었지만 전부 같은 입력(주소·로더·되살린 세션)에서 시작하고 같은
 * 사건에 함께 움직인다. 한 덩어리로 모아 둔다.
 *
 * 경로 라우트 전환(#215)의 1-6 에서 이 상태는 `/search` 와 `/` 로 갈린다. 갈라질 것을
 * 먼저 한곳에 모아 두면, 그때 옮길 것과 남길 것을 이 훅의 반환값에서 고르면 된다.
 */
export function useMapSheetSession(input: MapSheetSessionInput) {
  // 첫 렌더에서 한 번만 계산한다. 주소가 바뀌어 다시 계산되면 사용자가 그동안 옮겨 둔
  // 화면이 처음 상태로 되돌아간다.
  const [initial] = useState(() => resolveInitialMapSheetSession(input));

  const [sheetMode, setSheetMode] = useState<SheetModeForContext>(
    initial.sheetMode,
  );
  const [context, setContext] = useState<AppMapContext>(initial.context);
  const [activeLockerId, setActiveLockerId] = useState<number | null>(
    initial.activeLockerId,
  );
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(initial.selectedLockerDetail);
  const [selectedMapPin, setSelectedMapPin] =
    useState<LockerPinItemResponse | null>(initial.selectedMapPin);
  const [selectedMapPinOffset, setSelectedMapPinOffset] =
    useState<LockerMarkerOffset | null>(null);
  const [overlayReturnContext, setOverlayReturnContext] =
    useState<OverlayReturnContext>("idle");
  const [listKind, setListKind] = useState<SearchListKind | null>(
    initial.listKind,
  );
  const [searchPlaceId, setSearchPlaceId] = useState<number | null>(
    initial.searchPlaceId,
  );
  const [mapPlaceId, setMapPlaceId] = useState<number | null>(
    initial.mapPlaceId,
  );
  const [searchDetailBack, setSearchDetailBack] =
    useState<SearchDetailBackTarget | null>(initial.searchDetailBack);
  const [mapDetailBack, setMapDetailBack] = useState<MapDetailBack | null>(
    initial.mapDetailBack,
  );

  return {
    sheetMode,
    setSheetMode,
    context,
    setContext,
    activeLockerId,
    setActiveLockerId,
    selectedLockerDetail,
    setSelectedLockerDetail,
    selectedMapPin,
    setSelectedMapPin,
    selectedMapPinOffset,
    setSelectedMapPinOffset,
    overlayReturnContext,
    setOverlayReturnContext,
    listKind,
    setListKind,
    searchPlaceId,
    setSearchPlaceId,
    mapPlaceId,
    setMapPlaceId,
    searchDetailBack,
    setSearchDetailBack,
    mapDetailBack,
    setMapDetailBack,
  };
}
