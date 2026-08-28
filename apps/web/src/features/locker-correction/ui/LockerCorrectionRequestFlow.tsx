import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type {
  LockerCorrectionReason,
  LockerCorrectionRequest,
} from "../model/locker-correction-types";
import { LockerCorrectionRequestModal } from "./LockerCorrectionRequestModal";

export interface LockerCorrectionRequestFlowProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm?: (request: LockerCorrectionRequest) => Promise<void> | void;
}

export function LockerCorrectionRequestFlow({
  isOpen,
  onOpenChange,
  onConfirm,
}: LockerCorrectionRequestFlowProps) {
  const [reason, setReason] = useState<LockerCorrectionReason | null>(null);
  const [details, setDetails] = useState("");
  const [pendingRequest, setPendingRequest] =
    useState<LockerCorrectionRequest | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextIsOpen: boolean) => {
    onOpenChange(nextIsOpen);
  };

  const handleSubmit = (request: LockerCorrectionRequest) => {
    setPendingRequest(request);
  };

  const handleConfirm = async () => {
    if (!pendingRequest || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm?.(pendingRequest);
      setPendingRequest(null);
      onOpenChange(false);
      setIsSuccessOpen(true);
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setPendingRequest(null);
  };

  const handleConfirmOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setPendingRequest(null);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setReason(null);
    setDetails("");
    setPendingRequest(null);
  }, [isOpen]);

  return (
    <>
      <LockerCorrectionRequestModal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        reason={reason}
        onReasonChange={setReason}
        details={details}
        onDetailsChange={setDetails}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <Popup
        isOpen={pendingRequest !== null}
        onOpenChange={handleConfirmOpenChange}
        titleText={m.locker_correction_confirm_title()}
        primaryAction={{ label: m.common_yes(), onPress: handleConfirm }}
        secondaryAction={{
          label: m.common_no(),
          onPress: handleCancelConfirm,
        }}
      />
      <Popup
        isOpen={isSuccessOpen}
        onOpenChange={handleSuccessClose}
        titleText={m.locker_correction_submit_success_title()}
        helperText={m.locker_correction_submit_success_helper()}
        icon={
          <motion.div
            initial={{
              mask: "linear-gradient(90deg, #000 0%, transparent 0%)",
            }}
            animate={{
              mask: "linear-gradient(90deg, #000 100%, transparent 100%)",
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <IconCircleboxCheck32 />
          </motion.div>
        }
        primaryActionLayout="content"
        primaryAction={{
          label: m.locker_correction_submit_success_close(),
          onPress: handleSuccessClose,
        }}
      />
    </>
  );
}
