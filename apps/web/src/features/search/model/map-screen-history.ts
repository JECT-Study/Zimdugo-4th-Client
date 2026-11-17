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
}

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
 * 한 칸 위로 돌아가는 방법.
 *
 * 이 칸을 만들 때 떠나온 화면이 바로 부모 화면이면 히스토리를 되감는다. 기기의
 * 뒤로가기와 같은 결과가 되고 히스토리도 늘지 않는다.
 *
 * 아니면(링크로 바로 들어왔거나, 자동완성처럼 여러 단계를 한 번에 건너 왔으면) 지금
 * 칸을 부모 화면으로 바꾼다. 표시는 그대로 둔다. 이 칸 앞에 있는 항목은 바뀌지
 * 않았기 때문이다.
 */
export const planBackMapScreenNavigation = (
  search: SearchUrlParams,
  currentState: MapScreenHistoryState,
): { kind: "history-back" } | { kind: "replace"; search: SearchUrlParams } => {
  const parentSearch = toParentMapScreenSearch(search);
  const parentKey = toMapScreenKey(readMapScreenParams(parentSearch));

  if (currentState.mapBackTo === parentKey) {
    return { kind: "history-back" };
  }

  return { kind: "replace", search: parentSearch };
};
