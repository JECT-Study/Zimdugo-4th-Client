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

export function useSettingsStyleReady({ enabled = true } = {}) {
  const shouldProbeStyle = enabled && !hasSettingsStyleResolved;
  const styleReadyState = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: SETTINGS_STYLE_PROBES,
  });

  useEffect(() => {
    if (shouldProbeStyle && styleReadyState.isStyleReady) {
      hasSettingsStyleResolved = true;
    }
  }, [shouldProbeStyle, styleReadyState.isStyleReady]);

  return styleReadyState;
}
