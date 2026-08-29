import { m } from "@repo/i18n";
import {
  IconChevronLeft13,
  IconNormalSearch24,
  IconX24,
} from "@repo/ui/assets/icons";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { SearchField } from "@repo/ui/components/search-field";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useEffect,
} from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  type StyleReadyProbe,
  useStyleReadyProbe,
} from "#/shared/ui/useStyleReadyProbe";
import {
  closeButton,
  fallbackButton,
  fallbackIconSlot,
  fallbackLabel,
  leadingBackButton,
  searchBarLayer,
  searchBarLayerHome,
  searchControlRow,
  searchField,
  searchFieldWithClose,
  searchInputFrame,
} from "./HomeSearchBar.css";

export interface HomeSearchBarProps {
  onOpenSearch: () => void;
  onBackPress?: () => void;
  onCloseSearchContext?: () => void;
  searchQuery?: string;
  showBackButton?: boolean;
  isSearchContextActive?: boolean;
}

const searchBarLayerFallbackStyle: CSSProperties = {
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 8px)",
  left: "16px",
  right: "16px",
  zIndex: 10,
  display: "flex",
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

export function HomeSearchBar({
  onOpenSearch,
  onBackPress,
  onCloseSearchContext,
  searchQuery = "",
  showBackButton = false,
  isSearchContextActive = false,
}: HomeSearchBarProps) {
  const shouldProbeStyle = !hasHomeSearchBarStyleResolved;
  const { isStyleReady, isStyleTimedOut } = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: HOME_SEARCH_BAR_STYLE_PROBES,
  });
  const handleOpenSearch = () => {
    onOpenSearch();
  };

  const handleCloseSearchContext = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onCloseSearchContext?.();
  };

  const handleClosePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBackPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBackPress = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onBackPress?.();
  };

  useEffect(() => {
    if (shouldProbeStyle && isStyleReady && !isStyleTimedOut) {
      hasHomeSearchBarStyleResolved = true;
    }
  }, [shouldProbeStyle, isStyleReady, isStyleTimedOut]);

  // 폴백은 CSS 가 없을 때만 얹는다. 항상 얹으면 인라인 zIndex 10 이 클래스의 ui
  // 레이어(20)를 덮어써 검색 바가 의도보다 아래 층으로 내려가고, position/top/left
  // /right 도 searchBarLayerHome 대신 인라인 값이 화면을 잡는다.
  const layerStyle =
    !isStyleReady || isStyleTimedOut
      ? {
          ...searchBarLayerFallbackStyle,
          top: isSearchContextActive
            ? searchBarLayerFallbackStyle.top
            : "calc(env(safe-area-inset-top, 0px) + 60px)",
        }
      : undefined;

  return (
    <div
      className={[
        searchBarLayer,
        isSearchContextActive ? "" : searchBarLayerHome,
      ]
        .filter(Boolean)
        .join(" ")}
      style={layerStyle}
    >
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
        <div className={searchControlRow}>
          {showBackButton && onBackPress ? (
            <button
              type="button"
              className={leadingBackButton}
              onPointerDown={handleBackPointerDown}
              onClick={handleBackPress}
              aria-label={m.home_search_back_aria()}
            >
              <IconChevronLeft13 />
            </button>
          ) : null}
          <div className={searchInputFrame}>
            <SearchField
              className={[
                searchField,
                isSearchContextActive ? searchFieldWithClose : "",
              ]
                .filter(Boolean)
                .join(" ")}
              variant="searchHome"
              searchIconPlacement="left"
              placeholder={m.search_placeholder()}
              aria-label={m.search_input_aria()}
              value={isSearchContextActive ? searchQuery : ""}
              textTone={isSearchContextActive ? "on" : "auto"}
              isReadOnly
              onFocus={handleOpenSearch}
            />
            {isSearchContextActive ? (
              <button
                type="button"
                className={closeButton}
                onPointerDown={handleClosePointerDown}
                onClick={handleCloseSearchContext}
                aria-label={m.search_close_aria()}
              >
                <IconX24 />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
