import { m } from "@repo/i18n";
import { IconCheck24 } from "@repo/ui/assets/icons";
import type { CSSProperties } from "react";
import {
  MAP_COLOR_SCHEME_PREFERENCES,
  type MapColorSchemePreference,
} from "#/entities/map";
import {
  languageGroup,
  languageSettingRow,
  languageSettingRowCheck,
  languageSettingRowLabel,
  rowButton,
  settingRowSelected,
  settingRowText,
} from "./settings.css";

interface MapColorSchemeSettingListProps {
  preference: MapColorSchemePreference;
  onSelectPreference: (preference: MapColorSchemePreference) => void;
  groupFallbackStyle?: CSSProperties;
  rowFallbackStyle?: CSSProperties;
}

const preferenceLabel: Record<MapColorSchemePreference, () => string> = {
  system: m.settings_theme_system,
  light: m.settings_theme_light,
  dark: m.settings_theme_dark,
};

/** 설정 목록 행에 지금 고른 값을 함께 보여줄 때 쓴다. */
export const getMapColorSchemeLabel = (preference: MapColorSchemePreference) =>
  preferenceLabel[preference]();

export function MapColorSchemeSettingList({
  preference,
  onSelectPreference,
  groupFallbackStyle,
  rowFallbackStyle,
}: MapColorSchemeSettingListProps) {
  return (
    <section className={languageGroup} style={groupFallbackStyle}>
      {MAP_COLOR_SCHEME_PREFERENCES.map((value) => {
        const isCurrent = value === preference;

        return (
          <button
            key={value}
            type="button"
            className={[
              rowButton,
              languageSettingRow,
              isCurrent ? settingRowSelected : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={rowFallbackStyle}
            aria-pressed={isCurrent}
            onClick={() => onSelectPreference(value)}
          >
            <span className={languageSettingRowLabel}>
              <span className={settingRowText}>{preferenceLabel[value]()}</span>
            </span>
            {isCurrent ? (
              <span className={languageSettingRowCheck}>
                <IconCheck24 />
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}
