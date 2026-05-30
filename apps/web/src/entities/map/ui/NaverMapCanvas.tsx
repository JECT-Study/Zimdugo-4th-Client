import { useEffect, useRef, useState } from "react";

import { useNaverMapSdk } from "../model/NaverMapProvider";
import { MapError } from "./MapError";
import { MapSkeleton } from "./map-skeleton/MapSkeleton";
import { canvas, root } from "./NaverMapCanvas.css";

const DEFAULT_CENTER = {
  lat: 37.4979,
  lng: 127.0276,
};

const MAP_ERROR_MESSAGE =
  "\uB124\uD2B8\uC6CC\uD06C \uC0C1\uD0DC\uB97C \uD655\uC778\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.";

const MAP_AUTH_ERROR_SIGNATURES = [
  "VITE_NAVER_MAP_CLIENT_ID",
  "Naver Maps authentication failed",
  "Naver Maps authentication request timed out",
  "Naver Maps SDK did not expose window.naver.maps",
  "Failed to load Naver Maps SDK",
];

const getMapErrorMessage = (message?: string) => {
  if (!message) return MAP_ERROR_MESSAGE;

  const isAuthOrSdkError = MAP_AUTH_ERROR_SIGNATURES.some((signature) =>
    message.includes(signature),
  );

  return isAuthOrSdkError ? MAP_ERROR_MESSAGE : message;
};

export interface NaverMapCanvasProps {
  onLoad?: (map: naver.maps.Map | null) => void;
}

export function NaverMapCanvas({ onLoad }: NaverMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const { status, isReady, maps, error, reload } = useNaverMapSdk();
  const [mapInitError, setMapInitError] = useState<string | null>(null);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    if (!isReady || !maps || !containerRef.current) return;

    setMapInitError(null);

    try {
      const map = new maps.Map(containerRef.current, {
        center: new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        zoom: 15,
        zoomControl: false,
        scaleControl: true,
        mapDataControl: false,
      });
      mapRef.current = map;
      onLoadRef.current?.(map);

      // 리사이즈 옵저버를 통해 컨테이너 크기 변경 감지 및 지도 사이즈 갱신
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (mapRef.current) {
            const { width, height } = entry.contentRect;
            mapRef.current.setSize(new maps.Size(width, height));
          }
        }
      });
      resizeObserver.observe(containerRef.current);
      
      // cleanup 함수에 전달하기 위해 map 객체 프로퍼티로 잠시 보관 (꼼수) 또는 상위 클로저 변수 사용 불가하므로 effect 반환 함수에서 처리
      // 단, effect 클로저 내에서 변수를 할당하고 cleanup에서 사용할 수 있습니다.
      // 여기서는 useEffect 반환 스코프에 resizeObserver를 전달할 수 있도록 ref를 사용하거나 직접 해제합니다.
      // 가장 간단한 방법은 이 effect 스코프 내 변수를 활용하는 것입니다.
      (map as any).__resizeObserver = resizeObserver;

    } catch (nextError) {
      setMapInitError(
        nextError instanceof Error
          ? nextError.message
          : "\uC9C0\uB3C4 \uCD08\uAE30\uD654 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
      );
    }

    return () => {
      if (mapRef.current) {
        if ((mapRef.current as any).__resizeObserver) {
          (mapRef.current as any).__resizeObserver.disconnect();
        }
        mapRef.current.destroy();
        mapRef.current = null;
        onLoadRef.current?.(null);
      }
    };
  }, [isReady, maps]);

  const handleRetry = () => {
    setMapInitError(null);
    reload();
  };

  const hasError = status === "error" || mapInitError !== null;
  const isLoading = status === "idle" || status === "loading";
  const errorMessage = getMapErrorMessage(mapInitError ?? error?.message);

  return (
    <section
      className={root}
      aria-label="\uB124\uC774\uBC84 \uC9C0\uB3C4 \uC601\uC5ED"
    >
      <div ref={containerRef} className={canvas} />

      {isLoading ? <MapSkeleton /> : null}

      {hasError ? (
        <MapError message={errorMessage} onRetry={handleRetry} />
      ) : null}
    </section>
  );
}
