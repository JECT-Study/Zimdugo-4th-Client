import type { CSSProperties, ReactNode } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Popover as AriaPopover,
  type DialogRenderProps,
  type DialogTriggerProps,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { IconX16 } from "../../tokens/icons/Icons.tsx";
import { Button } from "../button/Button.tsx";
import {
  actionButton,
  actions,
  body,
  bubble,
  closeButton,
  headerRow,
  popover,
  title,
} from "./Popover.css.ts";

interface PopoverAction {
  label: string;
  onPress?: () => void;
}

export interface PopoverProps
  extends Pick<DialogTriggerProps, "isOpen" | "defaultOpen" | "onOpenChange"> {
  trigger: ReactNode;
  titleText: string;
  bodyText: string;
  primaryAction?: PopoverAction;
  secondaryAction?: PopoverAction;
  closeAriaLabel?: string;
  className?: string;
  placement?: AriaPopoverProps["placement"];
  offset?: number;
  tailPosition?: number;
  portalContainer?: AriaPopoverProps["UNSTABLE_portalContainer"];
}

type TailStyle = CSSProperties & {
  "--popover-tail-position": string;
};

const clampTailPosition = (position: number) =>
  Math.min(100, Math.max(0, position));

export function Popover({
  trigger,
  titleText,
  bodyText,
  primaryAction,
  secondaryAction,
  closeAriaLabel = "팝오버 닫기",
  className,
  placement = "top",
  offset = 12,
  tailPosition = 50,
  portalContainer,
  isOpen,
  defaultOpen,
  onOpenChange,
}: PopoverProps) {
  const tailStyle: TailStyle = {
    "--popover-tail-position": `${clampTailPosition(tailPosition)}%`,
  };

  return (
    <DialogTrigger
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger}
      <AriaPopover
        placement={placement}
        offset={offset}
        UNSTABLE_portalContainer={portalContainer}
        className={[popover, className].filter(Boolean).join(" ")}
      >
        <Dialog className={bubble} style={tailStyle}>
          {({ close }: DialogRenderProps) => {
            const handleSecondary = () => {
              secondaryAction?.onPress?.();
              close();
            };

            const handlePrimary = () => {
              primaryAction?.onPress?.();
              close();
            };

            return (
              <>
                <div className={headerRow}>
                  <p className={title}>{titleText}</p>
                  <AriaButton
                    className={closeButton}
                    aria-label={closeAriaLabel}
                    onPress={close}
                  >
                    <IconX16 />
                  </AriaButton>
                </div>

                <p className={body}>{bodyText}</p>

                {secondaryAction || primaryAction ? (
                  <div className={actions}>
                    {secondaryAction ? (
                      <Button
                        className={actionButton}
                        variant="filled"
                        intent="neutral"
                        size="S"
                        onPress={handleSecondary}
                      >
                        {secondaryAction.label}
                      </Button>
                    ) : null}
                    {primaryAction ? (
                      <Button
                        className={actionButton}
                        variant="filled"
                        intent="neutral"
                        size="S"
                        onPress={handlePrimary}
                      >
                        {primaryAction.label}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </>
            );
          }}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
