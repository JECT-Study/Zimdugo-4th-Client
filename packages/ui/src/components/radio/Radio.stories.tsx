import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Radio, RadioGroup } from "./Radio.tsx";

const meta = {
  title: "Shared/Layout/Radio",
  component: RadioGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const LAYOUTS = [
  { label: "Right", labelLayout: "right" },
  { label: "Bottom", labelLayout: "bottom" },
  { label: "None", labelLayout: "none" },
] as const;

const STATES = [
  { label: "Default", props: {} },
  { label: "Selected", props: { defaultValue: "1" } },
  { label: "Disabled", props: { defaultValue: "1", isDisabled: true } },
] as const;

export const Default: Story = {
  name: "Default",
  args: {
    children: null,
  },
  render: function DefaultStory() {
    return (
      <RadioGroup aria-label="Default radio group" optionsDirection="row">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
    );
  },
};

export const AllVariants: Story = {
  name: "Variants",
  args: {
    children: null,
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "88px repeat(3, 150px)",
          alignItems: "center",
          justifyItems: "center",
          gap: "18px 28px",
        }}
      >
        <div />
        {LAYOUTS.map(({ label }) => (
          <span key={label} style={{ ...LABEL_STYLE, textAlign: "center" }}>
            {label}
          </span>
        ))}

        {STATES.map(({ label, props }) => (
          <React.Fragment key={label}>
            <span style={{ ...LABEL_STYLE, justifySelf: "start" }}>{label}</span>
            {LAYOUTS.map(({ label: layoutLabel, labelLayout }) => (
              <RadioGroup
                key={layoutLabel}
                aria-label={`${label} ${layoutLabel}`}
                labelLayout={labelLayout}
                optionsDirection="row"
                {...props}
              >
                <Radio value="1">Option</Radio>
              </RadioGroup>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};
