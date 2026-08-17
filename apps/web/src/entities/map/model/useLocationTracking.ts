import { useCallback, useEffect, useRef, useState } from "react";
import { postLocationDiagnostic } from "./location-diagnostics";

const GEOLOCATION_RESPONSE_DELAY_MS = 12_000;
const GEOLOCATION_FINAL_TIMEOUT_MS = 45_000;
const PERMISSION_RECHECK_INTERVAL_MS = 1_000;
const PERMISSION_RECHECK_TIMEOUT_MS = 15_000;

export type LocationPermissionState = "prompt" | "granted" | "denied";

export type LocationRequestOutcome =
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "cancelled"
  | "unsupported";

export type LocationRequestStatus =
  | "idle"
  | "requesting"
  | "delayed"
  | "interrupted"
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
  const watchCleanupRef = useRef<() => void>(() => {});
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
    watchCleanupRef.current();
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

    const requestStartedAt = requestStartedAtRef.current ?? Date.now();
    let hasSettledInitialRequest = false;
    let isCleanedUp = false;
    let responseDelayId: number | undefined;
    let finalTimeoutId: number | undefined;
    let permissionRecheckId: number | undefined;
    let hasObservedPromptPermission = false;
    let hasRetriedAfterPermissionGrant = false;
    let watchId: number | undefined;
    let cleanupWatch = () => {};

    const clearInitialRequestTimers = () => {
      window.clearTimeout(responseDelayId);
      window.clearTimeout(finalTimeoutId);
      window.clearTimeout(permissionRecheckId);
      responseDelayId = undefined;
      finalTimeoutId = undefined;
      permissionRecheckId = undefined;
    };

    const settleInitialRequest = (outcome: LocationRequestOutcome) => {
      if (hasSettledInitialRequest) return;
      hasSettledInitialRequest = true;
      setLocationRequestStatus(outcome);
      onRequestSettledRef.current?.(outcome);
    };

    const handlePosition = (position: GeolocationPosition) => {
      if (isCleanedUp) return;

      const nextLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        heading: position.coords.heading,
      };

      if (isFirstLocationRef.current) {
        isFirstLocationRef.current = false;
        isLocatingRef.current = false;
        clearInitialRequestTimers();
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
    };

    const handlePositionError = (nextError: GeolocationPositionError) => {
      if (isCleanedUp) return;

      clearInitialRequestTimers();
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
    };

    const startWatch = () => {
      postLocationDiagnostic("tracking_watch_started", {
        isLocating: isLocatingRef.current,
        isTracking: true,
      });
      return navigator.geolocation.watchPosition(
        handlePosition,
        handlePositionError,
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: GEOLOCATION_FINAL_TIMEOUT_MS,
        },
      );
    };

    watchId = startWatch();

    if (navigator.permissions) {
      const permissionRecheckStartedAt = Date.now();

      const recheckPermission = async () => {
        try {
          const status = await navigator.permissions.query({
            name: "geolocation",
          });
          if (isCleanedUp || !isFirstLocationRef.current) return;

          if (status.state === "prompt") {
            hasObservedPromptPermission = true;
          } else if (
            status.state === "granted" &&
            hasObservedPromptPermission &&
            !hasRetriedAfterPermissionGrant
          ) {
            hasRetriedAfterPermissionGrant = true;
            if (watchId !== undefined) {
              navigator.geolocation.clearWatch(watchId);
            }
            postLocationDiagnostic("tracking_permission_granted_retry", {
              elapsedMs: Date.now() - requestStartedAt,
              isLocating: isLocatingRef.current,
              isTracking: true,
              permission: "granted",
            });
            watchId = startWatch();
            return;
          } else if (status.state === "granted") {
            return;
          } else if (status.state === "denied") {
            return;
          }
        } catch {
          return;
        }

        if (
          Date.now() - permissionRecheckStartedAt <
          PERMISSION_RECHECK_TIMEOUT_MS
        ) {
          permissionRecheckId = window.setTimeout(
            recheckPermission,
            PERMISSION_RECHECK_INTERVAL_MS,
          );
        }
      };

      void recheckPermission();
    }

    responseDelayId = window.setTimeout(() => {
      if (!isFirstLocationRef.current || isCleanedUp) return;

      postLocationDiagnostic("tracking_response_delayed", {
        elapsedMs: Date.now() - requestStartedAt,
        isLocating: false,
        isTracking: true,
      });
      isLocatingRef.current = false;
      setLocationRequestStatus("delayed");
      setIsLocating(false);
    }, GEOLOCATION_RESPONSE_DELAY_MS);

    finalTimeoutId = window.setTimeout(() => {
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
    }, GEOLOCATION_FINAL_TIMEOUT_MS);

    cleanupWatch = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearInitialRequestTimers();
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (isFirstLocationRef.current && !hasSettledInitialRequest) {
        postLocationDiagnostic("tracking_cancelled", {
          elapsedMs: Date.now() - requestStartedAt,
          isLocating: false,
          isTracking: false,
        });
        settleInitialRequest("cancelled");
      }
      watchCleanupRef.current = () => {};
    };
    watchCleanupRef.current = cleanupWatch;

    return cleanupWatch;
  }, [trackingAttemptId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      if (!isTrackingRef.current || !isFirstLocationRef.current) return;

      postLocationDiagnostic("tracking_suspended", {
        elapsedMs:
          requestStartedAtRef.current == null
            ? undefined
            : Date.now() - requestStartedAtRef.current,
        isLocating: false,
        isTracking: false,
      });
      stopTracking();
      setLocationRequestStatus("interrupted");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stopTracking]);

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
