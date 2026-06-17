import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  addressTextContent,
  locationSection,
  locationTextButton,
  photoSectionContent,
  requiredMark,
} from "./report.css.ts";

interface ReportLocationSectionProps {
  address: string;
  selectedCoords: { lat: number; lng: number } | null;
  onOpenOverlay: () => void;
  onResetLocation: () => void;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportLocationSection({
  address,
  selectedCoords,
  onOpenOverlay,
  onResetLocation,
  sectionServerError,
  onFieldChange,
}: ReportLocationSectionProps) {
  const errorMessage = useReportSectionError(
    ["roadAddress", "latitude", "longitude"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-location-error" : undefined;
  const hasLocationValue = Boolean(address) || selectedCoords !== null;

  const handleOpenLocationOverlay = () => {
    onFieldChange?.();
    onOpenOverlay();
  };

  const handleResetLocation = () => {
    onFieldChange?.();
    onResetLocation();
  };

  const handleLocationButtonPress = () => {
    if (hasLocationValue) {
      handleResetLocation();
      return;
    }

    handleOpenLocationOverlay();
  };

  return (
    <section
      className={locationSection}
      data-section="location"
      aria-describedby={errorId}
    >
      <ReportSectionTitleRow
        errorMessage={errorMessage}
        defaultErrorMessage={m.report_error_required()}
        errorId={errorId}
      >
        {m.report_section_location()}
        <span className={requiredMark}>*</span>
      </ReportSectionTitleRow>
      <div className={photoSectionContent}>
        {/*
        <button type="button" className={locationMapArea}>
          지도 프레임 영역은 QA 중 임시 비활성화합니다.
        </button>
        */}

        <button
          type="button"
          className={locationTextButton}
          onClick={handleOpenLocationOverlay}
        >
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
          intent="primary"
          size="L"
          onPress={handleLocationButtonPress}
        >
          {hasLocationValue
            ? m.search_filter_reset()
            : m.report_location_select_placeholder()}
        </Button>
      </div>
      <ReportSectionErrorReserve />
      {/* 롤백용: 하단 에러 영역 — Reserve 제거 후 주석 해제
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        placement="bottom"
      />
      */}
    </section>
  );
}
