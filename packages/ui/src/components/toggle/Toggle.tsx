import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { root, thumb, track } from "./Toggle.css.ts";

export interface ToggleProps extends Omit<AriaSwitchProps, "className" | "children"> {
  className?: string;
}

interface ToggleRenderProps {
  isSelected: boolean;
  isDisabled: boolean;
  isPressed: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
}

/** 토글 스위치 컴포넌트. */
export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <AriaSwitch
      {...props}
      className={({ isDisabled }: { isDisabled: boolean }) =>
        [root({ isDisabled }), className].filter(Boolean).join(" ")
      }
    >
      {({
        isSelected,
        isDisabled,
        isPressed,
        isHovered,
        isFocusVisible,
      }: ToggleRenderProps) => (
        <span
          className={track({
            isSelected,
            isDisabled,
            isPressed,
            isHovered,
            isFocusVisible,
          })}
        >
          <span
            className={thumb({
              isSelected,
              isDisabled,
            })}
          />
        </span>
      )}
    </AriaSwitch>
  );
}
