import { m } from "@repo/i18n";
import { ControlChip } from "@repo/ui/components/control-chip";
import { LabelTitle } from "@repo/ui/components/label-title";
import type { IndoorOutdoorType } from "#/features/report/model/report-types";
import {
  indoorOutdoorChip,
  indoorOutdoorControl,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportIndoorOutdoorSectionProps {
  value: IndoorOutdoorType | null;
  onChange: (value: IndoorOutdoorType) => void;
}

export function ReportIndoorOutdoorSection({
  value,
  onChange,
}: ReportIndoorOutdoorSectionProps) {
  return (
    <section className={section}>
      <LabelTitle size="small">
        {m.report_section_indoor_outdoor()}
        <span className={requiredMark}>*</span>
      </LabelTitle>
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
