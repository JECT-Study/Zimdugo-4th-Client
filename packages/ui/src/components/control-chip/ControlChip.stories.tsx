import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ControlChip } from "./ControlChip.tsx";

const meta = {
  title: "Design System/Components/Controls/ControlChip",
  component: ControlChip,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["choice", "filter", "sort"],
      description: "Control chip type",
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "Control chip size",
    },
    isActive: {
      control: "boolean",
      description: "Active state",
    },
    isOpen: {
      control: "boolean",
      description: "Open state for filter chips",
    },
    sortDirection: {
      control: "select",
      options: ["none", "asc", "desc"],
      description: "Sort direction for sort chips",
    },
    isDisabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  args: {
    label: "Control Chip",
    variant: "choice",
    size: "medium",
  },
} satisfies Meta<typeof ControlChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  render: (args: React.ComponentProps<typeof ControlChip>) => {
    const [isActive, setIsActive] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [sortDirection, setSortDirection] =
      useState<"none" | "asc" | "desc">("none");

    const handlePress = () => {
      if (args.variant === "choice") {
        setIsActive((current) => !current);
        return;
      }
      if (args.variant === "filter") {
        setIsActive(true);
        setIsOpen((current) => !current);
        return;
      }
      if (args.variant === "sort") {
        const next = { none: "asc", asc: "desc", desc: "none" }[
          sortDirection
        ] as "none" | "asc" | "desc";
        setSortDirection(next);
        setIsActive(next !== "none");
      }
    };

    return (
      <ControlChip
        {...args}
        isActive={args.isActive || isActive}
        isOpen={args.isOpen || isOpen}
        sortDirection={
          sortDirection !== "none" ? sortDirection : args.sortDirection
        }
        onPress={handlePress}
      />
    );
  },
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px repeat(3, auto)",
          alignItems: "center",
          gap: "16px 28px",
        }}
      >
        <div />
        {(["Choice", "Filter", "Sort"] as const).map((type) => (
          <span key={type} style={{ ...LABEL_STYLE, textAlign: "center" }}>
            {type}
          </span>
        ))}

        <span style={LABEL_STYLE}>Default</span>
        <ControlChip variant="choice" label="Option" />
        <ControlChip variant="filter" label="Filter" />
        <ControlChip variant="sort" label="Sort" sortDirection="none" />

        <span style={LABEL_STYLE}>Active</span>
        <ControlChip variant="choice" label="Selected" isActive />
        <ControlChip variant="filter" label="Applied" isActive isOpen />
        <ControlChip
          variant="sort"
          label="Ascending"
          isActive
          sortDirection="asc"
        />

        <div />
        <div />
        <div />
        <ControlChip
          variant="sort"
          label="Descending"
          isActive
          sortDirection="desc"
        />

        <span style={LABEL_STYLE}>Disabled</span>
        <ControlChip variant="choice" label="Disabled" isDisabled />
        <ControlChip variant="filter" label="Disabled" isDisabled />
        <ControlChip variant="sort" label="Disabled" isDisabled />
      </div>
    </div>
  ),
};
