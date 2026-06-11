import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { formatReportViewerSections } from "../lib/format-report-viewer-sections";
import {
  body,
  fieldItem,
  fieldLabel,
  fieldList,
  fieldValue,
  closeButton,
  footer,
  header,
  overlay,
  panel,
  photoImage,
  photoPlaceholder,
  section,
  sectionTitle,
  stateMessage,
} from "./ReportDetailViewerModal.css.ts";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

export type ReportDetailViewerLoadState = "idle" | "loading" | "ready" | "error";

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
  const sections =
    detail != null && loadState === "ready"
      ? formatReportViewerSections(detail)
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
          <Header
            className={header}
            leading="back"
            titleType="text"
            title={titleText}
            onBack={handleClose}
          />

          <div className={body}>
            {loadState === "loading" ? (
              <p className={stateMessage}>{m.my_summary_loading()}</p>
            ) : null}

            {loadState === "error" ? (
              <p className={stateMessage}>{m.my_list_error_title()}</p>
            ) : null}

            {loadState === "ready"
              ? sections.map((viewerSection) => (
                  <section
                    key={viewerSection.title}
                    className={section}
                    aria-label={viewerSection.title}
                  >
                    <h3 className={sectionTitle}>{viewerSection.title}</h3>

                    {"imageUrl" in viewerSection ? (
                      viewerSection.imageUrl ? (
                        <img
                          className={photoImage}
                          src={viewerSection.imageUrl}
                          alt={m.report_section_photo()}
                        />
                      ) : (
                        <LockerImageReportFrame
                          size="half"
                          className={photoPlaceholder}
                        />
                      )
                    ) : null}

                    {viewerSection.fields.length > 0 ? (
                      <ul className={fieldList}>
                        {viewerSection.fields.map((field) => (
                          <li key={field.label} className={fieldItem}>
                            <span className={fieldLabel}>{field.label}</span>
                            <span className={fieldValue}>{field.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))
              : null}
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
