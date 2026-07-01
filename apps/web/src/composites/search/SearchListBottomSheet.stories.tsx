import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { SearchListResult } from "#/entities/search";
import { SearchListBottomSheet } from "./SearchListBottomSheet";
import type {
  SearchPlaceResultItem,
  SearchResultItem,
} from "./search-list-model";

const STORY_PLACE_ITEM: SearchPlaceResultItem = {
  itemType: "PLACE",
  placeId: 1,
  title: "COEX",
  distanceLabel: "120m",
  address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
  distanceMeters: 120,
  lockers: [
    {
      itemType: "LOCKER",
      lockerId: 1,
      title: "COEX Mall Mega Box locker",
      categoryLabel: "Culture space",
      updatedLabel: "Updated 10 min ago",
      distanceLabel: "120m",
      address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
    },
    {
      itemType: "LOCKER",
      lockerId: 2,
      title: "COEX East Gate locker",
      categoryLabel: "Station",
      updatedLabel: "Updated 1 hour ago",
      distanceLabel: "240m",
      address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
    },
    {
      itemType: "LOCKER",
      lockerId: 3,
      title: "COEX B1 information desk locker",
      categoryLabel: "Public space",
      updatedLabel: "Updated yesterday",
      distanceLabel: "310m",
      address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
    },
  ],
};

const STORY_LIST_ITEMS: SearchResultItem[] = [STORY_PLACE_ITEM];

const useInnerHeight = () => {
  const [innerHeight, setInnerHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );

  useEffect(() => {
    const handleResize = () => setInnerHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return innerHeight;
};

function BulletPlacePreviewContent() {
  return (
    <SearchListResult
      item={STORY_PLACE_ITEM}
      isExpanded={false}
      onToggle={() => undefined}
    />
  );
}

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
          width: vars.layout.designWidth,
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
    searchQuery: "COEX",
    appLanguage: "en",
    items: STORY_LIST_ITEMS,
  },
  render: function Render(args) {
    const innerHeight = useInnerHeight();

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
    searchQuery: "Unknown locker",
    appLanguage: "en",
    items: [],
    minSnapPoint: 0,
    snapPoint: 120,
    maxSnapPoint: 760,
  },
};

export const BulletPlacePreview: Story = {
  args: {
    searchQuery: "COEX",
    appLanguage: "en",
    items: STORY_LIST_ITEMS,
  },
  render: function Render(args) {
    const innerHeight = useInnerHeight();

    return (
      <SearchListBottomSheet
        {...args}
        minSnapPoint={0}
        snapPoint={120}
        maxSnapPoint={innerHeight - 24}
      >
        <BulletPlacePreviewContent />
      </SearchListBottomSheet>
    );
  },
};
