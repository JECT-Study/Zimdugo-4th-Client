import { z } from "zod";

const LOCATION_DIAGNOSTICS_PATH = "/_internal/location-diagnostics";
const MAX_LOCATION_DIAGNOSTIC_BODY_LENGTH = 4_096;
const LOCATION_DIAGNOSTIC_WARNING_EVENTS = new Set([
  "tracking_unsupported",
  "tracking_watch_error",
  "tracking_watchdog_timeout",
]);

const locationDiagnosticSchema = z
  .object({
    version: z.literal(1),
    diagnosticId: z.uuid(),
    event: z.enum([
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
    ]),
    timestamp: z.number().int().nonnegative(),
    visibilityState: z.enum(["hidden", "visible"]),
    elapsedMs: z.number().int().min(0).max(120_000).optional(),
    errorCode: z.number().int().min(1).max(3).optional(),
    hasSessionRequestMarker: z.boolean().optional(),
    isLocating: z.boolean().optional(),
    isTracking: z.boolean().optional(),
    permission: z.enum(["prompt", "granted", "denied"]).optional(),
  })
  .strict();

type RuntimeEnvironment = Record<string, string | undefined>;

export const isLocationDiagnosticsServerEnabled = (env: RuntimeEnvironment) => {
  return (
    env.VERCEL_ENV === "preview" || env.LOCATION_DIAGNOSTICS_ENABLED === "true"
  );
};

export const handleLocationDiagnosticRequest = async (
  request: Request,
  env: RuntimeEnvironment = typeof process === "undefined" ? {} : process.env,
): Promise<Response | null> => {
  const requestUrl = new URL(request.url);
  if (requestUrl.pathname !== LOCATION_DIAGNOSTICS_PATH) return null;

  if (!isLocationDiagnosticsServerEnabled(env)) {
    return new Response(null, { status: 404 });
  }
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) {
    return new Response(null, { status: 403 });
  }
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return new Response(null, { status: 415 });
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_LOCATION_DIAGNOSTIC_BODY_LENGTH) {
    return new Response(null, { status: 413 });
  }

  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bodyLength = 0;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bodyLength += value.byteLength;
      if (bodyLength > MAX_LOCATION_DIAGNOSTIC_BODY_LENGTH) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }

  const result = locationDiagnosticSchema.safeParse(payload);
  if (!result.success) {
    return new Response(null, { status: 400 });
  }

  const serializedDiagnostic = JSON.stringify(result.data);
  if (LOCATION_DIAGNOSTIC_WARNING_EVENTS.has(result.data.event)) {
    console.warn("[location-diagnostic]", serializedDiagnostic);
  } else {
    console.info("[location-diagnostic]", serializedDiagnostic);
  }
  return new Response(null, { status: 204 });
};
