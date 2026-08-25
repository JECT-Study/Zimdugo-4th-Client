import { useEffect, useRef } from "react";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import {
  clearLockerMarkers,
  type LockerMarkerOffset,
  type LockerMarkerRegistry,
  syncLockerMarkers,
} from "./map-marker";

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
    offset: LockerMarkerOffset,
  ) => void;
  spreadCenter?: { lat: number; lng: number } | null;
  preservedOffsets?: ReadonlyMap<string, LockerMarkerOffset>;
}

export const useSearchResultMarkers = ({
  map,
  maps,
  pins,
  enabled = true,
  selectedPinId,
  onSelectLocker,
  spreadCenter,
  preservedOffsets,
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
      onSelectLocker: (pinType, id, pin, offset) =>
        onSelectLockerRef.current?.(pinType, id, pin, offset),
      registry: markerRegistryRef.current,
      spreadCenter,
      preservedOffsets,
    });
  }, [enabled, map, maps, pins, selectedPinId, spreadCenter, preservedOffsets]);

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
