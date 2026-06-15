import { m } from "@repo/i18n";
import { Button as UiButton } from "@repo/ui/components/button";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  getNavigationPlatformLinks,
  hasNavigationDestination,
  type NavigationPlatform,
  openNavigationPlatformLinks,
  type ResolveNavigationOriginResult,
  resolveNavigationOriginWithPermissionRequest,
} from "#/features/search/lib/navigation-platform-links";
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
export { getNavigationPlatformUrl } from "#/features/search/lib/navigation-platform-links";

const NAVER_MAP_ICON_URL = "/icons/navigation/naver-map.jpg";

const GOOGLE_MAPS_ICON_URL = "/icons/navigation/google-maps.jpg";

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
        <Dialog
          className={dialog}
          aria-label={m.navigation_platform_dialog_aria()}
        >
          <h2 className={title}>{m.navigation_platform_title()}</h2>
          <div className={platformGrid}>
            <AriaButton
              className={platformButton}
              onPress={() => handleSelectPlatform("naver")}
              aria-label={m.navigation_platform_naver_aria()}
            >
              <img
                className={platformIcon}
                src={NAVER_MAP_ICON_URL}
                alt=""
                aria-hidden="true"
              />
              <span className={platformLabel}>
                {m.navigation_platform_naver()}
              </span>
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
              <span className={platformLabel}>
                {m.navigation_platform_google()}
              </span>
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
