import { m } from "@repo/i18n";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { placeType, requiredMark, section } from "./report.css.ts";

interface ReportTypeSectionProps {
  lockerType: string[];
  setLockerType: (val: string[]) => void;
  options: Array<{ label: string; value: string }>;
}

export function ReportTypeSection({
  lockerType,
  setLockerType,
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
          value={lockerType}
          onChange={(keys) => setLockerType(keys.slice(-1))}
          selectionMode="single"
          ariaLabel="보관함 유형 필터"
        />
      </div>
    </section>
  );
}
