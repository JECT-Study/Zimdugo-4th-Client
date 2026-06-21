import { IconPencil24 } from "@repo/ui/tokens/icons";
import { useEffect, useRef } from "react";
import {
  reportTextareaCounter,
  reportTextareaField,
  reportTextareaIcon,
  reportTextareaRoot,
} from "./report.css.ts";

interface ReportTextareaFieldProps {
  id: string;
  value: string;
  placeholder: string;
  maxLength: number;
  isInvalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}

export function ReportTextareaField({
  id,
  value,
  placeholder,
  maxLength,
  isInvalid,
  describedBy,
  onChange,
}: ReportTextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  return (
    <label className={reportTextareaRoot} htmlFor={id}>
      <textarea
        id={id}
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        className={reportTextareaField}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={describedBy}
      />
      <span className={reportTextareaCounter}>
        {value.length}/{maxLength}
      </span>
      <span className={reportTextareaIcon} aria-hidden="true">
        <IconPencil24 />
      </span>
    </label>
  );
}
