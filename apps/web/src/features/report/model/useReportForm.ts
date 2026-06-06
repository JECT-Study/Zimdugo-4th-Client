import { m } from "@repo/i18n";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";
import type { IndoorOutdoorType } from "./report-types";

export {
  MAX_REPORT_ADDITIONAL_INFO_LENGTH,
  MAX_REPORT_PHOTOS,
  MAX_REPORT_PHOTO_SIZE_BYTES,
} from "./report-types";

export const reportSchema = z.object({
  lockerType: z.array(z.string()).min(1),
  indoorOutdoorType: z.enum(["INDOOR", "OUTDOOR"]),
  address: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  floor: z.string(),
  isLocationAgreed: z.literal(true),
  price: z
    .object({
      type: z.enum(["free", "paid", "none"]),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  businessHours: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
    })
    .optional(),
  sizes: z.array(z.string()).optional(),
  additionalInfo: z.string().max(MAX_REPORT_ADDITIONAL_INFO_LENGTH).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export function useReportForm() {
  // UI State
  const [step, setStep] = useState(1);
  const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPhotoErrorPopupOpen, setIsPhotoErrorPopupOpen] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadedImagesRef = useRef(uploadedImages);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  // Form Data State
  const [lockerType, setLockerType] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [floorType, setFloorType] = useState<string | number>("none");
  const [floorNumber, setFloorNumber] = useState("");
  const [indoorOutdoorType, setIndoorOutdoorType] =
    useState<IndoorOutdoorType | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [priceType, setPriceType] = useState<"free" | "paid" | "none">("none");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<SizeCardType[]>([]);

  // Dial Selection State
  const [dialPrefix, setDialPrefix] = useState("ground");
  const [dialD1, setDialD1] = useState("0");
  const [dialD2, setDialD2] = useState("0");
  const [dialD3, setDialD3] = useState("1");

  const formatPrice = useCallback((val: string) => formatPriceInput(val), []);

  const sanitizeFloorNumber = useCallback((raw: string) => {
    if (!raw) return "";
    if (raw.startsWith("B")) {
      const numPart = raw.substring(1);
      const parsed = Number.parseInt(numPart, 10);
      if (Number.isNaN(parsed)) return "";
      return `B${parsed}`;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return "";
    return String(parsed);
  }, []);

  // Sync Logic: Floor
  useEffect(() => {
    if (floorType === "exists") {
      const num = parseInt(`${dialD1}${dialD2}${dialD3}`, 10);
      const prefix = dialPrefix === "underground" ? "B" : "";
      setFloorNumber(`${prefix}${num}`);
    }
  }, [dialPrefix, dialD1, dialD2, dialD3, floorType]);

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

  // Handlers
  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleNext = useCallback(() => {
    if (step < 2) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      setIsSubmitting(true);

      const submitData = {
        lockerType,
        indoorOutdoorType,
        address,
        location: selectedCoords,
        floor: sanitizeFloorNumber(floorNumber),
        isLocationAgreed: isAgreed,
        price: {
          type: priceType,
          min: Number(minPrice.replace(/[^0-9]/g, "")),
          max: Number(maxPrice.replace(/[^0-9]/g, "")),
        },
        businessHours: { open: openTime, close: closeTime },
        sizes: selectedSizes,
        additionalInfo: additionalInfo.trim(),
        imageUrls: uploadedImages,
      };

      const result = reportSchema.safeParse(submitData);
      if (!result.success) {
        setIsSubmitting(false);
        return;
      }

      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
        const history = localStorage.getItem("report_history");
        let historyList: unknown[] = [];
        if (history) {
          try {
            const parsed = JSON.parse(history);
            historyList = Array.isArray(parsed) ? parsed : [];
          } catch {
            historyList = [];
          }
        }
        const newRecord = {
          ...result.data,
          id: Date.now().toString(),
          submittedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          "report_history",
          JSON.stringify([newRecord, ...historyList]),
        );
        localStorage.removeItem("report_draft");
        setIsPopupOpen(true);
      }, 1500);
    }
  }, [
    step,
    lockerType,
    indoorOutdoorType,
    address,
    selectedCoords,
    floorNumber,
    isAgreed,
    priceType,
    minPrice,
    maxPrice,
    openTime,
    closeTime,
    additionalInfo,
    selectedSizes,
    uploadedImages,
    sanitizeFloorNumber,
  ]);

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
    !!address && lockerType.length > 0 && indoorOutdoorType !== null;
  const isStep2Valid = isAgreed;

  return {
    step,
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
    form: {
      lockerType,
      setLockerType,
      address,
      setAddress,
      selectedCoords,
      setSelectedCoords,
      floorType,
      setFloorType,
      floorNumber,
      setFloorNumber,
      indoorOutdoorType,
      setIndoorOutdoorType,
      isAgreed,
      setIsAgreed,
      priceType,
      setPriceType,
      minPrice,
      setMinPrice,
      maxPrice,
      setMaxPrice,
      additionalInfo,
      setAdditionalInfo,
      selectedSizes,
      setSelectedSizes,
      openTime,
      setOpenTime,
      closeTime,
      setCloseTime,
    },
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
    },
    validation: { isStep1Valid, isStep2Valid },
  };
}
