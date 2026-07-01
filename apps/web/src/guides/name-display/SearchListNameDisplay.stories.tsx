import type { StoryObj } from "@storybook/react";
import type { ComponentType, ReactNode } from "react";
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
  buildNameDisplayControlSample,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_LENGTH_ARG_TYPE,
  NAME_DISPLAY_LOCALE_ARG_TYPE,
  NAME_DISPLAY_SAMPLE_NOTE,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocale,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

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
    rowVariant: {
      control: "inline-radio",
      options: ["place", "locker", "nested-locker"],
    },
    locale: {
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "title 언어 — en / ko / zh / ja",
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    rowVariant: "place",
    locale: "en",
    length: 28,
  },
  decorators: [
    (Story: ComponentType) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

interface NameDisplayStoryArgs {
  viewport: NameDisplayViewport;
  rowVariant: SearchListRowVariant;
  locale: NameDisplayLocale;
  length: number;
}

type Story = StoryObj<NameDisplayStoryArgs>;

function renderSearchListMatrix(
  viewport: NameDisplayViewport,
  locale: NameDisplayLocale,
  searchListRowVariant: SearchListRowVariant,
  length: number,
  note: string,
  renderItem: (title: string) => ReactNode,
) {
  const sample = buildNameDisplayControlSample({
    locale,
    length,
  });

  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-list-bottom-sheet"
      searchListRowVariant={searchListRowVariant}
      note={note}
      rows={[
        {
          key: `${sample.locale}-${searchListRowVariant}-${sample.length}`,
          label: `${sample.label} · ${searchListRowVariant}`,
          text: sample.text,
          length: sample.length,
          node: (
            <NameDisplaySurface
              surface="search-list-bottom-sheet"
              viewport={viewport}
            >
              {renderItem(sample.text)}
            </NameDisplaySurface>
          ),
        },
      ]}
    />
  );
}

export const Interactive: Story = {
  render: ({ viewport, rowVariant, locale, length }) => {
    const renderers: Record<
      SearchListRowVariant,
      {
        note: string;
        renderItem: (title: string) => ReactNode;
      }
    > = {
      place: {
        note: `placeName · SearchListBottomSheet listStack과 동일 래퍼. ${NAME_DISPLAY_SAMPLE_NOTE}`,
        renderItem: (title) => (
          <SearchListResult
            item={createPlace(title)}
            isExpanded={false}
            onToggle={() => undefined}
          />
        ),
      },
      locker: {
        note: `lockerName · marker·즐겨찾기 chrome 반영 title 폭. ${NAME_DISPLAY_SAMPLE_NOTE}`,
        renderItem: (title) => (
          <SearchLockerResult
            item={createLocker(title, 99)}
            onPress={() => undefined}
          />
        ),
      },
      "nested-locker": {
        note: `nested lockerName · accordion 들여쓰기(32px) 반영. ${NAME_DISPLAY_SAMPLE_NOTE}`,
        renderItem: (title) => (
          <NameDisplayNestedLockerShell>
            <SearchLockerResult
              item={createLocker(title, 100)}
              isNested
              onPress={() => undefined}
            />
          </NameDisplayNestedLockerShell>
        ),
      },
    };
    const renderer = renderers[rowVariant];

    return renderSearchListMatrix(
      viewport,
      locale,
      rowVariant,
      length,
      renderer.note,
      renderer.renderItem,
    );
  },
};
