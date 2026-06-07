import type { Meta, StoryObj } from "@storybook/react";
import { SearchOverlay } from "./SearchOverlay.tsx";
import { vars } from "@repo/ui/vars";
import React from "react";

const meta = {
  title: "Composites/Search/SearchOverlay",
  component: SearchOverlay,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: vars.layout.containerWidth,
          margin: "0 auto",
          minHeight: "100dvh",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
  args: {
    initialQuery: "",
  },
};

export const WithQuery: Story = {
  name: "with query",
  args: {
    initialQuery: "COEX",
  },
};
