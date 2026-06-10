import { m } from "@repo/i18n";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import type { LockerType } from "#/features/report/model/report-types";
import { placeType, requiredMark, section } from "./report.css.ts";

interface ReportTypeSectionBaseProps {
  title?: string;
  showRequiredMark?: boolean;
}

interface ReportTypeSingleSectionProps extends ReportTypeSectionBaseProps {
  lockerType: LockerType | null;
  onChange: (value: LockerType | null) => void;
  options: Array<{ label: string; value: LockerType }>;
  selectionMode?: "single";
}

interface ReportTypeMultipleSectionProps extends ReportTypeSectionBaseProps {
  lockerType: string[];
  setLockerType: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  selectionMode: "multiple";
}

type ReportTypeSectionProps =
  | ReportTypeSingleSectionProps
  | ReportTypeMultipleSectionProps;

export function ReportTypeSection(props: ReportTypeSectionProps) {
  const isMultiple = props.selectionMode === "multiple";
  const showRequiredMark = props.showRequiredMark ?? true;
  const title = props.title ?? m.report_section_type();
  const value = isMultiple
    ? props.lockerType
    : props.lockerType
      ? [props.lockerType]
      : [];

  const handleChange = (keys: string[]) => {
    if (isMultiple) {
      props.setLockerType(keys);
      return;
    }

    const next = keys.at(-1);
    props.onChange(next ? (next as LockerType) : null);
  };

  return (
    <section className={section}>
      <LabelTitle size="small">
        {title}
        {showRequiredMark ? <span className={requiredMark}>*</span> : null}
      </LabelTitle>
      <div className={placeType}>
        <ControlChipGroup
          options={props.options}
          value={value}
          onChange={handleChange}
          selectionMode={isMultiple ? "multiple" : "single"}
          ariaLabel={m.report_type_filter_aria()}
        />
      </div>
    </section>
  );
}
