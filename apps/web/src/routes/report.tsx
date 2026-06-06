import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import {
  cardsToSizeTypes,
  sizeTypesToCards,
} from "#/features/report/lib/size-type-map";
import type { LockerType } from "#/features/report/model/report-types";
import { useReportForm } from "#/features/report/model/useReportForm";
import { LocationPickerOverlay } from "#/features/report/ui/LocationPickerOverlay";
import { ReportAdditionalInfoSection } from "#/features/report/ui/ReportAdditionalInfoSection";
import { ReportFloorSection } from "#/features/report/ui/ReportFloorSection";
import { ReportIndoorOutdoorSection } from "#/features/report/ui/ReportIndoorOutdoorSection";
import { ReportLocationSection } from "#/features/report/ui/ReportLocationSection";
import { ReportPhotoSection } from "#/features/report/ui/ReportPhotoSection";
import { ReportPriceSection } from "#/features/report/ui/ReportPriceSection";
import { ReportSizeSection } from "#/features/report/ui/ReportSizeSection";
import { ReportTimeSection } from "#/features/report/ui/ReportTimeSection";
import { ReportTypeSection } from "#/features/report/ui/ReportTypeSection";
import {
  bottomButtonWrapper,
  contentArea,
  nextButton,
  reportContainer,
  reportHeader,
  stepWrapper,
} from "#/features/report/ui/report.css.ts";

const lockerTypeOptions: Array<{ label: string; value: LockerType }> = [
  { label: m.search_filter_place_museum_short(), value: "MUSEUM" },
  { label: m.search_filter_place_subway_short(), value: "SUBWAY_STATION" },
  { label: m.search_filter_place_department_short(), value: "DEPARTMENT_STORE" },
  {
    label: m.search_filter_place_convenience_short(),
    value: "CONVENIENCE_STORE",
  },
  { label: m.search_filter_place_public_short(), value: "PUBLIC_OFFICE" },
  { label: m.search_filter_place_private_short(), value: "PRIVATE_LOCKER" },
  { label: m.search_filter_place_train_short(), value: "TRAIN_STATION" },
  { label: m.search_filter_place_other_short(), value: "ETC" },
];

