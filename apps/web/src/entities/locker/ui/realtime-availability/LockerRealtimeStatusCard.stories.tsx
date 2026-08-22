import type { Meta, StoryObj } from "@storybook/react";
import { LockerRealtimeStatusCard } from "./LockerRealtimeStatusCard";

const meta = {
  title: "Product/Locker Detail/Realtime Status Card",
  component: LockerRealtimeStatusCard,
  parameters: {
    layout: "centered",
  },
  args: {
    availability: {
      isAvailable: true,
      smallAvailableCount: 4,
      mediumAvailableCount: 2,
      largeAvailableCount: 0,
      fetchedAt: new Date().toISOString(),
    },
  },
} satisfies Meta<typeof LockerRealtimeStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllAvailable: Story = {
  args: {
    availability: {
      isAvailable: true,
      smallAvailableCount: 4,
      mediumAvailableCount: 2,
      largeAvailableCount: 1,
      fetchedAt: new Date().toISOString(),
    },
  },
};

export const AllClosed: Story = {
  args: {
    availability: {
      isAvailable: true,
      smallAvailableCount: 0,
      mediumAvailableCount: 0,
      largeAvailableCount: 0,
      fetchedAt: new Date().toISOString(),
    },
  },
};
