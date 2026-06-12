import { create } from "zustand";

import { readViewport } from "./map-idle-controller";
import type { MapViewportCache } from "./map-viewport-bootstrap";

interface MapViewportStore {
  cache: MapViewportCache | null;
  setCache: (cache: MapViewportCache | null) => void;
  saveFromMap: (map: naver.maps.Map) => void;
}

export const useMapViewportStore = create<MapViewportStore>((set) => ({
  cache: null,
  setCache: (cache) => set({ cache }),
  saveFromMap: (map) => {
    const viewport = readViewport(map);
    set({
      cache: {
        center: viewport.center,
        zoom: viewport.zoom,
        savedAt: Date.now(),
      },
    });
  },
}));
