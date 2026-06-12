import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { formatReportViewerInformationGroups } from "../lib/format-report-viewer-sections";
import {
  closeButton,
  footer,
  informationBody,
  informationEyebrow,
  informationGroup,
  informationGroupTitle,
  informationLabel,
  informationList,
  informationLockerTitle,
  informationPhoto,
  informationRow,
  informationTitleCopy,
  informationTitleRow,
  informationValue,
  overlay,
  panel,
  photoImage,
  photoPlaceholder,
  stateMessage,
} from "./ReportDetailViewerModal.css.ts";

export type ReportDetailViewerLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export interface ReportDetailViewerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  titleText: string;
  detail: MyLockerReportDetail | null;
  loadState: ReportDetailViewerLoadState;
  className?: string;
}

export function ReportDetailViewerModal({
  isOpen,
  onOpenChange,
  titleText,
  detail,
  loadState,
  className,
}: ReportDetailViewerModalProps) {
  const informationGroups =
    detail != null && loadState === "ready"
      ? formatReportViewerInformationGroups(detail)
      : [];

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
      isDismissable
    >
      <Modal className={className}>
        <Dialog className={panel} aria-label={m.my_report_detail_viewer_aria()}>
          <div className={informationBody}>
            <div className={informationTitleRow} data-slot="information-title">
              <div className={informationTitleCopy}>
                <span className={informationEyebrow}>
                  {m.my_report_detail_eyebrow()}
                </span>
                <h2 className={informationLockerTitle}>{titleText}</h2>
              </div>
            </div>

            {loadState === "loading" ? (
              <p className={stateMessage}>{m.my_summary_loading()}</p>
            ) : null}
            {loadState === "error" ? (
              <p className={stateMessage}>{m.my_list_error_title()}</p>
            ) : null}

            {loadState === "ready" && detail != null ? (
              <>
                {detail.imageUrl ? (
                  <img
                    className={[photoImage, informationPhoto].join(" ")}
                    src={detail.imageUrl}
                    alt={m.report_section_photo()}
                  />
                ) : (
                  <LockerImageReportFrame
                    size="half"
                    className={[photoPlaceholder, informationPhoto].join(" ")}
                  />
                )}

                {informationGroups.map((group) => (
                  <section
                    key={group.title}
                    className={informationGroup}
                    aria-label={group.title}
                  >
                    <h3 className={informationGroupTitle}>{group.title}</h3>
                    <dl className={informationList}>
                      {group.fields.map((field) => (
                        <div key={field.label} className={informationRow}>
                          <dt className={informationLabel}>{field.label}</dt>
                          <dd className={informationValue}>{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </>
            ) : null}
          </div>

          {loadState === "ready" && detail != null ? (
            <div className={footer}>
              <Button
                className={closeButton}
                variant="filled"
                intent="neutral"
                size="L"
                onPress={handleClose}
              >
                {m.my_report_detail_close()}
              </Button>
            </div>
          ) : null}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
