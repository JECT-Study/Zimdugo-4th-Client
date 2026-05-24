import { type ReactNode, createContext, useContext } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
  type RadioRenderProps,
} from "react-aria-components";
import {
  dot,
  indicator,
  optionRow,
  optionsDirection,
  root,
  text,
} from "./Radio.css.ts";

interface RadioContextProps {
  labelLayout?: "right" | "bottom" | "none";
}

const RadioContext = createContext<RadioContextProps>({
  labelLayout: "right",
});

export interface RadioGroupProps
  extends Omit<AriaRadioGroupProps, "className" | "children"> {
  children: ReactNode;
  className?: string;
  optionsDirection?: "column" | "row";
  labelLayout?: "right" | "bottom" | "none";
}

/** 라디오 그룹 컨테이너 */
export function RadioGroup({
  children,
  className,
  optionsDirection: direction = "column",
  labelLayout = "right",
  ...props
}: RadioGroupProps) {
  const compactRow = labelLayout === "right";

  return (
    <AriaRadioGroup
      {...props}
      className={[root, className].filter(Boolean).join(" ")}
    >
      <RadioContext.Provider value={{ labelLayout }}>
        <div
          className={optionsDirection({
            direction,
            compact: direction === "row" ? compactRow : false,
          })}
        >
          {children}
        </div>
      </RadioContext.Provider>
    </AriaRadioGroup>
  );
}

export interface RadioProps
  extends Omit<AriaRadioProps, "className" | "children"> {
  children?: ReactNode;
  className?: string;
}

/** 개별 라디오 아이템 */
export function Radio({
  children,
  className,
  ...props
}: RadioProps) {
  const { labelLayout } = useContext(RadioContext);

  return (
    <AriaRadio
      {...props}
      className={({ isDisabled }) =>
        [optionRow({ labelLayout, disabled: isDisabled }), className]
          .filter(Boolean)
          .join(" ")
      }
    >
      {(renderProps: RadioRenderProps) => {
        const { isSelected, isHovered, isPressed, isFocusVisible, isDisabled } = renderProps;

        return (
          <>
            <span
              className={indicator({
                isSelected,
                isHovered,
                isPressed,
                isFocusVisible,
                isDisabled,
              })}
            >
              {isSelected ? (
                <span className={dot({ isDisabled })} />
              ) : null}
            </span>
            <span
              className={text({
                isDisabled,
                hidden: labelLayout === "none",
              })}
            >
              {children}
            </span>
          </>
        );
      }}
    </AriaRadio>
  );
}
