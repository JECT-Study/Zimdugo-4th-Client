import {
  reportPageLoadingBackdropStyle,
  reportPageLoadingOverlayStyle,
  reportPageLoadingSpinnerStyle,
} from "./report-page-fallback";

const SPINNER_KEYFRAMES = `
@keyframes report-page-spinner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export function ReportPageLoadingOverlay() {
  return (
    <>
      <style>{SPINNER_KEYFRAMES}</style>
      <div
        style={reportPageLoadingOverlayStyle}
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading"
      >
        <div style={reportPageLoadingBackdropStyle} />
        <div style={reportPageLoadingSpinnerStyle} />
      </div>
    </>
  );
}
