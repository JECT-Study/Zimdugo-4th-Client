import { useCallback, useEffect, useRef, useState } from "react";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
  webkitCompassHeading?: number;
}

/**
 * DeviceOrientationEvent 지원 여부를 초기값으로 판단한다.
 * - undefined: API 자체가 없음 (PC 등) → 즉시 false
 * - 존재: 실제 이벤트 수신 여부로 확정 전까지 null (unknown)
 */
const detectInitialOrientationSupport = (): boolean | null => {
  if (typeof window === "undefined") return false;
  if (typeof window.DeviceOrientationEvent === "undefined") return false;
  return null; // 이벤트 수신 시까지 unknown
};

export function useDeviceOrientation() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  /**
   * null  = 아직 판단 불가 (첫 이벤트 대기 중)
   * true  = 유효한 heading 이벤트를 수신함 → 지원
   * false = 2초 이내 유효 이벤트 없음 또는 API 자체 미지원 → 미지원
   */
  const [isSupported, setIsSupported] = useState<boolean | null>(
    detectInitialOrientationSupport,
  );
  const lastUpdateRef = useRef(0);
  const hasReceivedValidHeadingRef = useRef(false);
  const supportDetectionTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return; // 50ms 쓰로틀링 (초당 20번 제한)
    lastUpdateRef.current = now;

    const iosEvent = event as DeviceOrientationEventiOS;
    let resolvedHeading: number | null = null;

    // iOS (Safari) - webkitCompassHeading is clockwise (0=North, 90=East)
    if (typeof iosEvent.webkitCompassHeading === "number") {
      resolvedHeading = iosEvent.webkitCompassHeading;
    }
    // Android (Chrome) - absolute alpha is counter-clockwise (0=North, 90=West)
    // Convert to clockwise to match CSS rotate
    else if (event.absolute && event.alpha !== null) {
      resolvedHeading = 360 - event.alpha;
    }
    // Fallback if absolute is not available but alpha is
    else if (event.alpha !== null) {
      resolvedHeading = 360 - event.alpha;
    }

    if (resolvedHeading !== null) {
      // 첫 유효 heading 수신 시 지원 확정 및 타이머 취소
      if (!hasReceivedValidHeadingRef.current) {
        hasReceivedValidHeadingRef.current = true;
        if (supportDetectionTimerRef.current !== null) {
          clearTimeout(supportDetectionTimerRef.current);
          supportDetectionTimerRef.current = null;
        }
        setIsSupported(true);
      }
      setHeading(resolvedHeading);
    }
  }, []);

  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setHeading(null);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const DeviceOrientationEventAny =
        typeof window !== "undefined"
          ? (window.DeviceOrientationEvent as unknown as {
              requestPermission?: () => Promise<"granted" | "denied">;
            })
          : undefined;

      // iOS 13+ devices require explicit permission
      if (
        typeof DeviceOrientationEventAny !== "undefined" &&
        typeof DeviceOrientationEventAny.requestPermission === "function"
      ) {
        const permissionState =
          await DeviceOrientationEventAny.requestPermission();
        if (permissionState === "granted") {
          setPermissionGranted(true);
          return true;
        }
        setPermissionGranted(false);
        return false;
      }

      // Android or older iOS devices don't require permission
      setPermissionGranted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to request permission"),
      );
      setPermissionGranted(false);
      return false;
    }
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!isTracking || typeof window === "undefined") return;

    // We only attach listeners if permission isn't explicitly denied
    // (null means not requested yet, true means granted)
    if (permissionGranted === false) return;

    // In Chrome, 'deviceorientationabsolute' provides true North if available
    window.addEventListener("deviceorientationabsolute", handleOrientation);
    // In Safari, 'deviceorientation' includes webkitCompassHeading
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
      );
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isTracking, permissionGranted, handleOrientation]);

  /**
   * 트래킹 시작 시 isSupported가 아직 null(unknown)이면 2초 타이머를 설정한다.
   * 2초 내에 유효 heading 이벤트를 받지 못하면 미지원으로 확정한다.
   */
  useEffect(() => {
    if (!isTracking) return;
    // 이미 지원 여부가 확정된 경우 타이머 불필요
    if (isSupported !== null) return;

    hasReceivedValidHeadingRef.current = false;
    supportDetectionTimerRef.current = setTimeout(() => {
      supportDetectionTimerRef.current = null;
      if (!hasReceivedValidHeadingRef.current) {
        setIsSupported(false);
      }
    }, 2000);

    return () => {
      if (supportDetectionTimerRef.current !== null) {
        clearTimeout(supportDetectionTimerRef.current);
        supportDetectionTimerRef.current = null;
      }
    };
  }, [isTracking, isSupported]);

  return {
    heading,
    error,
    permissionGranted,
    isTracking,
    /** null = 판단 전, true = 지원, false = 미지원(PC 등) */
    isSupported,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
