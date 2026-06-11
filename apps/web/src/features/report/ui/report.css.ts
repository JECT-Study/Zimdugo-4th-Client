import { vars } from "@repo/ui/vars";
import { keyframes, style } from "@vanilla-extract/css";

export const reportContainer = style({
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  margin: "0 auto",
  height: "100dvh",
  backgroundColor: vars.color.bg.default,
  position: "relative",
  overflow: "hidden",
});

export const reportHeader = style({
  position: "fixed",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  backgroundColor: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
  paddingTop: "env(safe-area-inset-top, 0px)",
  zIndex: 100,
});

export const contentArea = style({
  width: "100%",
  height: "100%",
  padding: `calc(56px + env(safe-area-inset-top, 0px)) ${vars.layout.sidePadding} 100px`, // 헤더 높이 + 하단 버튼 여백
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const stepWrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  width: "100%",
});

export const bottomButtonWrapper = style({
  position: "fixed",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  padding: `${vars.spacing[16]} ${vars.layout.sidePadding} calc(env(safe-area-inset-bottom, 0px) + ${vars.spacing[16]})`,
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  backgroundColor: "white",
  zIndex: 100,
  boxSizing: "border-box",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
});

export const classificationSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  width: "100%",
});

export const sectionTitleRow = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.spacing[8],
  width: "100%",
});

export const sectionTitleLabel = style({
  flex: "0 0 auto",
  width: "auto",
});

export const sectionErrorTextBottom = style({
  margin: 0,
  marginTop: vars.spacing[8],
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  color: vars.color.palette.red[300],
  textAlign: "center",
});

export const sectionErrorTextInline = style({
  margin: 0,
  flex: "1 1 auto",
  minWidth: 0,
  alignSelf: "center",
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  color: vars.color.palette.red[300],
  textAlign: "right",
  wordBreak: "keep-all",
});

/** 하단 에러 영역과 동일한 높이 — 제목 옆 배치 시 섹션 간 gap 유지용 */
export const sectionErrorReserve = style({
  margin: 0,
  marginTop: vars.spacing[8],
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  flexShrink: 0,
});

/** @deprecated 롤백용 — `sectionErrorTextBottom` 또는 `sectionErrorTextInline` 사용 */
export const sectionErrorText = sectionErrorTextBottom;

export const sectionGap24 = style({
  marginTop: vars.spacing[24],
});

export const placeType = style({
  marginTop: 0,
});

export const indoorOutdoorControl = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[16],
  width: "256px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: 0,
  border: 0,
  minInlineSize: 0,
});

export const indoorOutdoorChip = style({
  width: "120px",
  maxWidth: "calc(50% - 8px)",
});

export const photoSectionContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "280px",
  margin: "0 auto",
});

export const emptyMapState = style({
  width: "100%",
  height: "100%",
  backgroundColor: vars.color.palette.gray[200],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
});

export const emptyMapIcon = style({
  width: "48px",
  height: "48px",
  color: vars.color.palette.gray[600],
});

export const locationTextButton = style({
  width: "100%",
  padding: `${vars.spacing[16]} ${vars.spacing[12]}`,
  backgroundColor: "white",
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: vars.radius[12],
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      cursor: "default",
    },
  },
});

export const floorDropdown = style({
  flex: 1,
});

export const floorControlRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const floorChoiceButton = style({
  flex: "0 0 auto",
  paddingLeft: vars.spacing[16],
  paddingRight: vars.spacing[16],
});

export const pickerTriggerButtonSlot = style({
  display: "flex",
  flex: 1,
  minWidth: 0,
  selectors: {
    '&[data-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
});

export const pickerTriggerButton = style({
  width: "100%",
  minWidth: 0,
  paddingLeft: vars.spacing[16],
  paddingRight: vars.spacing[16],
  borderRadius: vars.radius[4],
});

export const pickerTriggerButtonContent = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[8],
  width: "100%",
  minWidth: 0,
});

export const pickerTriggerButtonLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const dialContainer = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 16px",
  backgroundColor: vars.color.palette.gray[100], // #F8F9FA와 유사
  borderRadius: vars.radius[12],
  gap: vars.spacing[4],
});

export const dialSeparator = style({
  width: "1px",
  height: "40px",
  backgroundColor: vars.color.palette.gray[300],
});

export const sizeGuideBox = style({
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[600],
  lineHeight: "1.6",
  backgroundColor: vars.color.palette.gray[100],
  padding: vars.spacing[12],
  borderRadius: vars.radius[8],
});

export const sizeGuideList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const priceInputContainer = style({
  flex: 1,
  minWidth: 0,
  position: "relative",
});

export const priceUnit = style({
  position: "absolute",
  right: vars.spacing[12],
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: vars.typography.fontSize[14],
  color: vars.color.palette.gray[600],
  pointerEvents: "none",
});

export const textareaContainer = style({
  width: "100%",
  minHeight: "140px",
  borderRadius: vars.radius[8],
  border: `1px solid ${vars.color.palette.gray[400]}`,
  backgroundColor: "white",
  padding: "10px 16px 36px", // 하단 카운터 공간 확보
  boxSizing: "border-box",
  position: "relative",
});

export const textareaField = style({
  width: "100%",
  height: "100px",
  border: "none",
  outline: "none",
  resize: "none",
  fontSize: vars.typography.fontSize[14],
  fontFamily: "inherit",
  color: vars.color.text.content,
  padding: 0,
});

