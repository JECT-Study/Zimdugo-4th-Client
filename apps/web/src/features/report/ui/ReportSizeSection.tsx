import { m } from "@repo/i18n";
import { LabelTitle } from "@repo/ui/components/label-title";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import { section, sizeGuideBox, sizeGuideList } from "./report.css.ts";

interface ReportSizeSectionProps {
  selectedSizes: SizeCardType[];
  setSelectedSizes: (val: SizeCardType[]) => void;
}

export function ReportSizeSection({
  selectedSizes,
  setSelectedSizes,
}: ReportSizeSectionProps) {
  return (
    <section className={section}>
      <LabelTitle size="small">{m.report_section_size()}</LabelTitle>
      <SizeList
        labels={{
          S: m.report_size_s(),
          M: m.report_size_m(),
          L: m.report_size_l(),
        }}
        value={selectedSizes}
        onChange={setSelectedSizes}
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
    </section>
  );
}
