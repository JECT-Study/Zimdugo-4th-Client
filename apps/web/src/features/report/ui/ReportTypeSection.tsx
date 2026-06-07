import { m } from "@repo/i18n";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import type { LockerType } from "#/features/report/model/report-types";
import { placeType, requiredMark, section } from "./report.css.ts";

interface ReportTypeSectionProps {
  lockerType: LockerType | null;
  onChange: (value: LockerType | null) => void;
  options: Array<{ label: string; value: LockerType }>;
}

export function ReportTypeSection({
  lockerType,
  onChange,
  options,
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
          value={lockerType ? [lockerType] : []}
          onChange={(keys) => {
            const next = keys.at(-1);
            onChange(next ? (next as LockerType) : null);
          }}
          selectionMode="single"
          ariaLabel={m.report_type_filter_aria()}
        />
      </div>
    </section>
  );
}
