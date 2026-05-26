import { IconCaution24 } from "@repo/ui/tokens/icons";
import { vars } from "@repo/ui/vars";

interface MapErrorProps {
  message?: string;
  onRetry: () => void;
}

export function MapError({ message, onRetry }: MapErrorProps) {
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
      aria-label="\uC9C0\uB3C4 \uB85C\uB4DC \uC2E4\uD328 \uC54C\uB9BC"
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
              {"\uC9C0\uB3C4 \uB85C\uB4DC \uC624\uB958"}
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
              {"\uC9C0\uB3C4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: vars.color.text.disable,
                wordBreak: "break-word",
              }}
            >
              {message ?? "Failed to load map. Please check your network."}
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
          aria-label="\uC9C0\uB3C4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30"
        >
          {"\uB2E4\uC2DC \uC2DC\uB3C4"}
        </button>
      </div>
    </div>
  );
}
