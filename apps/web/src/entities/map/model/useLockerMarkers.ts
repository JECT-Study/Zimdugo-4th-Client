import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribeMapIdle } from "./map-idle-controller";
import type { MapViewport } from "./map-idle-controller";
import {
  clearLockerMarkers,
  syncLockerMarkers,
  type LockerMarkerRegistry,
} from "./map-marker";
import { getLockerPins, getRadiusFromZoom } from "#/shared/api/lockers";

export const LOCKER_PINS_QUERY_KEY = "lockerPins";

const EARTH_RADIUS_METERS = 6_371_000;
const LOCKER_PIN_COORDINATE_PRECISION = 4;
const LOCKER_PIN_RADIUS_BUCKET_METERS = 50;
const SEARCH_BAR_RESERVED_TOP_PX = 136;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(LOCKER_PIN_COORDINATE_PRECISION));

const roundRadius = (value: number): number =>
  Math.ceil(value / LOCKER_PIN_RADIUS_BUCKET_METERS) *
  LOCKER_PIN_RADIUS_BUCKET_METERS;

const getDistanceMeters = (
  from: MapViewport["center"],
  to: MapViewport["center"],
): number => {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

export const getRadiusFromViewport = (viewport: MapViewport): number => {
  return getLockerPinQueryFromViewport(viewport).radius;
};

export interface LockerPinQueryViewport {
  lat: number;
  lng: number;
  radius: number;
}

export const getLockerPinQueryFromViewport = (
  viewport: MapViewport,
): LockerPinQueryViewport => {
  const fallbackRadius = getRadiusFromZoom(viewport.zoom);
  const { northEast, southWest } = viewport.bounds;
  const topInsetRatio =
    viewport.size && viewport.size.height > 0
      ? Math.min(SEARCH_BAR_RESERVED_TOP_PX / viewport.size.height, 0.45)
      : 0;
  const effectiveNorthEast = {
    lat:
      northEast.lat -
      (northEast.lat - southWest.lat) * topInsetRatio,
    lng: northEast.lng,
  };
  const queryCenter = {
    lat: (effectiveNorthEast.lat + southWest.lat) / 2,
    lng: (effectiveNorthEast.lng + southWest.lng) / 2,
  };
  const radiusFromBounds = Math.ceil(
    Math.max(
      getDistanceMeters(queryCenter, effectiveNorthEast),
      getDistanceMeters(queryCenter, {
        lat: effectiveNorthEast.lat,
        lng: southWest.lng,
      }),
      getDistanceMeters(queryCenter, {
        lat: southWest.lat,
        lng: effectiveNorthEast.lng,
      }),
      getDistanceMeters(queryCenter, southWest),
    ),
  );

  return {
    lat: roundCoordinate(queryCenter.lat),
    lng: roundCoordinate(queryCenter.lng),
    radius: roundRadius(
      radiusFromBounds > 0
        ? Math.max(radiusFromBounds, fallbackRadius)
        : fallbackRadius,
    ),
  };
};

export interface UseLockerMarkersOptions {
  map: naver.maps.Map | null;
  maps: typeof naver.maps | null;
  onSelectLocker?: (pinType: "LOCKER" | "PLACE", id: number) => void;
}

export const useLockerMarkers = ({
  map,
  maps,
  onSelectLocker,
}: UseLockerMarkersOptions) => {
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const markerRegistryRef = useRef<LockerMarkerRegistry>(new Map());
  const onSelectLockerRef = useRef(onSelectLocker);

  useEffect(() => {
    onSelectLockerRef.current = onSelectLocker;
  }, [onSelectLocker]);

  const handleSelectLocker = useCallback(
    (pinType: "LOCKER" | "PLACE", id: number) => {
      onSelectLockerRef.current?.(pinType, id);
    },
    [],
  );

  const lockerPinQuery = useMemo(
    () => (viewport ? getLockerPinQueryFromViewport(viewport) : undefined),
    [viewport],
  );

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
    enabled: !!viewport,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // 3. 서버에서 받아온 데이터를 지도 마커와 동기화
  // viewport가 변경될 때마다(드래그 등) 화면 밖 마커 컬링 로직이 수행되도록 의존성 추가
  useEffect(() => {
    if (!map || !maps || !lockers) return;

    syncLockerMarkers({
      map,
      maps,
      lockers,
      onSelectLocker: handleSelectLocker,
      registry: markerRegistryRef.current,
    });
  }, [map, maps, lockers, handleSelectLocker, viewport]);

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
