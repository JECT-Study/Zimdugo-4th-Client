import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
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

const FIELD_STACK_DETAIL = {
  placeName: "Cheongnyangni Station",
  areaName: "Lotte Dept. Store · B5 Parking",
  locationHint: "Next to payment machine",
  categoryLabel: "Department store",
  operatingHoursLabel: "Open 24 hours",
  distanceLabel: "240m",
  address: "Lotte Dept. Store · B5 Parking",
} as const;

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

const previewSheetStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  bottom: 0,
  left: 0,
  height: "246px",
  overflow: "hidden",
  borderTopLeftRadius: vars.radius[16],
  borderTopRightRadius: vars.radius[16],
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[3],
};

const previewHandleStyle: CSSProperties = {
  width: "36px",
  height: "4px",
  margin: `${vars.spacing[8]} auto ${vars.spacing[4]}`,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.border.default,
};

const previewContentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  padding: `0 ${vars.spacing[16]}`,
};

const previewSummaryStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: vars.spacing[8],
  alignItems: "start",
  padding: `${vars.spacing[8]} ${vars.spacing[4]}`,
};

const previewNameStackStyle: CSSProperties = {
  display: "flex",
  minWidth: 0,
  flexDirection: "column",
  gap: "2px",
};

const oneLineTextStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const placeNameStyle: CSSProperties = {
  ...oneLineTextStyle,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
};

const areaNameStyle: CSSProperties = {
  ...oneLineTextStyle,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "20px",
};

const locationHintStyle: CSSProperties = {
  ...oneLineTextStyle,
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
};

const previewMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  gap: vars.spacing[8],
  overflow: "hidden",
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
};

const previewDotStyle: CSSProperties = {
  width: "2px",
  height: "2px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.text.disable,
};

const previewIconButtonStyle: CSSProperties = {
  width: "24px",
  height: "24px",
  flexShrink: 0,
  border: 0,
  borderRadius: vars.radius[4],
  background: "transparent",
  color: vars.color.text.disable,
};

const previewDividerStyle: CSSProperties = {
  height: "1px",
  margin: `0 -${vars.spacing[16]}`,
  backgroundColor: vars.color.border.default,
};

const previewDetailRowsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  padding: `0 ${vars.spacing[4]}`,
};

const previewDetailRowStyle: CSSProperties = {
  display: "flex",
  gap: vars.spacing[12],
  alignItems: "flex-start",
  minWidth: 0,
};

const previewDetailIconStyle: CSSProperties = {
  width: "32px",
  height: "32px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.brand.default,
};

const previewDetailTextStyle: CSSProperties = {
  display: "flex",
  minWidth: 0,
  flexDirection: "column",
  gap: "2px",
};

const previewDetailTitleStyle: CSSProperties = {
  ...oneLineTextStyle,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "20px",
};

const previewDetailDescriptionStyle: CSSProperties = {
  ...oneLineTextStyle,
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
};

function LockerDetailBottomSheetStory({
  namePattern,
  snapStage,
}: LockerDetailBottomSheetStoryArgs) {
  const [innerHeight, setInnerHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 812,
  );
  const snapPoints = useMemo(
    () => resolveLockerDetailSnapPoints({ windowHeight: innerHeight }),
    [innerHeight],
  );
  const locker = LOCKER_DETAIL_VARIANTS[namePattern];
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

function FieldStackHalfPreview() {
  return (
    <div style={previewSheetStyle}>
      <div style={previewHandleStyle} />
      <div style={previewContentStyle}>
        <section style={previewSummaryStyle}>
          <div style={previewNameStackStyle}>
            <span style={placeNameStyle}>{FIELD_STACK_DETAIL.placeName}</span>
            <span style={areaNameStyle}>{FIELD_STACK_DETAIL.areaName}</span>
            <span style={locationHintStyle}>
              {FIELD_STACK_DETAIL.locationHint}
            </span>
            <span style={previewMetaStyle}>
              <span>{FIELD_STACK_DETAIL.categoryLabel}</span>
              <span style={previewDotStyle} aria-hidden="true" />
              <span>{FIELD_STACK_DETAIL.operatingHoursLabel}</span>
            </span>
          </div>
          <button
            type="button"
            style={previewIconButtonStyle}
            aria-label="Close"
          >
            ×
          </button>
        </section>
        <div style={previewDividerStyle} />
        <div style={previewDetailRowsStyle}>
          <div style={previewDetailRowStyle}>
            <span style={previewDetailIconStyle} aria-hidden="true" />
            <div style={previewDetailTextStyle}>
              <span style={previewDetailTitleStyle}>
                {FIELD_STACK_DETAIL.address}
              </span>
              <span style={previewDetailDescriptionStyle}>
                {FIELD_STACK_DETAIL.locationHint}
              </span>
            </div>
          </div>
          <div style={previewDetailRowStyle}>
            <span style={previewDetailIconStyle} aria-hidden="true" />
            <div style={previewDetailTextStyle}>
              <span style={previewDetailTitleStyle}>Distance</span>
              <span style={previewDetailDescriptionStyle}>
                {FIELD_STACK_DETAIL.distanceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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

export const FieldStackHalf: Story = {
  args: {
    namePattern: "structured",
    snapStage: "half",
  },
  render: () => <FieldStackHalfPreview />,
};
