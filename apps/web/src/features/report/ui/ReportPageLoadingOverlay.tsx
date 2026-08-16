import { m } from "@repo/i18n";
import {
  reportPageLoadingBackdropStyle,
  reportPageLoadingOverlayStyle,
  reportPageLoadingSpinnerStyle,
  reportPageSpinnerKeyframes,
} from "./report-page-fallback";

interface ReportPageLoadingOverlayProps {
  label?: string;
}

export function ReportPageLoadingOverlay({
  label = m.report_page_loading_aria(),
}: ReportPageLoadingOverlayProps) {
  return (
    <>
      <style>{reportPageSpinnerKeyframes}</style>
      <output
        style={reportPageLoadingOverlayStyle}
        aria-live="polite"
        aria-label={label}
      >
        <div style={reportPageLoadingBackdropStyle} />
        <div data-report-page-spinner style={reportPageLoadingSpinnerStyle} />
      </output>
    </>
  );
}
