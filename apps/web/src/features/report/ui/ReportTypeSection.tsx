import { m } from "@repo/i18n";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { placeType, requiredMark, section } from "./report.css.ts";

interface ReportTypeSectionProps {
  lockerType: string[];
  setLockerType: (val: string[]) => void;
  options: Array<{ label: string; value: string }>;
  selectionMode?: "single" | "multiple";
}

export function ReportTypeSection({
  lockerType,
  setLockerType,
  options,
  selectionMode = "single",
}: ReportTypeSectionProps) {
  return (
    <section className={section}>
      <LabelTitle size="small">
        {m.report_section_type()}
        <span className={requiredMark}>*</span>
      </LabelTitle>
      <div className={placeType}>
        <ControlChipGroup
          options={options}
          value={lockerType}
          onChange={(keys) =>
            setLockerType(selectionMode === "single" ? keys.slice(-1) : keys)
          }
          selectionMode={selectionMode}
          ariaLabel={m.report_type_filter_aria()}
        />
      </div>
    </section>
  );
}
