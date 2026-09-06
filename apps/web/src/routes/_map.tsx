import { languageTag } from "@repo/i18n";
import {
  createFileRoute,
  Outlet,
  useMatches,
  useSearch,
} from "@tanstack/react-router";
import { useCallback, useMemo, useRef } from "react";
import {
  NaverMapCanvas,
  NaverMapProvider,
  useMapColorScheme,
} from "#/entities/map";
import { MapLocationProvider } from "#/entities/map/model/MapLocationProvider";
import {
  MapRuntimeProvider,
  type MapRuntimeValue,
} from "#/entities/map/model/MapRuntimeProvider";
import { DETAIL_FOCUS_ZOOM } from "#/entities/map/model/map-viewport-bootstrap";
import { useMapCamera } from "#/entities/map/model/useMapCamera";
import { useMapInitialCamera } from "#/entities/map/model/useMapInitialCamera";
import { useMapInstance } from "#/entities/map/model/useMapInstance";
import { useMapLocationValue } from "#/entities/map/model/useMapLocationValue";
import { useMapPressBus } from "#/entities/map/model/useMapPressBus";
import { useMapViewportPersistence } from "#/entities/map/model/useMapViewportPersistence";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { DEFAULT_SEARCH_COORDINATES } from "#/features/search/model/useMapSheetSession";
import { mapLayoutShell } from "./_map.css";
import { pickMapLoaderDetail } from "./-map-loader-detail";

/**
 * 지도를 얹는 화면들이 공유하는 레이아웃.
 *
 * 경로에 세그먼트를 더하지 않는 pathless 라우트다. `/` 는 여전히 `/` 이고, 프리렌더
 * 설정(`vite.config.ts` 의 `prerenderRoutes`)도 경로 문자열 기준이라 그대로 맞는다.
 *
 * `settings` · `notices` · `my` · `report` · `login` 은 지도를 쓰지 않으므로 이 아래에
 * 두지 않는다. 위치 추적이 이 자리에 있어, 아래에 두면 그 화면들에서도 GPS 가 켜진다.
 */
export const Route = createFileRoute("/_map")({
  component: MapLayout,
});

function MapLayout() {
  const { colorScheme } = useMapColorScheme();
  const mapLocation = useMapLocationValue();
  /*
   * 초기 카메라가 보는 것은 URL 과 자식의 로더뿐이다(#245).
   *
   * 자식의 `loaderData` 는 통로를 내지 않고 `useMatches()` 로 읽는다. 라우터가 주는
   * 매치 목록에 자식 것이 이미 들어 있어, 지도를 올리려고 새 prop 을 뚫을 필요가 없다.
   */
  const search = (useSearch({ strict: false }) || {}) as {
    locker?: unknown;
    focusLat?: number | null;
    focusLng?: number | null;
  };
  const matches = useMatches();
  const detail = useMemo(() => pickMapLoaderDetail(matches), [matches]);
  const lockerId = parseLockerSearchParam(search.locker);

  /*
   * 지도는 레이아웃이 쥔다.
   *
   * 지도가 화면에서 받던 것을 하나씩 끊어 왔다 — #236 이 `onMapPress`, #242 가 위치
   * 콜백, #244 가 `onLoad`, #245 가 `initialCenter` 다. 이제 지도가 받는 값 중 화면
   * 상태를 보는 것은 하나도 없어서, 어떤 화면이 `<Outlet />` 에 있든 같은 지도가 뜬다.
   */
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const getMap = useCallback(() => mapInstanceRef.current, []);
  const {
    map,
    isLoading,
    hasError,
    remountKey,
    attach,
    remount,
    setIsLoading,
    setHasError,
  } = useMapInstance({ mapRef: mapInstanceRef });
  const camera = useMapCamera({ getMap });
  const mapPressBus = useMapPressBus();

  /*
   * 카메라 저장이 초기 GPS 센터링보다 뒤에 붙어야 한다. `subscribeMapIdle` 이 구독
   * 즉시 handler 를 한 번 부르므로, 앞서면 첫 저장이 GPS 적용 전 카메라를 잡는다.
   *
   * 이 자리가 그 순서를 지킨다. 센터링은 `<Outlet />` 자식의 이펙트고 React 는 자식의
   * 이펙트를 먼저 돌리므로, 레이아웃에 있는 이 훅은 언제나 그 뒤다. 예전에는 같은
   * 컴포넌트 안에서 선언 순서로 지키던 것이라 주석으로 붙들어야 했다.
   */
  const { persistMapViewport, saveMapViewport } = useMapViewportPersistence({
    map,
    getMap,
  });

  const initialCamera = useMapInitialCamera({
    lockerId,
    focusLat: search.focusLat,
    focusLng: search.focusLng,
    detail,
    fallbackCenter: DEFAULT_SEARCH_COORDINATES,
    detailZoom: DETAIL_FOCUS_ZOOM,
    permission: mapLocation.permission,
    location: mapLocation.location,
    remountKey,
  });

  /** 다시 만들기 전에 보던 자리를 저장한다. 카메라를 지키는 것은 쥔 쪽의 일이다. */
  const remountWithSavedViewport = useCallback(() => {
    saveMapViewport();
    remount();
  }, [remount, saveMapViewport]);

  const mapRuntime = useMemo<MapRuntimeValue>(
    () => ({
      map,
      isLoading,
      hasError,
      camera,
      initialCamera,
      remount: remountWithSavedViewport,
      subscribeMapPress: mapPressBus.subscribe,
    }),
    [
      map,
      isLoading,
      hasError,
      camera,
      initialCamera,
      remountWithSavedViewport,
      mapPressBus.subscribe,
    ],
  );

  return (
    <NaverMapProvider colorScheme={colorScheme} language={languageTag()}>
      <MapLocationProvider value={mapLocation}>
        <MapRuntimeProvider value={mapRuntime}>
          <div className={mapLayoutShell}>
            <NaverMapCanvas
              key={remountKey}
              onLoad={attach}
              onWillDestroy={persistMapViewport}
              onLoadingChange={setIsLoading}
              onErrorChange={setHasError}
              onMapPress={mapPressBus.notify}
              initialCenter={initialCamera.center}
              initialZoom={initialCamera.zoom}
            />
            <Outlet />
          </div>
        </MapRuntimeProvider>
      </MapLocationProvider>
    </NaverMapProvider>
  );
}
