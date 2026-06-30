import type { CSSProperties } from "react";

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  animation: "loading-overlay-fade-in 0.12s ease-out",
};

const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};

const spinnerStyle: CSSProperties = {
  position: "relative",
  width: "34px",
  height: "34px",
  borderRadius: "9999px",
  border: "3px solid #DEE2E6",
  borderTopColor: "#495057",
  animation: "loading-overlay-spin 0.8s linear infinite",
  backgroundColor: "rgba(255, 255, 255, 0.78)",
};

const keyframesStyle = `
@keyframes loading-overlay-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes loading-overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

interface LoadingOverlayProps {
  /** pointer-events를 활성화해 클릭을 막아야 할 때 true */
  blockInteraction?: boolean;
  /** aria-label 텍스트 */
  label?: string;
}

/**
 * 공통 로딩 오버레이 (반투명 블러 배경 + 스피너).
 *
 * VE CSS 청크 도착 전에도 사용할 수 있도록 인라인 스타일로 구현한다.
 * - 새로고침 오버레이 (`index.tsx`)
 * - 페이지 전환 오버레이 (`__root.tsx`)
 * - 제보 페이지 로딩 (`ReportPageLoadingOverlay` 교체)
 */
export function LoadingOverlay({
  blockInteraction = false,
  label,
}: LoadingOverlayProps) {
  return (
    <>
      <style>{keyframesStyle}</style>
      <div
        style={{
          ...overlayStyle,
          pointerEvents: blockInteraction ? "auto" : "none",
        }}
        role="status"
        aria-live="polite"
        aria-label={label}
        aria-hidden={!label}
      >
        <div style={backdropStyle} />
        <div style={spinnerStyle} />
      </div>
    </>
  );
}
