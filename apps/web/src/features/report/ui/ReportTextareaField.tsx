import { IconPencil24 } from "@repo/ui/tokens/icons";
import type { ChangeEvent } from "react";
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
  const handleChangeTextarea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value.slice(0, maxLength));
  };

  return (
    <label className={reportTextareaRoot} htmlFor={id}>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={handleChangeTextarea}
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
