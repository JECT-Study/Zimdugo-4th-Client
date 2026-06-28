import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LockerBoundsRaw } from "#/shared/api/lockers";
import {
  getLockerPins,
  type LockerPinItemResponse,
  type LockerPinSearchParams,
} from "#/shared/api/lockers";
import { getAuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { useAuthStore } from "#/shared/store/authStore";
import {
  getLockerPinQueryFromViewport,
  isLockerPinQueryWithinCapacity,
  type LockerPinQueryViewport,
} from "./locker-pin-query";
import type { MapViewport } from "./map-idle-controller";
import { subscribeMapIdle } from "./map-idle-controller";
import {
  clearLockerMarkers,
  type LockerMarkerOffset,
  type LockerMarkerRegistry,
  syncLockerMarkers,
} from "./map-marker";

export const LOCKER_PINS_QUERY_KEY = "lockerPins";
export { getLockerPinQueryFromViewport, isLockerPinQueryWithinCapacity };
export type { LockerPinQueryViewport };

export const getLockerPinSearchSignature = (
  searchParams?: LockerPinSearchParams | null,
) =>
  JSON.stringify({
    keyword: searchParams?.keyword ?? null,
    sizeTypes: searchParams?.sizeTypes ?? [],
    lockerTypes: searchParams?.lockerTypes ?? [],
    indoorOutdoorTypes: searchParams?.indoorOutdoorTypes ?? [],
    minPrice: searchParams?.minPrice ?? null,
    maxPrice: searchParams?.maxPrice ?? null,
    isFree: searchParams?.isFree ?? null,
  });

export interface UseLockerMarkersOptions {
  map: naver.maps.Map | null;
  maps: typeof naver.maps | null;
  searchParams?: LockerPinSearchParams | null;
  selectedPinId?: string | null;
  onSelectLocker?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
    offset: LockerMarkerOffset,
  ) => void;
  onClusterClick?: (bounds: LockerBoundsRaw) => void;
  spreadCenter?: { lat: number; lng: number } | null;
}

export const useLockerMarkers = ({
  map,
  maps,
  searchParams,
  selectedPinId,
  onSelectLocker,
  onClusterClick,
  spreadCenter,
}: UseLockerMarkersOptions) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const markerRegistryRef = useRef<LockerMarkerRegistry>(new Map());
  const lastRenderedZoomRef = useRef<number | null>(null);
  const lastSearchSignatureRef = useRef<string | null>(null);
  const onSelectLockerRef = useRef(onSelectLocker);

  useEffect(() => {
    onSelectLockerRef.current = onSelectLocker;
  }, [onSelectLocker]);

  const handleSelectLocker = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin: LockerPinItemResponse,
      offset: LockerMarkerOffset,
    ) => {
      onSelectLockerRef.current?.(pinType, id, pin, offset);
    },
    [],
  );

  const lockerPinQuery = useMemo(
    () => (viewport ? getLockerPinQueryFromViewport(viewport) : undefined),
    [viewport],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: getLockerPinSearchSignature only uses filter properties
  const searchSignature = useMemo(
    () => getLockerPinSearchSignature(searchParams),
    [
      searchParams?.indoorOutdoorTypes?.join(","),
      searchParams?.keyword,
      searchParams?.lockerTypes?.join(","),
      searchParams?.sizeTypes?.join(","),
      searchParams?.minPrice,
      searchParams?.maxPrice,
      searchParams?.isFree,
    ],
  );
  const canFetchLockerPins =
    lockerPinQuery !== undefined &&
    isLockerPinQueryWithinCapacity(lockerPinQuery);
  const authScope = getAuthQueryCacheScope(isAuthenticated, userId);

  useEffect(() => {
    if (!maps) {
      lastSearchSignatureRef.current = searchSignature;
      return;
    }

    if (lastSearchSignatureRef.current === searchSignature) {
      return;
    }

    clearLockerMarkers(markerRegistryRef.current, maps);
    lastRenderedZoomRef.current = null;
    lastSearchSignatureRef.current = searchSignature;
  }, [maps, searchSignature]);

  // 1. 지도 idle 이벤트 구독 (뷰포트 상태 업데이트만 담당)
  useEffect(() => {
    if (!map || !maps) return;

    const unsubscribeIdle = subscribeMapIdle({
      map,
      maps,
      onZoomChangeStart: () => {
        clearLockerMarkers(markerRegistryRef.current, maps);
        lastRenderedZoomRef.current = null;
      },
      onSettle: (newViewport) => setViewport(newViewport),
    });

    return () => {
      unsubscribeIdle();
    };
  }, [map, maps]);

  // 2. 뷰포트 상태를 기반으로 TanStack Query 호출 (캐싱, 상태 관리 자동화)
  const { data: lockers, isFetching } = useQuery({
    queryKey: [
      LOCKER_PINS_QUERY_KEY,
      lockerPinQuery?.swLat,
      lockerPinQuery?.swLng,
      lockerPinQuery?.neLat,
      lockerPinQuery?.neLng,
      lockerPinQuery?.zoom,
      searchParams?.lat,
      searchParams?.lng,
      searchParams?.keyword,
      searchParams?.sizeTypes,
      searchParams?.lockerTypes,
      searchParams?.indoorOutdoorTypes,
      searchParams?.minPrice,
      searchParams?.maxPrice,
      searchParams?.isFree,
      authScope,
    ],
    queryFn: ({ signal }) => {
      if (!lockerPinQuery) return Promise.resolve([]);
      return getLockerPins({
        swLat: lockerPinQuery.swLat,
        swLng: lockerPinQuery.swLng,
        neLat: lockerPinQuery.neLat,
        neLng: lockerPinQuery.neLng,
        zoom: lockerPinQuery.zoom,
        ...searchParams,
        signal,
      });
    },
    enabled: canFetchLockerPins,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    gcTime: 1000 * 60 * 5,
  });

  // 3. 서버에서 받아온 데이터를 지도 마커와 동기화
  // viewport가 변경될 때마다(드래그 등) 화면 밖 마커 컬링 로직이 수행되도록 의존성 추가
  // biome-ignore lint/correctness/useExhaustiveDependencies: force sync on viewport change
  useEffect(() => {
    if (!map || !maps) return;

    if (!canFetchLockerPins) {
      clearLockerMarkers(markerRegistryRef.current, maps);
      lastRenderedZoomRef.current = null;
      return;
    }

    if (!lockers) {
      if (lastRenderedZoomRef.current === lockerPinQuery?.zoom) {
        return;
      }
      clearLockerMarkers(markerRegistryRef.current, maps);
      return;
    }

    syncLockerMarkers({
      map,
      maps,
      lockers,
      selectedPinId,
      onSelectLocker: handleSelectLocker,
      onClusterClick,
      registry: markerRegistryRef.current,
      spreadCenter,
    });
    lastRenderedZoomRef.current = lockerPinQuery?.zoom ?? null;
  }, [
    map,
    maps,
    lockers,
    selectedPinId,
    handleSelectLocker,
    onClusterClick,
    viewport,
    canFetchLockerPins,
    lockerPinQuery?.zoom,
    spreadCenter,
  ]);

  useEffect(() => {
    return () => {
      if (maps) {
        clearLockerMarkers(markerRegistryRef.current, maps);
      } else {
        markerRegistryRef.current.clear();
      }
      lastRenderedZoomRef.current = null;
    };
  }, [maps]);

  return {
    isFetching,
  };
};
