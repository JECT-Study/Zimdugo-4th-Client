import { useEffect, useRef, useState } from "react";
import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/shared/store/authStore";
import { AnimatePresence, motion } from "motion/react";
import { LocationPickerOverlay } from "./-LocationPickerOverlay";
import { ReportAdditionalInfoSection } from "./-ReportAdditionalInfoSection";
import { ReportFloorSection } from "./-ReportFloorSection";
import { ReportLocationSection } from "./-ReportLocationSection";
import { ReportPhotoSection } from "./-ReportPhotoSection";
import { ReportPriceSection } from "./-ReportPriceSection";
import { ReportSizeSection } from "./-ReportSizeSection";
import { ReportTimeSection } from "./-ReportTimeSection";
import { ReportTypeSection } from "./-ReportTypeSection";
import { useReportForm } from "./-useReportForm";
import {
  bottomButtonWrapper,
  contentArea,
  nextButton,
  reportContainer,
  reportHeader,
  stepWrapper,
} from "./-report.css.ts";

const lockerTypeOptions = [
  { id: "museum", label: m.search_filter_place_museum(), value: "museum" },
  { id: "subway", label: m.search_filter_place_subway(), value: "subway" },
  { id: "department", label: m.search_filter_place_department(), value: "department" },
  { id: "convenience", label: m.search_filter_place_convenience(), value: "convenience" },
  { id: "public", label: m.search_filter_place_public(), value: "public" },
  { id: "private", label: m.search_filter_place_private(), value: "private" },
  { id: "train", label: m.search_filter_place_train(), value: "train" },
];

export const Route = createFileRoute("/report")({
  beforeLoad: ({ location, preload }) => {
    // TODO: 추후 2번 방식(HttpOnly 쿠키 직접 확인) 적용 시, 서버(SSR) 컨텍스트에서 헤더를 읽어 isAuthenticated를 판단하도록 개선 필요
    if (typeof window !== "undefined" && !useAuthStore.getState().isAuthenticated) {
      if (!preload) {
        // 실제 네비게이션 시에만 로그인 팝업을 띄우기 위한 전역 상태 갱신
        import("#/shared/store/authPopupStore").then(m => 
          m.useAuthPopupStore.getState().openPopup(location.pathname)
        );
      }
      // 로그인 페이지로 강제 납치하지 않고 메인 화면("/")으로 돌려보낸 뒤 팝업을 띄움
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
    isAddressOverlayOpen, setIsAddressOverlayOpen,
    isPopupOpen, setIsPopupOpen,
    isSubmitting,
    uploadedImages,
    fileInputRef,
    form, dial, handlers, validation
  } = useReportForm();

  const {
    lockerType, setLockerType,
    address, setAddress,
    selectedCoords, setSelectedCoords,
    floorType, setFloorType,
    isAgreed, setIsAgreed,
    priceType, setPriceType,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    openTime, setOpenTime,
    closeTime, setCloseTime,
    additionalInfo, setAdditionalInfo,
    selectedSizes, setSelectedSizes,
  } = form;

  const {
    handleBack,
    handleNext,
    handleImageClick,
    handleImageChange,
    handleImageRemove,
    formatPrice,
    saveDraft,
    clearDraft,
  } = handlers;

  const handleExitBack = () => {
    if (step === 1) {
      setIsExitPopupOpen(true);
    } else {
      handleBack();
    }
  };

  const handleSaveAndExit = () => {
    saveDraft();
    setIsExitPopupOpen(false);
    navigate({ to: "/" });
  };

  const handleDiscardAndExit = () => {
    clearDraft();
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
                setFloorNumber={(_) => {}}
                dialPrefix={dial.dialPrefix}
                setDialPrefix={dial.setDialPrefix}
                dialD1={dial.dialD1}
                setDialD1={dial.setDialD1}
                dialD2={dial.dialD2}
                setDialD2={dial.setDialD2}
                dialD3={dial.dialD3}
                setDialD3={dial.setDialD3}
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
              <ReportSizeSection
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
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
          isDisabled={step === 1 ? !validation.isStep1Valid : !validation.isStep2Valid}
          isLoading={isSubmitting}
        >
          {step === 1 ? m.report_button_next() : m.report_button_submit()}
        </Button>
      </div>

      <Popup
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        titleText="제보하기 성공!"
        icon={
          <motion.div
            initial={{ mask: "linear-gradient(90deg, #000 0%, transparent 0%)", WebkitMask: "linear-gradient(90deg, #000 0%, transparent 0%)" }}
            animate={{ mask: "linear-gradient(90deg, #000 100%, transparent 100%)", WebkitMask: "linear-gradient(90deg, #000 100%, transparent 100%)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <IconCircleboxCheck32 />
          </motion.div>
        }
        primaryAction={{
          label: "홈으로 돌아가기",
          onPress: () => navigate({ to: "/" }),
        }}
        subAction={{
          label: "제보 히스토리",
          onPress: () => {
            setIsPopupOpen(false);
            navigate({ to: "/my" });
          },
        }}
      />

      {/* Exit Confirmation Popup */}
      <Popup
        isOpen={isExitPopupOpen}
        onOpenChange={setIsExitPopupOpen}
        titleText="작성을 중단하시겠습니까?"
        helperText="작성 중인 내용은 임시 저장할 수 있습니다."
        primaryAction={{
          label: "임시 저장하기",
          onPress: handleSaveAndExit,
        }}
        secondaryAction={{
          label: "나가기",
          onPress: handleDiscardAndExit,
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
