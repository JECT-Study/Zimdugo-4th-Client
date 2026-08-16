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
      <output
        style={reportPageLoadingOverlayStyle}
        aria-live="polite"
        aria-label={m.report_page_loading_aria()}
      >
        <div style={reportPageLoadingBackdropStyle} />
        <div data-report-page-spinner style={reportPageLoadingSpinnerStyle} />
      </output>
    </>
  );
}
