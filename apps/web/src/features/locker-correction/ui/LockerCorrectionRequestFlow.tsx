import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/icons";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  type LockerIssueReportFailure,
  parseLockerIssueReportFailure,
} from "../lib/parse-locker-issue-report-failure";
import type {
  LockerCorrectionReason,
  LockerCorrectionRequest,
} from "../model/locker-correction-types";
import { LockerCorrectionRequestModal } from "./LockerCorrectionRequestModal";

const getFailureMessage = (failure: LockerIssueReportFailure): string => {
  switch (failure) {
    case "not-found":
      return m.locker_correction_submit_error_not_found();
    case "invalid":
      return m.locker_correction_submit_error_invalid();
    case "server":
      return m.locker_correction_submit_error();
  }
};

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
  const [failure, setFailure] = useState<LockerIssueReportFailure | null>(null);
  /**
   * 제출 한 건을 가리키는 표. 대기 중에 흐름이 닫히면 값을 올려 무효화한다.
   * 그러지 않으면 닫은 뒤 도착한 응답이 성공 팝업을 다시 열거나, 다음에 열
   * 때까지 남는 오류를 심는다.
   */
  const submitSessionRef = useRef(0);

  const handleOpenChange = (nextIsOpen: boolean) => {
    onOpenChange(nextIsOpen);
  };

  const handleSubmit = (request: LockerCorrectionRequest) => {
    setPendingRequest(request);
  };

  // 입력을 고치는 순간 이전 실패 안내는 더 이상 그 입력을 가리키지 않는다.
  const handleReasonChange = (nextReason: LockerCorrectionReason) => {
    setFailure(null);
    setReason(nextReason);
  };

  const handleDetailsChange = (nextDetails: string) => {
    setFailure(null);
    setDetails(nextDetails);
  };

  const handleConfirm = async () => {
    // onConfirm 이 없으면 요청도 나가지 않는다. await undefined 는 그대로
    // 통과하므로, 막지 않으면 아무것도 보내지 않고 "접수됨"을 띄운다.
    if (!pendingRequest || isSubmitting || !onConfirm) {
      return;
    }

    const session = submitSessionRef.current;
    setIsSubmitting(true);
    setFailure(null);
    try {
      await onConfirm(pendingRequest);
      if (submitSessionRef.current !== session) return;

      setPendingRequest(null);
      onOpenChange(false);
      setIsSuccessOpen(true);
    } catch (error) {
      if (submitSessionRef.current !== session) return;

      // 확인 팝업만 닫고 신고 다이얼로그는 열어둔다. 입력이 남아 있어야
      // 사용자가 안내를 읽고 그 자리에서 다시 시도할 수 있다.
      setPendingRequest(null);
      setFailure(parseLockerIssueReportFailure(error));
    } finally {
      if (submitSessionRef.current === session) {
        setIsSubmitting(false);
      }
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

    submitSessionRef.current += 1;
    setReason(null);
    setDetails("");
    setPendingRequest(null);
    setFailure(null);
    setIsSubmitting(false);
  }, [isOpen]);

  return (
    <>
      <LockerCorrectionRequestModal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        reason={reason}
        onReasonChange={handleReasonChange}
        details={details}
        onDetailsChange={handleDetailsChange}
        onSubmit={handleSubmit}
        errorMessage={failure ? getFailureMessage(failure) : undefined}
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
