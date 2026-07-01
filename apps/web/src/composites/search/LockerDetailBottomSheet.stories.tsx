import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import {
  LockerDetailBottomSheet,
  type LockerDetailItem,
  type LockerDetailSheetSnapStage,
  resolveLockerDetailSnapPoints,
} from "./LockerDetailBottomSheet";

type DetailNamePattern = "full-name" | "structured";

interface LockerDetailBottomSheetStoryArgs {
  namePattern: DetailNamePattern;
  snapStage: Extract<LockerDetailSheetSnapStage, "half" | "mini">;
}

const LONG_FULL_NAME =
  "Cheongnyangni Station Lotte Department Store Next to the automatic payment machine in the B5th floor parking lot";

const LOCKER_DETAIL_VARIANTS: Record<DetailNamePattern, LockerDetailItem> = {
  "full-name": {
    itemType: "LOCKER",
    lockerId: 101,
    title: LONG_FULL_NAME,
    categoryLabel: "Department store",
    updatedLabel: "1 hour ago",
    distanceLabel: "240m",
    address: "Cheongnyangni Station Lotte Department Store",
    floorLabel: "B5 parking lot · Next to the automatic payment machine",
    operatingHoursLabel: "24 hours",
    priceLabel: "From KRW 2,000",
    sizeLabel: "S / M / L",
    detailHelpText:
      "Use the payment machine landmark after entering the B5 parking lot.",
    accurateCount: 28,
    inaccurateCount: 2,
    lastUpdatedLabel: "Updated 2026-07-01 10:20",
    isFavorite: true,
  },
  structured: {
    itemType: "LOCKER",
    lockerId: 102,
    title: "Cheongnyangni Station · Lotte Dept. Store",
    categoryLabel: "Department store",
    updatedLabel: "1 hour ago",
    distanceLabel: "240m",
    address: "Lotte Dept. Store · B5 Parking",
    floorLabel: "Next to payment machine",
    operatingHoursLabel: "24 hours",
    priceLabel: "From KRW 2,000",
    sizeLabel: "S / M / L",
    detailHelpText:
      "Use the payment machine landmark after entering the B5 parking lot.",
    accurateCount: 28,
    inaccurateCount: 2,
    lastUpdatedLabel: "Updated 2026-07-01 10:20",
    isFavorite: true,
  },
};

function LockerDetailBottomSheetStory({
  namePattern,
  snapStage,
}: LockerDetailBottomSheetStoryArgs) {
  const [innerHeight, setInnerHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 812,
  );
  const locker = LOCKER_DETAIL_VARIANTS[namePattern];
  const snapPoints = useMemo(
    () => resolveLockerDetailSnapPoints({ windowHeight: innerHeight }),
    [innerHeight],
  );
  const initialSnapPoint =
    snapStage === "mini" ? snapPoints.miniSnapPoint : snapPoints.snapPoint;

  useEffect(() => {
    const handleResize = () => setInnerHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <LockerDetailBottomSheet
      locker={locker}
      minSnapPoint={snapPoints.minSnapPoint}
      snapPoint={snapPoints.snapPoint}
      initialSnapPoint={initialSnapPoint}
      maxSnapPoint={snapPoints.maxSnapPoint}
      onBack={() => undefined}
      onFavoriteChange={() => undefined}
      onShare={() => undefined}
      onNavigate={() => undefined}
      onVoteChange={() => undefined}
    />
  );
}

const meta = {
  title: "Product/Search/Locker Detail Bottom Sheet",
  component: LockerDetailBottomSheetStory,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    namePattern: {
      control: "inline-radio",
      options: ["full-name", "structured"],
    },
    snapStage: {
      control: "inline-radio",
      options: ["half", "mini"],
    },
  },
  args: {
    namePattern: "structured",
    snapStage: "half",
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
} satisfies Meta<LockerDetailBottomSheetStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Half: Story = {
  args: {
    snapStage: "half",
  },
};

export const Mini: Story = {
  args: {
    snapStage: "mini",
  },
};
