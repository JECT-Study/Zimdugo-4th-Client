import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Dropdown, type DropdownOption } from "@repo/ui/components/dropdown";
import { TextareaField } from "@repo/ui/components/textarea-field";
import { IconX24 } from "@repo/ui/tokens/icons";
import type { Key } from "react";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  LOCKER_CORRECTION_REASON,
  type LockerCorrectionReason,
  type LockerCorrectionRequest,
  MAX_LOCKER_CORRECTION_DETAILS_LENGTH,
} from "../model/locker-correction-types";
import {
  closeButton,
  container,
  content,
  copy,
  detailsField,
  dialog,
  dropdown,
  header,
  heading,
  helper,
  modal,
  overlay,
  submitButton,
  submitError,
  title,
} from "./LockerCorrectionRequestModal.css.ts";

const getReasonLabel = (reason: LockerCorrectionReason): string => {
  switch (reason) {
    case LOCKER_CORRECTION_REASON.Closed:
      return m.locker_correction_reason_closed();
    case LOCKER_CORRECTION_REASON.WrongLocation:
      return m.locker_correction_reason_location();
    case LOCKER_CORRECTION_REASON.WrongOperatingHours:
      return m.locker_correction_reason_hours();
    case LOCKER_CORRECTION_REASON.MissingSize:
      return m.locker_correction_reason_size();
    case LOCKER_CORRECTION_REASON.WrongPhoto:
      return m.locker_correction_reason_photo();
    case LOCKER_CORRECTION_REASON.WrongPrice:
      return m.locker_correction_reason_price();
    case LOCKER_CORRECTION_REASON.Other:
      return m.locker_correction_reason_other();
  }
};

const getReasonOptions = (): DropdownOption[] =>
  Object.values(LOCKER_CORRECTION_REASON).map((reason) => ({
    id: reason,
    label: getReasonLabel(reason),
  }));

export interface LockerCorrectionRequestModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reason: LockerCorrectionReason | null;
  onReasonChange: (reason: LockerCorrectionReason) => void;
  details: string;
  onDetailsChange: (details: string) => void;
  onSubmit: (request: LockerCorrectionRequest) => void;
  /** 제출 실패 안내. 없으면 자리만 유지한다. */
  errorMessage?: string;
  isSubmitting?: boolean;
  isReasonMenuOpen?: boolean;
  onReasonMenuOpenChange?: (isOpen: boolean) => void;
}

export function LockerCorrectionRequestModal({
  isOpen,
  onOpenChange,
  reason,
  onReasonChange,
  details,
  onDetailsChange,
  onSubmit,
  errorMessage,
  isSubmitting = false,
  isReasonMenuOpen,
  onReasonMenuOpenChange,
}: LockerCorrectionRequestModalProps) {
  const reasonOptions = getReasonOptions();
  const isOtherReason = reason === LOCKER_CORRECTION_REASON.Other;
  const hasDetails = details.trim().length > 0;
  const isSubmitDisabled =
    reason === null || isSubmitting || (isOtherReason && !hasDetails);
  const detailsPlaceholder = isOtherReason
    ? m.locker_correction_details_required_placeholder()
    : m.locker_correction_details_placeholder();

  const handleReasonChange = (key: Key | null) => {
    if (key === null) {
      return;
    }

    onReasonChange(key as LockerCorrectionReason);
  };

  const handleSubmit = () => {
    if (reason === null) {
      return;
    }

    const normalizedDetails = details.trim();
    onSubmit({
      reason,
      details: normalizedDetails.length > 0 ? normalizedDetails : null,
    });
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isSubmitting}
      className={overlay}
    >
      <Modal className={modal}>
        <Dialog className={dialog} aria-label={m.locker_correction_title()}>
          <div className={container}>
            <header className={header}>
              <h2 className={title}>{m.locker_correction_title()}</h2>
              <AriaButton
                className={closeButton}
                onPress={() => onOpenChange(false)}
                isDisabled={isSubmitting}
                aria-label={m.locker_correction_close_aria()}
              >
                <IconX24 />
              </AriaButton>
            </header>

            <div className={content}>
              <div className={copy}>
                <p className={heading}>{m.locker_correction_heading()}</p>
                <p className={helper}>{m.locker_correction_helper()}</p>
              </div>

              <Dropdown
                className={dropdown}
                options={reasonOptions}
                placeholder={m.locker_correction_reason_placeholder()}
                aria-label={m.locker_correction_reason_aria()}
                selectedKey={reason}
                onSelectionChange={handleReasonChange}
                isOpen={isReasonMenuOpen}
                onOpenChange={onReasonMenuOpenChange}
                size="compact"
              />

              {reason !== null ? (
                <TextareaField
                  className={detailsField}
                  size="compact"
                  value={details}
                  onChange={onDetailsChange}
                  maxLength={MAX_LOCKER_CORRECTION_DETAILS_LENGTH}
                  placeholder={detailsPlaceholder}
                  aria-label={detailsPlaceholder}
                />
              ) : null}

              <p
                className={submitError}
                role={errorMessage ? "alert" : undefined}
                aria-hidden={errorMessage ? undefined : true}
              >
                {errorMessage ?? "\u00A0"}
              </p>

              <Button
                className={submitButton}
                variant="filled"
                intent="primary"
                size="L"
                isDisabled={isSubmitDisabled}
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                {m.locker_correction_submit()}
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
