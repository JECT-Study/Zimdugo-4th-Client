import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { useEffect, useState } from "react";
import type {
  LockerCorrectionReason,
  LockerCorrectionRequest,
} from "../model/locker-correction-types";
import { LockerCorrectionRequestModal } from "./LockerCorrectionRequestModal";

export interface LockerCorrectionRequestFlowProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm?: (request: LockerCorrectionRequest) => void;
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

  const handleOpenChange = (nextIsOpen: boolean) => {
    onOpenChange(nextIsOpen);
  };

  const handleSubmit = (request: LockerCorrectionRequest) => {
    setPendingRequest(request);
  };

  const handleConfirm = () => {
    if (!pendingRequest) {
      return;
    }

    onConfirm?.(pendingRequest);
    setPendingRequest(null);
    onOpenChange(false);
  };

  const handleCancelConfirm = () => {
    setPendingRequest(null);
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
      />
      <Popup
        isOpen={pendingRequest !== null}
        onOpenChange={(nextIsOpen) => {
          if (!nextIsOpen) {
            setPendingRequest(null);
          }
        }}
        titleText={m.locker_correction_confirm_title()}
        primaryAction={{ label: m.common_yes(), onPress: handleConfirm }}
        secondaryAction={{
          label: m.common_no(),
          onPress: handleCancelConfirm,
        }}
      />
    </>
  );
}
