import { useCallback, useEffect, useRef, useState } from "react";
import { postLocationDiagnostic } from "./location-diagnostics";

const GEOLOCATION_TIMEOUT_MS = 10_000;
const GEOLOCATION_WATCHDOG_TIMEOUT_MS = 12_000;

export type LocationPermissionState = "prompt" | "granted" | "denied";

export type LocationRequestOutcome =
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "interrupted"
  | "cancelled"
  | "unsupported";

export type LocationRequestStatus =
  | "idle"
  | "requesting"
  | LocationRequestOutcome;

export interface LocationData {
  lat: number;
  lng: number;
  heading: number | null;
}

interface UseLocationTrackingOptions {
  onFirstLocation?: (location: LocationData) => void;
  onRequestSettled?: (outcome: LocationRequestOutcome) => void;
}

const createLocationTimeoutError = (): GeolocationPositionError =>
  ({
    code: 3,
    message: "Location request timed out",
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  }) as GeolocationPositionError;

export function useLocationTracking({
  onFirstLocation,
  onRequestSettled,
}: UseLocationTrackingOptions = {}) {
  const [permission, setPermission] =
    useState<LocationPermissionState>("prompt");
  const [isTracking, setIsTracking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationRequestStatus, setLocationRequestStatus] =
    useState<LocationRequestStatus>("idle");
  const [trackingAttemptId, setTrackingAttemptId] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const isFirstLocationRef = useRef(true);
  const isTrackingRef = useRef(false);
  const isLocatingRef = useRef(false);
  const requestStartedAtRef = useRef<number | null>(null);
  const isPendingRequestInterruptedRef = useRef(false);
  const watchCleanupRef = useRef<
    ((outcome?: LocationRequestOutcome) => void) | null
  >(null);
  const onFirstLocationRef = useRef(onFirstLocation);
  const onRequestSettledRef = useRef(onRequestSettled);

  onFirstLocationRef.current = onFirstLocation;
  onRequestSettledRef.current = onRequestSettled;

  const startTracking = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      postLocationDiagnostic("tracking_unsupported", {
        isLocating: false,
        isTracking: false,
        permission: "denied",
      });
      isLocatingRef.current = false;
      isTrackingRef.current = false;
      setLocationRequestStatus("unsupported");
      setIsLocating(false);
      setIsTracking(false);
      setPermission("denied");
      onRequestSettledRef.current?.("unsupported");
      return;
    }

    requestStartedAtRef.current = Date.now();
    isPendingRequestInterruptedRef.current = false;
    isLocatingRef.current = true;
    isTrackingRef.current = true;
    isFirstLocationRef.current = true;
    setLocationRequestStatus("requesting");
    postLocationDiagnostic("tracking_request_started", {
      isLocating: true,
      isTracking: true,
      permission: "prompt",
    });
    setTrackingAttemptId((attemptId) => attemptId + 1);
    setIsTracking(true);
    setIsLocating(true);
    setError(null);
    setPermission("prompt");
  }, []);

  const stopTracking = useCallback(() => {
    watchCleanupRef.current?.();
    isLocatingRef.current = false;
    isTrackingRef.current = false;
    setIsTracking(false);
    setIsLocating(false);
  }, []);

  const interruptTracking = useCallback(() => {
    isPendingRequestInterruptedRef.current = true;
    if (watchCleanupRef.current) {
      watchCleanupRef.current("interrupted");
    } else {
      setLocationRequestStatus("interrupted");
      onRequestSettledRef.current?.("interrupted");
    }
    isLocatingRef.current = false;
    isTrackingRef.current = false;
    setIsTracking(false);
    setIsLocating(false);
  }, []);

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
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, []);

  useEffect(() => {
    if (trackingAttemptId === 0 || !navigator.geolocation) {
      return;
    }

    if (isPendingRequestInterruptedRef.current) {
      return;
    }

    const requestStartedAt = requestStartedAtRef.current ?? Date.now();
    let hasSettledInitialRequest = false;
    let isCleanedUp = false;
    let watchdogId: number | undefined;
    let cleanupWatch = (_outcome?: LocationRequestOutcome) => {};

    const clearWatchdog = () => {
      window.clearTimeout(watchdogId);
      watchdogId = undefined;
    };

    const settleInitialRequest = (outcome: LocationRequestOutcome) => {
      if (hasSettledInitialRequest) return;
      hasSettledInitialRequest = true;
      setLocationRequestStatus(outcome);
      onRequestSettledRef.current?.(outcome);
    };

    postLocationDiagnostic("tracking_watch_started", {
      isLocating: true,
      isTracking: true,
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (isCleanedUp) return;

        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
        };

        if (isFirstLocationRef.current) {
          isFirstLocationRef.current = false;
          isLocatingRef.current = false;
          clearWatchdog();
          postLocationDiagnostic("tracking_first_position", {
            elapsedMs: Date.now() - requestStartedAt,
            isLocating: false,
            isTracking: true,
            permission: "granted",
          });
          settleInitialRequest("success");
          onFirstLocationRef.current?.(nextLocation);
        }
        setLocation(nextLocation);
        setError(null);
        setPermission("granted");
        setIsLocating(false);
      },
      (nextError) => {
        if (isCleanedUp) return;

        clearWatchdog();
        postLocationDiagnostic("tracking_watch_error", {
          elapsedMs: Date.now() - requestStartedAt,
          errorCode: nextError.code,
          isLocating: false,
          isTracking: false,
          permission: nextError.code === 1 ? "denied" : undefined,
        });
        isLocatingRef.current = false;
        isTrackingRef.current = false;
        settleInitialRequest(
          nextError.code === 1
            ? "permission-denied"
            : nextError.code === 3
              ? "timeout"
              : "unavailable",
        );
        setError(nextError);
        setIsTracking(false);
        setIsLocating(false);
        if (nextError.code === 1) {
          setPermission("denied");
        }
        cleanupWatch();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    );

    watchdogId = window.setTimeout(() => {
      if (!isFirstLocationRef.current) return;

      const timeoutError = createLocationTimeoutError();
      postLocationDiagnostic("tracking_watchdog_timeout", {
        elapsedMs: Date.now() - requestStartedAt,
        errorCode: timeoutError.code,
        isLocating: false,
        isTracking: false,
      });
      isLocatingRef.current = false;
      isTrackingRef.current = false;
      settleInitialRequest("timeout");
      setError(timeoutError);
      setIsTracking(false);
      setIsLocating(false);
      cleanupWatch();
    }, GEOLOCATION_WATCHDOG_TIMEOUT_MS);

    cleanupWatch = (outcome = "cancelled") => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearWatchdog();
      navigator.geolocation.clearWatch(watchId);
      if (isFirstLocationRef.current && !hasSettledInitialRequest) {
        if (outcome === "cancelled") {
          postLocationDiagnostic("tracking_cancelled", {
            elapsedMs: Date.now() - requestStartedAt,
            isLocating: false,
            isTracking: false,
          });
        }
        settleInitialRequest(outcome);
      }
      watchCleanupRef.current = null;
    };
    watchCleanupRef.current = cleanupWatch;

    return cleanupWatch;
  }, [trackingAttemptId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden" || !isLocatingRef.current) {
        return;
      }

      postLocationDiagnostic("tracking_suspended", {
        elapsedMs:
          requestStartedAtRef.current == null
            ? undefined
            : Date.now() - requestStartedAtRef.current,
        isLocating: false,
        isTracking: false,
      });
      interruptTracking();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interruptTracking]);

  return {
    permission,
    locationRequestStatus,
    isTracking,
    isLocating,
    location,
    error,
    startTracking,
    stopTracking,
  };
}
