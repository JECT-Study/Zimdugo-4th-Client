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
import { postLockerReport } from "#/features/report/api/create-locker-report";
import { normalizeReportPayload } from "#/features/report/lib/normalize-report-payload";
import { parseReportSubmitFailure } from "#/features/report/lib/parse-report-submit-failure";
import {
  collectErrorSectionIds,
  mergeErrorSectionIds,
} from "#/features/report/lib/report-field-errors";
import {
  clearReportPrivacyNavigationHold,
  consumeReportPrivacyNavigationState,
  shouldPreserveReportBlobUrlsOnUnmount,
  stashReportStateForPrivacyPolicy,
} from "#/features/report/lib/report-privacy-navigation";
import { getReportValidationMessage } from "#/features/report/lib/report-validation-message";
import { requiresExifConsent } from "#/features/report/lib/requires-exif-consent";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";
import {
  scrollToEarliestReportSection,
  scrollToReportSection,
} from "#/features/report/lib/scroll-to-report-section";
import {
  ReportPhotoUploadValidationError,
  uploadReportPhoto,
} from "#/features/report/lib/upload-report-photo";
import {
  type ReportPhotoValidationError,
  validateReportPhotoFile,
} from "#/features/report/lib/validate-report-photo-file";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import {
  applyClientValidationIssues,
  applyValidationErrors,
  getSectionAnchorFields,
  toClientValidationIssues,
} from "./report-error-targets";
import { parseReportForm, reportSchema } from "./report-schema";
import {
  MAX_REPORT_PHOTOS,
  type ReportFormValues,
  type ReportSectionId,
  reportDefaultValues,
} from "./report-types";

const getPhotoValidationMessage = (
  error: ReportPhotoValidationError,
): string =>
  error === "invalid_type"
    ? m.report_alert_image_only()
    : m.report_photo_max_size_exceeded();

const parsePriceNumber = (formatted: string): number | null => {
  const digits = formatted.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
};

type PendingValidationNavigation = {
  firstSectionId: ReportSectionId | null;
};

export const isReportRequiredFieldsComplete = (
  values: Pick<
    ReportFormValues,
    | "roadAddress"
    | "latitude"
    | "longitude"
    | "indoorOutdoorType"
    | "lockerType"
    | "hasFloor"
    | "floorType"
    | "floorNumber"
    | "sizeTypes"
  >,
): boolean => {
  const isFloorComplete =
    values.hasFloor === false ||
    (values.hasFloor === true &&
      values.floorType !== null &&
      values.floorNumber !== null &&
      values.floorNumber >= 1);

  return (
    values.roadAddress.trim().length > 0 &&
    values.latitude !== null &&
    values.longitude !== null &&
    values.indoorOutdoorType !== null &&
    values.lockerType !== null &&
    values.hasFloor !== null &&
    isFloorComplete &&
    values.sizeTypes.length > 0
  );
};

export const isReportSubmitEnabled = ({
  areRequiredFieldsComplete,
  shouldRequireExifConsent,
  locationConsentAgreed,
}: {
  areRequiredFieldsComplete: boolean;
  shouldRequireExifConsent: boolean;
  locationConsentAgreed: boolean;
}): boolean => {
  const isExifConsentSatisfied =
    !shouldRequireExifConsent || locationConsentAgreed;

  return isExifConsentSatisfied && areRequiredFieldsComplete;
};

export const isReportOptionalFieldsComplete = ({
  isFree,
  minPrice,
  maxPrice,
  startTime,
  endTime,
  additionalInfo,
  imageUrl,
  uploadedImageCount,
}: Pick<
  ReportFormValues,
  | "isFree"
  | "minPrice"
  | "maxPrice"
  | "startTime"
  | "endTime"
  | "additionalInfo"
  | "imageUrl"
> & {
  uploadedImageCount: number;
}): boolean => {
  const isPriceComplete =
    isFree === true ||
    isFree === null ||
    (isFree === false && minPrice !== null && maxPrice !== null);
  const isTimeComplete = startTime !== null && endTime !== null;
  const isAdditionalInfoComplete = additionalInfo.trim().length > 0;
  const isPhotoComplete = imageUrl !== null || uploadedImageCount > 0;

  return (
    isPriceComplete &&
    isTimeComplete &&
    isAdditionalInfoComplete &&
    isPhotoComplete
  );
};

