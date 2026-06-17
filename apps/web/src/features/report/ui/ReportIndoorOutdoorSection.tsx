import { m } from "@repo/i18n";
import { ControlChip } from "@repo/ui/components/control-chip";
import type { IndoorOutdoorType } from "#/features/report/model/report-types";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  indoorOutdoorChip,
  indoorOutdoorControl,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportIndoorOutdoorSectionProps {
  value: IndoorOutdoorType | null;
  onChange: (value: IndoorOutdoorType) => void;
  sectionErrorMessage?: string;
  sectionErrorId?: string;
}

export function ReportIndoorOutdoorSection({
  value,
  onChange,
  sectionErrorMessage,
  sectionErrorId,
}: ReportIndoorOutdoorSectionProps) {
  return (
    <section className={section}>
      <ReportSectionTitleRow
        errorMessage={sectionErrorMessage}
        defaultErrorMessage={m.report_error_required()}
        errorId={sectionErrorId}
      >
        {m.report_section_indoor_outdoor()}
        <span className={requiredMark}>*</span>
      </ReportSectionTitleRow>
      <fieldset
        className={indoorOutdoorControl}
        aria-label={m.report_indoor_outdoor_aria()}
      >
        <ControlChip
          className={indoorOutdoorChip}
          label={m.report_indoor()}
          variant="choice"
          size="medium"
          isActive={value === "INDOOR"}
          onPress={() => onChange("INDOOR")}
        />
        <ControlChip
          className={indoorOutdoorChip}
          label={m.report_outdoor()}
          variant="choice"
          size="medium"
          isActive={value === "OUTDOOR"}
          onPress={() => onChange("OUTDOOR")}
        />
      </fieldset>
    </section>
  );
}
