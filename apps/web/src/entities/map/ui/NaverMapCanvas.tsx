import { useEffect, useRef } from "react";

import { useNaverMapSdk } from "../model/NaverMapProvider";
import {
  canvas,
  retryButton,
  root,
  statusDescription,
  statusPanel,
  statusTitle,
} from "./NaverMapCanvas.css";

const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

export function NaverMapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const { status, isReady, maps, error, reload } = useNaverMapSdk();

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
      {status === "loading" || status === "idle" ? (
        <div className={statusPanel}>
          <p className={statusTitle}>지도를 불러오고 있습니다.</p>
        </div>
      ) : null}
      {status === "error" ? (
        <div className={statusPanel}>
          <p className={statusTitle}>지도를 불러오지 못했습니다.</p>
          <p className={statusDescription}>
            {error?.message ?? "Naver Maps SDK 로딩 중 오류가 발생했습니다."}
          </p>
          <button type="button" className={retryButton} onClick={reload}>
            다시 시도
          </button>
        </div>
      ) : null}
    </div>
  );
}
