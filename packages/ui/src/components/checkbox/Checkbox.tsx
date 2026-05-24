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

export type CheckboxLabelLocation = "left" | "right" | "bottom" | "none";

export interface CheckboxProps extends AriaCheckboxProps {
  /** 라벨 텍스트 */
  labelText?: string;
  /** 라벨 위치 */
  labelLocation?: CheckboxLabelLocation;
  /** 커스텀 클래스 */
  className?: string;
  /** 호환용: 기존 selected 변경 핸들러 */
  onSelectedChange?: (isSelected: boolean) => void;
}

const CheckIcon = ({ isSelected }: { isSelected: boolean }) => (
  <svg 
    viewBox="0 0 12 9" 
    fill="none" 
    className={checkSvg} 
    style={{ 
      // 아이콘을 항상 렌더링하여 레이아웃 시프트를 막고 즉시 표시
      visibility: isSelected ? "visible" : "hidden",
      opacity: isSelected ? 1 : 0,
      transition: "none"
    }}
  >
    <path
      d="M1 4.5L4.5 7.5L11 1"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 전용 스타일이 적용된 체크박스 컴포넌트.
 */
export function Checkbox({
  labelText,
  labelLocation = "right",
  className,
  onSelectedChange,
  onChange,
  ...props
}: CheckboxProps) {
  return (
    <AriaCheckbox
      className={[root, rootLocation[labelLocation], className]
        .filter(Boolean)
        .join(" ")}
      onChange={(isSelected: boolean) => {
        onChange?.(isSelected);
        onSelectedChange?.(isSelected);
      }}
      {...props}
    >
      {({
        isHovered,
        isPressed,
        isSelected,
        isDisabled,
        isFocusVisible,
      }: CheckboxRenderProps) => {
        const appliedState: keyof typeof boxState = isDisabled
          ? "disabled"
          : (isPressed || isSelected)
            ? "pressed"
            : isFocusVisible
              ? "focus"
              : isHovered
                ? "hover"
                : "default";

        return (
          <>
            <span className={[box, boxState[appliedState]].join(" ")}>
              <CheckIcon isSelected={isSelected || isPressed} />
            </span>
            {labelText ? (
              <span className={label} style={{ opacity: isDisabled ? 0.5 : 1 }}>
                {labelText}
              </span>
            ) : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
