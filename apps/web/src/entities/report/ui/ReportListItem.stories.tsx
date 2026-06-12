import type { Meta, StoryObj } from "@storybook/react";
import { ReportListItem } from "./ReportListItem.tsx";

const meta = {
  title: "Entities/Report/ReportListItem",
  component: ReportListItem,
  parameters: {
    layout: "centered",
  },
  args: {
    titleText: "Sinchon Station Exit 5 B2 Locker",
    locationLabel: "83 Sinchon-ro, Seodaemun-gu, Seoul",
    detailText: "Near exit 5. Card payment only.",
    updatedLabel: "1hr ago",
    status: "pending",
    statusLabel: "Pending review",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 335 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    titleText: "신촌역 5번 출구 B2 보관함",
    locationLabel: "서울 서대문구 신촌로 83",
    detailText: "무인 보관함",
    updatedLabel: "1시간 전",
    status: undefined,
    statusLabel: undefined,
  },
};

export const Approved: Story = {
  args: {
    status: "approved",
    statusLabel: "승인",
  },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
    statusLabel: "반려",
  },
};

export const Pending: Story = {
  args: {
    titleText: "신촌역 5번 출구 B2 보관함",
    locationLabel: "서울 서대문구 신촌로 83",
    detailText: "무인 보관함",
    updatedLabel: "1시간 전",
    status: "pending",
    statusLabel: "검토 중",
  },
};

export const LongContent: Story = {
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
