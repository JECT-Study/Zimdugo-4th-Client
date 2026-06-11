import { m } from "@repo/i18n";
import {
  reportPageLoadingBackdropStyle,
  reportPageLoadingOverlayStyle,
  reportPageLoadingSpinnerStyle,
  reportPageSpinnerKeyframes,
} from "./report-page-fallback";

export function ReportPageLoadingOverlay() {
  return (
    <>
      <style>{reportPageSpinnerKeyframes}</style>
      <div
        style={reportPageLoadingOverlayStyle}
        role="status"
        aria-live="polite"
        aria-label={m.report_page_loading_aria()}
      >
        <div style={reportPageLoadingBackdropStyle} />
        <div style={reportPageLoadingSpinnerStyle} />
      </div>
    </>
  );
}
