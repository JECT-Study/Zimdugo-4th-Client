import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { SearchField } from "@repo/ui/components/search-field";
import { IconNormalSearch24 } from "@repo/ui/tokens/icons";
import { type CSSProperties, useEffect } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  type StyleReadyProbe,
  useStyleReadyProbe,
} from "#/shared/ui/useStyleReadyProbe";
import {
  fallbackButton,
  fallbackIconSlot,
  fallbackLabel,
  searchBarLayer,
  searchField,
} from "./HomeSearchBar.css";

export interface HomeSearchBarProps {
  onOpenSearch: () => void;
}

const searchBarLayerFallbackStyle: CSSProperties = {
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 8px)",
  left: "16px",
  right: "16px",
  zIndex: 10,
  display: "flex",
  maxWidth: "calc(480px - 32px)",
  margin: "0 auto",
};

const searchBarSkeletonFallbackStyle: CSSProperties = {
  ...SKELETON_SURFACE_STYLE,
  display: "block",
  width: "100%",
  height: "48px",
  minHeight: "48px",
  borderRadius: "8px",
};

const fallbackButtonInlineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  padding: "10px 16px",
  border: "2px solid #d9d9d9",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#8e8e8e",
  cursor: "pointer",
};

const fallbackIconSlotInlineStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
};

const fallbackLabelInlineStyle: CSSProperties = {
  overflow: "hidden",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.2,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const isHomeSearchBarStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.flexDirection === "column" &&
    style.minHeight === "48px"
  );
};

const HOME_SEARCH_BAR_STYLE_PROBES: StyleReadyProbe[] = [
  {
    className: searchField,
    isReady: isHomeSearchBarStyleReady,
  },
];

let hasHomeSearchBarStyleResolved = false;

export function HomeSearchBar({ onOpenSearch }: HomeSearchBarProps) {
  const shouldProbeStyle = !hasHomeSearchBarStyleResolved;
  const { isStyleReady, isStyleTimedOut } = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: HOME_SEARCH_BAR_STYLE_PROBES,
  });

  const handleOpenSearch = () => {
    onOpenSearch();
  };

  useEffect(() => {
    if (shouldProbeStyle && isStyleReady && !isStyleTimedOut) {
      hasHomeSearchBarStyleResolved = true;
    }
  }, [shouldProbeStyle, isStyleReady, isStyleTimedOut]);

  return (
    <div className={searchBarLayer} style={searchBarLayerFallbackStyle}>
      {!isStyleReady ? (
        <Skeleton
          height={48}
          minHeight={48}
          borderRadius={8}
          style={searchBarSkeletonFallbackStyle}
        />
      ) : isStyleTimedOut ? (
        <button
          type="button"
          className={fallbackButton}
          style={fallbackButtonInlineStyle}
          onClick={handleOpenSearch}
          aria-label={m.search_input_aria()}
        >
          <span
            className={fallbackIconSlot}
            style={fallbackIconSlotInlineStyle}
          >
            <IconNormalSearch24 />
          </span>
          <span className={fallbackLabel} style={fallbackLabelInlineStyle}>
            {m.search_placeholder()}
          </span>
        </button>
      ) : (
        <SearchField
          className={searchField}
          variant="searchHome"
          searchIconPlacement="left"
          placeholder={m.search_placeholder()}
          aria-label={m.search_input_aria()}
          isReadOnly
          onFocus={handleOpenSearch}
        />
      )}
    </div>
  );
}
