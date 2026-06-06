import { m } from "@repo/i18n";
import { useEffect, useRef, useState } from "react";

import { useNaverMapSdk } from "../model/NaverMapProvider";
import { MapError } from "./MapError";
import { MapSkeleton } from "./map-skeleton/MapSkeleton";
import { canvas, root } from "./NaverMapCanvas.css";

const DEFAULT_CENTER = {
  lat: 37.4979,
  lng: 127.0276,
};

const MAP_AUTH_ERROR_SIGNATURES = [
  "VITE_NAVER_MAP_CLIENT_ID",
  "Naver Maps authentication failed",
  "Naver Maps authentication request timed out",
  "Naver Maps SDK did not expose window.naver.maps",
  "Failed to load Naver Maps SDK",
];

const getMapErrorMessage = (message?: string) => {
  if (!message) return m.map_error_default_message();

  const isAuthOrSdkError = MAP_AUTH_ERROR_SIGNATURES.some((signature) =>
    message.includes(signature),
  );

  return isAuthOrSdkError ? m.map_error_default_message() : message;
};

export interface NaverMapCanvasProps {
  onLoad?: (map: naver.maps.Map | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (hasError: boolean) => void;
}

export function NaverMapCanvas({
  onLoad,
  onLoadingChange,
  onErrorChange,
}: NaverMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const { status, isReady, maps, error, reload } = useNaverMapSdk();
  const [mapInitError, setMapInitError] = useState<string | null>(null);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;

  const onErrorChangeRef = useRef(onErrorChange);
  onErrorChangeRef.current = onErrorChange;

  useEffect(() => {
    if (!isReady || !maps || !containerRef.current) return;

    setMapInitError(null);

    let resizeObserver: ResizeObserver | null = null;

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

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (mapRef.current) {
            const { width, height } = entry.contentRect;
            mapRef.current.setSize(new maps.Size(width, height));
          }
        }
      });
      resizeObserver.observe(containerRef.current);
    } catch (nextError) {
      onLoadRef.current?.(null);
      setMapInitError(
        nextError instanceof Error
          ? nextError.message
          : m.map_error_initialization_message(),
      );
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapRef.current) {
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

  useEffect(() => {
    onLoadingChangeRef.current?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    onErrorChangeRef.current?.(hasError);
  }, [hasError]);

  return (
    <section className={root} aria-label={m.map_area_aria()}>
      <div ref={containerRef} className={canvas} />

      {isLoading ? <MapSkeleton /> : null}

      {hasError ? (
        <MapError
          alertLabel={m.map_error_alert_aria()}
          description={m.map_error_description()}
          message={errorMessage}
          onRetry={handleRetry}
          retryAriaLabel={m.map_error_retry_aria()}
          retryLabel={m.map_error_retry()}
          title={m.map_error_title()}
        />
      ) : null}
    </section>
  );
}
