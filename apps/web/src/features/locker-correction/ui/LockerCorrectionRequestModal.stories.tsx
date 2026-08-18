import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  LOCKER_CORRECTION_REASON,
  type LockerCorrectionReason,
} from "../model/locker-correction-types";
import { LockerCorrectionRequestModal } from "./LockerCorrectionRequestModal";

interface LockerCorrectionRequestModalStoryProps {
  initialReason: LockerCorrectionReason | null;
  initialDetails: string;
  initialReasonMenuOpen: boolean;
  isSubmitting: boolean;
}

function LockerCorrectionRequestModalStory({
  initialReason,
  initialDetails,
  initialReasonMenuOpen,
  isSubmitting,
}: LockerCorrectionRequestModalStoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [reason, setReason] = useState<LockerCorrectionReason | null>(
    initialReason,
  );
  const [details, setDetails] = useState(initialDetails);
  const [isReasonMenuOpen, setIsReasonMenuOpen] = useState(
    initialReasonMenuOpen,
  );

  return (
    <LockerCorrectionRequestModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      reason={reason}
      onReasonChange={setReason}
      details={details}
      onDetailsChange={setDetails}
      onSubmit={() => undefined}
      isSubmitting={isSubmitting}
      isReasonMenuOpen={isReasonMenuOpen}
      onReasonMenuOpenChange={setIsReasonMenuOpen}
    />
  );
}

const meta = {
  title: "Product/Locker Detail/Correction Request Modal",
  component: LockerCorrectionRequestModalStory,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          background: "#e2f3e7",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    initialReason: null,
    initialDetails: "",
    initialReasonMenuOpen: false,
    isSubmitting: false,
  },
} satisfies Meta<typeof LockerCorrectionRequestModalStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReasonUnselected: Story = {};

export const ReasonMenuOpen: Story = {
  args: {
    initialReasonMenuOpen: true,
  },
};

export const ReasonSelected: Story = {
  args: {
    initialReason: LOCKER_CORRECTION_REASON.Closed,
  },
};

export const WithDetails: Story = {
  args: {
    initialReason: LOCKER_CORRECTION_REASON.WrongLocation,
    initialDetails: "출구 반대편 건물 1층으로 이전했어요.",
  },
};

export const Submitting: Story = {
  args: {
    initialReason: LOCKER_CORRECTION_REASON.WrongPrice,
    isSubmitting: true,
  },
};