export function useReportForm(): {
  form: UseFormReturn<ReportFormValues>;
  sectionServerErrors: Partial<Record<ReportSectionId, string>>;
  isAddressOverlayOpen: boolean;
  setIsAddressOverlayOpen: (open: boolean) => void;
  isPopupOpen: boolean;
  setIsPopupOpen: (open: boolean) => void;
  isPhotoErrorPopupOpen: boolean;
  setIsPhotoErrorPopupOpen: (open: boolean) => void;
  isSubmitErrorPopupOpen: boolean;
  setIsSubmitErrorPopupOpen: (open: boolean) => void;
  isSubmitConfirmPopupOpen: boolean;
  submitErrorMessage: string;
  photoErrorMessage: string;
  isSubmitting: boolean;
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  minPriceDisplay: string;
  maxPriceDisplay: string;
  handlers: {
    handleSubmitPress: () => Promise<void>;
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
    handleSubmitConfirmPopupOpenChange: (open: boolean) => void;
    handleConfirmSubmit: () => Promise<void>;
    preparePrivacyPolicyNavigation: () => void;
  };
  validation: {
    areRequiredFieldsComplete: boolean;
    isExifConsentSatisfied: boolean;
    isSubmitEnabled: boolean;
    areOptionalFieldsComplete: boolean;
  };
} {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const form = useForm<ReportFormValues>({
    defaultValues: reportDefaultValues,
    resolver: zodResolver(reportSchema),
    mode: "onSubmit",
  });

  const { control, setValue, handleSubmit } = form;

  const [sectionServerErrors, setSectionServerErrors] = useState<
    Partial<Record<ReportSectionId, string>>
  >({});
  const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPhotoErrorPopupOpen, setIsPhotoErrorPopupOpen] = useState(false);
  const [isSubmitErrorPopupOpen, setIsSubmitErrorPopupOpen] = useState(false);
  const [isSubmitConfirmPopupOpen, setIsSubmitConfirmPopupOpen] =
    useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [minPriceDisplay, setMinPriceDisplay] = useState("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPhotoFileRef = useRef<File | null>(null);
  const uploadedImagesRef = useRef(uploadedImages);
  const pendingValidationNavigationRef =
    useRef<PendingValidationNavigation | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const sectionServerErrorsRef = useRef(sectionServerErrors);

  const scheduleSectionScroll = useCallback((scroll: () => void) => {
    if (scrollRafRef.current !== null) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      scroll();
    });
  }, []);

  useEffect(() => {
    sectionServerErrorsRef.current = sectionServerErrors;
  }, [sectionServerErrors]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    const restored = consumeReportPrivacyNavigationState();
    if (restored) {
      form.reset(restored.values);
      setMinPriceDisplay(restored.minPriceDisplay);
      setMaxPriceDisplay(restored.maxPriceDisplay);
      setUploadedImages(restored.uploadedImages);
      selectedPhotoFileRef.current = restored.selectedPhotoFile;
      clearReportPrivacyNavigationHold();
    }
  }, [form]);

  useEffect(() => {
    return () => {
      if (shouldPreserveReportBlobUrlsOnUnmount()) {
        return;
      }

      for (const url of uploadedImagesRef.current) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, []);

  const locationConsentAgreed =
    useWatch({ control, name: "locationConsentAgreed" }) ?? false;
  const imageUrl = useWatch({ control, name: "imageUrl" }) ?? null;
  const roadAddress = useWatch({ control, name: "roadAddress" }) ?? "";
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const indoorOutdoorType = useWatch({ control, name: "indoorOutdoorType" });
  const lockerType = useWatch({ control, name: "lockerType" });
  const hasFloor = useWatch({ control, name: "hasFloor" });
  const floorType = useWatch({ control, name: "floorType" });
  const floorNumber = useWatch({ control, name: "floorNumber" });
  const sizeTypes = useWatch({ control, name: "sizeTypes" }) ?? [];
  const isFree = useWatch({ control, name: "isFree" });
  const minPrice = useWatch({ control, name: "minPrice" });
  const maxPrice = useWatch({ control, name: "maxPrice" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const additionalInfo = useWatch({ control, name: "additionalInfo" }) ?? "";

  useEffect(() => {
    if (
      uploadedImages.length === 0 &&
      selectedPhotoFileRef.current === null &&
      imageUrl !== null
    ) {
      setValue("imageUrl", null, { shouldDirty: true });
      setValue("locationConsentAgreed", false, { shouldDirty: true });
      form.clearErrors("locationConsentAgreed");
    }
  }, [form, imageUrl, setValue, uploadedImages]);

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

  const resetPhotoInputState = useCallback(() => {
    for (const url of uploadedImagesRef.current) {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }

    selectedPhotoFileRef.current = null;
    setUploadedImages([]);
    setValue("imageUrl", null, { shouldDirty: true });
    setValue("locationConsentAgreed", false, { shouldDirty: true });
    form.clearErrors("locationConsentAgreed");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form, setValue]);

  const getExifConsentRequirement = useCallback(() => {
    return requiresExifConsent({
      imageUrl: form.getValues("imageUrl"),
      uploadedImageCount: uploadedImagesRef.current.length,
      hasSelectedPhotoFile: selectedPhotoFileRef.current !== null,
    });
  }, [form]);

  const applyZodIssuesToUi = useCallback(() => {
    const parsed = parseReportForm(form.getValues());
    if (parsed.success) return [];

    const shouldRequireExifConsent = getExifConsentRequirement();
    const issues = toClientValidationIssues(parsed.error.issues).filter(
      (issue) => {
        if (issue.path[0] !== "locationConsentAgreed") {
          return true;
        }

        return shouldRequireExifConsent;
      },
    );

    return applyClientValidationIssues(issues, {
      setError: form.setError,
      setSectionServerErrors,
    });
  }, [form, getExifConsentRequirement]);

  const handleAuthFailure = useCallback(() => {
    pendingValidationNavigationRef.current = null;
    form.clearErrors();
    setSectionServerErrors({});
    setSubmitErrorMessage("");
    setPhotoErrorMessage("");
    setIsSubmitErrorPopupOpen(false);
    setIsPhotoErrorPopupOpen(false);
    useAuthPopupStore.getState().openPopup("/report");
  }, [form]);

  const scrollToPendingValidationSection = useCallback(() => {
    const pending = pendingValidationNavigationRef.current;
    pendingValidationNavigationRef.current = null;

    if (!pending) return;

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
    });
  }, [form.formState.errors, scheduleSectionScroll]);

  const handleSubmitErrorPopupConfirm = useCallback(() => {
    setIsSubmitErrorPopupOpen(false);
    scrollToPendingValidationSection();
  }, [scrollToPendingValidationSection]);

  const handleSubmitErrorPopupOpenChange = useCallback(
    (open: boolean) => {
      setIsSubmitErrorPopupOpen(open);

      if (!open) {
        scrollToPendingValidationSection();
      }
    },
    [scrollToPendingValidationSection],
  );

  const onSubmit = useCallback(
    async (data: ReportFormValues) => {
      if (!isAuthenticated) {
        handleAuthFailure();
        return;
      }

      const shouldRequireExifConsent = requiresExifConsent({
        imageUrl: data.imageUrl,
        uploadedImageCount: uploadedImagesRef.current.length,
        hasSelectedPhotoFile: selectedPhotoFileRef.current !== null,
      });
      if (shouldRequireExifConsent && !data.locationConsentAgreed) {
        pendingValidationNavigationRef.current = {
          firstSectionId: "agreement",
        };
        setSubmitErrorMessage(m.report_submit_agreement_required());
        setIsSubmitErrorPopupOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        let imageUrl: string | null = data.imageUrl;
        const selectedPhotoFile = selectedPhotoFileRef.current;

        if (selectedPhotoFile) {
          try {
            imageUrl = await uploadReportPhoto(selectedPhotoFile);
          } catch (error) {
            if (parseReportSubmitFailure(error).kind === "auth") {
              handleAuthFailure();
              return;
            }

            if (error instanceof ReportPhotoUploadValidationError) {
              const message = getPhotoValidationMessage(error.code);
              resetPhotoInputState();
              setPhotoErrorMessage(message);
              setSectionServerErrors((prev) => ({ ...prev, photo: message }));
              setIsPhotoErrorPopupOpen(true);
              requestAnimationFrame(() => {
                scrollToReportSection("photo");
              });
              return;
            }

            const message = m.report_photo_upload_failed();
            resetPhotoInputState();
            setPhotoErrorMessage(message);
            setSectionServerErrors((prev) => ({ ...prev, photo: message }));
            setIsPhotoErrorPopupOpen(true);
            requestAnimationFrame(() => {
              scrollToReportSection("photo");
            });
            return;
          }
        }

        const payload = normalizeReportPayload({ ...data, imageUrl });
        await postLockerReport(payload);
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
            firstSectionId: result.firstSectionId,
          };

          setSubmitErrorMessage(
            result.hasUnknown
              ? m.report_submit_unknown_validation_error()
              : result.agreementConsentRequired
                ? m.report_submit_agreement_required()
                : result.firstMessage
                  ? getReportValidationMessage(result.firstMessage)
                  : m.report_submit_validation_check_title(),
          );
          setIsSubmitErrorPopupOpen(true);
          return;
        }

        if (failure.kind === "auth") {
          handleAuthFailure();
          return;
        }

        pendingValidationNavigationRef.current = null;
        setSubmitErrorMessage(m.report_submit_error_title());
        setIsSubmitErrorPopupOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, handleAuthFailure, isAuthenticated, resetPhotoInputState],
  );

  const scrollToFirstFieldError = useCallback(
    (errors: FieldErrors<ReportFormValues>) => {
      const sectionIds = collectErrorSectionIds(errors);
      if (sectionIds.length === 0) return;
      scheduleSectionScroll(() => scrollToEarliestReportSection(sectionIds));
    },
    [scheduleSectionScroll],
  );

  const onInvalid = useCallback(
    (errors: FieldErrors<ReportFormValues>) => {
      setIsSubmitting(false);
      const sectionIds = applyZodIssuesToUi();
      if (sectionIds.length > 0) {
        scheduleSectionScroll(() => scrollToEarliestReportSection(sectionIds));
        return;
      }
      scrollToFirstFieldError(errors);
    },
    [applyZodIssuesToUi, scrollToFirstFieldError, scheduleSectionScroll],
  );

  const handleSubmitConfirmPopupOpenChange = useCallback(
    (open: boolean) => {
      if (isSubmitting) {
        return;
      }
      setIsSubmitConfirmPopupOpen(open);
    },
    [isSubmitting],
  );

  const handleConfirmSubmit = useCallback(async () => {
    setIsSubmitConfirmPopupOpen(false);
    await handleSubmit(onSubmit, onInvalid)();
  }, [handleSubmit, onInvalid, onSubmit]);

  const handleSubmitPress = useCallback(async () => {
    await handleSubmit(() => {
      setIsSubmitConfirmPopupOpen(true);
    }, onInvalid)();
  }, [handleSubmit, onInvalid]);

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
        const message = m.report_photo_max_count_exceeded();
        resetPhotoInputState();
        setPhotoErrorMessage(message);
        setSectionServerErrors((prev) => ({ ...prev, photo: message }));
        setIsPhotoErrorPopupOpen(true);
        return;
      }

      const selectedFile = files[0];
      const validation = validateReportPhotoFile(selectedFile);

      if (!validation.ok) {
        const message = getPhotoValidationMessage(validation.error);
        resetPhotoInputState();
        setPhotoErrorMessage(message);
        setSectionServerErrors((prev) => ({ ...prev, photo: message }));
        setIsPhotoErrorPopupOpen(true);
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
    [clearSectionError, resetPhotoInputState, setValue, uploadedImages],
  );

  const preparePrivacyPolicyNavigation = useCallback(() => {
    stashReportStateForPrivacyPolicy({
      values: form.getValues(),
      minPriceDisplay,
      maxPriceDisplay,
      uploadedImages,
      selectedPhotoFile: selectedPhotoFileRef.current,
    });
  }, [form, maxPriceDisplay, minPriceDisplay, uploadedImages]);

  const handleImageRemove = useCallback(
    (index: number) => {
      const targetUrl = uploadedImages[index];
      if (targetUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(targetUrl);
      }
      selectedPhotoFileRef.current = null;
      setValue("imageUrl", null, { shouldDirty: true });
      setValue("locationConsentAgreed", false, { shouldDirty: true });
      form.clearErrors("locationConsentAgreed");
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      clearSectionError("photo");
    },
    [clearSectionError, form, setValue, uploadedImages],
  );

  const shouldRequireExifConsent = requiresExifConsent({
    imageUrl,
    uploadedImageCount: uploadedImages.length,
    hasSelectedPhotoFile: selectedPhotoFileRef.current !== null,
  });
  const areRequiredFieldsComplete = isReportRequiredFieldsComplete({
    roadAddress,
    latitude,
    longitude,
    indoorOutdoorType,
    lockerType,
    hasFloor,
    floorType,
    floorNumber,
    sizeTypes,
  });
  const isExifConsentSatisfied =
    !shouldRequireExifConsent || locationConsentAgreed;
  const isSubmitEnabled = isReportSubmitEnabled({
    areRequiredFieldsComplete,
    shouldRequireExifConsent,
    locationConsentAgreed,
  });
  const areOptionalFieldsComplete = isReportOptionalFieldsComplete({
    isFree,
    minPrice,
    maxPrice,
    startTime,
    endTime,
    additionalInfo,
    imageUrl,
    uploadedImageCount: uploadedImages.length,
  });

  return {
    form,
    sectionServerErrors,
    isAddressOverlayOpen,
    setIsAddressOverlayOpen,
    isPopupOpen,
    setIsPopupOpen,
    isPhotoErrorPopupOpen,
    setIsPhotoErrorPopupOpen,
    isSubmitErrorPopupOpen,
    setIsSubmitErrorPopupOpen,
    isSubmitConfirmPopupOpen,
    submitErrorMessage,
    photoErrorMessage,
    isSubmitting,
    uploadedImages,
    fileInputRef,
    minPriceDisplay,
    maxPriceDisplay,
    handlers: {
      handleSubmitPress,
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
      handleSubmitConfirmPopupOpenChange,
      handleConfirmSubmit,
      preparePrivacyPolicyNavigation,
    },
    validation: {
      areRequiredFieldsComplete,
      isExifConsentSatisfied,
      isSubmitEnabled,
      areOptionalFieldsComplete,
    },
  };
}
