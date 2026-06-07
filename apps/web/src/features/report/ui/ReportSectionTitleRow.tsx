import { LabelTitle } from "@repo/ui/components/label-title";
import type { ReactNode } from "react";
import { ReportSectionError } from "./ReportSectionError";
import { sectionTitleLabel, sectionTitleRow } from "./report.css.ts";

interface ReportSectionTitleRowProps {
  children: ReactNode;
  errorMessage?: string;
  errorId?: string;
}

export function ReportSectionTitleRow({
  children,
  errorMessage,
  errorId,
}: ReportSectionTitleRowProps) {
  return (
    <div className={sectionTitleRow}>
      <LabelTitle size="small" className={sectionTitleLabel}>
        {children}
      </LabelTitle>
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        placement="title"
      />
    </div>
  );
}
