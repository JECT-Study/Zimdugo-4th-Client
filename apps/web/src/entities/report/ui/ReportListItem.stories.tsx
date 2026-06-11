import type { Meta, StoryObj } from "@storybook/react";
import { ReportListItem } from "./ReportListItem.tsx";

const meta = {
  title: "Entities/Report/ReportListItem",
  component: ReportListItem,
  parameters: {
    layout: "centered",
  },
  args: {
    titleText: "?좎큿??5踰?異쒓뎄 B2痢?臾쇳뭹蹂닿???,
    locationLabel: "?쒖슱 ?쒕?臾멸뎄 ?좎큿濡?83",
    detailText:
      "5踰?異쒓뎄 諛⑺뼢 媛쒖같援щ? 吏???쇱そ ?듬줈 ?앹뿉 ?덉뼱?? ?꾧툑 寃곗젣??遺덇??섍퀬 移대뱶 寃곗젣留?媛?ν빐??",
    updatedLabel: "1hr ago",
    status: "pending",
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
  },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
  },
};
