import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { vars } from "../../vars.css.ts";
import { Input, type InputProps } from "./Input.tsx";

const meta = {
  title: "Design System/Components/Controls/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "active",
        "error",
        "disabled",
        "ghost",
        "underlined",
        "searchHome",
      ],
      description: "Input visual state",
    },
    labelTitleSize: {
      control: "select",
      options: ["none", "small", "large"],
      description: "Label title size",
    },
    labelTypeVariant: {
      control: "select",
      options: ["text", "iconText"],
      description: "Leading label type",
    },
    searchIconPlacement: {
      control: "select",
      options: ["none", "left", "right", "auto"],
      description: "Search icon placement",
    },
    textTone: {
      control: "select",
      options: ["auto", "on", "off"],
      description: "Input text tone",
    },
    isDisabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  args: {
    placeholder: "Enter text",
    variant: "default",
    labelTitleSize: "none",
    labelTypeVariant: "text",
    searchIconPlacement: "none",
    textTone: "auto",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  render: (args) => (
    <div style={{ width: 343 }}>
      <Input {...args} />
    </div>
  ),
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const VARIANTS: { variant: InputProps["variant"]; label: string }[] = [
  { variant: "default", label: "Default" },
  { variant: "active", label: "Active" },
  { variant: "error", label: "Error" },
  { variant: "disabled", label: "Disabled" },
  { variant: "ghost", label: "Ghost" },
  { variant: "underlined", label: "Underlined" },
  { variant: "searchHome", label: "Search Home" },
];

const TYPES: {
  label: string;
  props: Pick<InputProps, "labelTypeVariant" | "searchIconPlacement">;
}[] = [
  { label: "Text", props: { labelTypeVariant: "text" } },
  { label: "Map Pin", props: { labelTypeVariant: "iconText" } },
  { label: "Search Left", props: { searchIconPlacement: "left" } },
  { label: "Search Right", props: { searchIconPlacement: "right" } },
];

export const AllVariants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={vars.typography.font.caption}>
        <strong>Focus</strong> 상태는 미리보기에서 직접 확인할 수 있습니다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "96px repeat(4, 343px)",
          alignItems: "center",
          gap: "16px 24px",
        }}
      >
        <div />
        {TYPES.map(({ label }) => (
          <span key={label} style={{ ...LABEL_STYLE, textAlign: "center" }}>
            {label}
          </span>
        ))}

        {VARIANTS.map(({ variant, label }) => (
          <React.Fragment key={variant}>
            <span style={LABEL_STYLE}>{label}</span>
            {TYPES.map(({ label: typeLabel, props }) => (
              <Input
                key={typeLabel}
                placeholder="Enter text"
                variant={variant}
                {...props}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  name: "Labels",
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 343 }}>
      <Input {...args} labelTitleSize="none" />
      <Input {...args} label="Small label" labelTitleSize="small" />
      <Input
        {...args}
        label="Large label"
        labelSubtitle="Optional helper text"
        labelTitleSize="large"
      />
    </div>
  ),
};
