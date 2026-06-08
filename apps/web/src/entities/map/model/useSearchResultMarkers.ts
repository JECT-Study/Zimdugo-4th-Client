import { useEffect, useRef } from "react";
import {
  clearLockerMarkers,
  syncLockerMarkers,
  type LockerMarkerRegistry,
} from "./map-marker";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export interface UseSearchResultMarkersOptions {
  map: naver.maps.Map | null;
  maps: typeof naver.maps | null;
  pins: LockerPinItemResponse[];
  enabled?: boolean;
  onSelectLocker?: (pinType: "LOCKER" | "PLACE", id: number) => void;
}

export const useSearchResultMarkers = ({
  map,
  maps,
  pins,
  enabled = true,
  onSelectLocker,
}: UseSearchResultMarkersOptions) => {
  const markerRegistryRef = useRef<LockerMarkerRegistry>(new Map());
  const onSelectLockerRef = useRef(onSelectLocker);

  useEffect(() => {
    onSelectLockerRef.current = onSelectLocker;
  }, [onSelectLocker]);

  useEffect(() => {
    if (!enabled || !map || !maps) {
      if (maps) {
        clearLockerMarkers(markerRegistryRef.current, maps);
      }
      markerRegistryRef.current.clear();
      return;
    }

    syncLockerMarkers({
      map,
      maps,
      lockers: pins,
      onSelectLocker: (pinType, id) => onSelectLockerRef.current?.(pinType, id),
      registry: markerRegistryRef.current,
    });
  }, [enabled, map, maps, pins]);

  useEffect(() => {
    return () => {
      if (maps) {
        clearLockerMarkers(markerRegistryRef.current, maps);
      } else {
        markerRegistryRef.current.clear();
      }
    };
  }, [maps]);
};
