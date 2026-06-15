import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { SearchListBottomSheet } from "./SearchListBottomSheet";
import type { SearchResultItem } from "./search-list-model";

const STORY_LIST_ITEMS: SearchResultItem[] = [
  {
    itemType: "PLACE",
    placeId: 1,
    title: "코엑스",
    distanceLabel: "120m",
    address: "서울 강남구 영동대로 513",
    distanceMeters: 120,
    lockers: [
      {
        itemType: "LOCKER",
        lockerId: 1,
        title: "코엑스 메가박스 보관함",
        categoryLabel: "복합문화공간",
        updatedLabel: "10분 전 업데이트",
        distanceLabel: "120m",
        address: "서울 강남구 영동대로 513",
      },
      {
        itemType: "LOCKER",
        lockerId: 2,
        title: "코엑스 동문 보관함",
        categoryLabel: "복합문화공간",
        updatedLabel: "1시간 전 업데이트",
        distanceLabel: "240m",
        address: "서울 강남구 영동대로 513",
      },
    ],
  },
];

const meta = {
  title: "Product/Search/Results Bottom Sheet",
  component: SearchListBottomSheet,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: vars.layout.containerWidth,
          height: "100dvh",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchListBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchQuery: "코엑스",
    appLanguage: "ko",
    items: STORY_LIST_ITEMS,
  },
  render: function Render(args) {
    const [innerHeight, setInnerHeight] = useState(
      typeof window !== "undefined" ? window.innerHeight : 800,
    );

    useEffect(() => {
      const handleResize = () => setInnerHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <SearchListBottomSheet
        {...args}
        minSnapPoint={0}
        snapPoint={120}
        maxSnapPoint={innerHeight - 24}
      />
    );
  },
};

export const Empty: Story = {
  args: {
    searchQuery: "없는 보관함",
    appLanguage: "ko",
    items: [],
    minSnapPoint: 0,
    snapPoint: 120,
    maxSnapPoint: 760,
  },
};
