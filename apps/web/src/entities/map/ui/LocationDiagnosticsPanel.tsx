import { useCallback, useEffect, useRef, useState } from "react";

type PermissionStateResult =
  | PermissionState
  | "unsupported"
  | "query-error"
  | "query-timeout";

const PERMISSION_QUERY_TIMEOUT_MS = 2000;

interface DiagnosticEvent {
  id: number;
  at: string;
  event: string;
  permission?: PermissionStateResult;
  errorCode?: number;
  errorMessage?: string;
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

export function LocationDiagnosticsPanel({
  isEnabled,
}: LocationDiagnosticsPanelProps) {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const eventIdRef = useRef(0);

  const appendEvent = useCallback(
    (event: Omit<DiagnosticEvent, "id" | "at">) => {
      eventIdRef.current += 1;
      const id = eventIdRef.current;
      setEvents((previousEvents) => [
        ...previousEvents,
        {
          ...event,
          id,
          at: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const stopWatch = useCallback(() => {
    if (watchIdRef.current === null) return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    appendEvent({ event: "watch-stopped" });
  }, [appendEvent]);

  const handleCheckPermission = useCallback(async () => {
    appendEvent({
      event: "permission-check",
      permission: await getPermissionState(),
    });
  }, [appendEvent]);

  const handleRequestOnce = useCallback(() => {
    const permissionBeforePromise = getPermissionState();
    appendEvent({ event: "get-current-position-start" });

    navigator.geolocation.getCurrentPosition(
      () => {
        appendEvent({ event: "get-current-position-success" });
        void getPermissionState().then((permission) => {
          appendEvent({
            event: "permission-after-get-current-position-success",
            permission,
          });
        });
      },
      (error) => {
        appendEvent({
          event: "get-current-position-error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        void getPermissionState().then((permission) => {
          appendEvent({
            event: "permission-after-get-current-position-error",
            permission,
          });
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    void permissionBeforePromise.then((permission) => {
      appendEvent({ event: "permission-before-request", permission });
    });
  }, [appendEvent]);

  const handleStartWatch = useCallback(() => {
    stopWatch();
    const permissionBeforePromise = getPermissionState();
    appendEvent({ event: "watch-start" });

    watchIdRef.current = navigator.geolocation.watchPosition(
      () => {
        appendEvent({ event: "watch-success" });
        void getPermissionState().then((permission) => {
          appendEvent({
            event: "permission-after-watch-success",
            permission,
          });
        });
      },
      (error) => {
        appendEvent({
          event: "watch-error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        void getPermissionState().then((permission) => {
          appendEvent({
            event: "permission-after-watch-error",
            permission,
          });
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    void permissionBeforePromise.then((permission) => {
      appendEvent({ event: "permission-before-watch", permission });
    });
  }, [appendEvent, stopWatch]);

  const handleCopy = useCallback(async () => {
    const output = JSON.stringify(
      {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        visibilityState: document.visibilityState,
        events,
      },
      null,
      2,
    );
    await navigator.clipboard.writeText(output);
    appendEvent({ event: "result-copied" });
  }, [appendEvent, events]);

  const handleClear = useCallback(() => {
    setEvents([]);
    eventIdRef.current = 0;
  }, []);

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
        status.addEventListener("change", handlePermissionChange);
      })
      .catch(() => {
        appendEvent({
          event: "permission-observer-error",
          permission: "query-error",
        });
      });

    return () => {
      isDisposed = true;
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, [appendEvent, isEnabled]);

  useEffect(() => stopWatch, [stopWatch]);

  if (!isEnabled) return null;

  return (
    <section style={panelStyle} aria-label="위치 권한 진단">
      <h1 style={{ margin: 0, fontSize: "18px" }}>iPhone 위치 진단</h1>
      <p style={{ margin: 0 }}>
        좌표는 수집하지 않습니다. 권한 상태와 성공·오류 순서만 기록합니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleCheckPermission}
        >
          권한 상태 확인
        </button>
        <button type="button" style={buttonStyle} onClick={handleRequestOnce}>
          1회 위치 요청
        </button>
        <button type="button" style={buttonStyle} onClick={handleStartWatch}>
          위치 추적 시작
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
