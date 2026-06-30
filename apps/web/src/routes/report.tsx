import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconCircleboxCheck32 } from "@repo/ui/tokens/icons";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePageTransitionStore } from "#/shared/store/pageTransitionStore";
import { FormProvider, useWatch } from "react-hook-form";
import { REPORT_CONTENT_SCROLL_CONTAINER_ATTR } from "#/features/report/lib/scroll-to-report-section";
import {
  cardsToSizeTypes,
  sizeTypesToCards,
} from "#/features/report/lib/size-type-map";
import { useReportContentFocusScroll } from "#/features/report/lib/use-report-content-focus-scroll";
import type { LockerType } from "#/features/report/model/report-types";
import { useReportForm } from "#/features/report/model/useReportForm";
import { useReportPageReady } from "#/features/report/model/useReportPageReady";
import { LocationPickerOverlay } from "#/features/report/ui/LocationPickerOverlay";
import { ReportPageLoadingOverlay } from "#/features/report/ui/ReportPageLoadingOverlay";
import { ReportUnifiedSections } from "#/features/report/ui/ReportUnifiedSections";
import {
  bottomButtonWrapper,
  contentArea,
  nextButton,
  reportContainer,
  reportHeader,
  reportPageContent,
  stepWrapper,
  submitActionFrame,
} from "#/features/report/ui/report.css.ts";
import {
  reportBottomBarInlineFallbackStyle,
  reportContentInlineFallbackStyle,
  reportHeaderInlineFallbackStyle,
  reportPageHiddenContentStyle,
  reportPageInlineFallbackStyle,
  reportPageLoadingShellStyle,
  reportPageVisibleContentStyle,
} from "#/features/report/ui/report-page-fallback";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useAuthStore } from "#/shared/store/authStore";

