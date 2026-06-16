import type { ReportFormValues } from "#/features/report/model/report-types";

export type ReportPrivacyNavigationState = {
  values: ReportFormValues;
  minPriceDisplay: string;
  maxPriceDisplay: string;
  uploadedImages: string[];
  selectedPhotoFile: File | null;
};

let pendingRestore: ReportPrivacyNavigationState | null = null;
let preserveBlobUrlsOnUnmount = false;

export function stashReportStateForPrivacyPolicy(
  state: ReportPrivacyNavigationState,
): void {
  pendingRestore = state;
  preserveBlobUrlsOnUnmount = true;
}

export function consumeReportPrivacyNavigationState(): ReportPrivacyNavigationState | null {
  const state = pendingRestore;
  pendingRestore = null;
  return state;
}

export function shouldPreserveReportBlobUrlsOnUnmount(): boolean {
  return preserveBlobUrlsOnUnmount;
}

export function clearReportPrivacyNavigationHold(): void {
  preserveBlobUrlsOnUnmount = false;
}
