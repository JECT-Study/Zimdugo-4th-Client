import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton.tsx";

const meta = {
  title: "Shared/Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  args: {
    width: "200px",
    height: "20px",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Circle: Story = {
  args: {
    width: "48px",
    height: "48px",
    variant: "circle",
  },
};

export const CustomRadius: Story = {
  args: {
    width: "100px",
    height: "100px",
    borderRadius: "20px",
  },
};
