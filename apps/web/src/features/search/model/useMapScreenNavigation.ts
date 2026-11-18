import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import {
  readMapScreenSearch,
  toMapScreenRoute,
} from "#/shared/lib/map-path-url";
import {
  type MapScreenHistoryState,
  planBackMapScreenNavigation,
  planForwardMapScreenNavigation,
  readMapScreenParams,
  toHomeMapScreenSearch,
  toMapScreenKey,
} from "./map-screen-history";
import type { SearchUrlParams } from "./search-url-state";

type SearchUpdate = (search: SearchUrlParams) => SearchUrlParams;

const HOME_SCREEN_KEY = toMapScreenKey({
  searchQuery: undefined,
  placeId: undefined,
  lockerId: undefined,
});

/**
 * 지도 화면 사이를 오가는 길.
 *
 * 화면은 주소가 정한다(`map-screen`). 이 훅은 주소를 바꾸는 네 가지 방법만 준다.
 * 화면이 상태를 직접 바꾸지 않고 여기를 거치게 해, "주소가 원본" 이라는 약속이
 * 한 곳에서 지켜지게 한다.
 *
 * - `goTo` — 다른 화면으로 간다. 더 깊으면 칸을 만들고 아니면 바꾼다.
 * - `replaceSearch` — 같은 화면의 주소만 다듬는다(슬러그 정리, 딥링크 값 소비).
 * - `goBack` — 한 칸 위 화면으로 돌아간다.
 * - `exitToHome` — 지도 화면이 쌓은 칸을 모두 되감아 홈으로 간다.
 *
 * 현재 주소는 렌더 때 값이 아니라 호출 순간의 라우터 값을 읽는다. 한 이벤트 안에서
 * 앞선 이동이 아직 렌더되지 않았더라도 그 결과 위에서 계산하기 위해서다.
 */
