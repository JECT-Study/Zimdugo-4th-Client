import { languageTag, m } from "@repo/i18n";
import { Button as UiButton } from "@repo/ui/components/button";
import { Popup } from "@repo/ui/components/popup";
import { useEffect, useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  getNavigationPlatformLinks,
  hasNavigationDestination,
  type NavigationPlatform,
  openNavigationPlatformLinks,
  resolveNavigationOriginForDirections,
} from "#/features/search/lib/navigation-platform-links";
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

const NAVER_MAP_ICON_URL = "/icons/navigation/naver-map.png";

const GOOGLE_MAPS_ICON_URL = "/icons/navigation/google-maps.png";

const resolvingNavigationLockerIds = new Set<number>();

export interface NavigationPlatformPopupProps {
  isOpen: boolean;
  locker: LockerDetailItem | null;
  knownLocation?: { lat: number; lng: number } | null;
  onOpenChange: (isOpen: boolean) => void;
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
  onSelectPlatform,
}: NavigationPlatformPopupProps) {
  const [isNaverLanguageWarningOpen, setIsNaverLanguageWarningOpen] =
    useState(false);

  const openPlatformNavigation = (platform: NavigationPlatform) => {
    if (!locker || !hasNavigationDestination(locker)) {
      return;
    }

    if (resolvingNavigationLockerIds.has(locker.lockerId)) {
      return;
    }

    resolvingNavigationLockerIds.add(locker.lockerId);

    try {
      const result = resolveNavigationOriginForDirections(knownLocation);

      const links = getNavigationPlatformLinks(platform, locker, {
        navigationOrigin: result.origin,
      });
      if (!links) {
        return;
      }

      onSelectPlatform?.(platform, links.webUrl, locker);
      openNavigationPlatformLinks(links);
      onOpenChange(false);
    } finally {
      resolvingNavigationLockerIds.delete(locker.lockerId);
    }
  };

  const handleSelectPlatform = (platform: NavigationPlatform) => {
    if (platform === "naver" && languageTag() !== "ko") {
      setIsNaverLanguageWarningOpen(true);
      return;
    }

    openPlatformNavigation(platform);
  };

  /*
   * 팝업이 닫히면 그 위의 언어 확인창도 닫는다. 기기 뒤로가기로 팝업만 닫히면 확인창
   * 상태가 남아, 앞으로가기로 팝업을 다시 열 때 확인창까지 함께 열린다.
   */
  useEffect(() => {
    if (!isOpen) setIsNaverLanguageWarningOpen(false);
  }, [isOpen]);

  return (
    <>
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

      <Popup
        isOpen={isNaverLanguageWarningOpen}
        onOpenChange={setIsNaverLanguageWarningOpen}
        titleText={m.navigation_naver_language_warning_title()}
        helperText={m.navigation_naver_language_warning_helper()}
        primaryAction={{
          label: m.common_yes(),
          onPress: () => {
            setIsNaverLanguageWarningOpen(false);
            openPlatformNavigation("naver");
          },
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsNaverLanguageWarningOpen(false),
        }}
      />
    </>
  );
}
