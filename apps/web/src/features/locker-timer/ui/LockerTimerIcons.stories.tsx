import {
  IconLockerTimerLarge,
  IconTimerStart20,
  IconTimerStop20,
} from "@repo/ui/tokens/icons";
import type { Meta, StoryObj } from "@storybook/react";

function LockerTimerIcons() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: 32,
        background: "#0D8533",
      }}
    >
      <IconTimerStart20 />
      <IconTimerStop20 />
      <IconLockerTimerLarge />
    </div>
  );
}

const meta = {
  title: "Product/Locker Timer/Icons",
  component: LockerTimerIcons,
} satisfies Meta<typeof LockerTimerIcons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
