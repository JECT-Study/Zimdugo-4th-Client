import {
  type MapScreenParams,
  resolveMapScreenNavigation,
  resolveParentMapScreen,
} from "./map-screen";
import {
  parseLockerSearchParam,
  readSearchPlaceIdParam,
  readSearchQueryParam,
  type SearchUrlParams,
  withoutLockerDetailParams,
} from "./search-url-state";

/**
 * 지도 화면이 히스토리 항목에 남기는 표시.
 *
 * 브라우저는 이전 항목의 주소를 알려 주지 않는다. 그래서 칸을 만들 때 "어디서
 * 왔는지" 를 그 칸에 적어 둔다. 앱 안의 되돌아가기 버튼은 이 표시를 보고, 히스토리를
 * 되감으면 부모 화면이 나오는지 판단한다.
 */
export interface MapScreenHistoryState {
  /** 이 칸을 만들 때 떠나온 화면. `toMapScreenKey` 의 값이다. */
  mapBackTo?: string;
  /** 이 칸까지 지도 화면이 만든 칸 수. 처음 들어온 칸이 0 이다. */
  mapStackDepth?: number;
  /**
   * 화면 위에 잠깐 뜬 시트. 주소는 아래 화면과 같고 이 표시만 다르다.
   *
   * 필터처럼 주소에 둘 이유는 없지만 기기 뒤로가기로 닫히길 기대하는 것들이다.
   * 열 때 같은 주소로 칸을 하나 만들고, 뒤로가기로 그 칸을 벗어나면 닫힌다.
   */
  mapSheet?: MapSheetEntry;
}

/** 히스토리 칸으로 여닫는 시트. */
export type MapSheetEntry = "filter" | "searchOverlay" | "navigationPopup";

/** 화면을 비교할 수 있는 문자열. 슬러그의 이름처럼 화면과 무관한 값은 넣지 않는다. */
export const toMapScreenKey = ({
  searchQuery,
  placeId,
  lockerId,
}: MapScreenParams): string =>
  JSON.stringify([searchQuery ?? null, placeId ?? null, lockerId ?? null]);

/**
 * 라우터 안쪽 검색 값에서 화면을 정하는 값만 읽는다.
 *
 * `openLockerId` 는 앱 안 딥링크(즐겨찾기 등)가 붙이는 일회용 값이다. 처리되면
 * `locker` 로 바뀌지만, 그 전에도 상세 화면이다.
 */
export const readMapScreenParams = (
  search: SearchUrlParams,
): MapScreenParams => ({
  searchQuery: readSearchQueryParam(search.q),
  placeId: readSearchPlaceIdParam(search.place),
  lockerId:
    parseLockerSearchParam(search.locker) ??
    readSearchPlaceIdParam(search.openLockerId),
});

/**
 * 부모 화면의 검색 값. 지금 검색 값에서 한 칸 위 화면에 없는 것만 걷어 낸다.
 *
 * 화면과 무관한 값(필터처럼 나중에 주소로 올라올 상태)은 남긴다.
 */
export const toParentMapScreenSearch = (
  search: SearchUrlParams,
): SearchUrlParams => {
  const params = readMapScreenParams(search);
  const parent = resolveParentMapScreen(params);
  let next = withoutLockerDetailParams(search);

  if (parent.placeId === undefined) {
    next = { ...next };
    delete next.place;
  }

  if (parent.searchQuery === undefined) {
    next = { ...next };
    delete next.q;
  }

  return next;
};

/** 홈의 검색 값. 화면을 정하는 값을 모두 걷어 낸다. */
export const toHomeMapScreenSearch = (
  search: SearchUrlParams,
): SearchUrlParams => {
  const next = withoutLockerDetailParams(search);
  delete next.q;
  delete next.place;
  return next;
};

/**
 * 링크로 바로 들어온 칸의 검색 값. 상세·장소 목록이면 검색어를 걷어 낸다.
 *
 * 상세·장소 목록의 `q` 는 "이 화면을 어떤 검색에서 열었는지" 다. 앱 안에서 연 칸에는
 * 떠나온 화면(`mapBackTo`)이 적혀 있어 그 맥락이 사용자 자신의 것이다. 링크로 바로
 * 들어온 칸에는 그 표시가 없다. 주소창을 복사해 받은 링크라면 `q` 는 보낸 사람의
 * 검색어라, 받은 사람의 검색창에 그 글자가 뜨고 되돌아가기가 그 검색 결과를 연다.
 * 그래서 지도에서 연 화면으로 다룬다.
 *
 * 새로고침이나 탭 복원은 히스토리 칸의 표시를 그대로 돌려주므로 걸리지 않는다.
 * 검색 결과(`/search?q=`)는 검색어 자체가 화면의 내용이라 그대로 둔다.
 */
