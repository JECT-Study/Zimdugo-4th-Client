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
    // 언어 행은 <a> 다. 프로브가 재는 건 클래스가 주는 계산 스타일이라 태그가
    // 달라도 결과는 같지만, 실제와 다른 태그를 적어 두면 다음 사람이 헷갈린다.
    tagName: "a",
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
