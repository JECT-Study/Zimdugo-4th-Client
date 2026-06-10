import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "@repo/i18n";
import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type FieldErrors,
  type UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  type ReportPhotoValidationError,
  validateReportPhotoFile,
} from "#/features/report/lib/validate-report-photo-file";
import {
  ReportPhotoUploadValidationError,
  uploadReportPhoto,
} from "#/features/report/lib/upload-report-photo";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";
import { normalizeReportPayload } from "#/features/report/lib/normalize-report-payload";
import { parseReportSubmitFailure } from "#/features/report/lib/parse-report-submit-failure";
import { collectErrorSectionIds, mergeErrorSectionIds } from "#/features/report/lib/report-field-errors";
import {
  scrollToEarliestReportSection,
  scrollToReportSection,
} from "#/features/report/lib/scroll-to-report-section";
import { createLockerReport } from "#/features/report/api/create-locker-report";
import {
  applyValidationErrors,
  applyClientValidationIssues,
  getSectionAnchorFields,
  toClientValidationIssues,
} from "./report-error-targets";
import { parseReportForm, reportSchema } from "./report-schema";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import {
  MAX_REPORT_PHOTOS,
  type ReportFormValues,
  type ReportSectionId,
  reportDefaultValues,
  STEP_1_FIELDS,
} from "./report-types";

const getPhotoValidationMessage = (error: ReportPhotoValidationError): string =>
  error === "invalid_type"
    ? m.report_alert_image_only()
    : m.report_photo_max_size_exceeded();

const parsePriceNumber = (formatted: string): number | null => {
  const digits = formatted.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
};

type PendingValidationNavigation = {
  earliestStep: 1 | 2 | null;
  firstSectionId: ReportSectionId | null;
};

/** AnimatePresence exit(200ms) + wait 모드 이후 DOM 마운트 대기 */
const STEP_TRANSITION_SCROLL_MS = 250;

