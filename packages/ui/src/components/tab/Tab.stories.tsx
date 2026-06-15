import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "./Tab.tsx";

const items = [
  { id: "first", label: "Label" },
  { id: "second", label: "Label" },
  { id: "third", label: "Label", isDisabled: true },
];

const meta = {
  title: "Design System/Components/Layout/Tab",
  component: TabBar,
  parameters: { layout: "centered" },
  args: {
    items,
    defaultSelectedKey: "first",
    style: {
      width: 529,
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};
