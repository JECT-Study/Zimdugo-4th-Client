import {
  Group,
  Input as AriaInput,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import { useState, type ChangeEvent } from "react";
import {
  IconNormalMapPin24,
  IconNormalSearch24,
} from "../../tokens/icons/Icons.tsx";
import { LabelTitle } from "../label-title/LabelTitle.tsx";
import {
  field,
  fieldState,
  iconSlot,
  inputText,
  inputTextTone,
  labelTitleSlot,
  labelType,
  labelTypeWithLeftSearch,
  root,
} from "./Input.css.ts";

export type InputVariant =
  | "default"
  | "ghost"
  | "disabled"
  | "active"
  | "error"
  | "searchHome"
  | "underlined";
export type InputLabelTypeVariant = "iconText" | "text";
export type InputSearchIconPlacement = "auto" | "left" | "right" | "none";
export type InputLabelTitleSize = "none" | "small" | "large";
export type InputTextTone = "auto" | "on" | "off";

export interface InputProps
  extends Omit<TextFieldProps, "className" | "children"> {
  placeholder?: string;
  label?: string;
  labelTitleSize?: InputLabelTitleSize;
  labelSubtitle?: string;
  variant?: InputVariant; // state -> variant
  labelTypeVariant?: InputLabelTypeVariant;
  searchIconPlacement?: InputSearchIconPlacement;
  textTone?: InputTextTone;
  className?: string;
}

export function Input({
  placeholder = "검색어를 입력하세요",
  label,
  labelTitleSize = "none",
  labelSubtitle,
  variant = "default",
  labelTypeVariant = "text",
  searchIconPlacement = "none",
  textTone = "auto",
  className,
  ...props
}: InputProps) {
  const isControlledValue = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    String(props.defaultValue ?? ""),
  );
  const isDisabled = props.isDisabled ?? variant === "disabled";
  const isLabelOn = labelTitleSize !== "none" && Boolean(label);
  const defaultLeftSearch = labelTypeVariant === "text";
  const defaultRightSearch = labelTypeVariant === "text";
  const showLeftSearch =
    searchIconPlacement === "auto"
      ? defaultLeftSearch
      : searchIconPlacement === "left";
  const showRightSearch =
    searchIconPlacement === "auto"
      ? defaultRightSearch
      : searchIconPlacement === "right";
  const showLeftMapPin = labelTypeVariant === "iconText";
  const currentValue = isControlledValue
    ? String(props.value ?? "")
    : uncontrolledValue;
  const hasTextValue = (currentValue || "").trim().length > 0;
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlledValue) {
      setUncontrolledValue(event.currentTarget.value);
    }
  };

  return (
    <TextField
      {...props}
      isDisabled={isDisabled}
      className={[root, className].filter(Boolean).join(" ")}
    >
      {() => {
        const isTextActiveByValue = !isDisabled && hasTextValue;
        const isTextActive =
          textTone === "on"
            ? true
            : textTone === "off"
              ? false
              : isTextActiveByValue;
        const toneClass = isTextActive ? inputTextTone?.on : inputTextTone?.off;
        return (
          <>
            {isLabelOn ? (
              <div className={labelTitleSlot}>
                <LabelTitle
                  size={labelTitleSize === "large" ? "large" : "small"}
                  subtitle={labelTitleSize === "large" ? labelSubtitle : undefined}
                >
                  {label}
                </LabelTitle>
              </div>
            ) : null}
            <Group className={[field, fieldState[variant]].join(" ")}>
              <div
                className={[
                  labelType,
                  showLeftSearch ? labelTypeWithLeftSearch : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {showLeftMapPin && (
                  <span className={iconSlot}>
                    <IconNormalMapPin24 />
                  </span>
                )}
                {showLeftSearch && (
                  <span className={iconSlot}>
                    <IconNormalSearch24 size={24} />
                  </span>
                )}
                <AriaInput
                  className={[inputText, toneClass].filter(Boolean).join(" ")}
                  placeholder={placeholder}
                  onChange={handleInputChange}
                />
              </div>
              {showRightSearch ? (
                <span className={iconSlot}>
                  <IconNormalSearch24 size={24} />
                </span>
              ) : null}
            </Group>
          </>
        );
      }}
    </TextField>
  );
}
