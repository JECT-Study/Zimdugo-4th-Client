import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import {
  cardsToSizeTypes,
  sizeTypesToCards,
} from "#/features/report/lib/size-type-map";
import type { LockerType } from "#/features/report/model/report-types";
import { useReportForm } from "#/features/report/model/useReportForm";
import { useReportPageReady } from "#/features/report/model/useReportPageReady";
import { LocationPickerOverlay } from "#/features/report/ui/LocationPickerOverlay";
import { ReportPageLoadingOverlay } from "#/features/report/ui/ReportPageLoadingOverlay";
import {
  reportBottomBarInlineFallbackStyle,
  reportContentInlineFallbackStyle,
  reportHeaderInlineFallbackStyle,
  reportPageHiddenContentStyle,
  reportPageInlineFallbackStyle,
  reportPageLoadingShellStyle,
  reportPageVisibleContentStyle,
} from "#/features/report/ui/report-page-fallback";
import { ReportClassificationSection } from "#/features/report/ui/ReportClassificationSection";
import { ReportAdditionalInfoSection } from "#/features/report/ui/ReportAdditionalInfoSection";
import { ReportFloorSection } from "#/features/report/ui/ReportFloorSection";
import { ReportLocationSection } from "#/features/report/ui/ReportLocationSection";
import { ReportPhotoSection } from "#/features/report/ui/ReportPhotoSection";
import { ReportPriceSection } from "#/features/report/ui/ReportPriceSection";
import { ReportSizeSection } from "#/features/report/ui/ReportSizeSection";
import { ReportTimeSection } from "#/features/report/ui/ReportTimeSection";
import {
  bottomButtonWrapper,
  contentArea,
  nextButton,
  reportContainer,
  reportHeader,
  stepWrapper,
} from "#/features/report/ui/report.css.ts";
import { useAuthStore } from "#/shared/store/authStore";

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
  beforeLoad: ({ location, preload }) => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const stepWrapperRef = useRef<HTMLDivElement>(null);
  const { isPageReady, isStyleTimedOut } = useReportPageReady({
    containerRef,
    contentRef,
    bottomBarRef,
    stepWrapperRef,
  });
  const applyFallbackStyle = isStyleTimedOut;

  const {
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
    handlers,
    validation,
  } = useReportForm();

  const { setValue, control } = form;

  const roadAddress = useWatch({ control, name: "roadAddress" }) ?? "";
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
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
    clearSectionError,
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
      <div
        ref={containerRef}
        className={reportContainer}
        style={
          !isPageReady
            ? reportPageLoadingShellStyle
            : applyFallbackStyle
              ? reportPageInlineFallbackStyle
              : undefined
        }
      >
        {!isPageReady && <ReportPageLoadingOverlay />}

        <div
          aria-hidden={!isPageReady}
          style={
            isPageReady
              ? reportPageVisibleContentStyle
              : reportPageHiddenContentStyle
          }
        >
          <div
            style={
              applyFallbackStyle ? reportHeaderInlineFallbackStyle : undefined
            }
          >
            <Header
              className={reportHeader}
              leading="back"
              onBack={handleExitBack}
              titleType="step"
              stepCurrent={step}
              stepTotal={2}
              stepState={step === 2 ? "active" : "default"}
            />
          </div>

          <main
            ref={contentRef}
            className={contentArea}
            style={
              applyFallbackStyle ? reportContentInlineFallbackStyle : undefined
            }
          >
            <div ref={stepWrapperRef} className={stepWrapper}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={isPageReady ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReportLocationSection
                      address={roadAddress}
                      selectedCoords={selectedCoords}
                      onOpenOverlay={() => setIsAddressOverlayOpen(true)}
                      sectionServerError={sectionServerErrors.location}
                    />
                    <ReportFloorSection
                      sectionServerError={sectionServerErrors.floor}
                      onFieldChange={() => clearSectionError("floor")}
                    />
                    <ReportClassificationSection
                      lockerTypeOptions={lockerTypeOptions}
                      sectionServerError={sectionServerErrors.classification}
                      onFieldChange={() => clearSectionError("classification")}
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
                    initial={isPageReady ? { opacity: 0, x: 10 } : false}
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
                      agreementServerError={sectionServerErrors.agreement}
                      onAgreementChange={() => clearSectionError("agreement")}
                    />
                    <ReportPriceSection
                      priceType={priceType}
                      setPriceType={handlePriceTypeChange}
                      minPrice={minPriceDisplay}
                      setMinPrice={setMinPriceDisplay}
                      maxPrice={maxPriceDisplay}
                      setMaxPrice={setMaxPriceDisplay}
                      formatPrice={formatPrice}
                      sectionServerError={sectionServerErrors.price}
                      onFieldChange={() => clearSectionError("price")}
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
                      sectionServerError={sectionServerErrors.time}
                      onFieldChange={() => clearSectionError("time")}
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
            </div>
          </main>

          <div
            ref={bottomBarRef}
            className={bottomButtonWrapper}
            style={
              applyFallbackStyle
                ? reportBottomBarInlineFallbackStyle
                : undefined
            }
          >
            <Button
              className={nextButton}
              variant="filled"
              intent="primary"
              size="L"
              onPress={() => {
                void handleNext();
              }}
              isDisabled={step === 2 ? !validation.isStep2Valid : false}
              isLoading={isSubmitting}
            >
              {step === 1 ? m.report_button_next() : m.report_button_submit()}
            </Button>
          </div>
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
          isOpen={isSubmitErrorPopupOpen}
          onOpenChange={setIsSubmitErrorPopupOpen}
          titleText={submitErrorMessage}
          primaryAction={{
            label: m.common_confirm(),
            onPress: () => setIsSubmitErrorPopupOpen(false),
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
              clearSectionError("location");
              setIsAddressOverlayOpen(false);
            }}
          />
        )}
      </div>
    </FormProvider>
  );
}
