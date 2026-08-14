import type { Meta, StoryObj } from "@storybook/react";
import { LockerRealtimeAvailabilityCard } from "./LockerRealtimeAvailabilityCard";

const meta = {
  title: "Product/Locker Detail/Realtime Availability Card",
  component: LockerRealtimeAvailabilityCard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 343 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    availability: {
      isAvailable: true,
      smallAvailableCount: 12,
      mediumAvailableCount: 2,
      largeAvailableCount: 0,
      fetchedAt: "2026-08-14T14:19:47.013473",
    },
  },
} satisfies Meta<typeof LockerRealtimeAvailabilityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {};

export const AllOccupied: Story = {
  args: {
    availability: {
      isAvailable: true,
      smallAvailableCount: 0,
      mediumAvailableCount: 0,
      largeAvailableCount: 0,
      fetchedAt: "2026-08-14T14:19:47.013473",
    },
  },
};

export const Unavailable: Story = {
  args: {
    availability: null,
  },
};
