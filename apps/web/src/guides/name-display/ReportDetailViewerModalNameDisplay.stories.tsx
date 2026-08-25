import type { Meta, StoryObj } from "@storybook/react";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  type EllipsisLocaleSelection,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";
import { ReportDetailTitlePreview } from "#/shared/storybook/ReportDetailTitlePreview";

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

/**
 * 스토리 전용 args.
 *
 * viewport·locale 은 컨트롤로만 쓰는 값이라 컴포넌트 props 에 없다. 타입을 주지
 * 않으면 Storybook 이 component 에서 args 를 추론해 이 둘을 모르는 것으로 본다.
 */
interface NameDisplayStoryArgs {
  viewport: NameDisplayViewport;
  locale: EllipsisLocaleSelection;
}

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
} satisfies Meta<NameDisplayStoryArgs>;

export default meta;

type Story = StoryObj<NameDisplayStoryArgs>;

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