export const toLandingMapScreenSearch = (
  search: SearchUrlParams,
  currentState: MapScreenHistoryState,
): SearchUrlParams => {
  if (currentState.mapBackTo !== undefined) return search;
  if (search.q === undefined) return search;

  const params = readMapScreenParams(search);
  if (params.lockerId === undefined && params.placeId === undefined) {
    return search;
  }

  const next = { ...search };
  delete next.q;
  return next;
};

export interface MapScreenNavigationPlan {
  replace: boolean;
  state: MapScreenHistoryState;
}

/**
 * 앞으로 가는 이동을 어떻게 기록할지.
 *
 * 더 깊은 화면이면 칸을 만들고 떠나온 화면을 적는다. 아니면 지금 칸을 바꾸고 표시를
 * 그대로 둔다. 칸의 앞뒤 관계는 바뀌지 않았기 때문이다.
 */
export const planForwardMapScreenNavigation = (
  fromSearch: SearchUrlParams,
  toSearch: SearchUrlParams,
  currentState: MapScreenHistoryState,
): MapScreenNavigationPlan => {
  const from = readMapScreenParams(fromSearch);
  const to = readMapScreenParams(toSearch);
  const mode = resolveMapScreenNavigation(from, to);
  const depth = currentState.mapStackDepth ?? 0;

  if (mode === "push") {
    return {
      replace: false,
      state: { mapBackTo: toMapScreenKey(from), mapStackDepth: depth + 1 },
    };
  }

  return {
    replace: true,
    state: {
      mapBackTo: currentState.mapBackTo,
      mapStackDepth: currentState.mapStackDepth,
    },
  };
};

/**
 * 화면의 모양. 검색 중인지와 어떤 장소·보관함을 보는지만 남기고 검색어 값은 뺀다.
 *
 * `toMapScreenKey` 의 값을 받는다. 읽을 수 없으면 null 이다.
 */
const toMapScreenShape = (key: string | undefined): string | null => {
  if (key === undefined) return null;

  try {
    const [searchQuery, placeId, lockerId] = JSON.parse(key) as unknown[];
    return JSON.stringify([searchQuery != null, placeId, lockerId]);
  } catch {
    return null;
  }
};

/**
 * 한 칸 위로 돌아가는 방법.
 *
 * 이 칸을 만들 때 떠나온 화면이 부모 화면과 같은 모양이면 히스토리를 되감는다.
 * 기기의 뒤로가기와 같은 결과가 되고 히스토리도 늘지 않는다.
 *
 * 검색어 값은 비교하지 않는다. 검색 결과에서 자동완성으로 장소를 고르면 검색어가 그
 * 장소 이름으로 바뀌어, 부모(검색 결과)를 계산하면 고르기 전과 다른 검색어가 나온다.
 * 그래도 사용자가 떠나온 칸은 검색 결과이고, 그 칸으로 되감는 것이 맞다. 검색어까지
 * 비교하면 되감지 못하고 지금 칸을 검색 결과로 바꿔, 같은 검색 결과가 두 칸 남는다.
 *
 * 떠나온 화면이 부모가 아니면(링크로 바로 들어왔거나, 자동완성처럼 여러 단계를 한
 * 번에 건너 왔으면) 지금 칸을 부모 화면으로 바꾼다. 표시는 그대로 둔다. 이 칸 앞에
 * 있는 항목은 바뀌지 않았기 때문이다.
 */
export const planBackMapScreenNavigation = (
  search: SearchUrlParams,
  currentState: MapScreenHistoryState,
): { kind: "history-back" } | { kind: "replace"; search: SearchUrlParams } => {
  const parentSearch = toParentMapScreenSearch(search);
  const parentShape = toMapScreenShape(
    toMapScreenKey(readMapScreenParams(parentSearch)),
  );

  if (toMapScreenShape(currentState.mapBackTo) === parentShape) {
    return { kind: "history-back" };
  }

  return { kind: "replace", search: parentSearch };
};
