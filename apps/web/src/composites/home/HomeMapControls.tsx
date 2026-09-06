import { m } from "@repo/i18n";
import {
  IconNavigationCrosshair24,
  IconNavigationRefresh24,
} from "@repo/ui/assets/icons";
import { type MotionValue, motion } from "motion/react";
import { memo } from "react";
import { LockerTimerMapControl } from "#/features/locker-timer/ui/LockerTimerMapControl";
import {
  locationButton,
  locationControlStack,
  locationLoadingBadge,
  myLocationIcon,
  refreshButtonDisabled,
  refreshCooldownBadge,
  refreshIconSpinning,
} from "#/routes/-index.css";

interface RefreshButtonProps {
  isRefreshing: boolean;
  isMapReady: boolean;
  /** 다른 컨트롤이 동작 중이면 같이 잠근다 */
  isOtherControlBusy: boolean;
  isRefreshSpinning: boolean;
  refreshCooldownRemaining: number;
  onRefresh: () => void;
}

const RefreshButton = memo(function RefreshButton({
  isRefreshing,
  isMapReady,
  isOtherControlBusy,
  isRefreshSpinning,
  refreshCooldownRemaining,
  onRefresh,
}: RefreshButtonProps) {
  const isDisabled = isRefreshing || !isMapReady || isOtherControlBusy;
  return (
    <button
      type="button"
      className={[locationButton, isDisabled ? refreshButtonDisabled : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={onRefresh}
      aria-label={m.home_map_refresh_aria()}
      disabled={isDisabled}
    >
      <IconNavigationRefresh24
        state={isDisabled ? "refresh" : "refreshActive"}
        className={isRefreshSpinning ? refreshIconSpinning : ""}
      />
      {isRefreshing && !isRefreshSpinning && refreshCooldownRemaining > 0 && (
        <div className={refreshCooldownBadge}>{refreshCooldownRemaining}</div>
      )}
    </button>
  );
});

interface MyLocationButtonProps {
  permission: PermissionState;
  /** 다른 컨트롤이 동작 중이면 같이 잠근다 */
  isOtherControlBusy: boolean;
  isCameraCentered: boolean;
  isLocating: boolean;
  isOrientationTracking: boolean;
  onMyLocation: () => void;
}

const MyLocationButton = memo(function MyLocationButton({
  permission,
  isOtherControlBusy,
  isCameraCentered,
  isLocating,
  isOrientationTracking,
  onMyLocation,
}: MyLocationButtonProps) {
  return (
    <button
      type="button"
      className={locationButton}
      onClick={onMyLocation}
      disabled={isLocating || isOtherControlBusy}
      aria-busy={isLocating}
      aria-label={
        isLocating ? m.location_loading_aria() : m.home_my_location_aria()
      }
    >
      <IconNavigationCrosshair24
        className={myLocationIcon}
        state={
          permission === "denied"
            ? "denied"
            : isCameraCentered || isOrientationTracking
              ? "active"
              : "default"
        }
      />
      {isLocating ? (
        <span className={locationLoadingBadge} aria-hidden="true" />
      ) : null}
    </button>
  );
});

export interface HomeMapControlsProps {
  /**
   * 컨트롤 스택의 바닥 위치.
   *
   * 늘 모션 값 하나가 쥔다. 시트가 없으면 그 값이 기본 자리를 가리키므로 갈아끼울 필요가
   * 없다. 모션 값과 정적 값을 오가게 두면 전환하는 순간 DOM 에 남은 인라인 스타일이
   * 갱신되지 않고 굳는 경우가 있었다 — 시트가 사라졌는데 컨트롤만 시트 윗변에 남는
   * 화면이 그것이다.
   */
  bottom: MotionValue<string> | MotionValue<number>;
  isMapReady: boolean;
  isRefreshing: boolean;
  isRefreshSpinning: boolean;
  refreshCooldownRemaining: number;
  onRefresh: () => void;
  permission: PermissionState;
  isCameraCentered: boolean;
  isLocating: boolean;
  isMyLocationPending: boolean;
  isOrientationTracking: boolean;
  onMyLocation: () => void;
  onTimerSelect: (lockerId: number) => void;
}

/**
 * 지도 위에 겹치는 컨트롤 묶음.
 *
 * 경로 라우트 전환(#215)의 1-3 에서 지도는 레이아웃 라우트로 올라가고, 이 묶음도 함께
 * 간다. #219 가 정한 대로 레이아웃이 쥐는 것은 "지도 + 가려진 영역"이고, 컨트롤은 그
 * 가려진 영역을 피해 놓이는 것이라 지도 쪽에 속한다.
 *
 * 지금은 `index.tsx` 가 이 값들을 쥐고 있어 prop 으로 받는다. 옮길 때 이 묶음과 값의
 * 출처(위치 추적)가 함께 움직인다.
 */
export function HomeMapControls({
  bottom,
  isMapReady,
  isRefreshing,
  isRefreshSpinning,
  refreshCooldownRemaining,
  onRefresh,
  permission,
  isCameraCentered,
  isLocating,
  isMyLocationPending,
  isOrientationTracking,
  onMyLocation,
  onTimerSelect,
}: HomeMapControlsProps) {
  return (
    <motion.div
      className={locationControlStack}
      // E2E 가 위치를 재는 앵커. 스켈레톤과 구분되도록 실제 컨트롤에만 둔다.
      data-map-control-stack=""
      initial={false}
      style={{ bottom }}
    >
      <LockerTimerMapControl
        buttonClassName={locationButton}
        onSelect={onTimerSelect}
      />
      <RefreshButton
        isRefreshing={isRefreshing}
        isMapReady={isMapReady}
        isOtherControlBusy={isLocating || isMyLocationPending}
        isRefreshSpinning={isRefreshSpinning}
        refreshCooldownRemaining={refreshCooldownRemaining}
        onRefresh={onRefresh}
      />
      <MyLocationButton
        permission={permission}
        isOtherControlBusy={isRefreshing}
        isCameraCentered={isCameraCentered}
        isLocating={isLocating || isMyLocationPending}
        isOrientationTracking={isOrientationTracking}
        onMyLocation={onMyLocation}
      />
    </motion.div>
  );
}
