import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import {
  readMapScreenSearch,
  toMapScreenRoute,
} from "#/shared/lib/map-path-url";
import {
  type MapScreenHistoryState,
  type MapSheetEntry,
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
  /**
   * 히스토리를 되감는 중인지와, 되감기가 끝난 뒤 할 일.
   *
   * 되감기(`history.back`·`go`)는 비동기다. 그 사이 다른 이동을 하면 되감기 전 칸
   * 위에서 계산되어 어긋난다. 예를 들어 지도 맥락을 닫으며(되감기) 검색 오버레이를
   * 열면(칸 만들기), 오버레이 칸이 되감기에 함께 사라진다. 그래서 되감는 동안 들어온
   * 일은 모아 두었다가 되감기가 끝나면 차례로 한다.
   */
  const isTraversingRef = useRef(false);
  const afterTraversalRef = useRef<Array<() => void>>([]);

  const traverse = useCallback(
    (delta: number) => {
      isTraversingRef.current = true;
      router.history.go(delta);
    },
    [router],
  );

  const runAfterTraversal = useCallback((task: () => void) => {
    if (isTraversingRef.current) {
      afterTraversalRef.current.push(task);
      return true;
    }
    return false;
  }, []);

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
        // 넘긴 상태에 없으면 지운다. 다른 화면으로 가는 칸에 시트 표시가 따라가지 않게.
        mapSheet: state.mapSheet,
      }),
    [],
  );

  const goTo = useCallback(
    (update: SearchUpdate) => {
      if (runAfterTraversal(() => goTo(update))) return;

      const current = readCurrent();

      /*
       * 시트 칸(검색 오버레이 등)이 열린 채 다른 화면으로 가면, 먼저 그 칸을 되감고
       * 나서 간다. 시트 칸 위에 새 칸을 쌓으면 새 화면에서 뒤로 갈 때 닫았던 시트가
       * 다시 열린다. 히스토리에는 시트를 연 적이 없던 것처럼 남는다.
       */
      if (current.state.mapSheet !== undefined) {
        traverse(-1);
        afterTraversalRef.current.push(() => goTo(update));
        return;
      }

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
    [keepState, navigateToScreen, readCurrent, runAfterTraversal, traverse],
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
        traverse(-1);
        return;
      }

      navigateToScreen(fallback ? fallback(plan.search) : plan.search, {
        replace: true,
        state: keepState(current.state),
      });
    },
    [keepState, navigateToScreen, readCurrent, traverse],
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
      traverse(-depth);
      return;
    }

    navigateToScreen(toHomeMapScreenSearch(current.search), {
      replace: true,
      state: keepState(current.state),
    });
  }, [keepState, navigateToScreen, readCurrent, traverse]);

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

  /**
   * 화면 위에 시트를 연다. 주소는 그대로 두고 같은 주소로 칸을 하나 만든다.
   *
   * 칸 수(`mapStackDepth`)도 하나 늘린다. 홈으로 나가기가 이 칸까지 되감아야 한다.
   */
  const pushSheetEntry = useCallback(
    (sheet: MapSheetEntry) => {
      if (runAfterTraversal(() => pushSheetEntry(sheet))) return;

      const current = readCurrent();
      if (current.state.mapSheet === sheet) return;

      navigateToScreen(current.search, {
        replace: false,
        state: keepState({
          mapBackTo: toMapScreenKey(readMapScreenParams(current.search)),
          mapStackDepth: (current.state.mapStackDepth ?? 0) + 1,
          mapSheet: sheet,
        }),
      });
    },
    [keepState, navigateToScreen, readCurrent, runAfterTraversal],
  );

  /**
   * 시트의 칸을 되감아 닫는다. 지금 칸이 그 시트의 칸이 아니면(새로고침 등으로 칸 없이
   * 열려 있었다면) 아무것도 하지 않는다. 화면이 시트를 닫는 것은 호출하는 쪽의 일이다.
   */
  const closeSheetEntry = useCallback(
    (sheet: MapSheetEntry) => {
      if (readCurrent().state.mapSheet !== sheet) return;
      traverse(-1);
    },
    [readCurrent, traverse],
  );

  /** 지금 칸의 시트 표시. 이동이 끝나 확정된 칸을 본다. */
  const sheetEntry = useRouterState({
    select: (state) =>
      (state.resolvedLocation?.state as MapScreenHistoryState | undefined)
        ?.mapSheet,
  });

  /*
   * 되감기가 끝나면 모아 둔 일을 한다. 확정된 칸이 바뀐 것으로 끝을 안다.
   *
   * 홈으로 나가기의 정리(위 이펙트)가 먼저 돌도록 그보다 뒤에 둔다. 그 정리가 다시
   * 칸을 바꾸면 그것도 되감기처럼 기다린다.
   */
  const resolvedEntryKey = useRouterState({
    select: (state) =>
      (state.resolvedLocation?.state as { key?: string } | undefined)?.key,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: resolvedEntryKey 는 되감기가 끝났음을 알리는 트리거다
  useEffect(() => {
    if (!isTraversingRef.current) return;
    if (isExitingToHomeRef.current) return;

    isTraversingRef.current = false;
    const tasks = afterTraversalRef.current;
    afterTraversalRef.current = [];
    for (const task of tasks) task();
  }, [resolvedEntryKey]);

  return {
    goTo,
    replaceSearch,
    goBack,
    exitToHome,
    pushSheetEntry,
    closeSheetEntry,
    sheetEntry,
  };
}