export const textareaClearButton = style({
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  color: vars.color.palette.gray[500],
  fontSize: vars.typography.fontSize[12],
  cursor: "pointer",
  padding: vars.spacing[4],
  zIndex: 2,
  selectors: {
    "&:hover": {
      color: vars.color.palette.gray[700],
    },
  },
});

export const charCounter = style({
  position: "absolute",
  bottom: "12px",
  right: "16px",
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[500],
});

export const requiredMark = style({
  color: vars.color.palette.red[300],
  marginLeft: "4px",
  verticalAlign: "middle",
});

export const addressTextContent = style({
  fontSize: "15px",
  lineHeight: vars.typography.lineHeight.normal,
});

const baseUploadArea = style({
  display: "flex",
  height: "200px",
  padding: vars.spacing[24],
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: vars.spacing[12],
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "dashed",
  borderColor: "#CACACA",
  backgroundColor: "#F5F5F5",
  backgroundClip: "padding-box", // 테두리 영역과 배경 겹침 방지
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
  ":active": {
    backgroundColor: vars.color.palette.gray[200],
  },
});

export const locationMapArea = style([
  baseUploadArea,
  {
    width: "280px",
    margin: "0 auto",
  },
]);

/** 제보 사진 업로드·미리보기 공통 치수 */
export const REPORT_PHOTO_TILE_MIN_WIDTH = "343px";
export const REPORT_PHOTO_TILE_HEIGHT = "200px";

const reportPhotoTileBase = style({
  flexShrink: 0,
  minWidth: REPORT_PHOTO_TILE_MIN_WIDTH,
  width: REPORT_PHOTO_TILE_MIN_WIDTH,
  height: REPORT_PHOTO_TILE_HEIGHT,
  boxSizing: "border-box",
});

export const reportPhotoGallery = style({
  display: "flex",
  gap: vars.spacing[12],
  overflowX: "auto",
  paddingBottom: vars.spacing[8],
  scrollbarWidth: "none",
  width: "100%",
});

export const photoUploadArea = style([
  baseUploadArea,
  reportPhotoTileBase,
  {
    flex: "1 0 343px",
    width: "100%",
    margin: 0,
    selectors: {
      [`${reportPhotoGallery}[data-has-images="true"] &`]: {
        flex: "0 0 343px",
        width: REPORT_PHOTO_TILE_MIN_WIDTH,
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
      },
    },
  },
]);

export const imageWrapper = style([
  reportPhotoTileBase,
  {
    position: "relative",
    flex: "0 0 343px",
    borderRadius: vars.radius[12],
    overflow: "hidden",
  },
]);

export const imagePreview = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const imageDeleteButton = style({
  position: "absolute",
  top: vars.spacing[8],
  right: vars.spacing[8],
  width: "28px",
  height: "28px",
  borderRadius: vars.radius.max,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  zIndex: 10,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

const photoUploadSpinner = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const photoPreviewUploadOverlay = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  zIndex: 5,
});

export const photoPreviewUploadSpinner = style({
  width: "24px",
  height: "24px",
  borderRadius: "9999px",
  border: "3px solid #DEE2E6",
  borderTopColor: "#495057",
  animation: `${photoUploadSpinner} 0.8s linear infinite`,
  backgroundColor: "rgba(255, 255, 255, 0.78)",
});

export const miniMapContainer = style({
  width: "100%",
  height: "100%",
});

export const floatingCameraButton = style({
  position: "absolute",
  right: vars.spacing[12],
  bottom: vars.spacing[12],
  width: "40px",
  height: "40px",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: vars.shadow[1],
  zIndex: 5,
  cursor: "pointer",
});

export const uploadIcon = style({
  width: "40px",
  height: "40px",
  color: vars.color.palette.gray[600],
});

export const uploadText = style({
  fontSize: vars.typography.fontSize[14],
  color: vars.color.palette.gray[600],
  textAlign: "center",
  lineHeight: vars.typography.lineHeight.normal,
});

export const guideText = style({
  color: vars.color.palette.gray[600],
  fontSize: "14px",
});

export const agreementSection = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[8],
});

export const agreementCheckRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  selectors: {
    '&[data-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
});

export const agreementLabel = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  selectors: {
    [`${agreementCheckRow}[data-disabled="true"] &`]: {
      opacity: 0.5,
    },
  },
});

export const privacyPolicyLink = style({
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  textDecorationLine: "underline",
  textUnderlinePosition: "from-font",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
});

export const photoAgreementGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

export const nextButton = style({
  width: "100%",
});

export const submitActionFrame = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
});

export const submitSubButton = style({
  margin: 0,
  width: "auto",
  minHeight: "auto",
  padding: 0,
  color: "#8E8E8E",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  letterSpacing: 0,
  textAlign: "center",
  textDecorationLine: "underline",
  textUnderlinePosition: "from-font",
  whiteSpace: "nowrap",
  backgroundColor: "transparent",
  selectors: {
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const priceRow = style({
  display: "flex",
  gap: vars.spacing[16],
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
});

export const priceInputRow = style({
  display: "flex",
  gap: vars.spacing[8],
  alignItems: "center",
  width: "100%",
});

export const priceInputItem = style({
  flex: 1,
  minWidth: 0,
});

export const timeRow = style({
  display: "flex",
  gap: vars.spacing[8],
  alignItems: "center",
});

export const timeSeparator = style({
  flex: "0 0 auto",
  color: vars.color.palette.gray[500],
});
