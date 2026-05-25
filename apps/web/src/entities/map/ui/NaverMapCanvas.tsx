import { useEffect, useRef } from "react";

import { useNaverMapSdk } from "../model/NaverMapProvider";
import {
  canvas,
  root,
} from "./NaverMapCanvas.css";

const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

export function NaverMapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const { isReady, maps } = useNaverMapSdk();

  useEffect(() => {
    if (!isReady || !maps || !containerRef.current) return;

    mapRef.current = new maps.Map(containerRef.current, {
      center: new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: 15,
      zoomControl: true,
      scaleControl: false,
      mapDataControl: false,
    });

    return () => {
      mapRef.current = null;
    };
  }, [isReady, maps]);

  return (
    <div className={root}>
      <div ref={containerRef} className={canvas} aria-label="Naver map" />
    </div>
  );
}

