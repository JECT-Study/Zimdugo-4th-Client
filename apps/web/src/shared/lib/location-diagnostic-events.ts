export const LOCATION_DIAGNOSTIC_EVENTS = [
  "home_auto_request_started",
  "home_auto_request_skipped_session",
  "permission_query_error",
  "permission_query_resolved",
  "permission_query_started",
  "tracking_cancelled",
  "tracking_first_position",
  "tracking_request_started",
  "tracking_response_delayed",
  "tracking_resumed",
  "tracking_suspended",
  "tracking_unsupported",
  "tracking_watch_error",
  "tracking_watchdog_timeout",
  "tracking_watch_started",
] as const;

export type LocationDiagnosticEventName =
  (typeof LOCATION_DIAGNOSTIC_EVENTS)[number];
