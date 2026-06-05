import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribeMapIdle } from "./map-idle-controller";
import type { MapViewport } from "./map-idle-controller";
import { syncLockerMarkers } from "./map-marker";
import { getLockerPins, getRadiusFromZoom } from "#/shared/api/lockers";

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
    ],
    queryFn: () => {
      if (!viewport) return Promise.resolve([]);
      return getLockerPins({
        lat: viewport.center.lat,
        lng: viewport.center.lng,
        radius: getRadiusFromZoom(viewport.zoom),
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
