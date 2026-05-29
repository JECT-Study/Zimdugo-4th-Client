import { useCallback, useEffect, useState } from "react";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
  webkitCompassHeading?: number;
}

export function useDeviceOrientation() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const lastUpdateRef = useRef(0);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 50) return; // 50ms 쓰로틀링 (초당 20번 제한)
      lastUpdateRef.current = now;

      const iosEvent = event as DeviceOrientationEventiOS;

      // iOS (Safari) - webkitCompassHeading is clockwise (0=North, 90=East)
      if (typeof iosEvent.webkitCompassHeading === "number") {
        setHeading(iosEvent.webkitCompassHeading);
        return;
      }

      // Android (Chrome) - absolute alpha is counter-clockwise (0=North, 90=West)
      // Convert to clockwise to match CSS rotate
      if (event.absolute && event.alpha !== null) {
        setHeading(360 - event.alpha);
        return;
      }

      // Fallback if absolute is not available but alpha is
      // This might just be relative to where the phone started, not true North,
      // but better than nothing if absolute fails.
      if (event.alpha !== null) {
        setHeading(360 - event.alpha);
      }
    },
    [lastUpdateRef],
  );

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

  return {
    heading,
    error,
    permissionGranted,
    isTracking,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
