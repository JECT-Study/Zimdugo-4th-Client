import { languageTag, m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { SearchField } from "@repo/ui/components/search-field";
import {
  IconCheck24,
  IconNormalGlobe32,
  IconNormalSearch24,
  IconX24,
} from "@repo/ui/tokens/icons";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { BASE_LOCALE } from "#/shared/i18n/locales";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
  getLocalizedHref,
  normalizeLanguage,
  useAppLanguageStore,
} from "#/shared/store/language";
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
  languageCheckIcon,
  languageChevron,
  languageDropdown,
  languageDropdownOpen,
  languageOption,
  languageOptionSelected,
  languageOptions,
  languageOptionText,
  languageTrigger,
  languageTriggerLabel,
  searchBarLayer,
  searchField,
  searchFieldWithClose,
  searchInputFrame,
} from "./HomeSearchBar.css";

export interface HomeSearchBarProps {
  onOpenSearch: () => void;
  onCloseSearchContext?: () => void;
  searchQuery?: string;
  isSearchContextActive?: boolean;
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

export function HomeSearchBar({
  onOpenSearch,
  onCloseSearchContext,
  searchQuery = "",
  isSearchContextActive = false,
}: HomeSearchBarProps) {
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const setAppLanguage = useAppLanguageStore((state) => state.setAppLanguage);
  const shouldProbeStyle = !hasHomeSearchBarStyleResolved;
  const { isStyleReady, isStyleTimedOut } = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: HOME_SEARCH_BAR_STYLE_PROBES,
  });
  const currentLanguage = normalizeLanguage(languageTag()) ?? BASE_LOCALE;

  const handleOpenSearch = () => {
    onOpenSearch();
  };

  const handleToggleLanguage = () => {
    setIsLanguageOpen((isOpen) => !isOpen);
  };

  const handleSelectLanguage = (language: AppLanguage) => {
    setIsLanguageOpen(false);
    setAppLanguage(language);

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const localizedHref = getLocalizedHref(currentHref, language);

    if (localizedHref !== currentHref) {
      window.location.assign(localizedHref);
      return;
    }

    if (currentLanguage !== language) {
      window.location.reload();
    }
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

  useEffect(() => {
    if (shouldProbeStyle && isStyleReady && !isStyleTimedOut) {
      hasHomeSearchBarStyleResolved = true;
    }
  }, [shouldProbeStyle, isStyleReady, isStyleTimedOut]);

  useEffect(() => {
    if (!isLanguageOpen) {
      return;
    }

    const handleDocumentPointerDown = (event: globalThis.PointerEvent) => {
      if (!languageDropdownRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isLanguageOpen]);

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
        <>
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
                aria-label={m.home_search_back_aria()}
              >
                <IconX24 />
              </button>
            ) : null}
          </div>
          {!isSearchContextActive ? (
            <div
              ref={languageDropdownRef}
              className={[
                languageDropdown,
                isLanguageOpen ? languageDropdownOpen : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={languageTrigger}
                aria-label={m.settings_language()}
                aria-expanded={isLanguageOpen}
                onClick={handleToggleLanguage}
              >
                <IconNormalGlobe32
                  state={isLanguageOpen ? "selected" : "default"}
                />
                {isLanguageOpen ? (
                  <>
                    <span className={languageTriggerLabel}>
                      {appLanguageLabelMap[currentLanguage]}
                    </span>
                    <span className={languageChevron} aria-hidden />
                  </>
                ) : null}
              </button>
              {isLanguageOpen ? (
                <div className={languageOptions} role="listbox">
                  {APP_LANGUAGES.map((language) => {
                    const isCurrent = language === currentLanguage;
                    return (
                      <button
                        key={language}
                        type="button"
                        className={[
                          languageOption,
                          isCurrent ? languageOptionSelected : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => handleSelectLanguage(language)}
                      >
                        <span className={languageOptionText}>
                          {appLanguageLabelMap[language]}
                        </span>
                        {isCurrent ? (
                          <span className={languageCheckIcon}>
                            <IconCheck24 />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
