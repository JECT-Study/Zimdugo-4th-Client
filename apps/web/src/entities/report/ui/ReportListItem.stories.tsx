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

export const Default: Story = {};

export const Approved: Story = {
  args: {
    status: "approved",
    statusLabel: "Approved",
  },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
    statusLabel: "Rejected",
  },
};
