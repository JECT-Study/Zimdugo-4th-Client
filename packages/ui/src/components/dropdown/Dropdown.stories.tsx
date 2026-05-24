import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { Dropdown } from "./Dropdown.tsx";

const OPTIONS = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2" },
  { id: "3", label: "Option 3" },
  { id: "4", label: "Option 4" },
];

const meta = {
  title: "Shared/Layout/Dropdown",
  component: Dropdown,
  parameters: { layout: "centered" },
  args: {
    options: OPTIONS,
    placeholder: "Select option",
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  decorators: [
    (Story: ComponentType) => (
      <div style={{ width: 343 }}>
        <Story />
      </div>
    ),
  ],
};

export const DynamicPlacement: Story = {
  name: "Dynamic Placement",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story: ComponentType) => (
      <div
        style={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{
            width: 700,
            height: 400,
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            padding: 32,
            boxSizing: "border-box",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Story />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-start",
            }}
          >
            <Story />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <Story />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};
