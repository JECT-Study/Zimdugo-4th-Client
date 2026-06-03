import { useEffect } from "react";
import {
  type StyleReadyProbe,
  useStyleReadyProbe,
} from "#/shared/ui/useStyleReadyProbe";
import { languageSettingRow, settingRow } from "../ui/settings.css.ts";

let hasSettingsStyleResolved = false;

const isSettingsRowStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.minHeight === "48px" &&
    style.boxSizing === "border-box"
  );
};

const SETTINGS_STYLE_PROBES: StyleReadyProbe[] = [
  {
    className: settingRow,
    isReady: isSettingsRowStyleReady,
    tagName: "button",
  },
  {
    className: languageSettingRow,
    isReady: isSettingsRowStyleReady,
    tagName: "button",
  },
];

/**
 * Settings subtree CSS chunk probe. Caches after first successful (non-timeout) resolve
 * so revisiting settings routes skips the skeleton (similar to BottomTabBar chrome policy).
 */
export function useSettingsStyleReady({ enabled = true } = {}) {
  const shouldProbeStyle = enabled && !hasSettingsStyleResolved;
  const styleReadyState = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: SETTINGS_STYLE_PROBES,
  });

  useEffect(() => {
    if (
      shouldProbeStyle &&
      styleReadyState.isStyleReady &&
      !styleReadyState.isStyleTimedOut
    ) {
      hasSettingsStyleResolved = true;
    }
  }, [
    shouldProbeStyle,
    styleReadyState.isStyleReady,
    styleReadyState.isStyleTimedOut,
  ]);

  return styleReadyState;
}
