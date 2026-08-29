import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LockerTimerModal } from "./LockerTimerModal";

const CONFIGURED_STORY_TIME = new Date(2026, 7, 29, 15, 31);

function SetupTimerStory({ isConfigured }: { isConfigured: boolean }) {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState(isConfigured ? "59" : "00");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleDurationChange = (nextHours: string, nextMinutes: string) => {
    setHours(nextHours);
    setMinutes(nextMinutes);
  };

  return (
    <>
      <LockerTimerModal
        isOpen
        mode="setup"
        hours={hours}
        minutes={minutes}
        currentTime={CONFIGURED_STORY_TIME}
        onOpenChange={() => undefined}
        onDurationChange={handleDurationChange}
        onStart={() => setIsConfirmationOpen(true)}
      />
      <Popup
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        titleText={m.locker_timer_start_confirm()}
        primaryAction={{
          label: m.common_yes(),
          onPress: () => setIsConfirmationOpen(false),
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsConfirmationOpen(false),
        }}
      />
    </>
  );
}

const meta = {
  title: "Product/Locker Timer/Modal",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: vars.layout.designWidth,
          height: "100dvh",
          minHeight: "812px",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#EAF6EE",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => <SetupTimerStory isConfigured={false} />,
};

export const Configured: Story = {
  render: () => <SetupTimerStory isConfigured />,
};

export const Running: Story = {
  render: () => (
    <LockerTimerModal
      isOpen
      mode="running"
      remainingTimeLabel="05 : 30"
      endTimeLabel="16:30"
      remainingTimeInSeconds={19_800}
      configuredTimeInSeconds={28_800}
      onOpenChange={() => undefined}
      onStop={() => undefined}
    />
  ),
};
