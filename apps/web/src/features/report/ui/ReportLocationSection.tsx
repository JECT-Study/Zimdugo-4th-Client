import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { LabelTitle } from "@repo/ui/components/label-title";
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
}

export function ReportLocationSection({
  address,
  onOpenOverlay,
}: ReportLocationSectionProps) {
  return (
    <section className={section} data-section="location">
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
    </section>
  );
}
