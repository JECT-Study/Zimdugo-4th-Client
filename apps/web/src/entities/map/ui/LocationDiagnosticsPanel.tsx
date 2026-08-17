import { useCallback, useEffect, useRef, useState } from "react";
import { postLocationDiagnostic } from "#/entities/map/model/location-diagnostics";
import type {
  LocationDiagnosticLifecycleEvent,
  LocationDiagnosticRequestMode,
} from "#/shared/lib/location-diagnostic-events";

type PermissionStateResult =
  | PermissionState
  | "unsupported"
  | "query-error"
  | "query-timeout";

const PERMISSION_QUERY_TIMEOUT_MS = 2000;
const REQUEST_RESPONSE_OBSERVATION_MS = 12_000;
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10_000,
};

interface DiagnosticEvent {
  id: number;
  at: string;
  event: string;
  requestMode?: LocationDiagnosticRequestMode;
  permission?: PermissionStateResult;
  elapsedMs?: number;
  errorCode?: number;
  errorMessage?: string;
  visibilityState?: DocumentVisibilityState;
  hasFocus?: boolean;
  hasUserActivation?: boolean;
}

interface LocationDiagnosticsPanelProps {
  isEnabled: boolean;
}

const panelStyle = {
  position: "fixed",
  inset: "12px",
  zIndex: 10000,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  overflow: "auto",
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.98)",
  color: "#111827",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "12px",
} as const;

const buttonStyle = {
  minHeight: "44px",
  padding: "8px 12px",
  border: "1px solid #9ca3af",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  font: "inherit",
} as const;

const getPermissionState = async (): Promise<PermissionStateResult> => {
  if (!navigator.permissions?.query) return "unsupported";

  try {
    return await Promise.race<PermissionStateResult>([
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => status.state),
      new Promise<"query-timeout">((resolve) => {
        window.setTimeout(
          () => resolve("query-timeout"),
          PERMISSION_QUERY_TIMEOUT_MS,
        );
      }),
    ]);
  } catch {
    return "query-error";
  }
};

const getLifecycleState = () => ({
  visibilityState: document.visibilityState,
  hasFocus: document.hasFocus(),
  hasUserActivation: navigator.userActivation?.isActive ?? false,
});

const getRemotePermission = (permission: PermissionStateResult) => {
  return permission === "prompt" ||
    permission === "granted" ||
    permission === "denied"
    ? permission
    : undefined;
};

