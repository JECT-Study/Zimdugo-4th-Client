import { m } from "@repo/i18n";
import {
  informationBody,
  informationEyebrow,
  informationLockerTitle,
  informationTitleCopy,
  informationTitleRow,
  panel,
} from "#/entities/report/ui/ReportDetailViewerModal.css.ts";

export interface ReportDetailTitlePreviewProps {
  titleText: string;
}

export function ReportDetailTitlePreview({
  titleText,
}: ReportDetailTitlePreviewProps) {
  return (
    <div className={panel}>
      <div className={informationBody}>
        <div className={informationTitleRow}>
          <div className={informationTitleCopy}>
            <span className={informationEyebrow}>
              {m.my_report_detail_eyebrow()}
            </span>
            <h2 className={informationLockerTitle}>{titleText}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