const lockerTypeOptions: Array<{ label: string; value: LockerType }> = [
  { label: m.search_filter_place_museum_short(), value: "MUSEUM" },
  { label: m.search_filter_place_subway_short(), value: "SUBWAY_STATION" },
  {
    label: m.search_filter_place_department_short(),
    value: "DEPARTMENT_STORE",
  },
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
  head: createNoIndexNoFollowHead,
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
  const endTransition = usePageTransitionStore((s) => s.endTransition);
  const startTransition = usePageTransitionStore((s) => s.startTransition);

  // 제보 페이지 마운트 시 전환 오버레이 해제
  useEffect(() => {
    endTransition();
  }, [endTransition]);
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
  useReportContentFocusScroll(contentRef, isPageReady);
  const applyFallbackStyle = isStyleTimedOut;

  const {
    form,
    sectionServerErrors,
    isAddressOverlayOpen,
    setIsAddressOverlayOpen,
    isPopupOpen,
    setIsPopupOpen,
    isPhotoErrorPopupOpen,
    setIsPhotoErrorPopupOpen,
    isSubmitErrorPopupOpen,
    isSubmitConfirmPopupOpen,
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
    handleSubmitPress,
    handleImageClick,
    handleImageChange,
    handleImageRemove,
    setMinPriceDisplay,
    setMaxPriceDisplay,
    handlePriceTypeChange,
    clearSectionError,
    preparePrivacyPolicyNavigation,
  } = handlers;
  const shouldShowCurrentInfoSubmit =
    validation.isSubmitEnabled && !validation.areOptionalFieldsComplete;

  const handleExitBack = () => {
    setIsExitPopupOpen(true);
  };

  const handleStayOnReport = () => {
    setIsExitPopupOpen(false);
  };

  const handleLeaveReport = () => {
    setIsExitPopupOpen(false);
    startTransition();
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
          className={reportPageContent}
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
              titleType="text"
              title={m.report_title()}
            />
          </div>

          <main
            ref={contentRef}
            className={contentArea}
            {...{ [REPORT_CONTENT_SCROLL_CONTAINER_ATTR]: "" }}
            style={
              applyFallbackStyle ? reportContentInlineFallbackStyle : undefined
            }
          >
            <div ref={stepWrapperRef} className={stepWrapper}>
              <ReportUnifiedSections
                address={roadAddress}
                selectedCoords={selectedCoords}
                onOpenLocationOverlay={() => setIsAddressOverlayOpen(true)}
                onResetLocation={() => {
                  setValue("roadAddress", "", { shouldDirty: true });
                  setValue("latitude", null, { shouldDirty: true });
                  setValue("longitude", null, { shouldDirty: true });
                  clearSectionError("location");
                }}
                lockerTypeOptions={lockerTypeOptions}
                selectedSizes={sizeTypesToCards(sizeTypes)}
                setSelectedSizes={(cards) => {
                  setValue("sizeTypes", cardsToSizeTypes(cards), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                uploadedImages={uploadedImages}
                fileInputRef={fileInputRef}
                onImageClick={handleImageClick}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                isSubmitting={isSubmitting}
                isAgreed={locationConsentAgreed}
                setIsAgreed={(val) => {
                  setValue("locationConsentAgreed", val, {
                    shouldDirty: true,
                  });
                }}
                onPrivacyPolicyNavigate={preparePrivacyPolicyNavigation}
                priceType={priceType}
                setPriceType={handlePriceTypeChange}
                minPrice={minPriceDisplay}
                setMinPrice={setMinPriceDisplay}
                maxPrice={maxPriceDisplay}
                setMaxPrice={setMaxPriceDisplay}
                openTime={startTime}
                setOpenTime={(val) => {
                  setValue("startTime", val || null, { shouldDirty: true });
                }}
                closeTime={endTime}
                setCloseTime={(val) => {
                  setValue("endTime", val || null, { shouldDirty: true });
                }}
                additionalInfo={additionalInfo}
                setAdditionalInfo={(val) => {
                  setValue("additionalInfo", val, { shouldDirty: true });
                }}
                sectionServerErrors={sectionServerErrors}
                clearSectionError={clearSectionError}
              />
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
            <div className={submitActionFrame}>
              <Button
                className={nextButton}
                variant="filled"
                intent={shouldShowCurrentInfoSubmit ? "neutral" : "primary"}
                size="L"
                onPress={() => {
                  void handleSubmitPress();
                }}
                isDisabled={
                  isSubmitting ||
                  isSubmitConfirmPopupOpen ||
                  !validation.isSubmitEnabled
                }
                isLoading={isSubmitting}
              >
                {isSubmitting && uploadedImages.length > 0
                  ? m.report_button_submit_uploading()
                  : shouldShowCurrentInfoSubmit
                    ? m.report_submit_with_current_info()
                    : m.report_button_submit()}
              </Button>
            </div>
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
          onOpenChange={handlers.handleSubmitErrorPopupOpenChange}
          titleText={submitErrorMessage}
          width="wide"
          primaryAction={{
            label: m.common_confirm(),
            onPress: handlers.handleSubmitErrorPopupConfirm,
          }}
        />

        <Popup
          isOpen={isPhotoErrorPopupOpen}
          onOpenChange={setIsPhotoErrorPopupOpen}
          titleText={photoErrorMessage}
          width="wide"
          primaryAction={{
            label: m.common_confirm(),
            onPress: () => setIsPhotoErrorPopupOpen(false),
          }}
        />

        <Popup
          isOpen={isSubmitConfirmPopupOpen}
          onOpenChange={handlers.handleSubmitConfirmPopupOpenChange}
          titleText={m.report_submit_confirm_title()}
          helperText={m.report_submit_confirm_helper()}
          primaryAction={{
            label: m.common_yes(),
            onPress: () => {
              void handlers.handleConfirmSubmit();
            },
          }}
          secondaryAction={{
            label: m.common_no(),
            onPress: () => handlers.handleSubmitConfirmPopupOpenChange(false),
          }}
        />

        <Popup
          isOpen={isExitPopupOpen}
          onOpenChange={setIsExitPopupOpen}
          titleText={m.report_exit_title()}
          primaryAction={{
            label: m.common_yes(),
            onPress: handleLeaveReport,
          }}
          secondaryAction={{
            label: m.common_no(),
            onPress: handleStayOnReport,
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
