import { useCallback, useEffect, useRef, useState } from "react";

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

  // 권한 상태 초기화 및 감지
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions) return;

    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permissionStatus) {
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

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        permissionStatus = status;
        const state = status.state;
        if (state === "granted" || state === "denied" || state === "prompt") {
          setPermission(state);
        }
        status.addEventListener("change", handlePermissionChange);
      })
      .catch((err) => {
        console.warn("Permissions API not supported for geolocation:", err);
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener("change", handlePermissionChange);
      }
    };
  }, []);

  // 권한이 이미 허용되어 있다면 자동으로 백그라운드 추적 시작
  useEffect(() => {
    if (permission === "granted") {
      setIsTracking(true);
    }
  }, [permission]);

  // 실시간 위치 추적
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // 첫 번째 콜백에서만 onFirstLocation 호출
        if (isFirstLocationRef.current) {
          isFirstLocationRef.current = false;
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
        setError(err);
        setIsTracking(false);
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
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
    setIsTracking(true);
    setIsLocating(true);
    isFirstLocationRef.current = true;
  }, []);

  const stopTracking = useCallback(() => {
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
