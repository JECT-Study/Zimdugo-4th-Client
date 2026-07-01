import type { ReactNode } from "react";
import {
  listScrollArea,
  listStack,
  sheetColumn,
} from "#/composites/search/SearchListBottomSheet.css.ts";
import { accordionChildren } from "#/entities/search/ui/SearchList.css.ts";
import { inSheetHeader } from "#/features/search/ui/search-results-heading/SearchResultsHeading.css.ts";
import { childContent } from "#/routes/-my.css.ts";
import type { NameDisplayViewport } from "./name-display-matrix";

/** 검색 리스트 행 종류별 title 2줄 표시 폭에 영향을 주는 chrome 차이 */
export type SearchListRowVariant = "place" | "locker" | "nested-locker";

export type NameDisplaySurfaceId =
  | "search-list-bottom-sheet"
  | "search-overlay-item"
  | "search-results-heading"
  | "my-favorite-list"
  | "my-report-list"
  | "report-detail-title";

const SIDE_PADDING = {
  sheet: 20,
  myPage: 16,
  card: 12,
  itemInline: 20,
} as const;

const MARKER_WIDTH = 40;
const SEARCH_LIST_MARKER_GAP = 8;
const SEARCH_LIST_ACTION_GAP = 12;
const SEARCH_LIST_ARROW_WIDTH = 24;
const SEARCH_LIST_FAVORITE_WIDTH = 24;
const SEARCH_LIST_NESTED_INDENT = 32;
const AUTOCOMPLETE_TRAILING_WIDTH = 54;
const FAVORITE_ACTION_GAP = 12;
const FAVORITE_BUTTON_WIDTH = 24;
const FAVORITE_MARKER_GAP = 12;
const REPORT_IMAGE_WIDTH = 76;
const REPORT_GRID_GAP = 12;
const REPORT_CHEVRON_WIDTH = 20;

function getSearchListTitleWidth(
  viewport: NameDisplayViewport,
  rowVariant: SearchListRowVariant,
): number {
  const sheetContent = viewport - SIDE_PADDING.sheet * 2;
  const indent = rowVariant === "nested-locker" ? SEARCH_LIST_NESTED_INDENT : 0;
  const trailingChrome =
    rowVariant === "place"
      ? SEARCH_LIST_ACTION_GAP + SEARCH_LIST_ARROW_WIDTH
      : SEARCH_LIST_ACTION_GAP + SEARCH_LIST_FAVORITE_WIDTH;

  return (
    sheetContent -
    indent -
    MARKER_WIDTH -
    SEARCH_LIST_MARKER_GAP -
    trailingChrome
  );
}

export function getNameDisplayContentWidth(
  surface: NameDisplaySurfaceId,
  viewport: NameDisplayViewport,
  searchListRowVariant: SearchListRowVariant = "place",
): number {
  switch (surface) {
    case "search-list-bottom-sheet":
      return getSearchListTitleWidth(viewport, searchListRowVariant);
    case "search-results-heading":
    case "report-detail-title":
      return viewport - SIDE_PADDING.sheet * 2;
    case "search-overlay-item":
      return (
        viewport -
        SIDE_PADDING.itemInline * 2 -
        MARKER_WIDTH -
        SEARCH_LIST_MARKER_GAP -
        AUTOCOMPLETE_TRAILING_WIDTH
      );
    case "my-favorite-list":
      return (
        viewport -
        SIDE_PADDING.myPage * 2 -
        SIDE_PADDING.itemInline * 2 -
        FAVORITE_ACTION_GAP -
        FAVORITE_BUTTON_WIDTH -
        MARKER_WIDTH -
        FAVORITE_MARKER_GAP
      );
    case "my-report-list":
      return (
        viewport -
        SIDE_PADDING.myPage * 2 -
        SIDE_PADDING.card * 2 -
        REPORT_IMAGE_WIDTH -
        REPORT_GRID_GAP * 2 -
        REPORT_CHEVRON_WIDTH
      );
  }
}

interface NameDisplaySurfaceProps {
  surface: NameDisplaySurfaceId;
  viewport: NameDisplayViewport;
  children: ReactNode;
}

export function NameDisplaySurface({
  surface,
  viewport,
  children,
}: NameDisplaySurfaceProps) {
  const frameStyle = {
    width: viewport,
    maxWidth: "100%",
    margin: "0 auto",
    boxSizing: "border-box" as const,
    background: "#fff",
  };

  switch (surface) {
    case "search-list-bottom-sheet":
      return (
        <div style={frameStyle}>
          <div
            className={sheetColumn}
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            <div
              className={listScrollArea}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <div className={listStack}>{children}</div>
            </div>
          </div>
        </div>
      );
    case "search-overlay-item":
      return <div style={frameStyle}>{children}</div>;
    case "search-results-heading":
      return (
        <div style={frameStyle}>
          <div
            className={sheetColumn}
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            <div className={inSheetHeader}>{children}</div>
          </div>
        </div>
      );
    case "my-favorite-list":
      return (
        <div style={frameStyle}>
          <div
            className={childContent}
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            {children}
          </div>
        </div>
      );
    case "my-report-list":
      return (
        <div style={frameStyle}>
          <div
            className={childContent}
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            {children}
          </div>
        </div>
      );
    case "report-detail-title":
      return <div style={frameStyle}>{children}</div>;
  }
}

export function NameDisplayNestedLockerShell({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={accordionChildren}>{children}</div>;
}
