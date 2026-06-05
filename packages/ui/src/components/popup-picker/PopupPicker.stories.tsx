import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  DialPicker,
  PopupPicker,
  type PopupPickerColumn,
} from "./PopupPicker.tsx";

const noop = () => {};

const floorScopeOptions = [
  { value: "ground", label: "Ground" },
  { value: "underground", label: "Underground" },
];

const floorOptions = Array.from({ length: 30 }, (_, index) => {
  const floor = index + 1;

  return { value: String(floor), label: `${floor}F` };
});

const meta = {
  title: "Shared/Layout/PopupPicker",
  component: PopupPicker,
  parameters: { layout: "centered" },
  args: {
    isOpen: true,
    onOpenChange: noop,
    titleText: "Select floor",
    columns: [
      {
        id: "scope",
        value: "ground",
        options: floorScopeOptions,
        ariaLabel: "Floor scope",
      },
      {
        id: "floor",
        value: "3",
        options: floorOptions,
        ariaLabel: "Floor",
      },
    ],
    onColumnChange: noop,
    primaryAction: {
      label: "Done",
      onPress: noop,
    },
  },
} satisfies Meta<typeof PopupPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [scope, setScope] = useState("ground");
    const [floor, setFloor] = useState("3");

    const columns: PopupPickerColumn[] = [
      {
        id: "scope",
        value: scope,
        options: floorScopeOptions,
        ariaLabel: "Floor scope",
      },
      {
        id: "floor",
        value: floor,
        options: floorOptions,
        ariaLabel: "Floor",
      },
    ];

    const handleColumnChange = (columnId: string, value: string) => {
      if (columnId === "scope") {
        setScope(value);
      }

      if (columnId === "floor") {
        setFloor(value);
      }
    };

    return (
      <PopupPicker
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        titleText="Select floor"
        columns={columns}
        onColumnChange={handleColumnChange}
        primaryAction={{
          label: "Done",
          onPress: noop,
        }}
      />
    );
  },
};

export const DialOnly: Story = {
  render: () => {
    const [scope, setScope] = useState("ground");
    const [floor, setFloor] = useState("3");

    const columns: PopupPickerColumn[] = [
      {
        id: "scope",
        value: scope,
        options: floorScopeOptions,
        ariaLabel: "Floor scope",
      },
      {
        id: "floor",
        value: floor,
        options: floorOptions,
        ariaLabel: "Floor",
      },
    ];

    const handleColumnChange = (columnId: string, value: string) => {
      if (columnId === "scope") {
        setScope(value);
      }

      if (columnId === "floor") {
        setFloor(value);
      }
    };

    return <DialPicker columns={columns} onColumnChange={handleColumnChange} />;
  },
};