export function LocationDiagnosticsPanel({
  isEnabled,
}: LocationDiagnosticsPanelProps) {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const watchResponseTimerRef = useRef<number | null>(null);
  const hasWatchRespondedRef = useRef(false);
  const requestTimerIdsRef = useRef<Set<number>>(new Set());
  const eventIdRef = useRef(0);

  const appendEvent = useCallback(
    (event: Omit<DiagnosticEvent, "id" | "at">) => {
      eventIdRef.current += 1;
      const id = eventIdRef.current;
      setEvents((previousEvents) => [
        ...previousEvents,
        { ...event, id, at: new Date().toISOString() },
      ]);
    },
    [],
  );

  const recordPermission = useCallback(
    async (requestMode?: LocationDiagnosticRequestMode) => {
      const permission = await getPermissionState();
      appendEvent({
        event: requestMode ? "permission-at-request-time" : "permission-check",
        requestMode,
        permission,
      });
      postLocationDiagnostic("diagnostic_permission_checked", {
        requestMode,
        permission: getRemotePermission(permission),
      });
    },
    [appendEvent],
  );

  const clearWatch = useCallback(
    (shouldRecord: boolean) => {
      if (watchResponseTimerRef.current !== null) {
        window.clearTimeout(watchResponseTimerRef.current);
        watchResponseTimerRef.current = null;
      }
      if (watchIdRef.current === null) return;

      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      hasWatchRespondedRef.current = true;
      if (shouldRecord) {
        appendEvent({
          event: "watch-stopped",
          requestMode: "high-accuracy-watch",
        });
        postLocationDiagnostic("diagnostic_watch_stopped", {
          requestMode: "high-accuracy-watch",
        });
      }
    },
    [appendEvent],
  );

  const stopWatch = useCallback(() => {
    clearWatch(true);
  }, [clearWatch]);

  const requestCurrentPosition = useCallback(
    (requestMode: LocationDiagnosticRequestMode, options?: PositionOptions) => {
      const startedAt = Date.now();
      appendEvent({ event: "request-started", requestMode });
      postLocationDiagnostic("diagnostic_request_started", {
        ...getLifecycleState(),
        isSecureContext: window.isSecureContext,
        requestMode,
      });
      void recordPermission(requestMode);

      if (!navigator.geolocation) {
        appendEvent({ event: "geolocation-unsupported", requestMode });
        postLocationDiagnostic("diagnostic_request_failed", { requestMode });
        return;
      }

      const timerId = window.setTimeout(() => {
        const elapsedMs = Date.now() - startedAt;
        requestTimerIdsRef.current.delete(timerId);
        responseTimerId = null;
        appendEvent({ event: "request-unresponsive", requestMode, elapsedMs });
        postLocationDiagnostic("diagnostic_request_unresponsive", {
          ...getLifecycleState(),
          elapsedMs,
          requestMode,
        });
      }, REQUEST_RESPONSE_OBSERVATION_MS);
      let responseTimerId: number | null = timerId;
      requestTimerIdsRef.current.add(timerId);

      const clearResponseTimer = () => {
        if (responseTimerId === null) return;
        window.clearTimeout(responseTimerId);
        requestTimerIdsRef.current.delete(responseTimerId);
        responseTimerId = null;
      };
      const handleSuccess: PositionCallback = () => {
        clearResponseTimer();
        const elapsedMs = Date.now() - startedAt;
        appendEvent({ event: "request-success", requestMode, elapsedMs });
        postLocationDiagnostic("diagnostic_request_succeeded", {
          elapsedMs,
          requestMode,
        });
        void recordPermission(requestMode);
      };
      const handleError: PositionErrorCallback = (error) => {
        clearResponseTimer();
        const elapsedMs = Date.now() - startedAt;
        appendEvent({
          event: "request-error",
          requestMode,
          elapsedMs,
          errorCode: error.code,
          errorMessage: error.message,
        });
        postLocationDiagnostic("diagnostic_request_failed", {
          elapsedMs,
          errorCode: error.code,
          requestMode,
        });
        void recordPermission(requestMode);
      };

      try {
        if (options) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            options,
          );
        } else {
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
        }
      } catch (error) {
        clearResponseTimer();
        appendEvent({
          event: "request-threw",
          requestMode,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        postLocationDiagnostic("diagnostic_request_failed", { requestMode });
      }
    },
    [appendEvent, recordPermission],
  );

  const handleCheckPermission = useCallback(() => {
    void recordPermission();
  }, [recordPermission]);

  const handleRequestDefault = useCallback(() => {
    requestCurrentPosition("default-current");
  }, [requestCurrentPosition]);

  const handleRequestHighAccuracy = useCallback(() => {
    requestCurrentPosition("high-accuracy-current", HIGH_ACCURACY_OPTIONS);
  }, [requestCurrentPosition]);

  const handleStartWatch = useCallback(() => {
    clearWatch(false);
    const requestMode = "high-accuracy-watch" as const;
    const startedAt = Date.now();
    hasWatchRespondedRef.current = false;
    appendEvent({ event: "request-started", requestMode });
    postLocationDiagnostic("diagnostic_request_started", {
      ...getLifecycleState(),
      isSecureContext: window.isSecureContext,
      requestMode,
    });
    void recordPermission(requestMode);

    if (!navigator.geolocation) {
      appendEvent({ event: "geolocation-unsupported", requestMode });
      postLocationDiagnostic("diagnostic_request_failed", { requestMode });
      return;
    }

    watchResponseTimerRef.current = window.setTimeout(() => {
      watchResponseTimerRef.current = null;
      const elapsedMs = Date.now() - startedAt;
      appendEvent({ event: "request-unresponsive", requestMode, elapsedMs });
      postLocationDiagnostic("diagnostic_request_unresponsive", {
        ...getLifecycleState(),
        elapsedMs,
        requestMode,
      });
    }, REQUEST_RESPONSE_OBSERVATION_MS);

    const settleFirstResponse = () => {
      if (hasWatchRespondedRef.current) return false;
      hasWatchRespondedRef.current = true;
      if (watchResponseTimerRef.current !== null) {
        window.clearTimeout(watchResponseTimerRef.current);
        watchResponseTimerRef.current = null;
      }
      return true;
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        () => {
          if (!settleFirstResponse()) return;
          const elapsedMs = Date.now() - startedAt;
          appendEvent({ event: "request-success", requestMode, elapsedMs });
          postLocationDiagnostic("diagnostic_request_succeeded", {
            elapsedMs,
            requestMode,
          });
          void recordPermission(requestMode);
        },
        (error) => {
          if (!settleFirstResponse()) return;
          const elapsedMs = Date.now() - startedAt;
          appendEvent({
            event: "request-error",
            requestMode,
            elapsedMs,
            errorCode: error.code,
            errorMessage: error.message,
          });
          postLocationDiagnostic("diagnostic_request_failed", {
            elapsedMs,
            errorCode: error.code,
            requestMode,
          });
          void recordPermission(requestMode);
        },
        HIGH_ACCURACY_OPTIONS,
      );
    } catch (error) {
      settleFirstResponse();
      appendEvent({
        event: "request-threw",
        requestMode,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      postLocationDiagnostic("diagnostic_request_failed", { requestMode });
    }
  }, [appendEvent, clearWatch, recordPermission]);

  const handleCopy = useCallback(async () => {
    const output = JSON.stringify(
      {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        ...getLifecycleState(),
        events,
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(output);
      appendEvent({ event: "result-copied" });
    } catch (error) {
      appendEvent({
        event: "result-copy-error",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }, [appendEvent, events]);

  const handleClear = useCallback(() => {
    setEvents([]);
    eventIdRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const recordLifecycle = (
      lifecycleEvent: LocationDiagnosticLifecycleEvent,
    ) => {
      const lifecycleState = getLifecycleState();
      appendEvent({ event: `lifecycle-${lifecycleEvent}`, ...lifecycleState });
      postLocationDiagnostic(
        lifecycleEvent === "mount"
          ? "diagnostic_panel_opened"
          : "diagnostic_lifecycle_changed",
        {
          ...lifecycleState,
          isSecureContext: window.isSecureContext,
          lifecycleEvent,
        },
      );
    };
    const handleVisibilityChange = () => recordLifecycle("visibilitychange");
    const handleFocus = () => recordLifecycle("focus");
    const handleBlur = () => recordLifecycle("blur");
    const handlePageShow = () => recordLifecycle("pageshow");
    const handlePageHide = () => recordLifecycle("pagehide");

    recordLifecycle("mount");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [appendEvent, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !navigator.permissions?.query) return;

    let isDisposed = false;
    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (!permissionStatus) return;
      appendEvent({
        event: "permission-change",
        permission: permissionStatus.state,
      });
      postLocationDiagnostic("diagnostic_permission_checked", {
        permission: permissionStatus.state,
      });
    };

    void navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (isDisposed) return;
        permissionStatus = status;
        appendEvent({
          event: "permission-observer-ready",
          permission: status.state,
        });
        postLocationDiagnostic("diagnostic_permission_checked", {
          permission: status.state,
        });
        status.addEventListener("change", handlePermissionChange);
      })
      .catch(() => {
        appendEvent({
          event: "permission-observer-error",
          permission: "query-error",
        });
        postLocationDiagnostic("diagnostic_permission_checked");
      });

    return () => {
      isDisposed = true;
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, [appendEvent, isEnabled]);

  useEffect(() => {
    return () => {
      clearWatch(false);
      for (const timerId of requestTimerIdsRef.current) {
        window.clearTimeout(timerId);
      }
      requestTimerIdsRef.current.clear();
    };
  }, [clearWatch]);

  if (!isEnabled) return null;

  return (
    <section style={panelStyle} aria-label="위치 권한 진단">
      <h1 style={{ margin: 0, fontSize: "18px" }}>iPhone 위치 진단</h1>
      <p style={{ margin: 0 }}>
        좌표는 수집하지 않습니다. 요청 방식과 성공·오류·무응답 순서만
        기록합니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleCheckPermission}
        >
          권한 상태 확인
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleRequestDefault}
        >
          기본 1회 요청
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleRequestHighAccuracy}
        >
          고정밀 1회 요청
        </button>
        <button type="button" style={buttonStyle} onClick={handleStartWatch}>
          고정밀 위치 추적
        </button>
        <button type="button" style={buttonStyle} onClick={stopWatch}>
          위치 추적 중지
        </button>
        <button type="button" style={buttonStyle} onClick={handleCopy}>
          결과 복사
        </button>
        <button type="button" style={buttonStyle} onClick={handleClear}>
          기록 지우기
        </button>
      </div>
      <pre
        style={{
          flex: 1,
          margin: 0,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {JSON.stringify(events, null, 2)}
      </pre>
    </section>
  );
}
