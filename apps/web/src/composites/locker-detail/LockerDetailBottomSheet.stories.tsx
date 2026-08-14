import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  LockerDetailBottomSheet,
  type LockerDetailSheetSnapStage,
  resolveLockerDetailSnapPoints,
} from "./LockerDetailBottomSheet";

type DetailNamePattern = "full-name" | "structured";
type RealtimeAvailabilityMode = "available" | "full" | "unavailable";
type StorySnapStage = Extract<
  LockerDetailSheetSnapStage,
  "full" | "half" | "mini"
>;

interface LockerDetailBottomSheetStoryArgs {
  namePattern: DetailNamePattern;
  snapStage: StorySnapStage;
  realtimeAvailabilityMode: RealtimeAvailabilityMode;
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
    operatingHoursLabel: "Open 24 hours",
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
    operatingHoursLabel: "Open 24 hours",
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

const REALTIME_AVAILABILITY_FIXTURES: Record<
  RealtimeAvailabilityMode,
  LockerDetailItem["realtimeAvailability"]
> = {
  available: {
    isAvailable: true,
    smallAvailableCount: 12,
    mediumAvailableCount: 2,
    largeAvailableCount: 0,
    fetchedAt: "2026-08-14T14:19:47.013473",
  },
  full: {
    isAvailable: true,
    smallAvailableCount: 0,
    mediumAvailableCount: 0,
    largeAvailableCount: 0,
    fetchedAt: "2026-08-14T14:19:47.013473",
  },
  unavailable: null,
};

function LockerDetailBottomSheetStory({
  namePattern,
  snapStage,
  realtimeAvailabilityMode,
}: LockerDetailBottomSheetStoryArgs) {
  const [innerHeight, setInnerHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 812,
  );
  const snapPoints = useMemo(
    () => resolveLockerDetailSnapPoints({ windowHeight: innerHeight }),
    [innerHeight],
  );
  const locker = useMemo<LockerDetailItem>(
    () => ({
      ...LOCKER_DETAIL_VARIANTS[namePattern],
      realtimeAvailability:
        REALTIME_AVAILABILITY_FIXTURES[realtimeAvailabilityMode],
    }),
    [namePattern, realtimeAvailabilityMode],
  );
  const initialSnapPoints: Record<StorySnapStage, number> = {
    full: snapPoints.minSnapPoint,
    half: snapPoints.snapPoint,
    mini: snapPoints.miniSnapPoint,
  };

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
      initialSnapPoint={initialSnapPoints[snapStage]}
      maxSnapPoint={snapPoints.maxSnapPoint}
      onBack={() => undefined}
      onFavoriteChange={() => undefined}
      onShare={() => undefined}
      onReport={() => undefined}
      onNavigate={() => undefined}
    />
  );
}

const meta = {
  title: "Product/Locker Detail/Bottom Sheet",
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
      options: ["full", "half", "mini"],
    },
    realtimeAvailabilityMode: {
      control: "inline-radio",
      options: ["available", "full", "unavailable"],
    },
  },
  args: {
    namePattern: "structured",
    snapStage: "half",
    realtimeAvailabilityMode: "available",
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

export const Full: Story = {
  args: {
    snapStage: "full",
  },
};

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

export const RealtimeFull: Story = {
  args: {
    snapStage: "half",
    realtimeAvailabilityMode: "full",
  },
};

export const RealtimeUnavailable: Story = {
  args: {
    snapStage: "half",
    realtimeAvailabilityMode: "unavailable",
  },
};
