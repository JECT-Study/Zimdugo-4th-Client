import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { SearchMarkerIcon } from "#/entities/search/ui/SearchMarkerIcon";
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

const BULLET_PLACE_PREVIEW_ITEMS = [
  {
    lockerId: 101,
    title: "COEX Mall Mega Box locker",
    categoryLabel: "Culture space",
    updatedLabel: "Updated 10 min ago",
    distanceLabel: "120m",
  },
  {
    lockerId: 102,
    title: "COEX East Gate locker",
    categoryLabel: "Station",
    updatedLabel: "Updated 1 hour ago",
    distanceLabel: "240m",
  },
  {
    lockerId: 103,
    title: "COEX B1 information desk locker",
    categoryLabel: "Public space",
    updatedLabel: "Updated yesterday",
    distanceLabel: "310m",
  },
];

const bulletPreviewStyles = {
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing[12],
    padding: `${vars.spacing[8]} 0`,
  },
  placeCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: vars.spacing[8],
    width: "100%",
  },
  marker: {
    display: "inline-flex",
    width: "40px",
    height: "40px",
    flexShrink: 0,
  },
  content: {
    display: "flex",
    minWidth: 0,
    flex: 1,
    flexDirection: "column",
    gap: vars.spacing[4],
  },
  title: {
    overflow: "hidden",
    color: vars.color.text.title,
    fontSize: vars.typography.fontSize[16],
    fontWeight: vars.typography.fontWeight.SemiBold,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  meta: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    gap: vars.spacing[8],
    color: vars.color.text.content,
    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.Medium,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  },
  muted: {
    color: vars.color.text.disable,
  },
  address: {
    overflow: "hidden",
    color: vars.color.text.surface,
    textOverflow: "ellipsis",
  },
  bulletList: {
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing[8],
    margin: `${vars.spacing[4]} 0 0`,
    padding: 0,
    listStyle: "none",
  },
  bulletItem: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr)",
    columnGap: vars.spacing[8],
    minWidth: 0,
  },
  bulletDot: {
    width: "5px",
    height: "5px",
    marginTop: "7px",
    borderRadius: vars.radius.max,
    backgroundColor: vars.color.palette.green[500],
  },
  bulletTitle: {
    overflow: "hidden",
    color: vars.color.text.title,
    fontSize: vars.typography.fontSize[14],
    fontWeight: vars.typography.fontWeight.SemiBold,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
} satisfies Record<string, CSSProperties>;

function BulletPlacePreviewContent() {
  return (
    <div style={bulletPreviewStyles.stack}>
      <div style={bulletPreviewStyles.placeCard}>
        <span style={bulletPreviewStyles.marker} aria-hidden="true">
          <SearchMarkerIcon kind="place" tone="brand" />
        </span>
        <div style={bulletPreviewStyles.content}>
          <div style={bulletPreviewStyles.title}>COEX</div>
          <div style={bulletPreviewStyles.meta}>
            <span>120m</span>
            <span style={bulletPreviewStyles.muted}>·</span>
            <span style={bulletPreviewStyles.address}>
              513 Yeongdong-daero, Gangnam-gu, Seoul
            </span>
          </div>
          <ul style={bulletPreviewStyles.bulletList}>
            {BULLET_PLACE_PREVIEW_ITEMS.map((item) => (
              <li key={item.lockerId} style={bulletPreviewStyles.bulletItem}>
                <span style={bulletPreviewStyles.bulletDot} aria-hidden />
                <span style={bulletPreviewStyles.content}>
                  <span style={bulletPreviewStyles.bulletTitle}>
                    {item.title}
                  </span>
                  <span style={bulletPreviewStyles.meta}>
                    <span style={bulletPreviewStyles.muted}>
                      {item.categoryLabel}
                    </span>
                    <span style={bulletPreviewStyles.muted}>·</span>
                    <span>{item.distanceLabel}</span>
                    <span style={bulletPreviewStyles.muted}>·</span>
                    <span style={bulletPreviewStyles.muted}>
                      {item.updatedLabel}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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

export const BulletPlacePreview: Story = {
  args: {
    searchQuery: "COEX",
    appLanguage: "en",
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
      >
        <BulletPlacePreviewContent />
      </SearchListBottomSheet>
    );
  },
};
