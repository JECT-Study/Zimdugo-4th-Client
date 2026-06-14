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
  selectedPinId?: string | null;
  onSelectLocker?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void;
  spreadCenter?: { lat: number; lng: number } | null;
}

export const useSearchResultMarkers = ({
  map,
  maps,
  pins,
  enabled = true,
  selectedPinId,
  onSelectLocker,
  spreadCenter,
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
      selectedPinId,
      onSelectLocker: (pinType, id, pin) =>
        onSelectLockerRef.current?.(pinType, id, pin),
      registry: markerRegistryRef.current,
      spreadCenter,
    });
  }, [enabled, map, maps, pins, selectedPinId, spreadCenter]);

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
