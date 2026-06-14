import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribeMapIdle } from "./map-idle-controller";
import type { MapViewport } from "./map-idle-controller";
import {
  getLockerPinQueryFromViewport,
  getRadiusFromViewport,
  isLockerPinQueryWithinCapacity,
  type LockerPinQueryViewport,
} from "./locker-pin-query";
import {
  clearLockerMarkers,
  syncLockerMarkers,
  type LockerMarkerRegistry,
} from "./map-marker";
import {
  getLockerPins,
  type LockerPinItemResponse,
} from "#/shared/api/lockers";

export const LOCKER_PINS_QUERY_KEY = "lockerPins";
export {
  getLockerPinQueryFromViewport,
  getRadiusFromViewport,
  isLockerPinQueryWithinCapacity,
};
export type { LockerPinQueryViewport };

export interface UseLockerMarkersOptions {
  map: naver.maps.Map | null;
  maps: typeof naver.maps | null;
  selectedPinId?: string | null;
  onSelectLocker?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void;
}

export const useLockerMarkers = ({
  map,
  maps,
  selectedPinId,
  onSelectLocker,
}: UseLockerMarkersOptions) => {
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const markerRegistryRef = useRef<LockerMarkerRegistry>(new Map());
  const onSelectLockerRef = useRef(onSelectLocker);

  useEffect(() => {
    onSelectLockerRef.current = onSelectLocker;
  }, [onSelectLocker]);

  const handleSelectLocker = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin: LockerPinItemResponse,
    ) => {
      onSelectLockerRef.current?.(pinType, id, pin);
    },
    [],
  );

  const lockerPinQuery = useMemo(
    () => (viewport ? getLockerPinQueryFromViewport(viewport) : undefined),
    [viewport],
  );
  const canFetchLockerPins =
    lockerPinQuery !== undefined &&
    isLockerPinQueryWithinCapacity(lockerPinQuery);

  // 1. 지도 idle 이벤트 구독 (뷰포트 상태 업데이트만 담당)
  useEffect(() => {
    if (!map || !maps) return;

    const unsubscribeIdle = subscribeMapIdle({
      map,
      maps,
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
      lockerPinQuery?.lat,
      lockerPinQuery?.lng,
      lockerPinQuery?.radius,
    ],
    queryFn: ({ signal }) => {
      if (!lockerPinQuery) return Promise.resolve([]);
      return getLockerPins({
        lat: lockerPinQuery.lat,
        lng: lockerPinQuery.lng,
        radius: lockerPinQuery.radius,
        signal,
      });
    },
    enabled: canFetchLockerPins,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // 3. 서버에서 받아온 데이터를 지도 마커와 동기화
  // viewport가 변경될 때마다(드래그 등) 화면 밖 마커 컬링 로직이 수행되도록 의존성 추가
  useEffect(() => {
    if (!map || !maps) return;

    if (!canFetchLockerPins || !lockers) {
      clearLockerMarkers(markerRegistryRef.current, maps);
      return;
    }

    syncLockerMarkers({
      map,
      maps,
      lockers,
      selectedPinId,
      onSelectLocker: handleSelectLocker,
      registry: markerRegistryRef.current,
    });
  }, [
    map,
    maps,
    lockers,
    selectedPinId,
    handleSelectLocker,
    viewport,
    canFetchLockerPins,
  ]);

  useEffect(() => {
    return () => {
      if (maps) {
        clearLockerMarkers(markerRegistryRef.current, maps);
      } else {
        markerRegistryRef.current.clear();
      }
    };
  }, [maps]);

  return {
    isFetching,
  };
};
