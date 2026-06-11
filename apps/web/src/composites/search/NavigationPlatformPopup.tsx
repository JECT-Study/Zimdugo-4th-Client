import { Button as UiButton } from "@repo/ui/components/button";
import { m } from "@repo/i18n";
import {
  getNavigationPlatformLinks,
  hasNavigationDestination,
  openNavigationPlatformLinks,
  resolveNavigationOriginWithPermissionRequest,
  type NavigationPlatform,
  type ResolveNavigationOriginResult,
} from "#/features/search/lib/navigation-platform-links";
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

export type { NavigationPlatform } from "#/features/search/lib/navigation-platform-links";
export {
  getNavigationPlatformUrl,
} from "#/features/search/lib/navigation-platform-links";

const KAKAO_MAP_ICON_URL =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/68/e2/0b/68e20b4b-7303-6023-2de9-c893f5ea1b38/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg";

const GOOGLE_MAPS_ICON_URL =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f1/56/40/f15640e5-527f-1000-045f-0a4c71df9286/maps_2025-0-0-1x_U007epad-0-0-0-1-0-0-sRGB-0-0-85-220.png/512x512bb.jpg";

const resolvingNavigationLockerIds = new Set<number>();

export interface NavigationPlatformPopupProps {
  isOpen: boolean;
  locker: LockerDetailItem | null;
  knownLocation?: { lat: number; lng: number } | null;
  onOpenChange: (isOpen: boolean) => void;
  onOriginResolved?: (result: ResolveNavigationOriginResult) => void;
  onSelectPlatform?: (
    platform: NavigationPlatform,
    url: string,
    locker: LockerDetailItem,
  ) => void;
}

export function NavigationPlatformPopup({
  isOpen,
  locker,
  knownLocation = null,
  onOpenChange,
  onOriginResolved,
  onSelectPlatform,
}: NavigationPlatformPopupProps) {
  const handleSelectPlatform = (platform: NavigationPlatform) => {
    if (!locker || !hasNavigationDestination(locker)) {
      return;
    }

    if (resolvingNavigationLockerIds.has(locker.lockerId)) {
      return;
    }

    resolvingNavigationLockerIds.add(locker.lockerId);

    const originTask = resolveNavigationOriginWithPermissionRequest({
      knownLocation,
    });

    void originTask
      .then((result) => {
        onOriginResolved?.(result);

        const links = getNavigationPlatformLinks(platform, locker, {
          navigationOrigin: result.origin,
        });
        if (!links) return;

        onSelectPlatform?.(platform, links.webUrl, locker);
        openNavigationPlatformLinks(links);
        onOpenChange(false);
      })
      .finally(() => {
        resolvingNavigationLockerIds.delete(locker.lockerId);
      });
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
      isDismissable
    >
      <Modal>
        <Dialog className={dialog} aria-label={m.navigation_platform_dialog_aria()}>
          <h2 className={title}>{m.navigation_platform_title()}</h2>
          <div className={platformGrid}>
            <AriaButton
              className={platformButton}
              onPress={() => handleSelectPlatform("kakao")}
              aria-label={m.navigation_platform_kakao_aria()}
            >
              <img
                className={platformIcon}
                src={KAKAO_MAP_ICON_URL}
                alt=""
                aria-hidden="true"
              />
              <span className={platformLabel}>{m.navigation_platform_kakao()}</span>
            </AriaButton>
            <AriaButton
              className={platformButton}
              onPress={() => handleSelectPlatform("google")}
              aria-label={m.navigation_platform_google_aria()}
            >
              <img
                className={platformIcon}
                src={GOOGLE_MAPS_ICON_URL}
                alt=""
                aria-hidden="true"
              />
              <span className={platformLabel}>{m.navigation_platform_google()}</span>
            </AriaButton>
          </div>
          <UiButton
            variant="filled"
            intent="neutral"
            size="L"
            className={cancelButton}
            onPress={() => onOpenChange(false)}
          >
            {m.navigation_platform_close()}
          </UiButton>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
