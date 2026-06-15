import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import {
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
} from "./SearchAutocompleteItem";

const PLACE_AUTOCOMPLETE_ITEM: SearchAutocompleteItemData = {
  itemType: "PLACE",
  placeId: 10,
  title: "신촌역 1번 출구",
  address: "서울 서대문구 창천동",
  updatedLabel: "9시간 전 업데이트",
  categoryLabel: "지하철역",
  distanceLabel: "120m",
};

const LOCKER_AUTOCOMPLETE_ITEM: SearchAutocompleteItemData = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 B2층 물품보관함",
  address: "서울 서대문구 신촌로 83",
  updatedLabel: "4시간 전 업데이트",
  categoryLabel: "지하철역",
  distanceLabel: "210m",
};

const meta = {
  title: "Product/Search/Autocomplete Item",
  component: SearchAutocompleteItem,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: ComponentType) => (
      <div style={{ width: "375px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchAutocompleteItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Place: Story = {
  args: {
    item: PLACE_AUTOCOMPLETE_ITEM,
  },
};

export const Locker: Story = {
  args: {
    item: LOCKER_AUTOCOMPLETE_ITEM,
  },
};
