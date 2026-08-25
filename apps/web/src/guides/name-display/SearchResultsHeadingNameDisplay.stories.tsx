import { m } from "@repo/i18n";
import type { StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  type BoundaryTextKind,
  buildEllipsisBoundaryRows,
  type EllipsisLocaleSelection,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplaySlotId,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

const meta = {
  title: "Product/Guides/Name Display/Results Heading",
  component: SearchResultsHeading,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    locale: {
      control: "inline-radio",
      options: ["ko", "en", "all"],
      description: "title(보관함명) 언어 — ko / en / 둘 다",
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

function buildHeadingRows(
  viewport: NameDisplayViewport,
  locale: EllipsisLocaleSelection,
  slot: NameDisplaySlotId,
  renderHeading: (text: string) => ReactNode,
  textKind?: BoundaryTextKind,
) {
  return buildEllipsisBoundaryRows({
    slot,
    locale,
    viewport,
    textKind: textKind ?? "place",
  }).map((row) => ({
    key: `${row.locale}-${row.length}`,
    label: row.label,
    node: (
      <NameDisplaySurface surface="search-results-heading" viewport={viewport}>
        {renderHeading(row.text)}
      </NameDisplaySurface>
    ),
  }));
}

export const PlaceScope: Story = {
  render: ({ viewport, locale }) => (
    <NameDisplayMatrix
      width={viewport}
      surface="search-results-heading"
      note={`placeName이 문장에 삽입됨. ellipsis 없음 — ≈경계에서 줄바꿈·가독성 확인. ${PLACE_EXAMPLE_NOTE}`}
      rows={buildHeadingRows(
        viewport,
        locale,
        "search-results-heading-place",
        (place) => (
          <SearchResultsHeading
            queryText="강남"
            titleText={m.search_place_lockers_title({ place })}
          />
        ),
      )}
    />
  ),
};

export const QueryScope: Story = {
  render: ({ viewport, locale }) => (
    <NameDisplayMatrix
      width={viewport}
      surface="search-results-heading"
      note={`검색어(keyword) · 띄어쓰기 포함 경계 ±5자. ellipsis 없음 — 줄바꿈 확인. ${PLACE_EXAMPLE_NOTE}`}
      rows={buildHeadingRows(
        viewport,
        locale,
        "search-results-heading-query",
        (query) => (
          <SearchResultsHeading
            queryText={query}
            subtitleText="강남구 삼성동"
          />
        ),
        "keyword",
      )}
    />
  ),
};
