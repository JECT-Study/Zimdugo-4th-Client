import { useEffect, useState } from "react";
import { languageSettingRow, settingRow } from "./-settings.css.ts";

const STYLE_READY_CHECK_LIMIT = 20;

const isSettingsRowStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.minHeight === "48px" &&
    style.boxSizing === "border-box"
  );
};

export function useSettingsStyleReady({ enabled = true } = {}) {
  const [isStyleReady, setIsStyleReady] = useState(!enabled);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsStyleReady(true);
      setIsStyleTimedOut(false);
      return;
    }

    setIsStyleReady(false);
    setIsStyleTimedOut(false);

    let frameId = 0;
    let checkCount = 0;

    const rowProbe = document.createElement("button");
    rowProbe.className = settingRow;
    rowProbe.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";

    const languageRowProbe = document.createElement("button");
    languageRowProbe.className = languageSettingRow;
    languageRowProbe.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";

    document.body.appendChild(rowProbe);
    document.body.appendChild(languageRowProbe);

    const checkStyleReady = () => {
      if (
        isSettingsRowStyleReady(rowProbe) &&
        isSettingsRowStyleReady(languageRowProbe)
      ) {
        setIsStyleReady(true);
        return;
      }

      if (checkCount >= STYLE_READY_CHECK_LIMIT) {
        setIsStyleTimedOut(true);
        setIsStyleReady(true);
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkStyleReady);
    };

    frameId = window.requestAnimationFrame(checkStyleReady);

    return () => {
      window.cancelAnimationFrame(frameId);
      rowProbe.remove();
      languageRowProbe.remove();
    };
  }, [enabled]);

  return { isStyleReady, isStyleTimedOut };
}
