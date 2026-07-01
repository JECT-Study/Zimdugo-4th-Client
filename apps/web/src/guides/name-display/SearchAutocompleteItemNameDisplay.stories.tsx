import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import {
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
} from "#/entities/search/ui/SearchAutocompleteItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
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
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "title 언어 — en / ko / zh / ja",
    },
    distanceLabel: {
      control: "inline-radio",
      options: ["120m", "12.3km"],
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    itemType: "LOCKER",
    locale: "en",
    distanceLabel: "120m",
    length: 32,
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
  itemType: "PLACE" | "LOCKER";
  locale: NameDisplayLocale;
  distanceLabel: string;
  length: number;
}

type Story = StoryObj<NameDisplayStoryArgs>;

const renderMatrix = ({
  itemType,
  viewport,
  locale,
  distanceLabel,
  length,
}: NameDisplayStoryArgs) => {
  const sample = buildNameDisplayControlSample({
    locale,
    length,
  });

  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-overlay-item"
      rows={[
        {
          key: `${sample.locale}-${itemType}-${distanceLabel}-${sample.length}`,
          label: `${sample.label} · ${itemType} · ${distanceLabel}`,
          text: sample.text,
          length: sample.length,
          node: (
            <NameDisplaySurface
              surface="search-overlay-item"
              viewport={viewport}
            >
              <SearchAutocompleteItem
                item={createAutocompleteItem(
                  itemType,
                  sample.text,
                  distanceLabel,
                )}
              />
            </NameDisplaySurface>
          ),
        },
      ]}
      note={`title · itemType/distanceLabel/언어/글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
    />
  );
};

export const Interactive: Story = {
  render: (args) => renderMatrix(args),
};
