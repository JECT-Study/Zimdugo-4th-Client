import { useEffect, useMemo } from "react";
import { useDeviceOrientation } from "#/shared/hooks/useDeviceOrientation";
import type { MapLocationValue } from "./MapLocationProvider";
import { useLocationEventBus } from "./useLocationEventBus";
import { useLocationTracking } from "./useLocationTracking";

/**
 * 위치 추적을 쥐고, 아래에 내려 줄 값 하나로 묶는 자리.
 *
 * `_map` 레이아웃이 부른다. 라우트 파일에 두지 않는 이유는 이것이 배선이 아니라
 * 동작이기 때문이다 — 알림이 `<Outlet />` 너머의 화면까지 닿는지는 라우터를 세우지
 * 않고 이 훅만으로 잴 수 있다.
 *
 * 화면에서 오는 값이 하나도 없다. `useLocationTracking` 이 받는 콜백 둘은 #242 에서
 * 세운 알림 창구로 고정돼 있어, `<Outlet />` 에 어떤 화면이 있든 같은 인자로 돈다.
 */
export function useMapLocationValue(): MapLocationValue {
  const locationEventBus = useLocationEventBus();
  const {
    permission,
    isTracking,
    isLocating,
    location,
    error,
    locationRequestStatus,
    startTracking,
  } = useLocationTracking({
    onFirstLocation: locationEventBus.notifyFirstLocation,
    onRequestSettled: locationEventBus.notifyRequestSettled,
  });

  const {
    heading: deviceHeading,
    isTracking: isOrientationTracking,
    isSupported: isOrientationSupported,
    requestPermission: requestOrientationPermission,
    startTracking: startOrientationTracking,
    stopTracking: stopOrientationTracking,
  } = useDeviceOrientation();

  /*
   * 센서가 없다고 확정되면 켜 둔 방향 추적을 스스로 끈다. 센서에만 딸린 규칙이라
   * 센서를 쥔 쪽에서 한다.
   *
   * 카메라 추적(`isCameraCentered`)은 건드리지 않는다. 방향을 모른다고 해서 내 위치를
   * 따라가는 것까지 멈출 이유는 없다.
   */
  useEffect(() => {
    if (isOrientationSupported !== false) return;
    if (!isOrientationTracking) return;

    stopOrientationTracking();
  }, [isOrientationSupported, isOrientationTracking, stopOrientationTracking]);

  return useMemo(
    () => ({
      permission,
      isTracking,
      isLocating,
      location,
      error,
      requestStatus: locationRequestStatus,
      startTracking,
      subscribeFirstLocation: locationEventBus.subscribeFirstLocation,
      subscribeRequestSettled: locationEventBus.subscribeRequestSettled,
      deviceHeading,
      isOrientationTracking,
      isOrientationSupported,
      requestOrientationPermission,
      startOrientationTracking,
      stopOrientationTracking,
    }),
    [
      deviceHeading,
      isOrientationTracking,
      isOrientationSupported,
      requestOrientationPermission,
      startOrientationTracking,
      stopOrientationTracking,
      permission,
      isTracking,
      isLocating,
      location,
      error,
      locationRequestStatus,
      startTracking,
      locationEventBus.subscribeFirstLocation,
      locationEventBus.subscribeRequestSettled,
    ],
  );
}
