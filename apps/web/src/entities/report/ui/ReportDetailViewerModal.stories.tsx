import type { Meta, StoryObj } from "@storybook/react";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import type { LockerReportApiStatus } from "../lib/resolve-report-status";
import { ReportDetailViewerModal } from "./ReportDetailViewerModal";

const PHOTO_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420' viewBox='0 0 720 420'%3E%3Crect width='720' height='420' fill='%23eceff1'/%3E%3Crect x='130' y='70' width='460' height='290' rx='18' fill='%239aa4ad'/%3E%3Cg fill='%23dfe4e8'%3E%3Crect x='160' y='100' width='120' height='105' rx='8'/%3E%3Crect x='300' y='100' width='120' height='105' rx='8'/%3E%3Crect x='440' y='100' width='120' height='105' rx='8'/%3E%3Crect x='160' y='225' width='120' height='105' rx='8'/%3E%3Crect x='300' y='225' width='120' height='105' rx='8'/%3E%3Crect x='440' y='225' width='120' height='105' rx='8'/%3E%3C/g%3E%3C/svg%3E";

const BASE_DETAIL = {
  reportId: 1,
  lockerName: "신촌역 5번 출구 B2 보관함",
  roadAddress: "서울 서대문구 신촌로 83",
  latitude: 37.555,
  longitude: 126.936,
  hasFloor: true,
  floorType: "UNDERGROUND",
  floorNumber: 2,
  indoorOutdoorType: "INDOOR",
  lockerType: "PRIVATE_LOCKER",
  sizeTypes: ["SMALL", "MEDIUM", "LARGE"],
  priceType: "PAID",
  minPrice: 2000,
  maxPrice: 5000,
  operatingTimeType: "TIME_RANGE",
  startTime: "06:00",
  endTime: "23:30",
  additionalInfo: "5번 출구 왼쪽에 있습니다.",
  imageUrl: null,
  locationConsentAgreed: true,
} satisfies MyLockerReportDetail;

const createDetail = (
  overrides: Partial<MyLockerReportDetail> = {},
): MyLockerReportDetail => ({
  ...BASE_DETAIL,
  reportStatus: "SUBMITTED",
  ...overrides,
});

const createReadyArgs = (overrides: Partial<MyLockerReportDetail> = {}) => {
  const detail = createDetail(overrides);

  return {
    isOpen: true,
    onOpenChange: () => undefined,
    titleText: detail.lockerName,
    detail,
    loadState: "ready" as const,
  };
};

const meta = {
  title: "Product/My/Report Detail Modal",
  component: ReportDetailViewerModal,
  parameters: {
    layout: "fullscreen",
  },
  args: createReadyArgs(),
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100dvh", background: "#f3f4f5" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportDetailViewerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: createReadyArgs({
    reportStatus: "SUBMITTED",
    imageUrl: null,
  }),
};

export const ReadyWithPhoto: Story = {
  args: createReadyArgs({
    reportStatus: "SUBMITTED",
    imageUrl: PHOTO_DATA_URL,
  }),
};

export const ReadyLongContent: Story = {
  args: createReadyArgs({
    reportStatus: "SUBMITTED",
    lockerName: "서울역 공항철도 도심공항터미널 지하 2층 대형 보관함",
    roadAddress:
      "서울특별시 용산구 한강대로 405 서울역 공항철도 도심공항터미널",
    additionalInfo:
      "공항철도 개찰구를 지나 도심공항터미널 방면으로 이동하면 안내 데스크 오른쪽 긴 복도 끝에서 확인할 수 있습니다.",
  }),
};

export const ReadyWithoutStatus: Story = {
  args: createReadyArgs({
    reportStatus: undefined,
  }),
};

const createStatusStory = (reportStatus: LockerReportApiStatus): Story => ({
  args: createReadyArgs({ reportStatus }),
});

export const StatusSubmitted = createStatusStory("SUBMITTED");
export const StatusApproved = createStatusStory("APPROVED");
export const StatusRejected = createStatusStory("REJECTED");

export const Loading: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => undefined,
    titleText: BASE_DETAIL.lockerName,
    detail: null,
    loadState: "loading",
  },
};

export const ErrorState: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => undefined,
    titleText: BASE_DETAIL.lockerName,
    detail: null,
    loadState: "error",
  },
};
