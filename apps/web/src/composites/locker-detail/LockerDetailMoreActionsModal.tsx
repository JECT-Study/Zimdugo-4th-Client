import { m } from "@repo/i18n";
import {
  IconCircleboxClose32,
  IconReport24,
  IconShare24,
  IconStarFilled24,
  IconStarOutline24,
} from "@repo/ui/tokens/icons";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  actionButton,
  actionIcon,
  actionLabel,
  actionList,
  closeButton,
  dialog,
  header,
  modal,
  overlay,
  reportActionButton,
} from "./LockerDetailMoreActionsModal.css.ts";

const MODAL_EDGE_GAP = 8;
const MODAL_VIEWPORT_PADDING = 16;

interface ModalPosition {
  top: number;
  right: number;
}

export interface LockerDetailMoreActionsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  anchorRef: RefObject<HTMLElement | null>;
  isFavorite: boolean;
  canFavorite: boolean;
  onShare: () => void;
  onFavoriteChange: () => void;
  onReport: () => void;
}

export function LockerDetailMoreActionsModal({
  isOpen,
  onOpenChange,
  anchorRef,
  isFavorite,
  canFavorite,
  onShare,
  onFavoriteChange,
  onReport,
}: LockerDetailMoreActionsModalProps) {
  const [position, setPosition] = useState<ModalPosition>({
    top: MODAL_VIEWPORT_PADDING,
    right: 0,
  });
  const modalRef = useRef<HTMLDivElement | null>(null);

  const modalStyle: CSSProperties = {
    top: position.top,
    right: position.right,
  };

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;

    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const modalElement = modalRef.current;
    const modalHeight = modalElement?.getBoundingClientRect().height ?? 0;
    const preferredTop = rect.bottom + MODAL_EDGE_GAP;
    const maximumTop =
      window.innerHeight - modalHeight - MODAL_VIEWPORT_PADDING;
    setPosition({
      top: Math.max(MODAL_VIEWPORT_PADDING, Math.min(preferredTop, maximumTop)),
      right: 0,
    });
  }, [anchorRef]);

  const handleOpenChange = (nextIsOpen: boolean) => {
    onOpenChange(nextIsOpen);

    if (!nextIsOpen) {
      queueMicrotask(() => anchorRef.current?.focus());
    }
  };

  const handleAction = (action: () => void) => {
    action();
    handleOpenChange(false);
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isOpen, updatePosition]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      className={overlay}
    >
      <Modal ref={modalRef} className={modal} style={modalStyle}>
        <Dialog
          className={dialog}
          aria-label={m.locker_detail_more_actions_aria()}
        >
          <div className={header}>
            <AriaButton
              className={closeButton}
              onPress={() => handleOpenChange(false)}
              aria-label={m.locker_detail_more_actions_close_aria()}
            >
              <IconCircleboxClose32 />
            </AriaButton>
          </div>

          <div className={actionList}>
            <MoreActionItem
              icon={<IconShare24 />}
              label={m.locker_detail_share_aria()}
              onPress={() => handleAction(onShare)}
            />
            {canFavorite ? (
              <MoreActionItem
                icon={
                  isFavorite ? (
                    <IconStarFilled24 size={24} />
                  ) : (
                    <IconStarOutline24 size={24} />
                  )
                }
                label={
                  isFavorite
                    ? m.search_favorite_remove()
                    : m.search_favorite_add()
                }
                onPress={() => handleAction(onFavoriteChange)}
              />
            ) : null}
            <MoreActionItem
              icon={<IconReport24 />}
              label={m.locker_detail_report()}
              onPress={() => handleAction(onReport)}
              isDestructive
            />
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function MoreActionItem({
  icon,
  label,
  onPress,
  isDestructive = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}) {
  return (
    <AriaButton
      className={[actionButton, isDestructive ? reportActionButton : ""]
        .filter(Boolean)
        .join(" ")}
      onPress={onPress}
    >
      <span className={actionIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={actionLabel}>{label}</span>
    </AriaButton>
  );
}
