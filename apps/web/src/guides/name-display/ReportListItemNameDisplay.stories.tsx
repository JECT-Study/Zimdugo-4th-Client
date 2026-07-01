import type { StoryObj } from "@storybook/react";
import { ReportListItem } from "#/entities/report/ui/ReportListItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: 힣 / 囍 / 曜 / W 반복";

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
      options: ["ko", "zh", "ja", "en", "all"],
      description: "title(보관함명) 언어 — ko / zh / ja / en / 전체",
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

export const TwoLineBoundary: Story = {
  render: ({ viewport, locale }) => {
    const rows = buildNameDisplayBoundaryRows({
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
