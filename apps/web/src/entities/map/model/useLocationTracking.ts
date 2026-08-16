import { useCallback, useEffect, useRef, useState } from "react";
import { postLocationDiagnostic } from "./location-diagnostics";

export type LocationPermissionState = "prompt" | "granted" | "denied";

interface LocationData {
  lat: number;
  lng: number;
  heading: number | null;
}

interface UseLocationTrackingOptions {
  onFirstLocation?: () => void;
}

export function useLocationTracking({
  onFirstLocation,
}: UseLocationTrackingOptions = {}) {
  const [permission, setPermission] =
    useState<LocationPermissionState>("prompt");
  const [isTracking, setIsTracking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  // watchPosition의 첫 번째 콜백인지 판단하는 플래그
  // startTracking() 호출 시 true로 리셋, 첫 콜백 시 false로 플립
  const isFirstLocationRef = useRef(true);
  // 진행 중인 위치 요청은 늦게 도착한 Permissions API 결과로 중단하지 않는다.
  const isTrackingRef = useRef(false);
  const requestStartedAtRef = useRef<number | null>(null);

  // 권한 상태 초기화 및 감지
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions) return;

    let isCancelled = false;
    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permissionStatus && !isTrackingRef.current) {
        const state = permissionStatus.state;
        if (state === "granted" || state === "denied" || state === "prompt") {
          setPermission(state);
        }
        if (state === "denied") {
          setIsTracking(false);
          setIsLocating(false);
        }
      }
    };

    postLocationDiagnostic("permission_query_started", {
      permission: "prompt",
      isTracking: isTrackingRef.current,
    });

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (isCancelled) return;
        permissionStatus = status;
        const state = status.state;
        postLocationDiagnostic("permission_query_resolved", {
          permission: state,
          isTracking: isTrackingRef.current,
        });
        if (
          !isTrackingRef.current &&
          (state === "granted" || state === "denied" || state === "prompt")
        ) {
          setPermission(state);
        }
        status.addEventListener("change", handlePermissionChange);
      })
      .catch((err) => {
        postLocationDiagnostic("permission_query_error", {
          isTracking: isTrackingRef.current,
        });
        console.warn("Permissions API not supported for geolocation:", err);
      });

    return () => {
      isCancelled = true;
      if (permissionStatus) {
        permissionStatus.removeEventListener("change", handlePermissionChange);
      }
    };
  }, []);

  // 권한이 이미 허용되어 있다면 자동으로 백그라운드 추적 시작
  useEffect(() => {
    if (permission === "granted") {
      isTrackingRef.current = true;
      setIsTracking(true);
    }
  }, [permission]);

  // 실시간 위치 추적
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    const requestStartedAt = requestStartedAtRef.current ?? Date.now();
    requestStartedAtRef.current = requestStartedAt;
    postLocationDiagnostic("tracking_watch_started", {
      isLocating: true,
      isTracking: true,
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // 첫 번째 콜백에서만 onFirstLocation 호출
        if (isFirstLocationRef.current) {
          isFirstLocationRef.current = false;
          postLocationDiagnostic("tracking_first_position", {
            elapsedMs: Date.now() - requestStartedAt,
            isLocating: false,
            isTracking: true,
            permission: "granted",
          });
          onFirstLocation?.();
        }
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
        });
        setError(null);
        setPermission("granted");
        setIsLocating(false);
      },
      (err) => {
        postLocationDiagnostic("tracking_watch_error", {
          elapsedMs: Date.now() - requestStartedAt,
          errorCode: err.code,
          isLocating: false,
          isTracking: false,
          permission: err.code === 1 ? "denied" : undefined,
        });
        isTrackingRef.current = false;
        setError(err);
        setIsTracking(false);
        setIsLocating(false);
        if (err.code === 1) {
          setPermission("denied");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, onFirstLocation]);

  const startTracking = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      postLocationDiagnostic("tracking_unsupported", {
        isLocating: false,
        isTracking: false,
        permission: "denied",
      });
      setIsLocating(false);
      setIsTracking(false);
      setPermission("denied");
      return;
    }
    requestStartedAtRef.current = Date.now();
    postLocationDiagnostic("tracking_request_started", {
      isLocating: true,
      isTracking: true,
      permission: "prompt",
    });
    setIsTracking(true);
    setIsLocating(true);
    setError(null);
    setPermission("prompt");
    isTrackingRef.current = true;
    isFirstLocationRef.current = true;
  }, []);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    setIsTracking(false);
    setIsLocating(false);
  }, []);

  return {
    permission,
    isTracking,
    isLocating,
    location,
    error,
    startTracking,
    stopTracking,
  };
}