export const Route = createFileRoute("/report")({
  // ZIM-26 UI QA 중에는 비로그인 상태에서도 /report에 진입할 수 있도록
  // 인증 가드를 임시 비활성화합니다. 커밋 전 원복해야 합니다.
  // beforeLoad: ({ location, preload }) => {
  //   if (!useAuthStore.getState().isAuthenticated) {
  //     if (typeof window !== "undefined" && !preload) {
  //       import("#/shared/store/authPopupStore").then((m) =>
  //         m.useAuthPopupStore.getState().openPopup(location.pathname),
  //       );
  //     }
  //     throw redirect({
  //       to: "/",
  //       replace: true,
  //     });
  //   }
  // },
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const [isExitPopupOpen, setIsExitPopupOpen] = useState(false);

  const {
    form,
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
    minPriceDisplay,
    maxPriceDisplay,
    dial,
    handlers,
    validation,
  } = useReportForm();

  const { setValue, control } = form;

  const roadAddress = useWatch({ control, name: "roadAddress" }) ?? "";
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const indoorOutdoorType = useWatch({ control, name: "indoorOutdoorType" });
  const lockerType = useWatch({ control, name: "lockerType" });
  const hasFloor = useWatch({ control, name: "hasFloor" });
  const isFree = useWatch({ control, name: "isFree" });
  const sizeTypes = useWatch({ control, name: "sizeTypes" }) ?? [];
  const locationConsentAgreed =
    useWatch({ control, name: "locationConsentAgreed" }) ?? false;
  const startTime = useWatch({ control, name: "startTime" }) ?? "";
  const endTime = useWatch({ control, name: "endTime" }) ?? "";
  const additionalInfo = useWatch({ control, name: "additionalInfo" }) ?? "";

  const selectedCoords =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : null;

  const uiFloorType = hasFloor ? "exists" : "none";
  const priceType =
    isFree === true ? "free" : isFree === false ? "paid" : "none";

  const {
    handleBack,
    handleNext,
    handleImageClick,
    handleImageChange,
    handleImageRemove,
    formatPrice,
    setMinPriceDisplay,
    setMaxPriceDisplay,
    handlePriceTypeChange,
    handleUiFloorTypeChange,
    handleFloorNumberChange,
  } = handlers;

  const handleExitBack = () => {
    if (step === 1) {
      setIsExitPopupOpen(true);
    } else {
      handleBack();
    }
  };

  const handleStayOnReport = () => {
    setIsExitPopupOpen(false);
  };

  const handleLeaveReport = () => {
    setIsExitPopupOpen(false);
    navigate({ to: "/" });
  };

  return (
    <FormProvider {...form}>
      <div className={reportContainer}>
        <Header
          className={reportHeader}
          leading="back"
          onBack={handleExitBack}
          titleType="step"
          stepCurrent={step}
          stepTotal={2}
          stepState={step === 2 ? "active" : "default"}
        />

        <main className={contentArea}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                className={stepWrapper}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ReportLocationSection
                  address={roadAddress}
                  selectedCoords={selectedCoords}
                  onOpenOverlay={() => setIsAddressOverlayOpen(true)}
                />
                <ReportFloorSection
                  floorType={uiFloorType}
                  setFloorType={handleUiFloorTypeChange}
                  setFloorNumber={handleFloorNumberChange}
                  dialPrefix={dial.dialPrefix}
                  setDialPrefix={dial.setDialPrefix}
                  dialD1={dial.dialD1}
                  setDialD1={dial.setDialD1}
                  dialD2={dial.dialD2}
                  setDialD2={dial.setDialD2}
                  dialD3={dial.dialD3}
                  setDialD3={dial.setDialD3}
                />
                <ReportIndoorOutdoorSection
                  value={indoorOutdoorType ?? null}
                  onChange={(value) => {
                    setValue("indoorOutdoorType", value, { shouldDirty: true });
                  }}
                />
                <ReportTypeSection
                  lockerType={lockerType ?? null}
                  onChange={(value) => {
                    setValue("lockerType", value, { shouldDirty: true });
                  }}
                  options={lockerTypeOptions}
                />
                <ReportSizeSection
                  selectedSizes={sizeTypesToCards(sizeTypes)}
                  setSelectedSizes={(cards) => {
                    setValue("sizeTypes", cardsToSizeTypes(cards), {
                      shouldDirty: true,
                    });
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                className={stepWrapper}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReportPhotoSection
                  uploadedImages={uploadedImages}
                  fileInputRef={fileInputRef}
                  onImageClick={handleImageClick}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  isAgreed={locationConsentAgreed}
                  setIsAgreed={(val) => {
                    setValue("locationConsentAgreed", val, {
                      shouldDirty: true,
                    });
                  }}
                />
                <ReportPriceSection
                  priceType={priceType}
                  setPriceType={handlePriceTypeChange}
                  minPrice={minPriceDisplay}
                  setMinPrice={setMinPriceDisplay}
                  maxPrice={maxPriceDisplay}
                  setMaxPrice={setMaxPriceDisplay}
                  formatPrice={formatPrice}
                />
                <ReportTimeSection
                  openTime={startTime ?? ""}
                  setOpenTime={(val) => {
                    setValue("startTime", val || null, { shouldDirty: true });
                  }}
                  closeTime={endTime ?? ""}
                  setCloseTime={(val) => {
                    setValue("endTime", val || null, { shouldDirty: true });
                  }}
                />
                <ReportAdditionalInfoSection
                  additionalInfo={additionalInfo}
                  setAdditionalInfo={(val) => {
                    setValue("additionalInfo", val, { shouldDirty: true });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <div className={bottomButtonWrapper}>
          <Button
            className={nextButton}
            variant="filled"
            intent="primary"
            size="L"
            onPress={() => {
              void handleNext();
            }}
            isDisabled={
              step === 1 ? !validation.isStep1Valid : !validation.isStep2Valid
            }
            isLoading={isSubmitting}
          >
            {step === 1 ? m.report_button_next() : m.report_button_submit()}
          </Button>
        </div>

        <Popup
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          titleText={m.report_submit_success_title()}
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
          primaryAction={{
            label: m.report_submit_success_home(),
            onPress: () => navigate({ to: "/" }),
          }}
          subAction={{
            label: m.report_submit_success_history(),
            onPress: () => {
              setIsPopupOpen(false);
              navigate({ to: "/my" });
            },
          }}
        />

        <Popup
          isOpen={isPhotoErrorPopupOpen}
          onOpenChange={setIsPhotoErrorPopupOpen}
          titleText={photoErrorMessage}
          primaryAction={{
            label: m.common_confirm(),
            onPress: () => setIsPhotoErrorPopupOpen(false),
          }}
        />

        <Popup
          isOpen={isExitPopupOpen}
          onOpenChange={setIsExitPopupOpen}
          titleText={m.report_exit_title()}
          primaryAction={{
            label: m.report_exit_back(),
            onPress: handleStayOnReport,
          }}
          secondaryAction={{
            label: m.report_exit_leave(),
            onPress: handleLeaveReport,
          }}
        />

        {isAddressOverlayOpen && (
          <LocationPickerOverlay
            onClose={() => setIsAddressOverlayOpen(false)}
            initialCoords={selectedCoords}
            onSelect={(addr, coords) => {
              setValue("roadAddress", addr, { shouldDirty: true });
              setValue("latitude", coords.lat, { shouldDirty: true });
              setValue("longitude", coords.lng, { shouldDirty: true });
              setIsAddressOverlayOpen(false);
            }}
          />
        )}
      </div>
    </FormProvider>
  );
}
