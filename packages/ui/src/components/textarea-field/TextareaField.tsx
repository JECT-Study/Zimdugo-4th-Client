import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from "react";
import {
  accessories,
  counter,
  field,
  root,
  trailingIconSlot,
} from "./TextareaField.css.ts";

export type TextareaFieldSize = "default" | "compact";

export interface TextareaFieldProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "children" | "className" | "onChange" | "size" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
  size?: TextareaFieldSize;
  className?: string;
  textareaClassName?: string;
  showCounter?: boolean;
  trailingIcon?: ReactNode;
}

export function TextareaField({
  value,
  onChange,
  size = "default",
  className,
  textareaClassName,
  maxLength,
  showCounter = true,
  trailingIcon,
  id,
  ...props
}: TextareaFieldProps) {
  const hasCounter = showCounter && maxLength !== undefined;
  const hasAccessories = hasCounter || trailingIcon !== undefined;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue =
      maxLength === undefined
        ? event.target.value
        : event.target.value.slice(0, maxLength);
    onChange(nextValue);
  };

  return (
    <label
      className={[root({ size }), className].filter(Boolean).join(" ")}
      htmlFor={id}
    >
      <textarea
        {...props}
        id={id}
        className={[field({ size }), textareaClassName]
          .filter(Boolean)
          .join(" ")}
        value={value}
        maxLength={maxLength}
        onChange={handleChange}
      />
      {hasAccessories ? (
        <span className={accessories({ size })}>
          {hasCounter ? (
            <span className={counter}>
              {value.length}/{maxLength}
            </span>
          ) : null}
          {trailingIcon !== undefined ? (
            <span className={trailingIconSlot} aria-hidden="true">
              {trailingIcon}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
