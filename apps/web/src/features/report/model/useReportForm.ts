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
} from "react-hook-form";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";
import { reportSchema } from "./report-schema";
import {
  MAX_REPORT_PHOTOS,
  MAX_REPORT_PHOTO_SIZE_BYTES,
  type ReportFormValues,
  type ReportSectionId,
  reportDefaultValues,
  STEP_1_FIELDS,
} from "./report-types";

const parsePriceNumber = (formatted: string): number | null => {
  const digits = formatted.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
};

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
  photoErrorMessage: string;
  isSubmitting: boolean;
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  minPriceDisplay: string;
  maxPriceDisplay: string;
  dial: {
    dialPrefix: string;
    setDialPrefix: (val: string) => void;
    dialD1: string;
    setDialD1: (val: string) => void;
    dialD2: string;
    setDialD2: (val: string) => void;
    dialD3: string;
    setDialD3: (val: string) => void;
  };
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
    handleUiFloorTypeChange: (val: string | number) => void;
    handleFloorNumberChange: (val: string) => void;
  };
  validation: { isStep1Valid: boolean; isStep2Valid: boolean };
} {
  const form = useForm<ReportFormValues>({
    defaultValues: reportDefaultValues,
    resolver: zodResolver(reportSchema),
    mode: "onSubmit",
  });

  const { watch, setValue, trigger, handleSubmit } = form;

  const [step, setStep] = useState(1);
  const [sectionServerErrors, setSectionServerErrors] = useState<
    Partial<Record<ReportSectionId, string>>
  >({});
  const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPhotoErrorPopupOpen, setIsPhotoErrorPopupOpen] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [minPriceDisplay, setMinPriceDisplay] = useState("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadedImagesRef = useRef(uploadedImages);

  const [dialPrefix, setDialPrefix] = useState("ground");
  const [dialD1, setDialD1] = useState("0");
  const [dialD2, setDialD2] = useState("0");
  const [dialD3, setDialD3] = useState("1");

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      for (const url of uploadedImagesRef.current) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, []);

  const roadAddress = watch("roadAddress");
  const lockerType = watch("lockerType");
  const indoorOutdoorType = watch("indoorOutdoorType");
  const locationConsentAgreed = watch("locationConsentAgreed");

  const clearSectionError = useCallback((sectionId: ReportSectionId) => {
    setSectionServerErrors((prev) => {
      if (!prev[sectionId]) return prev;
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  }, []);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const onSubmit = useCallback((_data: ReportFormValues) => {
    setIsSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setIsPopupOpen(true);
    }, 1500);
  }, []);

  const onInvalid = useCallback((errors: FieldErrors<ReportFormValues>) => {
    setIsSubmitting(false);
    const hasStep1Error = STEP_1_FIELDS.some((field) => errors[field]);
    if (hasStep1Error) {
      setStep(1);
    }
  }, []);

  const handleNext = useCallback(async () => {
    if (step < 2) {
      const isValid = await trigger([...STEP_1_FIELDS]);
      if (isValid) {
        setStep(2);
        window.scrollTo(0, 0);
      }
      return;
    }

    await handleSubmit(onSubmit, onInvalid)();
  }, [step, trigger, handleSubmit, onSubmit, onInvalid]);

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

  const handleUiFloorTypeChange = useCallback(
    (val: string | number) => {
      if (val === "none") {
        setValue("hasFloor", false, { shouldDirty: true });
        setValue("floorType", null, { shouldDirty: true });
        setValue("floorNumber", null, { shouldDirty: true });
      } else if (val === "exists") {
        setValue("hasFloor", true, { shouldDirty: true });
      }
      clearSectionError("floor");
    },
    [clearSectionError, setValue],
  );

  const handleFloorNumberChange = useCallback(
    (val: string) => {
      if (!val) {
        setValue("floorType", null, { shouldDirty: true });
        setValue("floorNumber", null, { shouldDirty: true });
        return;
      }

      const isUnderground = val.startsWith("B");
      const numPart = isUnderground ? val.slice(1) : val;
      const parsed = Number.parseInt(numPart, 10);
      if (Number.isNaN(parsed)) return;

      setValue("hasFloor", true, { shouldDirty: true });
      setValue(
        "floorType",
        isUnderground ? "UNDERGROUND" : "ABOVE_GROUND",
        { shouldDirty: true },
      );
      setValue("floorNumber", parsed, { shouldDirty: true });
      clearSectionError("floor");
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

      const imageFile = Array.from(files).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!imageFile) {
        e.target.value = "";
        return;
      }

      if (imageFile.size > MAX_REPORT_PHOTO_SIZE_BYTES) {
        setPhotoErrorMessage(m.report_photo_max_size_exceeded());
        setIsPhotoErrorPopupOpen(true);
        e.target.value = "";
        return;
      }

      setUploadedImages([URL.createObjectURL(imageFile)]);
      e.target.value = "";
    },
    [uploadedImages.length],
  );

  const handleImageRemove = useCallback(
    (index: number) => {
      const targetUrl = uploadedImages[index];
      if (targetUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(targetUrl);
      }
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    },
    [uploadedImages],
  );

  const isStep1Valid =
    !!roadAddress.trim() && lockerType !== null && indoorOutdoorType !== null;
  const isStep2Valid = locationConsentAgreed;

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
    photoErrorMessage,
    isSubmitting,
    uploadedImages,
    fileInputRef,
    minPriceDisplay,
    maxPriceDisplay,
    dial: {
      dialPrefix,
      setDialPrefix,
      dialD1,
      setDialD1,
      dialD2,
      setDialD2,
      dialD3,
      setDialD3,
    },
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
      handleUiFloorTypeChange,
      handleFloorNumberChange,
    },
    validation: { isStep1Valid, isStep2Valid },
  };
}
