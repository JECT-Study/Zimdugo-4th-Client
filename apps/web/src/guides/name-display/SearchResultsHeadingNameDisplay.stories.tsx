import { m } from "@repo/i18n";
import type { StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  type BoundaryTextKind,
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocaleSelection,
  type NameDisplaySlotId,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: 힣 / 囍 / 曜 / W 반복";

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
      options: ["ko", "zh", "ja", "en", "all"],
      description: "title(보관함명) 언어 — ko / zh / ja / en / 전체",
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
  locale: NameDisplayLocaleSelection,
  slot: NameDisplaySlotId,
  renderHeading: (text: string) => ReactNode,
  textKind?: BoundaryTextKind,
) {
  return buildNameDisplayBoundaryRows({
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
      note={`placeName이 문장에 삽입됨. 최대 2줄 기준으로 줄바꿈·가독성 확인. ${PLACE_EXAMPLE_NOTE}`}
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
      note={`검색어(keyword) · 최대폭 문자 반복 경계 ±5자. 최대 2줄 기준으로 줄바꿈 확인. ${PLACE_EXAMPLE_NOTE}`}
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
