import { m } from "@repo/i18n";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  requiredMark,
  section,
  sizeGuideBox,
  sizeGuideList,
} from "./report.css.ts";

interface ReportSizeSectionProps {
  selectedSizes: SizeCardType[];
  setSelectedSizes: (val: SizeCardType[]) => void;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportSizeSection({
  selectedSizes,
  setSelectedSizes,
  sectionServerError,
  onFieldChange,
}: ReportSizeSectionProps) {
  const errorMessage = useReportSectionError(["sizeTypes"], sectionServerError);
  const errorId = errorMessage ? "report-size-error" : undefined;

  const handleSizeChange = (cards: SizeCardType[]) => {
    setSelectedSizes(cards);
    onFieldChange?.();
  };

  return (
    <section className={section} data-section="size" aria-describedby={errorId}>
      <ReportSectionTitleRow
        errorMessage={errorMessage}
        defaultErrorMessage={m.report_error_required()}
        errorId={errorId}
      >
        {m.report_section_size()}
        <span className={requiredMark}>*</span>
      </ReportSectionTitleRow>
      <SizeList
        labels={{
          S: m.report_size_s(),
          M: m.report_size_m(),
          L: m.report_size_l(),
        }}
        value={selectedSizes}
        onChange={handleSizeChange}
      />

      <div className={sizeGuideBox}>
        <ul className={sizeGuideList}>
          <li>
            <b>{m.report_size_s()}</b>: {m.report_size_guide_s()}
          </li>
          <li>
            <b>{m.report_size_m()}</b>: {m.report_size_guide_m()}
          </li>
          <li>
            <b>{m.report_size_l()}</b>: {m.report_size_guide_l()}
          </li>
        </ul>
      </div>
      <ReportSectionErrorReserve />
    </section>
  );
}
