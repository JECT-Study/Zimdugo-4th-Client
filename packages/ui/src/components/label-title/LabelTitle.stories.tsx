import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { vars } from "../../vars.css.ts";
import { LabelTitle } from "./LabelTitle.tsx";

const meta = {
  title: "Shared/Controls/LabelTitle",
  component: LabelTitle,
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["large", "small"],
      description: "Label title size",
    },
    subtitle: {
      control: "text",
      description: "Supporting text for large labels",
    },
  },
  args: {
    children: "Label title",
    subtitle: "Supporting text",
    size: "large",
  },
} satisfies Meta<typeof LabelTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  render: (args) => (
    <div style={{ width: 280 }}>
      <LabelTitle {...args} />
    </div>
  ),
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const AllVariants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={vars.typography.font.caption}>
        <strong>Subtitle</strong>는 large size에서만 표시됩니다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 280px",
          alignItems: "center",
          gap: "16px 24px",
        }}
      >
        <span style={LABEL_STYLE}>Large</span>
        <LabelTitle size="large" subtitle="Supporting text">
          Label title
        </LabelTitle>
        <span style={LABEL_STYLE}>Small</span>
        <LabelTitle size="small">Label title</LabelTitle>
      </div>
    </div>
  ),
};
