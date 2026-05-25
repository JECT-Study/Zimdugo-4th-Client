import { Link } from "@tanstack/react-router";
import { IconCaution24 } from "@repo/ui/tokens/icons";
import { vars } from "@repo/ui/vars";

export function NotFoundComponent() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
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
            <p style={{ fontSize: "48px", fontWeight: 600, margin: 0 }}>404</p>
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
              페이지가 존재하지 않습니다.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: vars.color.text.disable,
              }}
            >
              This page does not exist :(
            </p>
          </div>
        </div>
        <Link
          to="/"
          style={{
            display: "flex",
            width: "100%",
            height: "40px",
            padding: "12px 24px",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "white",
            borderRadius: "8px",
            backgroundColor: vars.color.palette.green[500],
            fontWeight: 600,
            boxSizing: "border-box",
          }}
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
