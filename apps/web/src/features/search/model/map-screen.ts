import type {
  AppMapContext,
  MapDetailBack,
  SearchDetailBackTarget,
  SearchListKind,
} from "./sheet-session";

/**
 * 지도 위 화면이 "어느 화면에 있어야 하는가".
 *
 * ## 주소가 원본이다
 *
 * 예전에는 지금 화면(`context`·`listKind`·`…Id`)과 돌아갈 곳(`searchDetailBack`·
 * `mapDetailBack`)을 각각 `useState` 로 들고, 주소는 그 상태를 `replace` 로 따라
 * 썼다. 원본이 둘이라 새로고침·뒤로가기·공유 링크가 상태와 어긋났고, 모든 이동이
 * `replace` 라 히스토리가 화면을 기억하지 못했다(#215).
 *
 * 이제 화면은 라우터 안쪽 주소의 세 값으로 정해진다.
 *
 * | 안쪽 주소           | 바깥 주소            | 화면                 |
 * |---------------------|----------------------|----------------------|
 * | `/`                 | `/`                  | 홈                   |
 * | `?q=강남`           | `/search?q=강남`     | 검색 결과            |
 * | `?place=9&q=강남`   | `/places/9?q=강남`   | 검색에서 연 장소 목록 |
 * | `?place=9`          | `/places/9`          | 지도에서 연 장소 목록 |
 * | `?locker=164&…`     | `/lockers/164?…`     | 상세 (아래 목록은 나머지 값) |
 *
 * 상세 주소에 남은 `q`·`place` 는 "상세 아래 깔린 목록" 이다. 그래서 돌아갈 곳과
 * 상세를 보는 동안 지도에 남길 목록 핀을 주소만으로 계산할 수 있다.
 *
 * ## 그려진 화면과는 다르다
 *
 * 이 값은 목표다. 핀이 커지는 애니메이션이 끝난 뒤에 시트를 여는 것처럼, 화면이 목표를
 * 잠깐 늦게 따라가는 순간이 있다. 그 지연은 화면 쪽 `sheetMode` 가 들고, 이 모듈은
 * 다루지 않는다.
 */

/** 라우터 안쪽 주소에서 화면을 정하는 값. */
export interface MapScreenParams {
  /** 확정된 검색어. 있으면 검색 맥락이다. */
  searchQuery: string | undefined;
  placeId: number | undefined;
  lockerId: number | undefined;
}

/** 주소가 가리키는 시트. */
type MapScreenTarget = "idle" | "list" | "detail";

export interface MapScreen {
  target: MapScreenTarget;
  context: AppMapContext;
  /** 검색 맥락의 목록 종류. 검색이 아니면 null. */
  listKind: SearchListKind | null;
  /** 검색에서 연 장소. */
  searchPlaceId: number | null;
  /** 지도에서 연 장소. */
  mapPlaceId: number | null;
  lockerId: number | undefined;
  /** 검색 맥락의 상세 아래 깔린 목록. */
  searchDetailBack: SearchDetailBackTarget | null;
  /** 지도 맥락의 상세 아래 깔린 것. */
  mapDetailBack: MapDetailBack | null;
}

export const resolveMapScreen = ({
  searchQuery,
  placeId,
  lockerId,
}: MapScreenParams): MapScreen => {
  const isSearch = searchQuery !== undefined;
  const hasPlace = placeId !== undefined;
  const hasLocker = lockerId !== undefined;

  const context: AppMapContext = isSearch
    ? "search"
    : hasPlace || hasLocker
      ? "map"
      : "idle";
  const listKind: SearchListKind | null = isSearch
    ? hasPlace
      ? "place"
      : "keyword"
    : null;

  return {
    target: hasLocker ? "detail" : isSearch || hasPlace ? "list" : "idle",
    context,
    listKind,
    searchPlaceId: isSearch && hasPlace ? placeId : null,
    mapPlaceId: !isSearch && hasPlace ? placeId : null,
    lockerId,
    searchDetailBack:
      isSearch && hasLocker
        ? { listKind: hasPlace ? "place" : "keyword", placeId: placeId ?? null }
        : null,
    mapDetailBack:
      !isSearch && hasLocker ? (hasPlace ? "placeList" : "idle") : null,
  };
};

/**
 * 화면의 깊이. 홈이 0 이고, 위에 화면이 하나 얹힐 때마다 1 씩 늘어난다.
 *
 * 검색에서 연 장소 목록은 검색 결과 위에 얹히므로 2 다. 지도에서 연 장소 목록은
 * 홈 위에 바로 얹혀 1 이다. 상세는 아래 깔린 것보다 하나 깊다.
 */
export const getMapScreenDepth = ({
  searchQuery,
  placeId,
  lockerId,
}: MapScreenParams): number => {
  const base =
    (searchQuery !== undefined ? 1 : 0) + (placeId !== undefined ? 1 : 0);
  return base + (lockerId !== undefined ? 1 : 0);
};

/**
 * 한 화면에서 다른 화면으로 갈 때 히스토리에 칸을 만들지.
 *
 * 더 깊은 화면으로 들어가면 칸을 만든다(push). 그래야 뒤로가기가 들어오기 전
 * 화면으로 돌아간다. 같은 깊이나 얕은 화면으로 가면 지금 칸을 바꾼다(replace).
 * 상세에서 다른 핀을 누르는 것처럼 형제로 옮겨 가는 이동이 히스토리를 늘리지 않는다.
 *
 * 되돌아가는 이동은 이 규칙을 쓰지 않는다. 그건 히스토리를 되감는 일이다.
 */
export const resolveMapScreenNavigation = (
  from: MapScreenParams,
  to: MapScreenParams,
): "push" | "replace" =>
  getMapScreenDepth(to) > getMapScreenDepth(from) ? "push" : "replace";

/**
 * 한 칸 위 화면. 되돌아갈 히스토리가 없을 때(링크로 바로 들어왔을 때) 쓴다.
 *
 * 상세는 아래 깔린 목록으로, 검색에서 연 장소 목록은 검색 결과로, 나머지는 홈으로
 * 간다.
 */
export const resolveParentMapScreen = (
  params: MapScreenParams,
): MapScreenParams => {
  if (params.lockerId !== undefined) {
    return { ...params, lockerId: undefined };
  }

  if (params.placeId !== undefined && params.searchQuery !== undefined) {
    return { ...params, placeId: undefined };
  }

  return { searchQuery: undefined, placeId: undefined, lockerId: undefined };
};
