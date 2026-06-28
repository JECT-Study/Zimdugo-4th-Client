import type { Meta, StoryObj } from "@storybook/react";
import type { ReportStatusVariant } from "../model/report-status";
import { ReportListItem, type ReportListItemProps } from "./ReportListItem.tsx";

const DEFAULT_ARGS = {
  titleText: "신촌역 5번 출구 B2 보관함",
  locationLabel: "서울 서대문구 신촌로 83",
  detailText: "무인 보관함",
  updatedLabel: "1시간 전",
  imageTitleText: "이미지 없음",
  imageHelperText: "",
} satisfies ReportListItemProps;

const STATUS_VARIANTS: Array<{
  status: ReportStatusVariant;
  statusLabel: string;
}> = [
  { status: "pending", statusLabel: "검토 중" },
  { status: "approved", statusLabel: "승인" },
  { status: "rejected", statusLabel: "반려" },
];

const meta = {
  title: "Product/My/Report List Item",
  component: ReportListItem,
  parameters: {
    layout: "centered",
  },
  args: DEFAULT_ARGS,
} satisfies Meta<typeof ReportListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderSingleItem = (args: ReportListItemProps) => (
  <div style={{ width: 335 }}>
    <ReportListItem {...args} />
  </div>
);

export const Default: Story = {
  render: renderSingleItem,
};

export const Status: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: 335,
      }}
    >
      {STATUS_VARIANTS.map(({ status, statusLabel }) => (
        <ReportListItem
          key={status}
          {...args}
          status={status}
          statusLabel={statusLabel}
        />
      ))}
    </div>
  ),
};

export const LongContent: Story = {
  render: renderSingleItem,
  args: {
    titleText: "서울역 공항철도 도심공항터미널 지하 2층 대형 보관함",
    locationLabel:
      "서울특별시 용산구 한강대로 405 서울역 공항철도 도심공항터미널",
    detailText: "무인 보관함",
    updatedLabel: "2026년 6월 12일",
    status: "pending",
    statusLabel: "검토 중",
  },
};
