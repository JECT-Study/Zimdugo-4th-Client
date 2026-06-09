import { Button as UiButton } from "@repo/ui/components/button";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import type { LockerDetailItem } from "./LockerDetailBottomSheet";
import {
  cancelButton,
  dialog,
  overlay,
  platformButton,
  platformGrid,
  platformIcon,
  platformLabel,
  title,
} from "./NavigationPlatformPopup.css.ts";

export type NavigationPlatform = "naver" | "google";

const NAVER_MAP_ICON_URL =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e2/75/2d/e2752d44-f2c7-ac4e-ff75-8b9ac83cd62c/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg";

const GOOGLE_MAPS_ICON_URL =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f1/56/40/f15640e5-527f-1000-045f-0a4c71df9286/maps_2025-0-0-1x_U007epad-0-0-0-1-0-0-sRGB-0-0-85-220.png/512x512bb.jpg";

export interface NavigationPlatformPopupProps {
  isOpen: boolean;
  locker: LockerDetailItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSelectPlatform?: (
    platform: NavigationPlatform,
    url: string,
    locker: LockerDetailItem,
  ) => void;
}

export const getNavigationPlatformUrl = (
  platform: NavigationPlatform,
  locker: LockerDetailItem,
) => {
  const query = encodeURIComponent(`${locker.title} ${locker.address}`.trim());

  if (platform === "naver") {
    return `https://map.naver.com/p/search/${query}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export function NavigationPlatformPopup({
  isOpen,
  locker,
  onOpenChange,
  onSelectPlatform,
}: NavigationPlatformPopupProps) {
  const handleSelectPlatform = (platform: NavigationPlatform) => {
    if (!locker) return;

    const url = getNavigationPlatformUrl(platform, locker);
    onSelectPlatform?.(platform, url, locker);
    window.location.href = url;
    onOpenChange(false);
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
      isDismissable
    >
      <Modal>
        <Dialog className={dialog} aria-label="길찾기 플랫폼 선택">
          <h2 className={title}>어떤 지도로 길찾기 할까요?</h2>
          <div className={platformGrid}>
            <AriaButton
              className={platformButton}
              onPress={() => handleSelectPlatform("naver")}
              aria-label="네이버맵으로 길찾기"
            >
              <img
                className={platformIcon}
                src={NAVER_MAP_ICON_URL}
                alt=""
                aria-hidden="true"
              />
              <span className={platformLabel}>네이버맵</span>
            </AriaButton>
            <AriaButton
              className={platformButton}
              onPress={() => handleSelectPlatform("google")}
              aria-label="구글맵스로 길찾기"
            >
              <img
                className={platformIcon}
                src={GOOGLE_MAPS_ICON_URL}
                alt=""
                aria-hidden="true"
              />
              <span className={platformLabel}>구글맵스</span>
            </AriaButton>
          </div>
          <UiButton
            variant="filled"
            intent="neutral"
            size="L"
            className={cancelButton}
            onPress={() => onOpenChange(false)}
          >
            닫기
          </UiButton>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
