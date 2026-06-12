import { m } from "@repo/i18n";
import { useEffect, useRef, useState } from "react";

import {
  getMapContainerSize,
  hasUsableMapContainerSize,
  waitForUsableMapContainerSize,
} from "../model/map-container-layout";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "../model/map-viewport-bootstrap";
import { useNaverMapSdk } from "../model/NaverMapProvider";
import { MapError } from "./MapError";
import { MapSkeleton } from "./map-skeleton/MapSkeleton";
import { canvas, root } from "./NaverMapCanvas.css";

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

export interface MapCanvasCoordinates {
  lat: number;
  lng: number;
}

export interface NaverMapCanvasProps {
  onLoad?: (map: naver.maps.Map | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (hasError: boolean) => void;
  initialCenter?: MapCanvasCoordinates | null;
  initialZoom?: number;
}

export function NaverMapCanvas({
  onLoad,
  onLoadingChange,
  onErrorChange,
  initialCenter = null,
  initialZoom = DEFAULT_MAP_ZOOM,
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

  const initialCenterRef = useRef(initialCenter);
  initialCenterRef.current = initialCenter;

  const initialZoomRef = useRef(initialZoom);
  initialZoomRef.current = initialZoom;

  const hasError = status === "error" || mapInitError !== null;
  const isLoading = status === "idle" || status === "loading";
  const errorMessage = getMapErrorMessage(mapInitError ?? error?.message);

  const handleRetry = () => {
    setMapInitError(null);
    reload();
  };

  useEffect(() => {
    if (!isReady || !maps || !containerRef.current) return;

    const container = containerRef.current;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let refreshFrameId = 0;

    const initMap = async () => {
      setMapInitError(null);

      let size = getMapContainerSize(container);
      if (!hasUsableMapContainerSize(size)) {
        size = await waitForUsableMapContainerSize(container);
      }
      if (cancelled) return;

      try {
        const bootstrapCenter = initialCenterRef.current ?? DEFAULT_MAP_CENTER;
        const map = new maps.Map(container, {
          center: new maps.LatLng(bootstrapCenter.lat, bootstrapCenter.lng),
          zoom: initialZoomRef.current,
          zoomControl: false,
          scaleControl: true,
          mapDataControl: false,
        });

        if (cancelled) {
          map.destroy();
          return;
        }

        map.setSize(new maps.Size(size.width, size.height));
        mapRef.current = map;
        onLoadRef.current?.(map);

        refreshFrameId = requestAnimationFrame(() => {
          if (cancelled || mapRef.current !== map) return;
          map.refresh();
        });

        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (mapRef.current) {
              const { width, height } = entry.contentRect;
              mapRef.current.setSize(new maps.Size(width, height));
            }
          }
        });
        resizeObserver.observe(container);
      } catch (nextError) {
        if (cancelled) return;
        onLoadRef.current?.(null);
        setMapInitError(
          nextError instanceof Error
            ? nextError.message
            : m.map_error_initialization_message(),
        );
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      cancelAnimationFrame(refreshFrameId);
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
