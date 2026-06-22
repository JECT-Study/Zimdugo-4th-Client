import type { ReactNode } from "react";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { IconCaution24 } from "../../tokens/icons/Icons.tsx";
import { Button } from "../button/Button.tsx";
import {
  actionsContainer,
  bottomSection,
  buttonRow,
  container,
  dialog,
  helper,
  helperArea,
  iconWrapper,
  overlay,
  primaryButtonItem,
  secondaryButtonItem,
  subActionText,
  title,
} from "./Popup.css.ts";

export interface PopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** 아이콘 (미지정 시 기본 주의 아이콘 사용) */
  icon?: ReactNode;
  /** 필수: 팝업 제목 */
  titleText: string;
  /** 선택: 보조 설명 (subAction과 택일) */
  helperText?: string;
  /** 필수: 기본 실행 버튼 */
  primaryAction: {
    label: string;
    onPress: () => void;
  };
  /** 선택: 취소/닫기 등 보조 버튼 */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** 선택: 언더라인 텍스트 형태의 추가 액션 (helperText와 택일) */
  subAction?: {
    label: string;
    onPress: () => void;
  };
  width?: "default" | "wide";
  className?: string;
}

export function Popup({
  isOpen,
  onOpenChange,
  icon,
  titleText,
  helperText,
  primaryAction,
  secondaryAction,
  subAction,
  width = "default",
  className,
}: PopupProps) {
  const hasHelper = !!helperText;
  const hasSubAction = !hasHelper && !!subAction;
  const hasMiddleElement = hasHelper || hasSubAction;
  const containerClassName =
    width === "wide"
      ? hasMiddleElement
        ? container.wideWithMiddle
        : container.wideDefault
      : hasMiddleElement
        ? container.withMiddle
        : container.default;
  const bottomSectionClassName =
    width === "wide"
      ? hasMiddleElement
        ? bottomSection.wideWithMiddle
        : bottomSection.wideDefault
      : hasMiddleElement
        ? bottomSection.withMiddle
        : bottomSection.default;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
    >
      <Modal className={className}>
        <Dialog className={dialog[width]} aria-label={titleText}>
          {({ close }: { close: () => void }) => {
            const handlePrimary = () => {
              primaryAction.onPress();
              close();
            };

            const handleSecondary = () => {
              secondaryAction?.onPress();
              close();
            };

            const handleSubAction = () => {
              subAction?.onPress();
              close();
            };

            return (
              <div className={containerClassName}>
                {/* 기본 Caution 아이콘을 초록색으로 표현하기 위해 state 생략 또는 커스텀 */}
                <div className={iconWrapper}>{icon || <IconCaution24 />}</div>

                <div className={title}>{titleText}</div>

                <div className={bottomSectionClassName}>
                  {hasMiddleElement && (
                    <div className={helperArea}>
                      {hasHelper && <p className={helper}>{helperText}</p>}

                      {hasSubAction && (
                        <AriaButton
                          className={subActionText}
                          onPress={handleSubAction}
                        >
                          {subAction.label}
                        </AriaButton>
                      )}
                    </div>
                  )}

                  <div className={actionsContainer}>
                    <div className={buttonRow}>
                      {secondaryAction && (
                        <Button
                          className={secondaryButtonItem}
                          variant="filled"
                          intent="neutral"
                          size="S"
                          onPress={handleSecondary}
                        >
                          {secondaryAction.label}
                        </Button>
                      )}
                      <Button
                        className={primaryButtonItem}
                        variant="filled"
                        intent="primary"
                        size={secondaryAction ? "S" : "L"}
                        data-size={secondaryAction ? "S" : "L"}
                        onPress={handlePrimary}
                      >
                        {primaryAction.label}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
