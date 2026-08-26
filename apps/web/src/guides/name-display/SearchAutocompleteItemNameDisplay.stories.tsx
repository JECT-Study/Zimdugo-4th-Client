import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import {
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
} from "#/entities/search/ui/SearchAutocompleteItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  type EllipsisLocaleSelection,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
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

/**
 * 스토리 전용 args.
 *
 * viewport·locale 은 컨트롤로만 쓰는 값이라 컴포넌트 props 에 없다. 타입을 주지
 * 않으면 Storybook 이 component 에서 args 를 추론해 이 둘을 모르는 것으로 본다.
 */
type NameDisplayStoryArgs = ComponentProps<typeof SearchAutocompleteItem> & {
  viewport: NameDisplayViewport;
  locale: EllipsisLocaleSelection;
  // 컴포넌트에서는 item 안에 들어 있는 값이라 최상위 prop 이 아니다.
  itemType: "PLACE" | "LOCKER";
  distanceLabel: string;
};

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
      options: ["ko", "en", "all"],
      description: "title(보관함명) 언어 — ko / en / 둘 다",
    },
    distanceLabel: {
      control: "inline-radio",
      options: ["120m", "12.3km"],
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    itemType: "LOCKER",
    locale: "all",
    distanceLabel: "120m",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<NameDisplayStoryArgs>;

export default meta;

type Story = StoryObj<NameDisplayStoryArgs>;

function renderMatrix(
  itemType: "PLACE" | "LOCKER",
  viewport: NameDisplayViewport,
  locale: EllipsisLocaleSelection,
  distanceLabel: string,
) {
  const slot =
    distanceLabel === "12.3km"
      ? "search-autocomplete-12km"
      : "search-autocomplete-120m";

  const rows = buildEllipsisBoundaryRows({
    slot,
    locale,
    viewport,
    labelExtra: itemType === "PLACE" ? "place" : "locker",
  }).map((row) => ({
    key: `${row.locale}-${row.length}`,
    label: row.label,
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
      note="장소형 예시(띄어쓰기 포함) · 한글/영문 title 각각 말줄임 경계 ±5자. 예: 강남역 교보타워 5층 안내데스크 맞은편"
    />
  );
}

export const EllipsisBoundary: Story = {
  render: ({ viewport, itemType, locale, distanceLabel }) =>
    renderMatrix(itemType, viewport, locale, distanceLabel),
};

export const LongDistanceLabel: Story = {
  args: {
    distanceLabel: "12.3km",
  },
  render: ({ viewport, itemType, locale }) =>
    renderMatrix(itemType, viewport, locale, "12.3km"),
};
