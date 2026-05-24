import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { vars } from "../../vars.css.ts";
import { Checkbox } from "./Checkbox.tsx";

const meta = {
  title: "Shared/Controls/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  argTypes: {
    labelLocation: {
      control: "select",
      options: ["left", "right", "bottom", "none"],
      description: "Label position",
    },
    labelText: {
      control: "text",
      description: "Label text",
    },
    isDisabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  args: {
    labelText: "Label",
    labelLocation: "right",
  },
} satisfies Meta<typeof Checkbox>;

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

const CELL_STYLE: React.CSSProperties = {
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

type State = "default" | "selected" | "disabled";

const STATE_PROPS: Record<State, Record<string, unknown>> = {
  default: {},
  selected: { defaultSelected: true },
  disabled: { isDisabled: true },
};

const STATES: { state: State; label: string }[] = [
  { state: "default", label: "Default" },
  { state: "selected", label: "Selected" },
  { state: "disabled", label: "Disabled" },
];

const LABEL_LOCATIONS = ["right", "left", "bottom", "none"] as const;

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
          gridTemplateColumns: "80px repeat(4, auto)",
          alignItems: "center",
          justifyItems: "center",
          gap: "16px 32px",
        }}
      >
        <div />
        {LABEL_LOCATIONS.map((location) => (
          <span key={location} style={{ ...LABEL_STYLE, textAlign: "center" }}>
            {location}
          </span>
        ))}

        {STATES.map(({ state, label }) => (
          <React.Fragment key={state}>
            <span style={LABEL_STYLE}>{label}</span>
            {LABEL_LOCATIONS.map((location) => (
              <div key={location} style={CELL_STYLE}>
                <Checkbox
                  labelLocation={location}
                  labelText={location === "none" ? undefined : "Label"}
                  {...STATE_PROPS[state]}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};
