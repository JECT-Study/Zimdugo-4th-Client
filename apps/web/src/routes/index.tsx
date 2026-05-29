import { languageTag } from "@repo/i18n";
import { NaverMapCanvas, NaverMapProvider } from "#/entities/map";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconCircleboxCrosshair48,
  IconCircleboxRefresh48,
} from "@repo/ui/tokens/icons";
import { useCallback, useRef, useState, useEffect } from "react";
import { useLocationTracking } from "#/entities/map/model/useLocationTracking";
import { MyLocationMarker } from "#/entities/map/ui/MyLocationMarker";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import {
  locationButton,
  locationControlStack,
  pageWrapper,
  refreshButtonDisabled,
  refreshCooldownBadge,
  refreshIconSpinning,
  refreshLoadingBackdrop,
  refreshLoadingOverlay,
  refreshLoadingSpinner,
} from "./-index.css";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<naver.maps.Map | null>(null);

  const { permission, isTracking, location, startTracking, stopTracking } =
    useLocationTracking();
  const { openPopup: openLocationPopup } = useLocationPermissionPopup();

  // 리프레시 버튼 관련 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] = useState(0);
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);
  const [isRefreshVisualLoading, setIsRefreshVisualLoading] = useState(false);

  const handleRefreshMap = useCallback(() => {
    if (!mapInstanceRef.current || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshCooldownRemaining(15);
    setIsRefreshSpinning(true);
    setIsRefreshVisualLoading(true);

    setTimeout(() => setIsRefreshSpinning(false), 500);
    setTimeout(() => setIsRefreshVisualLoading(false), 900);

    mapInstanceRef.current.refresh();

    const interval = setInterval(() => {
      setRefreshCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRefreshing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRefreshing]);

  const handleMyLocation = () => {
    if (permission === "denied") {
      openLocationPopup();
      return;
    }
    startTracking();
  };

  const handleMapLoad = useCallback((map: naver.maps.Map) => {
    mapInstanceRef.current = map;
    setMapInstance(map);
  }, []);

  // 트래킹 중일 때 위치가 갱신되면 지도 중심 이동
  useEffect(() => {
    if (isTracking && location && mapInstance) {
      const latLng = new window.naver.maps.LatLng(location.lat, location.lng);
      mapInstance.panTo(latLng);
    }
  }, [isTracking, location, mapInstance]);

  // 지도 드래그 시 트래킹 모드 해제
  useEffect(() => {
    if (!mapInstance) return;

    const listener = window.naver.maps.Event.addListener(
      mapInstance,
      "dragstart",
      () => {
        stopTracking();
      },
    );

    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [mapInstance, stopTracking]);

  return (
    <main className={pageWrapper}>
      {isRefreshVisualLoading && (
        <div className={refreshLoadingOverlay}>
          <div className={refreshLoadingBackdrop} />
          <div className={refreshLoadingSpinner} />
        </div>
      )}

      <NaverMapProvider language={languageTag()}>
        <NaverMapCanvas onLoad={handleMapLoad} />
        <MyLocationMarker
          map={mapInstance}
          location={location}
          isTracking={isTracking}
        />
      </NaverMapProvider>
      <div className={locationControlStack}>
        <button
          type="button"
          className={[
            locationButton,
            isRefreshing || !mapInstanceRef.current ? refreshButtonDisabled : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handleRefreshMap}
          aria-label="현 지도에서 검색"
        >
          <IconCircleboxRefresh48
            state={
              isRefreshing || !mapInstanceRef.current
                ? "refresh"
                : "refreshActive"
            }
            className={isRefreshSpinning ? refreshIconSpinning : ""}
          />
          {isRefreshing &&
            !isRefreshSpinning &&
            refreshCooldownRemaining > 0 && (
              <div className={refreshCooldownBadge}>
                {refreshCooldownRemaining}
              </div>
            )}
        </button>
        <button
          type="button"
          className={locationButton}
          onClick={handleMyLocation}
          aria-label="내 위치 찾기"
        >
          <IconCircleboxCrosshair48
            state={
              permission === "denied"
                ? "denied"
                : isTracking
                  ? "active"
                  : "default"
            }
          />
        </button>
      </div>
    </main>
  );
}
