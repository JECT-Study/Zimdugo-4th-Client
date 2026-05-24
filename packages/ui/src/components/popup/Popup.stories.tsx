import type { Meta, StoryObj } from "@storybook/react";
import { Popup } from "./Popup.tsx";

const action = () => {};

const meta = {
  title: "Shared/Layout/Popup",
  component: Popup,
  parameters: { layout: "centered" },
  args: {
    isOpen: true,
    onOpenChange: action,
    titleText: "Title",
    primaryAction: { label: "Action", onPress: action },
  },
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

export const Helper: Story = {
  name: "Helper",
  args: {
    helperText: "Helper text",
  },
};

export const SubAction: Story = {
  name: "Sub Action",
  args: {
    subAction: { label: "Action", onPress: action },
  },
};

export const Double: Story = {
  name: "Double",
  args: {
    secondaryAction: { label: "Cancel", onPress: action },
    primaryAction: { label: "Confirm", onPress: action },
  },
};

export const DoubleHelper: Story = {
  name: "Double + Helper",
  args: {
    titleText: "Delete service",
    helperText: "This action cannot be undone.",
    secondaryAction: { label: "Cancel", onPress: action },
    primaryAction: { label: "Delete", onPress: action },
  },
};

export const LongContent: Story = {
  name: "Long Content",
  args: {
    titleText: "Are you sure you want to delete this service?",
    helperText:
      "This action cannot be undone and all personal information will be removed immediately.",
    secondaryAction: { label: "Cancel", onPress: action },
    primaryAction: { label: "Confirm", onPress: action },
  },
};
