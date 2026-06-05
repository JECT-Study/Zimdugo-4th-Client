import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribeMapIdle } from "./map-idle-controller";
import type { MapViewport } from "./map-idle-controller";
import { syncLockerMarkers } from "./map-marker";
import { getLockerPins, getRadiusFromZoom } from "#/shared/api/lockers";

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

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
  const fallbackRadius = getRadiusFromZoom(viewport.zoom);
  const radiusFromBounds = Math.ceil(
    Math.max(
      getDistanceMeters(viewport.center, viewport.bounds.northEast),
      getDistanceMeters(viewport.center, viewport.bounds.southWest),
    ),
  );

  return radiusFromBounds > 0
    ? Math.max(radiusFromBounds, fallbackRadius)
    : fallbackRadius;
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
  const cleanupMarkersRef = useRef<(() => void) | null>(null);
  const radius = useMemo(
    () => (viewport ? getRadiusFromViewport(viewport) : undefined),
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
      "lockerPins",
      viewport?.center.lat,
      viewport?.center.lng,
      viewport?.zoom,
      radius,
    ],
    queryFn: () => {
      if (!viewport || radius === undefined) return Promise.resolve([]);
      return getLockerPins({
        lat: viewport.center.lat,
        lng: viewport.center.lng,
        radius,
      });
    },
    enabled: !!viewport,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });

  // 3. 서버에서 받아온 데이터를 지도 마커와 동기화
  useEffect(() => {
    if (!map || !maps || !lockers) return;

    if (cleanupMarkersRef.current) {
      cleanupMarkersRef.current();
    }

    cleanupMarkersRef.current = syncLockerMarkers({
      map,
      maps,
      lockers,
      onSelectLocker,
    });

    return () => {
      if (cleanupMarkersRef.current) {
        cleanupMarkersRef.current();
        cleanupMarkersRef.current = null;
      }
    };
  }, [map, maps, lockers, onSelectLocker]);

  return {
    isFetching,
  };
};
