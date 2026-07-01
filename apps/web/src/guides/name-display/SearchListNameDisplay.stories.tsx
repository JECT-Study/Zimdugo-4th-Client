import type { StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
} from "#/composites/search/search-list-model";
import {
  SearchListResult,
  SearchLockerResult,
} from "#/entities/search/ui/SearchListResult";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import {
  NameDisplayNestedLockerShell,
  NameDisplaySurface,
  type SearchListRowVariant,
} from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_BOUNDARY_RADIUS,
  NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocaleSelection,
  type NameDisplaySlotId,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: 힣 / 囍 / 曜 / W 반복";

const BASE_ADDRESS = "서울특별시 강남구 도곡로 401";

function createLocker(title: string, lockerId: number): SearchLockerResultItem {
  return {
    itemType: "LOCKER",
    lockerId,
    title,
    categoryLabel: "지하철역",
    updatedLabel: "2일 전 업데이트",
    distanceLabel: "2.3km",
    address: BASE_ADDRESS,
    isFavorite: false,
  };
}

function createPlace(title: string): SearchPlaceResultItem {
  return {
    itemType: "PLACE",
    placeId: 1,
    title,
    distanceLabel: "18m",
    address: "서울특별시 강남구 강남대로 지하 396",
    lockers: [
      createLocker("보조 보관함 A", 1),
      createLocker("보조 보관함 B", 2),
    ],
  };
}

const meta = {
  title: "Product/Guides/Name Display/Search List",
  component: SearchListResult,
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
    radius: NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
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

function buildRows(
  viewport: NameDisplayViewport,
  locale: NameDisplayLocaleSelection,
  slot: NameDisplaySlotId,
  radius: number,
  renderItem: (title: string) => ReactNode,
) {
  return buildNameDisplayBoundaryRows({ slot, locale, viewport, radius }).map(
    (row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
      text: row.text,
      length: row.length,
      node: (
        <NameDisplaySurface
          surface="search-list-bottom-sheet"
          viewport={viewport}
        >
          {renderItem(row.text)}
        </NameDisplaySurface>
      ),
    }),
  );
}

function renderSearchListMatrix(
  viewport: NameDisplayViewport,
  locale: NameDisplayLocaleSelection,
  slot: NameDisplaySlotId,
  searchListRowVariant: SearchListRowVariant,
  radius: number,
  note: string,
  renderItem: (title: string) => ReactNode,
) {
  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-list-bottom-sheet"
      searchListRowVariant={searchListRowVariant}
      note={note}
      rows={buildRows(viewport, locale, slot, radius, renderItem)}
    />
  );
}

export const PlaceRow: Story = {
  render: ({ viewport, locale, radius }) =>
    renderSearchListMatrix(
      viewport,
      locale,
      "search-list-place",
      "place",
      radius,
      `placeName · SearchListBottomSheet listStack과 동일 래퍼 · 2줄 표시 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`,
      (title) => (
        <SearchListResult
          item={createPlace(title)}
          isExpanded={false}
          onToggle={() => undefined}
        />
      ),
    ),
};

export const LockerRow: Story = {
  render: ({ viewport, locale, radius }) =>
    renderSearchListMatrix(
      viewport,
      locale,
      "search-list-locker",
      "locker",
      radius,
      `lockerName · marker·즐겨찾기 chrome 반영 title 폭 · 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`,
      (title) => (
        <SearchLockerResult
          item={createLocker(title, 99)}
          onPress={() => undefined}
        />
      ),
    ),
};

export const NestedLockerRow: Story = {
  render: ({ viewport, locale, radius }) =>
    renderSearchListMatrix(
      viewport,
      locale,
      "search-list-nested-locker",
      "nested-locker",
      radius,
      `nested lockerName · accordion 들여쓰기(32px) 반영 · 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`,
      (title) => (
        <NameDisplayNestedLockerShell>
          <SearchLockerResult
            item={createLocker(title, 100)}
            isNested
            onPress={() => undefined}
          />
        </NameDisplayNestedLockerShell>
      ),
    ),
};
