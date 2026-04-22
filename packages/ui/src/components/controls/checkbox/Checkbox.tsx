import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
  type CheckboxRenderProps,
} from "react-aria-components";
import {
  box,
  boxState,
  checkSvg,
  label,
  root,
  rootLocation,
} from "./Checkbox.css.ts";

export type CheckboxState =
  | "default"
  | "hover"
  | "pressed"
  | "disabled"
  | "focus";
export type CheckboxLabelLocation = "left" | "right" | "bottom";

export interface CheckboxProps extends Omit<AriaCheckboxProps, "className" | "children" | "onChange"> {
  /** 시각 상태를 강제로 고정할 때 사용 */
  state?: CheckboxState;
  labelText?: string;
  labelLocation?: CheckboxLabelLocation;
  className?: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
}

function CheckIcon() {
  return (
    <svg
      className={checkSvg}
      // viewBox="0 0 12 12"
      width="12"
      height="9"
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>체크됨</title>
      {/*<path*/}
      {/*  d="M2 6.2L4.5 8.7L10 3.2"*/}
      {/*  stroke="#FFFFFF"*/}
      {/*  strokeWidth="1.8"*/}
      {/*  strokeLinecap="round"*/}
      {/*  strokeLinejoin="round"*/}
      {/*/>*/}
      <path
        d="M3.70444 7.27329L1.21906 4.7897C1.08514 4.65587 0.903505 4.58069 0.714111 4.58069C0.524717 4.58069 0.34308 4.65587 0.209158 4.7897C0.0752365 4.92353 0 5.10503 0 5.29429C0 5.388 0.0184712 5.4808 0.0543586 5.56737C0.0902461 5.65395 0.142847 5.73262 0.209158 5.79888L3.20306 8.79065C3.4824 9.06978 3.93363 9.06978 4.21297 8.79065L11.7908 1.21819C11.9248 1.08437 12 0.902859 12 0.713601C12 0.524342 11.9248 0.342835 11.7908 0.209009C11.6569 0.0751829 11.4753 0 11.2859 0C11.0965 0 10.9149 0.0751829 10.7809 0.209009L3.70444 7.27329Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/** 체크박스(상태 + 라벨 위치). Figma `186:17750`, `210:459`. */
export function Checkbox({
  state,
  labelText,
  labelLocation = "left",
  className,
  isSelected,
  defaultSelected,
  onSelectedChange,
  isDisabled = false,
  ...props
}: CheckboxProps) {
  // state prop이 빈 문자열이거나 명시적인 값이 있을 때만 강제 상태로 간주
  const hasForcedState = typeof state === "string";
  return (
    <AriaCheckbox
      {...props}
      className={[root, rootLocation[labelLocation], className]
        .filter(Boolean)
        .join(" ")}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onSelectedChange}
      isDisabled={isDisabled}
    >
      {({
        isSelected: selected,
        isPressed,
        isHovered,
        isFocusVisible,
        isDisabled: disabled,
      }: CheckboxRenderProps) => {
        const liveState: CheckboxState = disabled
          ? "disabled"
          : selected
            ? "pressed"
            : isPressed
              ? "pressed"
              : isFocusVisible
                ? "focus"
                : isHovered
                  ? "hover"
                  : "default";
        const appliedState = hasForcedState ? state : liveState;
        const liveCheck = hasForcedState ? state === "pressed" : selected;
        return (
          <>
            <span className={[box, boxState[appliedState]].join(" ")}>
              {liveCheck ? <CheckIcon /> : null}
            </span>
            {labelText ? <span className={label}>{labelText}</span> : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
