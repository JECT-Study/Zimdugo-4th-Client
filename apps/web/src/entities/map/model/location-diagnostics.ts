export const LOCATION_DIAGNOSTICS_ENDPOINT = "/_internal/location-diagnostics";

const LOCATION_DIAGNOSTICS_SESSION_KEY = "zimdugo:location-diagnostics-enabled";
const LOCATION_DIAGNOSTICS_ID_SESSION_KEY = "zimdugo:location-diagnostics-id";

export type LocationDiagnosticEventName =
  | "home_auto_request_started"
  | "home_auto_request_skipped_session"
  | "permission_query_error"
  | "permission_query_resolved"
  | "permission_query_started"
  | "tracking_first_position"
  | "tracking_request_started"
  | "tracking_unsupported"
  | "tracking_watch_error"
  | "tracking_watch_started";

export interface LocationDiagnosticData {
  elapsedMs?: number;
  errorCode?: number;
  hasSessionRequestMarker?: boolean;
  isLocating?: boolean;
  isTracking?: boolean;
  permission?: "prompt" | "granted" | "denied";
}

const getLocationDiagnosticId = () => {
  const storedId = window.sessionStorage.getItem(
    LOCATION_DIAGNOSTICS_ID_SESSION_KEY,
  );
  if (storedId) return storedId;

  const diagnosticId = window.crypto.randomUUID();
  window.sessionStorage.setItem(
    LOCATION_DIAGNOSTICS_ID_SESSION_KEY,
    diagnosticId,
  );
  return diagnosticId;
};

export const isLocationDiagnosticsEnabled = () => {
  if (typeof window === "undefined") return false;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("locationDebug") === "1") {
      window.sessionStorage.setItem(LOCATION_DIAGNOSTICS_SESSION_KEY, "true");
      return true;
    }
    if (searchParams.get("locationDebug") === "0") {
      window.sessionStorage.removeItem(LOCATION_DIAGNOSTICS_SESSION_KEY);
      return false;
    }

    return (
      window.sessionStorage.getItem(LOCATION_DIAGNOSTICS_SESSION_KEY) === "true"
    );
  } catch {
    return false;
  }
};

export const postLocationDiagnostic = (
  event: LocationDiagnosticEventName,
  data: LocationDiagnosticData = {},
) => {
  if (!isLocationDiagnosticsEnabled()) return;

  try {
    const payload = {
      version: 1,
      diagnosticId: getLocationDiagnosticId(),
      event,
      timestamp: Date.now(),
      visibilityState: document.visibilityState,
      ...data,
    };

    void fetch(LOCATION_DIAGNOSTICS_ENDPOINT, {
      method: "POST",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // 진단 기능은 위치 수집의 정상 동작을 방해하지 않는다.
  }
};
