import type { StoryObj } from "@storybook/react";
import type { SearchListRecentKind } from "#/entities/search/ui/SearchListRecent";
import { SearchListRecent } from "#/entities/search/ui/SearchListRecent";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  type EllipsisLocaleSelection,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

const meta = {
  title: "Product/Guides/Name Display/Recent Search",
  component: SearchListRecent,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    historyKind: {
      control: "inline-radio",
      options: ["keyword", "place", "locker"],
    },
    locale: {
      control: "inline-radio",
      options: ["ko", "en", "all"],
      description: "title(보관함명) 언어 — ko / en / 둘 다",
    },
    dateLabel: {
      control: "inline-radio",
      options: ["방금", "2일 전"],
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    historyKind: "place",
    locale: "all",
    dateLabel: "2일 전",
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

function renderRecentMatrix(
  viewport: NameDisplayViewport,
  historyKind: SearchListRecentKind,
  locale: EllipsisLocaleSelection,
  dateLabel: string,
) {
  const rows = buildEllipsisBoundaryRows({
    slot: "search-recent",
    locale,
    viewport,
    labelExtra: historyKind,
  }).map((row) => ({
    key: `${row.locale}-${row.length}`,
    label: row.label,
    node: (
      <NameDisplaySurface surface="search-overlay-item" viewport={viewport}>
        <SearchListRecent
          historyKind={historyKind}
          dateLabel={dateLabel}
          onPress={() => undefined}
          onRemove={() => undefined}
        >
          {row.text}
        </SearchListRecent>
      </NameDisplaySurface>
    ),
  }));

  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-overlay-item"
      rows={rows}
      note={`최근검색(${historyKind}) · 14px title · 말줄임 경계 ±5자. ${PLACE_EXAMPLE_NOTE}`}
    />
  );
}

export const EllipsisBoundary: Story = {
  render: ({ viewport, historyKind, locale, dateLabel }) =>
    renderRecentMatrix(viewport, historyKind, locale, dateLabel),
};

export const PlaceHistory: Story = {
  args: { historyKind: "place" },
  render: ({ viewport, locale, dateLabel }) =>
    renderRecentMatrix(viewport, "place", locale, dateLabel),
};

export const LockerHistory: Story = {
  args: { historyKind: "locker" },
  render: ({ viewport, locale, dateLabel }) =>
    renderRecentMatrix(viewport, "locker", locale, dateLabel),
};

export const KeywordHistory: Story = {
  args: { historyKind: "keyword" },
  render: ({ viewport, locale, dateLabel }) =>
    renderRecentMatrix(viewport, "keyword", locale, dateLabel),
};
