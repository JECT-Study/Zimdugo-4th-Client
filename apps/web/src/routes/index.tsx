import { languageTag } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import {
  IconCircleboxCrosshair48,
  IconCircleboxRefresh48,
} from "@repo/ui/tokens/icons";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { NaverMapCanvas, NaverMapProvider } from "#/entities/map";
import { useLocationTracking } from "#/entities/map/model/useLocationTracking";
import { MyLocationMarker } from "#/entities/map/ui/MyLocationMarker";
import { useDeviceOrientation } from "#/shared/hooks/useDeviceOrientation";
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
  const locationLoadingTimerRef = useRef<number | undefined>(undefined);

  // onFirstLocation을 useCallback으로 메모이즈
  // → 매 렌더마다 새 함수 레퍼런스가 생성되면 useLocationTracking 내부
  //   useEffect([isTracking, onFirstLocation])이 불필요하게 재실행되어 watchPosition이
  //   재등록되는 무한 루프가 발생함
  // setIsLocationDelayedLoading은 useState dispatch로 stable하므로 deps [] 안전
  const handleFirstLocation = useCallback(() => {
    window.clearTimeout(locationLoadingTimerRef.current);
    locationLoadingTimerRef.current = undefined;
    // GPS 응답 시점에 오버레이 해제(애니메이션을 늦추면 사용자 경험 저하)
    setIsLocationDelayedLoading(false);
  }, []);

  const { permission, isTracking, location, startTracking, stopTracking } =
    useLocationTracking({ onFirstLocation: handleFirstLocation });
  const {
    heading: deviceHeading,
    requestPermission: requestOrientationPermission,
    startTracking: startOrientationTracking,
    stopTracking: stopOrientationTracking,
  } = useDeviceOrientation();
  const {
    isOpen: isLocationPopupOpen,
    openPopup: openLocationPopup,
    closePopup: closeLocationPopup,
  } = useLocationPermissionPopup();

  // 리프레시 버튼 관련 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] = useState(0);
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);
  const [isRefreshVisualLoading, setIsRefreshVisualLoading] = useState(false);

  // 내 위치 버튼 지연 로딩 관련 상태
  const [isLocationDelayedLoading, setIsLocationDelayedLoading] =
    useState(false);

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

  const handleMyLocation = useCallback(async () => {
    if (permission === "denied") {
      openLocationPopup();
      return;
    }

    // iOS 방향 센서 권한 요청 (클릭 이벤트 내에서 발생해야 함)
    await requestOrientationPermission();

    // GPS 응답이 300ms 안에 오면 onFirstLocation이 타이머를 취소
    // 느리면 오버레이를 띄워 GPS 대기 중임을 표시
    locationLoadingTimerRef.current = window.setTimeout(() => {
      setIsLocationDelayedLoading(true);
    }, 300);
    startTracking();
    startOrientationTracking();
  }, [
    permission,
    openLocationPopup,
    requestOrientationPermission,
    startTracking,
    startOrientationTracking,
  ]);

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
        stopOrientationTracking();
      },
    );

    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [mapInstance, stopTracking, stopOrientationTracking]);

  return (
    <main className={pageWrapper}>
      {(isRefreshVisualLoading || isLocationDelayedLoading) && (
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
          deviceHeading={deviceHeading}
        />
      </NaverMapProvider>
      <div className={locationControlStack}>
        <button
          type="button"
          className={[
            locationButton,
            isRefreshing || !mapInstanceRef.current
              ? refreshButtonDisabled
              : "",
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

      <Popup
        isOpen={isLocationPopupOpen}
        onOpenChange={closeLocationPopup}
        titleText="위치 권한이 필요합니다"
        helperText="현재 위치를 확인하려면 브라우저 설정에서 위치 권한을 허용한 뒤, 페이지를 새로고침해주세요."
        primaryAction={{
          label: "확인",
          onPress: closeLocationPopup,
        }}
      />
    </main>
  );
}
