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
  getPinId,
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
  /** 선택된 핀의 전체 데이터. 클러스터링으로 핀이 사라졌을 때 anchor dot을 표시하는 데 사용한다. */
  selectedPin?: LockerPinItemResponse | null;
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
  selectedPin,
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
  const anchorDotRef = useRef<naver.maps.Marker | null>(null);

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
        // 줌 시작 시 마커를 즉시 제거하지 않는다.
        // 새 뷰포트 데이터가 도착할 때까지 기존 마커를 유지해
        // 줌 애니메이션 중 핀이 사라지는 공백을 방지한다.
        // 새 데이터 도착 후 syncLockerMarkers가 stale 마커를 정리한다.
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
      // 새 뷰포트 데이터를 불러오는 중에는 기존 마커를 그대로 유지한다.
      // 데이터가 도착하면 syncLockerMarkers가 오래된 마커를 원자적으로 교체한다.
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

  // anchor dot: 선택된 핀이 클러스터링으로 화면에서 사라졌을 때 위치를 표시한다.
  // lockers 데이터가 로드됐지만 selectedPinId가 없을 때만 dot을 표시한다.
  useEffect(() => {
    const removeAnchorDot = () => {
      if (anchorDotRef.current) {
        anchorDotRef.current.setMap(null);
        anchorDotRef.current = null;
      }
    };

    if (!map || !maps || !canFetchLockerPins) {
      removeAnchorDot();
      return;
    }

    const isSelectedPinVisible =
      lockers != null &&
      lockers.some((pin) => getPinId(pin) === selectedPinId);

    const shouldShowDot =
      selectedPinId != null &&
      selectedPin != null &&
      selectedPin.pinType !== "CLUSTER" &&
      lockers != null &&
      !isSelectedPinVisible;

    if (!shouldShowDot) {
      removeAnchorDot();
      return;
    }

    const { latitude, longitude } = selectedPin;
    const dotSize = 12;
    const dotIcon = new maps.HtmlIcon({
      content: `<div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:#3BD569;border:2.5px solid white;box-shadow:0 0 0 2px rgba(59,213,105,0.35),0 1px 4px rgba(0,0,0,0.2);"></div>`,
      size: new maps.Size(dotSize, dotSize),
      anchor: new maps.Point(dotSize / 2, dotSize / 2),
    });

    if (!anchorDotRef.current) {
      anchorDotRef.current = new maps.Marker({
        map,
        position: new maps.LatLng(latitude, longitude),
        icon: dotIcon,
        zIndex: 15,
      });
    } else {
      anchorDotRef.current.setPosition(new maps.LatLng(latitude, longitude));
      if (
        (
          anchorDotRef.current as naver.maps.Marker & {
            getMap?: () => naver.maps.Map | null;
          }
        ).getMap?.() !== map
      ) {
        anchorDotRef.current.setMap(map);
      }
    }
  }, [map, maps, selectedPinId, selectedPin, lockers, canFetchLockerPins]);

  useEffect(() => {
    return () => {
      if (maps) {
        clearLockerMarkers(markerRegistryRef.current, maps);
      } else {
        markerRegistryRef.current.clear();
      }
      anchorDotRef.current?.setMap(null);
      anchorDotRef.current = null;
      lastRenderedZoomRef.current = null;
    };
  }, [maps]);

  return {
    isFetching,
  };
};
