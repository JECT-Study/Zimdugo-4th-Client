import type { StoryObj } from "@storybook/react";
import {
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
} from "#/entities/search/ui/SearchAutocompleteItem";
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

const BASE_ITEM = {
  address: "서울 강남구 영동대로 513",
  updatedLabel: "1시간 전 업데이트",
  categoryLabel: "지하철역",
  distanceLabel: "120m",
} as const;

function createAutocompleteItem(
  itemType: "PLACE" | "LOCKER",
  title: string,
  distanceLabel: string,
): SearchAutocompleteItemData {
  return itemType === "PLACE"
    ? {
        itemType: "PLACE",
        placeId: 10,
        title,
        ...BASE_ITEM,
        distanceLabel,
      }
    : {
        itemType: "LOCKER",
        lockerId: 11,
        title,
        ...BASE_ITEM,
        distanceLabel,
      };
}

const meta = {
  title: "Product/Guides/Name Display/Autocomplete Item",
  component: SearchAutocompleteItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    itemType: {
      control: "inline-radio",
      options: ["PLACE", "LOCKER"],
    },
    locale: {
      control: "inline-radio",
      options: ["ko", "zh", "ja", "en", "all"],
      description: "title(보관함명) 언어 — ko / zh / ja / en / 전체",
    },
    distanceLabel: {
      control: "inline-radio",
      options: ["120m", "12.3km"],
    },
    radius: NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    itemType: "LOCKER",
    locale: "all",
    distanceLabel: "120m",
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

function renderMatrix(
  itemType: "PLACE" | "LOCKER",
  viewport: NameDisplayViewport,
  locale: NameDisplayLocaleSelection,
  distanceLabel: string,
  radius: number,
) {
  const slot =
    distanceLabel === "12.3km"
      ? "search-autocomplete-12km"
      : "search-autocomplete-120m";

  const rows = buildNameDisplayBoundaryRows({
    slot,
    locale,
    viewport,
    radius,
    labelExtra: itemType === "PLACE" ? "place" : "locker",
  }).map((row) => ({
    key: `${row.locale}-${row.length}`,
    label: row.label,
    text: row.text,
    length: row.length,
    node: (
      <NameDisplaySurface surface="search-overlay-item" viewport={viewport}>
        <SearchAutocompleteItem
          item={createAutocompleteItem(itemType, row.text, distanceLabel)}
        />
      </NameDisplaySurface>
    ),
  }));

  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-overlay-item"
      rows={rows}
      note={`언어별 최대폭 문자 반복 · 한중일영 title 각각 2줄 표시 경계 ±${radius}자. worst-case 샘플: 힣 / 囍 / 曜 / W 반복`}
    />
  );
}

export const TwoLineBoundary: Story = {
  render: ({ viewport, itemType, locale, distanceLabel, radius }) =>
    renderMatrix(itemType, viewport, locale, distanceLabel, radius),
};

export const LongDistanceLabel: Story = {
  args: {
    distanceLabel: "12.3km",
  },
  render: ({ viewport, itemType, locale, radius }) =>
    renderMatrix(itemType, viewport, locale, "12.3km", radius),
};
