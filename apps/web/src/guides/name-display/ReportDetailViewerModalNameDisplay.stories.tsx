import type { StoryObj } from "@storybook/react";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
} from "#/shared/storybook/name-display-matrix";
import { ReportDetailTitlePreview } from "#/shared/storybook/ReportDetailTitlePreview";

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

const meta = {
  title: "Product/Guides/Name Display/Report Detail Modal",
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

export const WrapBoundary: Story = {
  render: ({ viewport, locale }) => {
    const rows = buildEllipsisBoundaryRows({
      slot: "report-detail-title-wrap",
      locale,
      viewport,
    }).map((row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
      node: (
        <NameDisplaySurface surface="report-detail-title" viewport={viewport}>
          <ReportDetailTitlePreview titleText={row.text} />
        </NameDisplaySurface>
      ),
    }));

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="report-detail-title"
        note={`20px 제목 · ellipsis 없음 · 줄바꿈 경계 ±5자. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
