import type { ChangeEvent, RefObject } from "react";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import type {
  LockerType,
  ReportSectionId,
} from "#/features/report/model/report-types";
import { ReportAdditionalInfoSection } from "./ReportAdditionalInfoSection";
import { ReportClassificationSection } from "./ReportClassificationSection";
import { ReportFloorSection } from "./ReportFloorSection";
import { ReportLocationSection } from "./ReportLocationSection";
import { ReportPhotoSection } from "./ReportPhotoSection";
import { ReportPriceSection } from "./ReportPriceSection";
import { ReportSizeSection } from "./ReportSizeSection";
import { ReportTimeSection } from "./ReportTimeSection";

type PriceType = "free" | "paid" | "none";

interface ReportUnifiedSectionsProps {
  address: string;
  selectedCoords: { lat: number; lng: number } | null;
  onOpenLocationOverlay: () => void;
  onResetLocation: () => void;
  lockerTypeOptions: Array<{ label: string; value: LockerType }>;
  selectedSizes: SizeCardType[];
  setSelectedSizes: (cards: SizeCardType[]) => void;
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  isSubmitting: boolean;
  isAgreed: boolean;
  setIsAgreed: (value: boolean) => void;
  onPrivacyPolicyNavigate: () => void;
  priceType: PriceType;
  setPriceType: (value: PriceType) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  openTime: string;
  setOpenTime: (value: string) => void;
  closeTime: string;
  setCloseTime: (value: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  sectionServerErrors: Partial<Record<ReportSectionId, string>>;
  clearSectionError: (sectionId: ReportSectionId) => void;
}

export function ReportUnifiedSections({
  address,
  selectedCoords,
  onOpenLocationOverlay,
  onResetLocation,
  lockerTypeOptions,
  selectedSizes,
  setSelectedSizes,
  uploadedImages,
  fileInputRef,
  onImageClick,
  onImageChange,
  onImageRemove,
  isSubmitting,
  isAgreed,
  setIsAgreed,
  onPrivacyPolicyNavigate,
  priceType,
  setPriceType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  additionalInfo,
  setAdditionalInfo,
  sectionServerErrors,
  clearSectionError,
}: ReportUnifiedSectionsProps) {
  return (
    <>
      <ReportLocationSection
        address={address}
        selectedCoords={selectedCoords}
        onOpenOverlay={onOpenLocationOverlay}
        onResetLocation={onResetLocation}
        sectionServerError={sectionServerErrors.location}
        onFieldChange={() => clearSectionError("location")}
      />
      <ReportClassificationSection
        lockerTypeOptions={lockerTypeOptions}
        floorSection={({ isDisabled }) => (
          <ReportFloorSection
            isDisabled={isDisabled}
            sectionServerError={sectionServerErrors.floor}
            onFieldChange={() => clearSectionError("floor")}
          />
        )}
        sectionServerError={sectionServerErrors.classification}
        onFieldChange={() => clearSectionError("classification")}
        onFloorReset={() => clearSectionError("floor")}
      />
      <ReportSizeSection
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        sectionServerError={sectionServerErrors.size}
        onFieldChange={() => clearSectionError("size")}
      />
      <ReportPhotoSection
        uploadedImages={uploadedImages}
        fileInputRef={fileInputRef}
        onImageClick={onImageClick}
        onImageChange={onImageChange}
        onImageRemove={onImageRemove}
        isSubmitting={isSubmitting}
        photoServerError={sectionServerErrors.photo}
        isAgreed={isAgreed}
        setIsAgreed={setIsAgreed}
        onPrivacyPolicyNavigate={onPrivacyPolicyNavigate}
      />
      <ReportPriceSection
        priceType={priceType}
        setPriceType={setPriceType}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sectionServerError={sectionServerErrors.price}
        onFieldChange={() => clearSectionError("price")}
      />
      <ReportTimeSection
        openTime={openTime}
        setOpenTime={setOpenTime}
        closeTime={closeTime}
        setCloseTime={setCloseTime}
        sectionServerError={sectionServerErrors.time}
        onFieldChange={() => clearSectionError("time")}
      />
      <ReportAdditionalInfoSection
        additionalInfo={additionalInfo}
        setAdditionalInfo={setAdditionalInfo}
        sectionServerError={sectionServerErrors.additionalInfo}
        onFieldChange={() => clearSectionError("additionalInfo")}
      />
    </>
  );
}
