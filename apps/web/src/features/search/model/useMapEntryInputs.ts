import { useSearch } from "@tanstack/react-router";
import {
  parseLockerSearchParam,
  readSearchPlaceIdParam,
} from "./search-url-state";

export interface MapEntryInputs {
  /** `locker` 로 가리킨 보관함 번호. 바깥 주소로는 `/lockers/<slug>` 다. */
  lockerIdFromQuery: number | undefined;
  /** 열어야 할 보관함. `locker` 든 앱 안 딥링크의 `openLockerId` 든. */
  openLockerId: number | undefined;
  /** `?detailSnap=full` 로 상세를 끝까지 펴 달라고 들어왔는지. */
  detailSnap: "full" | undefined;
  /** 딥링크가 들고 온 좌표. 상세를 연 뒤 주소에서 지워진다. */
  focusLat: number | undefined;
  focusLng: number | undefined;
  /** `q` 로 들어온 검색어. 검증 전 값이다. */
  searchQueryFromUrl: string | undefined;
  /** `place` 로 가리킨 장소. 바깥 주소로는 `/places/<id>` 다. */
  placeIdFromUrl: number | undefined;
}

interface MapEntrySearchParams {
  locker?: unknown;
  openLockerId?: number;
  detailSnap?: "full";
  focusLat?: number;
  focusLng?: number;
  q?: unknown;
  place?: unknown;
}

/**
 * 주소가 담은 지도 화면의 값.
 *
 * 지도 레이아웃과 그 아래 화면이 **둘 다** 봐야 하는 값이다. 레이아웃은 초기 카메라를,
 * 화면은 무엇을 그릴지를 여기서 얻는다. 두 곳에서 따로 읽으면 조건이 갈라지므로
 * 한 벌만 둔다.
 *
 * 예전에는 탭을 떠났다 돌아올 때 되살릴 세션도 여기서 함께 읽었다. 지도 장소 목록처럼
 * 주소에 흔적이 없는 화면이 있었기 때문이다. 이제 모든 화면이 주소를 가져 그 장치가
 * 필요 없다.
 */
export function useMapEntryInputs(): MapEntryInputs {
  const search = (useSearch({ strict: false }) || {}) as MapEntrySearchParams;

  const lockerIdFromQuery = parseLockerSearchParam(search.locker);

  return {
    lockerIdFromQuery,
    openLockerId: lockerIdFromQuery ?? search.openLockerId,
    detailSnap: search.detailSnap,
    focusLat: search.focusLat,
    focusLng: search.focusLng,
    searchQueryFromUrl: typeof search.q === "string" ? search.q : undefined,
    placeIdFromUrl: readSearchPlaceIdParam(search.place),
  };
}
