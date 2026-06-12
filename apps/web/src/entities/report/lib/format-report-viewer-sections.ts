import { m } from "@repo/i18n";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
} from "#/shared/lib/locker-detail-labels";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";

export type ReportViewerField = {
  label: string;
  value: string;
};

export type ReportViewerSection = {
  title: string;
  fields: ReportViewerField[];
  imageUrl?: string | null;
};

const formatFloorLabel = (detail: MyLockerReportDetail): string => {
  if (!detail.hasFloor) {
    return m.report_floor_none();
  }

  if (detail.floorNumber == null) {
    return "-";
  }

  if (detail.floorType == null) {
    return `${detail.floorNumber}${m.report_history_item_floor_unit()}`;
  }

  const scopeLabel =
    detail.floorType === "UNDERGROUND"
      ? m.report_floor_underground()
      : m.report_floor_ground();

  return `${scopeLabel} ${detail.floorNumber}${m.report_history_item_floor_unit()}`;
};

const formatIndoorOutdoorLabel = (indoorOutdoorType: string | null): string => {
  if (indoorOutdoorType === "INDOOR") {
    return m.report_indoor();
  }

  if (indoorOutdoorType === "OUTDOOR") {
    return m.report_outdoor();
  }

  return "-";
};

const formatSizeTypesLabel = (sizeTypes: string[]): string => {
  if (sizeTypes.length === 0) {
    return "-";
  }

  const labels = sizeTypes.map((sizeType) => {
    if (sizeType === "SMALL") return m.report_size_s();
    if (sizeType === "MEDIUM") return m.report_size_m();
    if (sizeType === "LARGE") return m.report_size_l();
    return sizeType;
  });

  return labels.join(", ");
};

const formatPriceLabel = (detail: MyLockerReportDetail): string => {
  if (detail.isFree === true) {
    return m.report_price_free();
  }

  if (detail.isFree === false) {
    return formatLockerPriceLabel(
      detail.minPrice ?? undefined,
      detail.maxPrice ?? undefined,
    );
  }

  return m.locker_detail_price_not_provided();
};

const formatAdditionalInfoLabel = (additionalInfo: string | null): string => {
  const trimmed = additionalInfo?.trim();
  return trimmed ? trimmed : "-";
};

export const formatReportViewerSections = (
  detail: MyLockerReportDetail,
): ReportViewerSection[] => [
  {
    title: m.report_section_location(),
    fields: [
      {
        label: m.report_location_selected_label(),
        value: detail.roadAddress,
      },
    ],
  },
  {
    title: m.report_section_indoor_outdoor(),
    fields: [
      {
        label: m.report_section_indoor_outdoor(),
        value: formatIndoorOutdoorLabel(detail.indoorOutdoorType),
      },
    ],
  },
  {
    title: m.report_section_type(),
    fields: [
      {
        label: m.my_history_item_type(),
        value: getLockerTypeLabel(detail.lockerType ?? undefined) || "-",
      },
    ],
  },
  {
    title: m.report_section_floor(),
    fields: [
      {
        label: m.my_history_item_floor(),
        value: formatFloorLabel(detail),
      },
    ],
  },
  {
    title: m.report_section_size(),
    fields: [
      {
        label: m.report_section_size(),
        value: formatSizeTypesLabel(detail.sizeTypes),
      },
    ],
  },
  {
    title: m.report_section_photo(),
    imageUrl: detail.imageUrl,
    fields: [],
  },
  {
    title: m.report_section_price(),
    fields: [
      {
        label: m.my_history_item_price(),
        value: formatPriceLabel(detail),
      },
    ],
  },
  {
    title: m.report_section_time(),
    fields: [
      {
        label: m.report_section_time(),
        value: formatLockerOperatingHoursLabel(
          detail.startTime ?? undefined,
          detail.endTime ?? undefined,
        ),
      },
    ],
  },
  {
    title: m.report_section_additional(),
    fields: [
      {
        label: m.report_section_additional(),
        value: formatAdditionalInfoLabel(detail.additionalInfo),
      },
    ],
  },
];

export const formatReportViewerInformationGroups = (
  detail: MyLockerReportDetail,
): ReportViewerSection[] => [
  {
    title: m.my_report_detail_location_group(),
    fields: [
      {
        label: m.my_report_detail_address(),
        value: detail.roadAddress,
      },
      {
        label: m.my_report_detail_position(),
        value: formatFloorLabel(detail),
      },
      {
        label: m.report_section_indoor_outdoor(),
        value: formatIndoorOutdoorLabel(detail.indoorOutdoorType),
      },
    ],
  },
  {
    title: m.my_report_detail_locker_group(),
    fields: [
      {
        label: m.my_history_item_type(),
        value: getLockerTypeLabel(detail.lockerType ?? undefined) || "-",
      },
      {
        label: m.my_report_detail_size(),
        value: formatSizeTypesLabel(detail.sizeTypes),
      },
      {
        label: m.my_history_item_price(),
        value: formatPriceLabel(detail),
      },
      {
        label: m.report_section_time(),
        value: formatLockerOperatingHoursLabel(
          detail.startTime ?? undefined,
          detail.endTime ?? undefined,
        ),
      },
    ],
  },
  {
    title: m.report_section_additional(),
    fields: [
      {
        label: m.report_section_additional(),
        value: formatAdditionalInfoLabel(detail.additionalInfo),
      },
    ],
  },
];
