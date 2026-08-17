export const LOCATION_DIAGNOSTIC_EVENTS = [
  "diagnostic_lifecycle_changed",
  "diagnostic_panel_opened",
  "diagnostic_permission_checked",
  "diagnostic_request_failed",
  "diagnostic_request_started",
  "diagnostic_request_succeeded",
  "diagnostic_request_unresponsive",
  "diagnostic_watch_stopped",
  "home_auto_request_started",
  "home_auto_request_skipped_session",
  "permission_query_error",
  "permission_query_resolved",
  "permission_query_started",
  "tracking_cancelled",
  "tracking_first_position",
  "tracking_request_started",
  "tracking_resumed",
  "tracking_suspended",
  "tracking_unsupported",
  "tracking_watch_error",
  "tracking_watchdog_timeout",
  "tracking_watch_started",
] as const;

export type LocationDiagnosticEventName =
  (typeof LOCATION_DIAGNOSTIC_EVENTS)[number];

export const LOCATION_DIAGNOSTIC_REQUEST_MODES = [
  "default-current",
  "high-accuracy-current",
  "high-accuracy-watch",
] as const;

export type LocationDiagnosticRequestMode =
  (typeof LOCATION_DIAGNOSTIC_REQUEST_MODES)[number];

export const LOCATION_DIAGNOSTIC_LIFECYCLE_EVENTS = [
  "mount",
  "visibilitychange",
  "focus",
  "blur",
  "pageshow",
  "pagehide",
] as const;

export type LocationDiagnosticLifecycleEvent =
  (typeof LOCATION_DIAGNOSTIC_LIFECYCLE_EVENTS)[number];
