import {
  type LockerDetailSnap,
  parseOpenLockerDeepLinkSearch,
} from "#/features/search/lib/open-locker-deep-link";
import {
  readSearchPlaceIdParam,
  readSearchQueryParam,
} from "./search-url-state";

/**
 * 지도 화면들이 공유하는 검색 파라미터. validateSearch 가 이 모양으로 정규화한다.
 *
 * 무엇을 보고 있는지(장소·보관함)는 자식 라우트의 경로가 정한다. 여기 남는 것은
 * 경로가 아닌 상태다. 검색어, 상세 아래 깔린 장소, 앱 안 딥링크의 일회용 값이다.
 */
export interface MapScreenSearchParams {
  openLockerId?: number;
  detailSnap?: LockerDetailSnap;
  focusLat?: number;
  focusLng?: number;
  q?: string;
  /** 상세 아래 깔린 장소 목록. 장소 목록 화면 자체는 `/places/<id>` 경로다. */
  place?: number;
}

/**
 * 지도 화면의 검색 파라미터를 검증한다.
 *
 * 상세의 펼침(`detailSnap`)과 좌표(`focusLat/Lng`)는 앱 안 딥링크(`openLockerId`)가
 * 없어도 읽는다. 구 딥링크는 서버가 `/lockers/164?detailSnap=full&…` 로 옮기므로,
 * 딥링크 파서처럼 `openLockerId` 가 있을 때만 읽으면 옵션이 버려진다.
 */
export const validateMapScreenSearch = (
  search: Record<string, unknown> | undefined,
): MapScreenSearchParams => {
  const safeSearch = search || {};
  // 옵션 검증만 빌려 쓴다. 보관함 번호는 아래에서 따로 읽는다.
  const { openLockerId: _ignored, ...options } = parseOpenLockerDeepLinkSearch({
    ...safeSearch,
    openLockerId: 1,
  });
  const { openLockerId } = parseOpenLockerDeepLinkSearch(safeSearch);

  return {
    ...options,
    ...(openLockerId !== undefined ? { openLockerId } : {}),
    q: readSearchQueryParam(safeSearch.q),
    place: readSearchPlaceIdParam(safeSearch.place),
  };
};
