import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
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
  const search = (useSearch({ strict: false }) || {}) as SearchUrlParams;
  /** 되감기가 끝났을 때 홈이 아니면 홈으로 바꿔야 하는지. */
  const isExitingToHomeRef = useRef(false);

  const readCurrent = useCallback(() => {
    const location = router.latestLocation;
    return {
      search: (location.search ?? {}) as SearchUrlParams,
      state: (location.state ?? {}) as MapScreenHistoryState,
    };
  }, [router]);

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

      void navigate({
        to: ".",
        search: nextSearch as never,
        replace: plan.replace,
        state: keepState(plan.state) as never,
      });
    },
    [keepState, navigate, readCurrent],
  );

  const replaceSearch = useCallback(
    (update: SearchUpdate) => {
      const current = readCurrent();

      void navigate({
        to: ".",
        search: update(current.search) as never,
        replace: true,
        state: keepState(current.state) as never,
      });
    },
    [keepState, navigate, readCurrent],
  );

  const goBack = useCallback(
    (fallback?: SearchUpdate) => {
      const current = readCurrent();
      const plan = planBackMapScreenNavigation(current.search, current.state);

      if (plan.kind === "history-back") {
        router.history.back();
        return;
      }

      void navigate({
        to: ".",
        search: (fallback ? fallback(plan.search) : plan.search) as never,
        replace: true,
        state: keepState(current.state) as never,
      });
    },
    [keepState, navigate, readCurrent, router],
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

    void navigate({
      to: ".",
      search: toHomeMapScreenSearch(current.search) as never,
      replace: true,
      state: keepState(current.state) as never,
    });
  }, [keepState, navigate, readCurrent, router]);

  /*
   * 되감아 닿은 첫 칸이 홈이 아닐 수 있다. 검색 결과 주소로 바로 들어와 그 위에
   * 상세를 쌓았다면 첫 칸은 검색 결과다. 그때는 그 칸을 홈으로 바꾼다.
   */
  const screenKey = toMapScreenKey(readMapScreenParams(search));
  useEffect(() => {
    if (!isExitingToHomeRef.current) return;

    const current = readCurrent();
    if ((current.state.mapStackDepth ?? 0) > 0) return;

    isExitingToHomeRef.current = false;
    if (screenKey === HOME_SCREEN_KEY) return;

    void navigate({
      to: ".",
      search: toHomeMapScreenSearch(current.search) as never,
      replace: true,
      state: keepState(current.state) as never,
    });
  }, [keepState, navigate, readCurrent, screenKey]);

  return { goTo, replaceSearch, goBack, exitToHome };
}
