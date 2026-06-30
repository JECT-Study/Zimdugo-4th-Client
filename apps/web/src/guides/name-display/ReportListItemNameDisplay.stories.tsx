import type { StoryObj } from "@storybook/react";
import { ReportListItem } from "#/entities/report/ui/ReportListItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

const SHARED_ARGS = {
  locationLabel: "서울 서대문구 신촌로 83",
  detailText: "무인 보관함",
  updatedLabel: "1시간 전",
  imageTitleText: "이미지 없음",
  imageHelperText: "",
} as const;

const meta = {
  title: "Product/Guides/Name Display/Report List Item",
  component: ReportListItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    locale: {
      control: "inline-radio",
      options: ["ko", "en", "all"],
      description: "title(보관함명) 언어 — ko / en / 둘 다",
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const EllipsisBoundary: Story = {
  render: ({ viewport, locale }) => {
    const rows = buildEllipsisBoundaryRows({
      slot: "report-list-title",
      locale,
      viewport,
    }).map((row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
      node: (
        <NameDisplaySurface surface="my-report-list" viewport={viewport}>
          <ReportListItem titleText={row.text} {...SHARED_ARGS} />
        </NameDisplaySurface>
      ),
    }));

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="my-report-list"
        note={`lockerName · 썸네일·chevron 차감 후 좁은 text column · 경계 ±5자. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
