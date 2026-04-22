import {
  Input as AriaInput,
  Group,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import {
  IconNormalMapPin24,
  IconNormalSearch24,
} from "../../../tokens/icons/Icons.tsx";
import {
  field,
  fieldState,
  iconSlot,
  labelRow,
  labelTitle,
  labelType,
  labelTypeWithLeftSearch,
  root,
  value as valueStyle,
  valueTone,
} from "./Input.css.ts";

export type InputState =
  | "default"
  | "ghost"
  | "disabled"
  | "active"
  | "error"
  | "searchHome"
  | "searchFilter"
  | "underlined";
export type InputTextActive = "on" | "off";
export type InputLabelTypeVariant = "iconText" | "text";
export type InputSearchIconPlacement = "auto" | "left" | "right" | "none";

export interface InputProps
  extends Omit<TextFieldProps, "className" | "children"> {
  placeholder?: string;
  labelTitleText?: string;
  state?: InputState;
  textActive?: InputTextActive;
  labelTypeVariant?: InputLabelTypeVariant;
  searchIconPlacement?: InputSearchIconPlacement;
  className?: string;
}

/** 입력 필드 variants. Figma `194:310`, `458:426`, `194:340`, `358:604`, `337:528`, `339:354` */
export function Input({
  placeholder = "검색어를 입력하세요",
  labelTitleText,
  state = "default",
  textActive = "on",
  labelTypeVariant = "text",
  searchIconPlacement = "none",
  className,
  ...props
}: InputProps) {
  const isLabelOn = Boolean(labelTitleText);
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

  // textActive prop controls the manual text tone, if required.
  // Native ::placeholder handles empty state coloring automatically via CSS.

  return (
    <TextField
      {...props}
      isDisabled={props.isDisabled ?? state === "disabled"}
      className={[root, className].filter(Boolean).join(" ")}
    >
      {isLabelOn ? (
        <div className={labelRow}>
          <div className={labelTitle}>{labelTitleText}</div>
        </div>
      ) : null}
      <Group className={[field, fieldState[state]].join(" ")}>
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
            className={[valueStyle, valueTone[textActive]].join(" ")}
            placeholder={placeholder}
          />
        </div>
        {showRightSearch ? (
          <span className={iconSlot}>
            <IconNormalSearch24 size={24} />
          </span>
        ) : null}
      </Group>
    </TextField>
  );
}
