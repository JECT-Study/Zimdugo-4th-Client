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

const MAP_BOOTSTRAP_TIMEOUT_MS = 3_000;

const getMapErrorMessage = (message?: string) => {
  if (!message) return m.map_error_default_message();

  const isAuthOrSdkError = MAP_AUTH_ERROR_SIGNATURES.some((signature) =>
    message.includes(signature),
  );

  return isAuthOrSdkError ? m.map_error_default_message() : message;
};

interface MapCanvasCoordinates {
  lat: number;
  lng: number;
}

export interface NaverMapCanvasProps {
  onLoad?: (map: naver.maps.Map | null) => void;
  onWillDestroy?: (map: naver.maps.Map) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (hasError: boolean) => void;
  onMapPress?: () => void;
  initialCenter?: MapCanvasCoordinates | null;
  initialZoom?: number;
}

export function NaverMapCanvas({
  onLoad,
  onWillDestroy,
  onLoadingChange,
  onErrorChange,
  onMapPress,
  initialCenter = null,
  initialZoom = DEFAULT_MAP_ZOOM,
}: NaverMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const { status, isReady, maps, error, reload, styleOptions } =
    useNaverMapSdk();
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [isMapBootstrapping, setIsMapBootstrapping] = useState(false);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  const onWillDestroyRef = useRef(onWillDestroy);
  onWillDestroyRef.current = onWillDestroy;

  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;

  const onErrorChangeRef = useRef(onErrorChange);
  onErrorChangeRef.current = onErrorChange;

  const onMapPressRef = useRef(onMapPress);
  onMapPressRef.current = onMapPress;

  const initialCenterRef = useRef(initialCenter);
  initialCenterRef.current = initialCenter;

  const initialZoomRef = useRef(initialZoom);
  initialZoomRef.current = initialZoom;

  // 색 테마가 바뀌면 지도를 새로 만든다. 그때 보고 있던 위치를 잃지 않도록
  // 부수기 직전 카메라를 여기 담아 다음 생성의 시작점으로 쓴다.
  const lastViewportRef = useRef<{
    center: MapCanvasCoordinates;
    zoom: number;
  } | null>(null);

  const hasError = status === "error" || mapInitError !== null;
  const isSdkLoading = status === "idle" || status === "loading";
  const isLoading = isSdkLoading || isMapBootstrapping;
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
    let bootstrapTimeoutId = 0;
    let bootstrapIdleListener: naver.maps.MapEventListener | null = null;
    let mapPressListener: naver.maps.MapEventListener | null = null;

    const finishBootstrapping = () => {
      if (cancelled) return;
      setIsMapBootstrapping(false);
    };

    const initMap = async () => {
      setMapInitError(null);
      setIsMapBootstrapping(true);

      let size = getMapContainerSize(container);
      if (!hasUsableMapContainerSize(size)) {
        size = await waitForUsableMapContainerSize(container);
      }
      if (cancelled) return;

      try {
        const restoredViewport = lastViewportRef.current;
        const bootstrapCenter =
          restoredViewport?.center ??
          initialCenterRef.current ??
          DEFAULT_MAP_CENTER;
        const map = new maps.Map(container, {
          center: new maps.LatLng(bootstrapCenter.lat, bootstrapCenter.lng),
          zoom: restoredViewport?.zoom ?? initialZoomRef.current,
          zoomControl: false,
          scaleControl: true,
          mapDataControl: false,
          // 지도 디자인툴 스타일(gl, customStyleId, background). 스타일 ID 가
          // 없으면 비어 있어 기본 스타일로 뜬다.
          ...styleOptions,
        });

        if (cancelled) {
          map.destroy();
          return;
        }

        map.setSize(new maps.Size(size.width, size.height));
        mapRef.current = map;
        onLoadRef.current?.(map);
        mapPressListener = maps.Event.addListener(map, "click", () => {
          onMapPressRef.current?.();
        });

        bootstrapIdleListener = maps.Event.addListener(map, "idle", () => {
          if (bootstrapIdleListener) {
            maps.Event.removeListener(bootstrapIdleListener);
            bootstrapIdleListener = null;
          }
          window.clearTimeout(bootstrapTimeoutId);
          finishBootstrapping();
        });
        bootstrapTimeoutId = window.setTimeout(() => {
          if (bootstrapIdleListener) {
            maps.Event.removeListener(bootstrapIdleListener);
            bootstrapIdleListener = null;
          }
          finishBootstrapping();
        }, MAP_BOOTSTRAP_TIMEOUT_MS);

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
        window.clearTimeout(bootstrapTimeoutId);
        if (bootstrapIdleListener) {
          maps.Event.removeListener(bootstrapIdleListener);
          bootstrapIdleListener = null;
        }
        if (mapPressListener) {
          maps.Event.removeListener(mapPressListener);
          mapPressListener = null;
        }
        setIsMapBootstrapping(false);
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
      window.clearTimeout(bootstrapTimeoutId);
      if (bootstrapIdleListener) {
        maps.Event.removeListener(bootstrapIdleListener);
      }
      if (mapPressListener) {
        maps.Event.removeListener(mapPressListener);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        lastViewportRef.current = {
          center: { lat: center.lat(), lng: center.lng() },
          zoom: mapRef.current.getZoom(),
        };
        onWillDestroyRef.current?.(mapRef.current);
        mapRef.current.destroy();
        mapRef.current = null;
        onLoadRef.current?.(null);
      }
      setIsMapBootstrapping(false);
    };
    // 커스텀 스타일은 만들어진 지도에 다시 붙이는 공개 API 가 없다. 테마가
    // 바뀌면 지도를 새로 만든다.
  }, [isReady, maps, styleOptions]);

  useEffect(() => {
    onLoadingChangeRef.current?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    onErrorChangeRef.current?.(hasError);
  }, [hasError]);

  return (
    <section
      className={root}
      aria-label={m.map_area_aria()}
      // 지도 SDK 가 붙고 부트스트랩까지 끝났는지. E2E 가 컨트롤과 무관한
      // 신호로 준비 완료를 기다리는 데 쓴다. 컨트롤 자체를 신호로 삼으면
      // "아직 안 떴을 뿐인 상태" 와 "잘못 숨겨진 상태" 를 구분하지 못한다.
      data-map-state={hasError ? "error" : isLoading ? "loading" : "ready"}
    >
      <div ref={containerRef} className={canvas} />

      {isLoading && !hasError ? <MapSkeleton /> : null}

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
