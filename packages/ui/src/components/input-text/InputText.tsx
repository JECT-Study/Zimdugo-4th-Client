import { Input as AriaInput } from "react-aria-components";
import type { ComponentProps } from "react";
import { inputText, inputTextTone } from "./InputText.css.ts";

export type InputTextTone = "on" | "off";

export interface InputTextProps extends Omit<ComponentProps<typeof AriaInput>, "className"> {
  tone?: InputTextTone;
  className?: string;
}

export function InputText({
  tone = "on",
  className,
  ...props
}: InputTextProps) {
  return (
    <AriaInput
      {...props}
      className={[inputText, inputTextTone[tone], className].filter(Boolean).join(" ")}
    />
  );
}
