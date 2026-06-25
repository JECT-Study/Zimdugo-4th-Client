import type { Meta, StoryObj } from "@storybook/react";
import { ClusterMapPin } from "./ClusterMapPin.tsx";

const meta = {
  title: "Design System/Components/Map/ClusterMapPin",
  component: ClusterMapPin,
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["s", "l"],
    },
    count: {
      control: "text",
    },
  },
  args: {
    size: "s",
    count: 2,
  },
} satisfies Meta<typeof ClusterMapPin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 48,
      }}
    >
      <ClusterMapPin size="s" count={2} />
      <ClusterMapPin size="l" count={10} />
    </div>
  ),
};
