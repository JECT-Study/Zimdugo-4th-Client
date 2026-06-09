import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useReportForm } from "#/features/report/model/useReportForm";
import { LocationPickerOverlay } from "#/features/report/ui/LocationPickerOverlay";
import { ReportAdditionalInfoSection } from "#/features/report/ui/ReportAdditionalInfoSection";
import { ReportFloorSection } from "#/features/report/ui/ReportFloorSection";
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

import { useAuthStore } from "#/shared/store/authStore";

const lockerTypeOptions = [
  {
    id: "museum",
    label: m.search_filter_place_museum_short(),
    value: "museum",
  },
  {
    id: "subway",
    label: m.search_filter_place_subway_short(),
    value: "subway",
  },
  {
    id: "department",
    label: m.search_filter_place_department_short(),
    value: "department",
  },
  {
    id: "convenience",
    label: m.search_filter_place_convenience_short(),
    value: "convenience",
  },
  {
    id: "public",
    label: m.search_filter_place_public_short(),
    value: "public",
  },
  {
    id: "private",
    label: m.search_filter_place_private_short(),
    value: "private",
  },
  { id: "train", label: m.search_filter_place_train_short(), value: "train" },
  { id: "other", label: m.search_filter_place_other_short(), value: "other" },
];

export const Route = createFileRoute("/report")({
  beforeLoad: ({ location, preload }) => {
    // TODO: 추후 2번 방식(HttpOnly 쿠키 직접 확인) 적용 시, 서버(SSR) 컨텍스트에서 헤더를 읽어 isAuthenticated를 판단하도록 개선 필요
    if (!useAuthStore.getState().isAuthenticated) {
      if (typeof window !== "undefined" && !preload) {
        import("#/shared/store/authPopupStore").then((m) =>
          m.useAuthPopupStore.getState().openPopup(location.pathname),
        );
      }
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  },
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const [isExitPopupOpen, setIsExitPopupOpen] = useState(false);

  const {
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
    form,
    dial,
    handlers,
    validation,
  } = useReportForm();

  const {
    lockerType,
    setLockerType,
    address,
    setAddress,
    selectedCoords,
    setSelectedCoords,
    floorType,
    setFloorType,
    setFloorNumber,
    isAgreed,
    setIsAgreed,
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
    selectedSizes,
    setSelectedSizes,
  } = form;

  const {
    handleBack,
    handleNext,
    handleImageClick,
    handleImageChange,
    handleImageRemove,
    formatPrice,
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
    localStorage.removeItem("report_draft");
    setIsExitPopupOpen(false);
    navigate({ to: "/" });
  };

  return (
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
                address={address}
                selectedCoords={selectedCoords}
                onOpenOverlay={() => setIsAddressOverlayOpen(true)}
              />
              <ReportTypeSection
                lockerType={lockerType}
                setLockerType={setLockerType}
                options={lockerTypeOptions}
              />
              <ReportFloorSection
                floorType={floorType}
                setFloorType={setFloorType}
                setFloorNumber={setFloorNumber}
                dialPrefix={dial.dialPrefix}
                setDialPrefix={dial.setDialPrefix}
                dialD1={dial.dialD1}
                setDialD1={dial.setDialD1}
                dialD2={dial.dialD2}
                setDialD2={dial.setDialD2}
                dialD3={dial.dialD3}
                setDialD3={dial.setDialD3}
              />
              <ReportSizeSection
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
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
                isAgreed={isAgreed}
                setIsAgreed={setIsAgreed}
              />
              <ReportPriceSection
                priceType={priceType}
                setPriceType={setPriceType}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                formatPrice={formatPrice}
              />
              <ReportTimeSection
                openTime={openTime}
                setOpenTime={setOpenTime}
                closeTime={closeTime}
                setCloseTime={setCloseTime}
              />
              <ReportAdditionalInfoSection
                additionalInfo={additionalInfo}
                setAdditionalInfo={setAdditionalInfo}
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
          onPress={handleNext}
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
            setAddress(addr);
            setSelectedCoords(coords);
            setIsAddressOverlayOpen(false);
          }}
        />
      )}
    </div>
  );
}
