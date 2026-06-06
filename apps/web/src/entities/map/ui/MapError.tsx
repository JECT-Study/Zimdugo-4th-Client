import { IconCaution24 } from "@repo/ui/tokens/icons";
import { vars } from "@repo/ui/vars";

interface MapErrorProps {
  alertLabel: string;
  description: string;
  message?: string;
  onRetry: () => void;
  retryAriaLabel: string;
  retryLabel: string;
  title: string;
}

export function MapError({
  alertLabel,
  description,
  message,
  onRetry,
  retryAriaLabel,
  retryLabel,
  title,
}: MapErrorProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "24px",
        boxSizing: "border-box",
        backgroundColor: vars.color.bg.default,
        pointerEvents: "auto",
      }}
      role="alert"
      aria-label={alertLabel}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          width: "100%",
          maxWidth: "320px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IconCaution24 state="error" />
            <p
              style={{
                fontSize: "28px",
                fontWeight: 600,
                margin: 0,
                color: vars.color.text.title,
              }}
            >
              {title}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: vars.color.text.title,
              }}
            >
              {description}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: vars.color.text.disable,
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          style={{
            display: "flex",
            width: "100%",
            height: "40px",
            padding: "12px 24px",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            border: "none",
            cursor: "pointer",
            color: "white",
            borderRadius: "8px",
            backgroundColor: vars.color.palette.green[500],
            fontWeight: 600,
            boxSizing: "border-box",
          }}
          aria-label={retryAriaLabel}
        >
          {retryLabel}
        </button>
      </div>
    </div>
  );
}
