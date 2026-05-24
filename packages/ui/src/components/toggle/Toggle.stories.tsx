import type { Meta, StoryObj } from "@storybook/react";
import React, { type CSSProperties, useState } from "react";
import { vars } from "../../vars.css.ts";
import { Toggle } from "./Toggle.tsx";

const meta = {
  title: "Shared/Layout/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABEL_STYLE: CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const COLUMNS = [
  { label: "Off", props: { defaultSelected: false } },
  { label: "On", props: { defaultSelected: true } },
] as const;

const ROWS = [
  { label: "Default", props: {} },
  { label: "Disabled", props: { isDisabled: true } },
] as const;

export const Default: Story = {
  name: "Default",
  render: function DefaultStory() {
    const [isSelected, setIsSelected] = useState(false);

    return (
      <Toggle
        isSelected={isSelected}
        onChange={setIsSelected}
        aria-label="Default toggle"
      />
    );
  },
};

export const AllVariants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={vars.typography.font.caption}>
        Hover / Active / Focus 상태는 미리보기에서 직접 확인할 수 있습니다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "88px repeat(2, 104px)",
          alignItems: "center",
          justifyItems: "start",
          gap: "16px 20px",
        }}
      >
        <div />
        {COLUMNS.map(({ label }) => (
          <span key={label} style={LABEL_STYLE}>
            {label}
          </span>
        ))}

        {ROWS.map(({ label: rowLabel, props: rowProps }) => (
          <React.Fragment key={rowLabel}>
            <span style={LABEL_STYLE}>{rowLabel}</span>
            {COLUMNS.map(({ label: columnLabel, props: columnProps }) => (
              <Toggle
                key={`${rowLabel}-${columnLabel}`}
                aria-label={`Toggle ${rowLabel} ${columnLabel}`}
                {...columnProps}
                {...rowProps}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};
