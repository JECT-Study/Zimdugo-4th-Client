import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import type { MapSheetRestorableSession } from "./map-sheet-session-storage";
import { readRestoredSessionForTabReturn } from "./map-sheet-session-storage";
import {
  parseLockerSearchParam,
  readSearchPlaceIdParam,
} from "./search-url-state";

export interface MapEntryInputs {
  /** `?locker=` 로 들어온 보관함 번호. */
  lockerIdFromQuery: number | undefined;
  /** 열어야 할 보관함. `?locker=` 든 `?openLockerId=` 든. */
  openLockerId: number | undefined;
  /** 주소가 특정 보관함을 가리키는지. 되살린 세션보다 앞선다. */
  hasExplicitLockerEntry: boolean;
  /** `?detailSnap=full` 로 상세를 끝까지 펴 달라고 들어왔는지. */
  detailSnap: "full" | undefined;
  /** 딥링크가 들고 온 좌표. 상세를 연 뒤 주소에서 지워진다. */
  focusLat: number | undefined;
  focusLng: number | undefined;
  /** `?q=` 로 들어온 검색어. */
  searchQueryFromUrl: string | undefined;
  /** `?searchPlaceId=` 로 들어온 장소 번호. */
  searchPlaceIdFromUrl: number | undefined;
  /** 장소 결과 목록을 연 채로 시작해야 하는지. */
  hasSearchPlaceEntry: boolean;
  /** 검색 결과 목록을 연 채로 시작해야 하는지. */
  hasSearchQueryEntry: boolean;
  /**
   * 탭을 떠났다 돌아왔을 때 되살릴 세션.
   *
   * 주소가 보관함을 가리키면 `null` 이다. 사용자가 그 보관함을 보러 온 것이라,
   * 지난번 화면으로 되돌리면 요청한 것과 다른 것을 보여 주게 된다.
   */
  restoredSession: MapSheetRestorableSession | null;
}

interface MapEntrySearchParams {
  locker?: unknown;
  openLockerId?: number;
  detailSnap?: "full";
  focusLat?: number;
  focusLng?: number;
  q?: unknown;
  searchPlaceId?: unknown;
}

/**
 * 주소가 지시하는 첫 화면의 조건.
 *
 * 지도 레이아웃과 그 아래 화면이 **둘 다** 봐야 하는 값이다. 레이아웃은 초기 카메라와
 * 시트 세션의 출발점을 여기서 얻고, 화면은 딥링크를 열고 검색을 복원하는 데 쓴다.
 * 두 곳에서 따로 파생시키면 조건이 갈라지므로 한 벌만 둔다.
 *
 * 보는 것이 주소와 세션 저장소뿐이라 어느 쪽에서 불러도 같은 답이 나온다.
 * `readRestoredSessionForTabReturn` 은 읽기만 하고 지우지 않아 두 번 불러도 안전하다.
 */
export function useMapEntryInputs(): MapEntryInputs {
  const search = (useSearch({ strict: false }) || {}) as MapEntrySearchParams;

  const lockerIdFromQuery = parseLockerSearchParam(search.locker);
  const openLockerId = lockerIdFromQuery ?? search.openLockerId;
  const hasExplicitLockerEntry = openLockerId != null;
  const searchQueryFromUrl =
    typeof search.q === "string" ? search.q : undefined;
  const searchPlaceIdFromUrl = readSearchPlaceIdParam(search.searchPlaceId);
  const hasSearchPlaceEntry =
    searchPlaceIdFromUrl !== undefined && !hasExplicitLockerEntry;
  const hasSearchQueryEntry =
    (searchQueryFromUrl !== undefined || hasSearchPlaceEntry) &&
    !hasExplicitLockerEntry;

  const restoredSession = useMemo(
    () => (hasExplicitLockerEntry ? null : readRestoredSessionForTabReturn()),
    [hasExplicitLockerEntry],
  );

  return {
    lockerIdFromQuery,
    openLockerId,
    hasExplicitLockerEntry,
    detailSnap: search.detailSnap,
    focusLat: search.focusLat,
    focusLng: search.focusLng,
    searchQueryFromUrl,
    searchPlaceIdFromUrl,
    hasSearchPlaceEntry,
    hasSearchQueryEntry,
    restoredSession,
  };
}