export function useMapScreenNavigation() {
  const router = useRouter();
  const navigate = useNavigate();
  /** 되감기가 끝났을 때 홈이 아니면 홈으로 바꿔야 하는지. */
  const isExitingToHomeRef = useRef(false);

  /*
   * 화면 값으로 읽는다. 경로(`/lockers/164`)와 쿼리를 합친 한 벌이다. 화면 코드는
   * 이 모양으로만 생각하고, 라우트와의 변환은 `map-path-url` 이 한다.
   */
  const readCurrent = useCallback(() => {
    const location = router.latestLocation;
    return {
      search: readMapScreenSearch({
        pathname: location.pathname,
        search: (location.search ?? {}) as SearchUrlParams,
      }),
      state: (location.state ?? {}) as MapScreenHistoryState,
    };
  }, [router]);

  /** 화면 값이 사는 라우트로 이동한다. */
  const navigateToScreen = useCallback(
    (
      search: SearchUrlParams,
      options: { replace: boolean; state: (previous: object) => object },
    ) => {
      const route = toMapScreenRoute(search);
      void navigate({
        to: route.to,
        params: route.params,
        search: route.search,
        replace: options.replace,
        state: options.state,
      } as never);
    },
    [navigate],
  );

  const keepState = useCallback(
    (state: MapScreenHistoryState) =>
      <T extends object>(previous: T) => ({
        ...previous,
        mapBackTo: state.mapBackTo,
        mapStackDepth: state.mapStackDepth,
      }),
    [],
  );

  const goTo = useCallback(
    (update: SearchUpdate) => {
      const current = readCurrent();
      const nextSearch = update(current.search);
      // 받은 값을 그대로 돌려주면 바꿀 것이 없다는 뜻이다. 같은 주소로 이동하지 않는다.
      if (nextSearch === current.search) return;

      const plan = planForwardMapScreenNavigation(
        current.search,
        nextSearch,
        current.state,
      );

      navigateToScreen(nextSearch, {
        replace: plan.replace,
        state: keepState(plan.state),
      });
    },
    [keepState, navigateToScreen, readCurrent],
  );

  const replaceSearch = useCallback(
    (update: SearchUpdate) => {
      const current = readCurrent();
      const nextSearch = update(current.search);
      // 받은 값을 그대로 돌려주면 다듬을 것이 없다는 뜻이다.
      if (nextSearch === current.search) return;

      navigateToScreen(nextSearch, {
        replace: true,
        state: keepState(current.state),
      });
    },
    [keepState, navigateToScreen, readCurrent],
  );

  const goBack = useCallback(
    (fallback?: SearchUpdate) => {
      const current = readCurrent();
      const plan = planBackMapScreenNavigation(current.search, current.state);

      if (plan.kind === "history-back") {
        router.history.back();
        return;
      }

      navigateToScreen(fallback ? fallback(plan.search) : plan.search, {
        replace: true,
        state: keepState(current.state),
      });
    },
    [keepState, navigateToScreen, readCurrent, router],
  );

  const exitToHome = useCallback(() => {
    const current = readCurrent();
    const depth = current.state.mapStackDepth ?? 0;

    /*
     * 지도 화면이 쌓은 칸을 모두 되감는다. 홈으로 새 칸을 만들거나 지금 칸을 홈으로
     * 바꾸면, 그 뒤 기기 뒤로가기가 방금 떠난 검색·상세를 다시 연다(#214).
     */
    if (depth > 0) {
      isExitingToHomeRef.current = true;
      router.history.go(-depth);
      return;
    }

    navigateToScreen(toHomeMapScreenSearch(current.search), {
      replace: true,
      state: keepState(current.state),
    });
  }, [keepState, navigateToScreen, readCurrent, router]);

  /*
   * 되감아 닿은 첫 칸이 홈이 아닐 수 있다. 검색 결과 주소로 바로 들어와 그 위에
   * 상세를 쌓았다면 첫 칸은 검색 결과다. 그때는 그 칸을 홈으로 바꾼다.
   *
   * 화면이 바뀐 것만 보면 놓치는 경우가 있다. 첫 칸과 떠나기 직전 칸이 같은 주소면
   * (검색 결과로 들어와 같은 검색어로 다시 검색한 경우) 되감아도 화면 키가 그대로라
   * 이 이펙트가 다시 돌지 않는다. 그래서 히스토리 칸의 위치도 함께 본다.
   */
  const screenKey = useRouterState({
    select: (state) =>
      toMapScreenKey(
        readMapScreenParams(
          readMapScreenSearch({
            pathname: state.location.pathname,
            search: state.location.search as SearchUrlParams,
          }),
        ),
      ),
  });
  const historyEntryIndex = useRouterState({
    select: (state) =>
      (state.location.state as { __TSR_index?: number } | undefined)
        ?.__TSR_index,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: historyEntryIndex 는 같은 주소의 다른 칸에 닿았을 때 다시 돌리는 트리거다
  useEffect(() => {
    if (!isExitingToHomeRef.current) return;

    const current = readCurrent();
    if ((current.state.mapStackDepth ?? 0) > 0) return;

    isExitingToHomeRef.current = false;
    if (screenKey === HOME_SCREEN_KEY) return;

    navigateToScreen(toHomeMapScreenSearch(current.search), {
      replace: true,
      state: keepState(current.state),
    });
  }, [historyEntryIndex, keepState, navigateToScreen, readCurrent, screenKey]);

  /*
   * 홈 경로에 화면 값이 남아 있으면 그 화면의 경로로 옮긴다.
   *
   * 홈 라우트도 같은 일을 하지만(`beforeLoad`) 서버에서만 확실히 돈다. 홈은 프리렌더된
   * 정적 파일이라, `/?q=…` 로 들어오면 그 파일로 하이드레이션하고 클라이언트는
   * `beforeLoad` 를 다시 돌리지 않는다. 그러면 화면은 검색 결과인데 주소는 홈인
   * 상태가 되어, 홈으로 나가기가 같은 주소로 가려다 아무것도 하지 못한다.
   *
   * 앱 안 딥링크(`/?openLockerId=…`)는 화면 값을 만들지 않아 여기 걸리지 않는다.
   * 화면이 보관함을 연 뒤 상세 경로로 바꾼다.
   */
  /*
   * 이동이 끝나 확정된 위치만 본다. 이동 중에는 라우터 상태의 위치가 목적지로 먼저
   * 바뀌는데, 그 순간 이 정리가 돌면 아직 떠나지 않은 주소를 읽고 되돌려 보내, 홈으로
   * 나가기와 이 정리가 서로를 되돌리는 루프에 빠졌다.
   */
  const settledHomeSearch = useRouterState({
    select: (state) =>
      state.status === "idle" && state.resolvedLocation?.pathname === "/"
        ? (state.resolvedLocation.searchStr ?? "")
        : null,
  });
  useEffect(() => {
    if (settledHomeSearch === null) return;

    const current = readCurrent();
    const location = router.latestLocation;
    if (location.pathname !== "/") return;
    if (toMapScreenRoute(current.search).to === "/") return;

    navigateToScreen(current.search, {
      replace: true,
      state: keepState(current.state),
    });
  }, [keepState, navigateToScreen, readCurrent, router, settledHomeSearch]);

  return { goTo, replaceSearch, goBack, exitToHome };
}
