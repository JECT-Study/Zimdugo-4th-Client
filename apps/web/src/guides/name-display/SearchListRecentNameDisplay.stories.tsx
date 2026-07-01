import type { StoryObj } from "@storybook/react";
import type { SearchListRecentKind } from "#/entities/search/ui/SearchListRecent";
import { SearchListRecent } from "#/entities/search/ui/SearchListRecent";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_BOUNDARY_RADIUS,
  NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocaleSelection,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: 힣 / 囍 / 曜 / W 반복";

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
      options: ["ko", "zh", "ja", "en", "all"],
      description: "title(보관함명) 언어 — ko / zh / ja / en / 전체",
    },
    dateLabel: {
      control: "inline-radio",
      options: ["방금", "2일 전"],
    },
    radius: NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    historyKind: "place",
    locale: "all",
    dateLabel: "2일 전",
    radius: NAME_DISPLAY_BOUNDARY_RADIUS,
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
  locale: NameDisplayLocaleSelection,
  dateLabel: string,
  radius: number,
) {
  const rows = buildNameDisplayBoundaryRows({
    slot: "search-recent",
    locale,
    viewport,
    radius,
    labelExtra: historyKind,
  }).map((row) => ({
    key: `${row.locale}-${row.length}`,
    label: row.label,
    text: row.text,
    length: row.length,
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
      note={`최근검색(${historyKind}) · 14px title · 2줄 표시 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`}
    />
  );
}

export const TwoLineBoundary: Story = {
  render: ({ viewport, historyKind, locale, dateLabel, radius }) =>
    renderRecentMatrix(viewport, historyKind, locale, dateLabel, radius),
};

export const PlaceHistory: Story = {
  args: { historyKind: "place" },
  render: ({ viewport, locale, dateLabel, radius }) =>
    renderRecentMatrix(viewport, "place", locale, dateLabel, radius),
};

export const LockerHistory: Story = {
  args: { historyKind: "locker" },
  render: ({ viewport, locale, dateLabel, radius }) =>
    renderRecentMatrix(viewport, "locker", locale, dateLabel, radius),
};

export const KeywordHistory: Story = {
  args: { historyKind: "keyword" },
  render: ({ viewport, locale, dateLabel, radius }) =>
    renderRecentMatrix(viewport, "keyword", locale, dateLabel, radius),
};
