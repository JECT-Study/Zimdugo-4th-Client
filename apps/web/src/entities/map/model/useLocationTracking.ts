import { useCallback, useEffect, useState } from "react";

export type LocationPermissionState = "prompt" | "granted" | "denied";

interface LocationData {
  lat: number;
  lng: number;
  heading: number | null;
}

export function useLocationTracking() {
  const [permission, setPermission] = useState<LocationPermissionState>("prompt");
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

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

  // 실시간 위치 추적
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
        });
        setError(null);
        setPermission("granted");
      },
      (err) => {
        setError(err);
        setIsTracking(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermission("denied");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  return {
    permission,
    isTracking,
    location,
    error,
    startTracking,
    stopTracking,
  };
}
