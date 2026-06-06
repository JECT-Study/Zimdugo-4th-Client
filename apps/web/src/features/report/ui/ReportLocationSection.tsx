import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { LabelTitle } from "@repo/ui/components/label-title";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportSectionError } from "./ReportSectionError";
import {
  addressTextContent,
  locationTextButton,
  photoSectionContent,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportLocationSectionProps {
  address: string;
  selectedCoords: { lat: number; lng: number } | null;
  onOpenOverlay: () => void;
  sectionServerError?: string;
}

export function ReportLocationSection({
  address,
  onOpenOverlay,
  sectionServerError,
}: ReportLocationSectionProps) {
  const errorMessage = useReportSectionError(
    ["roadAddress", "latitude", "longitude"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-location-error" : undefined;

  return (
    <section
      className={section}
      data-section="location"
      aria-describedby={errorId}
    >
      <LabelTitle size="small">
        {m.report_section_location()}
        <span className={requiredMark}>*</span>
      </LabelTitle>
      <div className={photoSectionContent}>
        {/*
        <button type="button" className={locationMapArea}>
          지도 프레임 영역은 QA 중 임시 비활성화합니다.
        </button>
        */}

        <button type="button" className={locationTextButton} disabled>
          <span
            className={addressTextContent}
            style={{
              color: address ? "#16181C" : "#8E8E8E",
            }}
          >
            {address || m.report_location_select_placeholder()}
          </span>
        </button>

        <Button
          variant="filled"
          intent="neutral"
          size="L"
          onPress={onOpenOverlay}
        >
          {m.report_location_select_button()}
        </Button>
      </div>
      <ReportSectionError id={errorId} message={errorMessage} />
    </section>
  );
}
