import { m } from "@repo/i18n";
import { LabelTitle } from "@repo/ui/components/label-title";
import { useEffect, useRef } from "react";
import { MAX_REPORT_ADDITIONAL_INFO_LENGTH } from "../model/report-types";
import {
  charCounter,
  section,
  textareaContainer,
  textareaField,
} from "./report.css.ts";

interface ReportAdditionalInfoSectionProps {
  additionalInfo: string;
  setAdditionalInfo: (val: string) => void;
}

export function ReportAdditionalInfoSection({
  additionalInfo,
  setAdditionalInfo,
}: ReportAdditionalInfoSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-growing logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [additionalInfo]);

  return (
    <section className={section}>
      <LabelTitle size="small">{m.report_section_additional()}</LabelTitle>
      <div className={textareaContainer}>
        <textarea
          ref={textareaRef}
          placeholder={m.report_additional_placeholder()}
          value={additionalInfo}
          onChange={(e) =>
            setAdditionalInfo(
              e.target.value.slice(0, MAX_REPORT_ADDITIONAL_INFO_LENGTH),
            )
          }
          className={textareaField}
          style={{ overflow: "hidden" }}
        />
        <div className={charCounter}>
          {additionalInfo.length}/{MAX_REPORT_ADDITIONAL_INFO_LENGTH}
        </div>
      </div>
    </section>
  );
}
