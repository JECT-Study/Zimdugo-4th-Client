import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import type { Selection } from "react-aria-components";
import { ChipGroup } from "./ChipGroup.tsx";

const basicOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const staggeredOptions = [
  { label: "Option A", value: "optionA" },
  { label: "Option B", value: "optionB" },
  { label: "Option C", value: "optionC" },
  { label: "Option D", value: "optionD" },
  { label: "Option E", value: "optionE" },
  { label: "Option F", value: "optionF" },
  { label: "Option G", value: "optionG" },
];

const meta = {
  title: "Shared/Controls/ChipGroup",
  component: ChipGroup,
  parameters: { layout: "centered" },
  args: {
    options: basicOptions,
    value: ["option1"],
    selectionMode: "multiple",
  },
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const AllVariants: Story = {
  name: "Variants",
  render: function VariantsStory() {
    const [wrapKeys, setWrapKeys] = useState<Selection>(new Set(["option1"]));
    const [staggeredKeys, setStaggeredKeys] = useState<Selection>(
      new Set(["optionB", "optionC"]),
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "96px 343px",
            alignItems: "center",
            gap: "20px 24px",
          }}
        >
          <span style={LABEL_STYLE}>Wrap</span>
          <ChipGroup
            options={basicOptions}
            selectedKeys={wrapKeys}
            onSelectionChange={setWrapKeys}
            selectionMode="multiple"
          />

          <span style={LABEL_STYLE}>Staggered</span>
          <ChipGroup
            options={staggeredOptions}
            selectedKeys={staggeredKeys}
            onSelectionChange={setStaggeredKeys}
            selectionMode="multiple"
            layout="staggered"
          />
        </div>
      </div>
    );
  },
};
