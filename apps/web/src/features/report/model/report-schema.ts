import { z } from "zod";
import {
  LOCKER_TYPES,
  MAX_REPORT_ADDITIONAL_INFO_LENGTH,
  REPORT_PRICE_MAX,
  REPORT_PRICE_MIN,
  SIZE_TYPES,
  type ReportFormValues,
  reportDefaultValues,
} from "./report-types";

export const timeToMinutes = (time: string): number => {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number.parseInt(hour, 10) * 60 + Number.parseInt(minute, 10);
};

const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const reportSchema = z
  .object({
    roadAddress: z.string(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    locationConsentAgreed: z.boolean(),
    indoorOutdoorType: z.enum(["INDOOR", "OUTDOOR"]).nullable(),
    lockerType: z.enum(LOCKER_TYPES).nullable(),
    hasFloor: z.boolean().nullable(),
    floorType: z.enum(["ABOVE_GROUND", "UNDERGROUND"]).nullable(),
    floorNumber: z.number().int().nullable(),
    isFree: z.boolean().nullable(),
    minPrice: z.number().int().nullable(),
    maxPrice: z.number().int().nullable(),
    startTime: timeStringSchema.nullable(),
    endTime: timeStringSchema.nullable(),
    sizeTypes: z.array(z.enum(SIZE_TYPES)).max(3),
    additionalInfo: z.string().max(MAX_REPORT_ADDITIONAL_INFO_LENGTH),
    imageUrl: z.string().max(500).nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.roadAddress.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["roadAddress"],
        message: "required",
      });
    }

    if (data.latitude === null) {
      ctx.addIssue({
        code: "custom",
        path: ["latitude"],
        message: "required",
      });
    }

    if (data.longitude === null) {
      ctx.addIssue({
        code: "custom",
        path: ["longitude"],
        message: "required",
      });
    }

    if (!data.indoorOutdoorType) {
      ctx.addIssue({
        code: "custom",
        path: ["indoorOutdoorType"],
        message: "required",
      });
    }

    if (!data.lockerType) {
      ctx.addIssue({
        code: "custom",
        path: ["lockerType"],
        message: "required",
      });
    }

    if (data.hasFloor === null) {
      ctx.addIssue({
        code: "custom",
        path: ["hasFloor"],
        message: "required",
      });
    } else if (data.hasFloor) {
      if (!data.floorType) {
        ctx.addIssue({
          code: "custom",
          path: ["floorType"],
          message: "required",
        });
      }
      if (data.floorNumber === null || data.floorNumber < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["floorNumber"],
          message: "required",
        });
      }
    } else if (data.floorType !== null || data.floorNumber !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["floorType"],
        message: "must_be_null",
      });
    }

    if (data.isFree === false) {
      if (data.minPrice === null) {
        ctx.addIssue({
          code: "custom",
          path: ["minPrice"],
          message: "required",
        });
      }
      if (data.maxPrice === null) {
        ctx.addIssue({
          code: "custom",
          path: ["maxPrice"],
          message: "required",
        });
      }
      if (data.minPrice !== null && data.minPrice < REPORT_PRICE_MIN) {
        ctx.addIssue({
          code: "custom",
          path: ["minPrice"],
          message: "min",
        });
      }
      if (data.maxPrice !== null && data.maxPrice > REPORT_PRICE_MAX) {
        ctx.addIssue({
          code: "custom",
          path: ["maxPrice"],
          message: "max",
        });
      }
      if (
        data.minPrice !== null &&
        data.maxPrice !== null &&
        data.minPrice > data.maxPrice
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["maxPrice"],
          message: "range",
        });
      }
    }

    const hasStart = data.startTime !== null;
    const hasEnd = data.endTime !== null;
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: "custom",
        path: hasStart ? ["endTime"] : ["startTime"],
        message: "pair_required",
      });
    }
    if (hasStart && hasEnd && data.startTime && data.endTime) {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      if (start >= end) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "invalid_range",
        });
      }
    }

    if (!data.locationConsentAgreed) {
      ctx.addIssue({
        code: "custom",
        path: ["locationConsentAgreed"],
        message: "required",
      });
    }
  });

export type ReportFormInput = z.infer<typeof reportSchema>;

export const parseReportForm = (values: ReportFormValues) =>
  reportSchema.safeParse(values);

export { reportDefaultValues };