export function useReportForm(): {
  form: UseFormReturn<ReportFormValues>;
  step: number;
  sectionServerErrors: Partial<Record<ReportSectionId, string>>;
  isAddressOverlayOpen: boolean;
  setIsAddressOverlayOpen: (open: boolean) => void;
  isPopupOpen: boolean;
  setIsPopupOpen: (open: boolean) => void;
  isPhotoErrorPopupOpen: boolean;
  setIsPhotoErrorPopupOpen: (open: boolean) => void;
  isSubmitErrorPopupOpen: boolean;
  setIsSubmitErrorPopupOpen: (open: boolean) => void;
  submitErrorMessage: string;
  photoErrorMessage: string;
  isSubmitting: boolean;
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  minPriceDisplay: string;
  maxPriceDisplay: string;
  handlers: {
    handleBack: () => void;
    handleNext: () => Promise<void>;
    handleImageClick: () => void;
    handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleImageRemove: (index: number) => void;
    formatPrice: (val: string) => string;
    setMinPriceDisplay: (val: string) => void;
    setMaxPriceDisplay: (val: string) => void;
    handlePriceTypeChange: (type: "free" | "paid" | "none") => void;
    clearSectionError: (sectionId: ReportSectionId) => void;
    handleSubmitErrorPopupConfirm: () => void;
    handleSubmitErrorPopupOpenChange: (open: boolean) => void;
  };
  validation: { isStep1Valid: boolean; isStep2Valid: boolean };
} {
  const userId = useAuthStore((state) => state.userId);
  const form = useForm<ReportFormValues>({
    defaultValues: reportDefaultValues,
    resolver: zodResolver(reportSchema),
    mode: "onSubmit",
  });

  const { control, setValue, trigger, handleSubmit } = form;

  const [step, setStep] = useState(1);
  const [sectionServerErrors, setSectionServerErrors] = useState<
    Partial<Record<ReportSectionId, string>>
  >({});
  const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPhotoErrorPopupOpen, setIsPhotoErrorPopupOpen] = useState(false);
  const [isSubmitErrorPopupOpen, setIsSubmitErrorPopupOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [minPriceDisplay, setMinPriceDisplay] = useState("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPhotoFileRef = useRef<File | null>(null);
  const uploadedImagesRef = useRef(uploadedImages);
  const pendingValidationNavigationRef = useRef<PendingValidationNavigation | null>(
    null,
  );
  const scrollTimeoutRef = useRef<number | null>(null);
  const sectionServerErrorsRef = useRef(sectionServerErrors);

  const scheduleSectionScroll = useCallback(
    (scroll: () => void, afterStepTransition: boolean) => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      if (afterStepTransition) {
        scrollTimeoutRef.current = window.setTimeout(() => {
          scrollTimeoutRef.current = null;
          scroll();
        }, STEP_TRANSITION_SCROLL_MS);
        return;
      }

      requestAnimationFrame(scroll);
    },
    [],
  );

  useEffect(() => {
    sectionServerErrorsRef.current = sectionServerErrors;
  }, [sectionServerErrors]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    return () => {
      for (const url of uploadedImagesRef.current) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, []);

  const roadAddress = useWatch({ control, name: "roadAddress" }) ?? "";
  const lockerType = useWatch({ control, name: "lockerType" });
  const indoorOutdoorType = useWatch({ control, name: "indoorOutdoorType" });
  const locationConsentAgreed =
    useWatch({ control, name: "locationConsentAgreed" }) ?? false;

  const clearSectionError = useCallback(
    (sectionId: ReportSectionId) => {
      setSectionServerErrors((prev) => {
        if (!prev[sectionId]) return prev;
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });

      for (const field of getSectionAnchorFields(sectionId)) {
        form.clearErrors(field);
      }
    },
    [form],
  );

  const applyZodIssuesToUi = useCallback(
    (stepFilter?: 1 | 2) => {
      const parsed = parseReportForm(form.getValues());
      if (parsed.success) return [];

      return applyClientValidationIssues(
        toClientValidationIssues(parsed.error.issues),
        {
          setError: form.setError,
          setSectionServerErrors,
        },
        stepFilter ? { step: stepFilter } : undefined,
      );
    },
    [form],
  );

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleSubmitErrorPopupConfirm = useCallback(() => {
    const pending = pendingValidationNavigationRef.current;
    pendingValidationNavigationRef.current = null;
    setIsSubmitErrorPopupOpen(false);

    if (!pending) return;

    const afterStepTransition = pending.earliestStep === 1 && step === 2;
    if (pending.earliestStep === 1) {
      setStep(1);
    }

    scheduleSectionScroll(() => {
      if (pending.firstSectionId) {
        scrollToReportSection(pending.firstSectionId);
        return;
      }

      const sectionIds = mergeErrorSectionIds(
        form.formState.errors,
        sectionServerErrorsRef.current,
      );
      if (sectionIds.length > 0) {
        scrollToEarliestReportSection(sectionIds);
      }
    }, afterStepTransition);
  }, [form.formState.errors, scheduleSectionScroll, step]);

  const handleSubmitErrorPopupOpenChange = useCallback((open: boolean) => {
    if (!open) {
      pendingValidationNavigationRef.current = null;
    }
    setIsSubmitErrorPopupOpen(open);
  }, []);

  const onSubmit = useCallback(
    async (data: ReportFormValues) => {
      if (userId == null) {
        useAuthPopupStore.getState().openPopup("/report");
        return;
      }

      const hasReportPhoto =
        selectedPhotoFileRef.current !== null ||
        uploadedImagesRef.current.length > 0 ||
        data.imageUrl !== null;
      if (hasReportPhoto && !data.locationConsentAgreed) {
        pendingValidationNavigationRef.current = {
          earliestStep: 2,
          firstSectionId: "agreement",
        };
        setSubmitErrorMessage(m.report_submit_agreement_required());
        setIsSubmitErrorPopupOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        let imageUrl: string | null = null;
        const selectedPhotoFile = selectedPhotoFileRef.current;

        if (selectedPhotoFile) {
          try {
            imageUrl = await uploadReportPhoto(selectedPhotoFile);
          } catch (error) {
            if (parseReportSubmitFailure(error).kind === "auth") {
              useAuthPopupStore.getState().openPopup("/report");
              return;
            }

            if (error instanceof ReportPhotoUploadValidationError) {
              setPhotoErrorMessage(
                getPhotoValidationMessage(error.code),
              );
              setIsPhotoErrorPopupOpen(true);
              requestAnimationFrame(() => {
                scrollToReportSection("photo");
              });
              return;
            }

            setPhotoErrorMessage(m.report_photo_upload_failed());
            setIsPhotoErrorPopupOpen(true);
            requestAnimationFrame(() => {
              scrollToReportSection("photo");
            });
            return;
          }
        }

        const payload = normalizeReportPayload({ ...data, imageUrl });
        await createLockerReport(payload, { userId });
        setIsPopupOpen(true);
      } catch (error) {
        const failure = parseReportSubmitFailure(error);

        if (failure.kind === "validation") {
          const result = applyValidationErrors(failure.validationErrors, {
            setError: form.setError,
            setSectionServerErrors,
            clearErrors: form.clearErrors,
          });

          pendingValidationNavigationRef.current = {
            earliestStep: result.agreementConsentRequired
              ? 2
              : result.earliestStep,
            firstSectionId: result.firstSectionId,
          };

          setSubmitErrorMessage(
            result.hasUnknown
              ? m.report_submit_unknown_validation_error()
              : result.agreementConsentRequired
                ? m.report_submit_agreement_required()
                : m.report_submit_validation_check_title(),
          );
          setIsSubmitErrorPopupOpen(true);
          return;
        }

        if (failure.kind === "auth") {
          useAuthPopupStore.getState().openPopup("/report");
          return;
        }

        pendingValidationNavigationRef.current = null;
        setSubmitErrorMessage(m.report_submit_error_title());
        setIsSubmitErrorPopupOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, userId],
  );

  const scrollToFirstFieldError = useCallback(
    (
      errors: FieldErrors<ReportFormValues>,
      afterStepTransition = false,
    ) => {
      const sectionIds = collectErrorSectionIds(errors);
      if (sectionIds.length === 0) return;
      scheduleSectionScroll(
        () => scrollToEarliestReportSection(sectionIds),
        afterStepTransition,
      );
    },
    [scheduleSectionScroll],
  );

  const onInvalid = useCallback(
    (errors: FieldErrors<ReportFormValues>) => {
      setIsSubmitting(false);
      const sectionIds = applyZodIssuesToUi();
      const hasStep1Error = STEP_1_FIELDS.some((field) => errors[field]);
      const afterStepTransition = hasStep1Error && step === 2;
      if (hasStep1Error) {
        setStep(1);
      }
      if (sectionIds.length > 0) {
        scheduleSectionScroll(
          () => scrollToEarliestReportSection(sectionIds),
          afterStepTransition,
        );
        return;
      }
      scrollToFirstFieldError(errors, afterStepTransition);
    },
    [applyZodIssuesToUi, scrollToFirstFieldError, scheduleSectionScroll, step],
  );

  const handleNext = useCallback(async () => {
    if (step < 2) {
      const isValid = await trigger([...STEP_1_FIELDS]);
      if (isValid) {
        setStep(2);
        window.scrollTo(0, 0);
      } else {
        const sectionIds = applyZodIssuesToUi(1);
        if (sectionIds.length > 0) {
          requestAnimationFrame(() => {
            scrollToEarliestReportSection(sectionIds);
          });
        }
      }
      return;
    }

    await handleSubmit(onSubmit, onInvalid)();
  }, [
    step,
    trigger,
    handleSubmit,
    onSubmit,
    onInvalid,
    applyZodIssuesToUi,
  ]);

  const formatPrice = useCallback((val: string) => formatPriceInput(val), []);

  const handleMinPriceDisplayChange = useCallback(
    (val: string) => {
      const formatted = formatPrice(val);
      setMinPriceDisplay(formatted);
      setValue("minPrice", parsePriceNumber(formatted), { shouldDirty: true });
      clearSectionError("price");
    },
    [clearSectionError, formatPrice, setValue],
  );

  const handleMaxPriceDisplayChange = useCallback(
    (val: string) => {
      const formatted = formatPrice(val);
      setMaxPriceDisplay(formatted);
      setValue("maxPrice", parsePriceNumber(formatted), { shouldDirty: true });
      clearSectionError("price");
    },
    [clearSectionError, formatPrice, setValue],
  );

  const handlePriceTypeChange = useCallback(
    (type: "free" | "paid" | "none") => {
      if (type === "free") {
        setValue("isFree", true, { shouldDirty: true });
        setValue("minPrice", null, { shouldDirty: true });
        setValue("maxPrice", null, { shouldDirty: true });
        setMinPriceDisplay("");
        setMaxPriceDisplay("");
      } else if (type === "paid") {
        setValue("isFree", false, { shouldDirty: true });
      } else {
        setValue("isFree", null, { shouldDirty: true });
        setValue("minPrice", null, { shouldDirty: true });
        setValue("maxPrice", null, { shouldDirty: true });
        setMinPriceDisplay("");
        setMaxPriceDisplay("");
      }
      clearSectionError("price");
    },
    [clearSectionError, setValue],
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      if (uploadedImages.length >= MAX_REPORT_PHOTOS) {
        setPhotoErrorMessage(m.report_photo_max_count_exceeded());
        setIsPhotoErrorPopupOpen(true);
        e.target.value = "";
        return;
      }

      const selectedFile = files[0];
      const validation = validateReportPhotoFile(selectedFile);

      if (!validation.ok) {
        setPhotoErrorMessage(getPhotoValidationMessage(validation.error));
        setIsPhotoErrorPopupOpen(true);
        e.target.value = "";
        return;
      }

      const previousPreviewUrl = uploadedImages[0];
      if (previousPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreviewUrl);
      }

      selectedPhotoFileRef.current = selectedFile;
      setValue("imageUrl", null, { shouldDirty: true });
      setValue("locationConsentAgreed", false, { shouldDirty: true });
      setUploadedImages([URL.createObjectURL(selectedFile)]);
      clearSectionError("photo");
      e.target.value = "";
    },
    [clearSectionError, setValue, uploadedImages],
  );

  const handleImageRemove = useCallback(
    (index: number) => {
      const targetUrl = uploadedImages[index];
      if (targetUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(targetUrl);
      }
      selectedPhotoFileRef.current = null;
      setValue("imageUrl", null, { shouldDirty: true });
      setValue("locationConsentAgreed", false, { shouldDirty: true });
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      clearSectionError("photo");
    },
    [clearSectionError, setValue, uploadedImages],
  );

  const isStep1Valid =
    !!roadAddress.trim() && lockerType !== null && indoorOutdoorType !== null;
  const hasUploadedReportPhoto = uploadedImages.length > 0;
  const isStep2Valid = !hasUploadedReportPhoto || locationConsentAgreed;

  return {
    form,
    step,
    sectionServerErrors,
    isAddressOverlayOpen,
    setIsAddressOverlayOpen,
    isPopupOpen,
    setIsPopupOpen,
    isPhotoErrorPopupOpen,
    setIsPhotoErrorPopupOpen,
    isSubmitErrorPopupOpen,
    setIsSubmitErrorPopupOpen,
    submitErrorMessage,
    photoErrorMessage,
    isSubmitting,
    uploadedImages,
    fileInputRef,
    minPriceDisplay,
    maxPriceDisplay,
    handlers: {
      handleBack,
      handleNext,
      handleImageClick,
      handleImageChange,
      handleImageRemove,
      formatPrice,
      setMinPriceDisplay: handleMinPriceDisplayChange,
      setMaxPriceDisplay: handleMaxPriceDisplayChange,
      handlePriceTypeChange,
      clearSectionError,
      handleSubmitErrorPopupConfirm,
      handleSubmitErrorPopupOpenChange,
    },
    validation: { isStep1Valid, isStep2Valid },
  };
}
