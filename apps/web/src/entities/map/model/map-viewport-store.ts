import { create } from "zustand";

import { readViewport } from "./map-idle-controller";
import type { MapViewportCache, MapViewportCoord } from "./map-viewport-bootstrap";

interface MapViewportStore {
  cache: MapViewportCache | null;
  setCache: (cache: MapViewportCache | null) => void;
  saveFromMap: (map: naver.maps.Map, gpsAtSave?: MapViewportCoord | null) => void;
}

export const useMapViewportStore = create<MapViewportStore>((set) => ({
  cache: null,
  setCache: (cache) => set({ cache }),
  saveFromMap: (map, gpsAtSave = null) => {
    const viewport = readViewport(map);
    set({
      cache: {
        center: viewport.center,
        zoom: viewport.zoom,
        savedAt: Date.now(),
        gpsAtSave,
      },
    });
  },
}));
