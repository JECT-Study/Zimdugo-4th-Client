import type { ReactNode } from "react";
import { ReportSectionError } from "./ReportSectionError";
import { sectionTitleLabel, sectionTitleRow } from "./report.css.ts";

interface ReportSectionTitleRowProps {
  children: ReactNode;
  errorMessage?: string;
  defaultErrorMessage?: string;
  errorId?: string;
}

export function ReportSectionTitleRow({
  children,
  errorMessage,
  defaultErrorMessage,
  errorId,
}: ReportSectionTitleRowProps) {
  return (
    <div className={sectionTitleRow}>
      <div className={sectionTitleLabel}>{children}</div>
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        defaultMessage={defaultErrorMessage}
        placement="title"
      />
    </div>
  );
}
