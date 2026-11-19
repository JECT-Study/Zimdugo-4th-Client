import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  createLockerJsonLd,
  createOpeningHoursSpecification,
} from "./locker-json-ld";

const baseDetail: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 1326,
  title: "9호선 중앙보훈병원",
  address: "서울 강동구 동남로 지하 625",
  distanceLabel: "",
  categoryLabel: "",
  updatedLabel: "",
  latitude: 37.52911,
  longitude: 127.148736,
};

const URL = "https://zimdugo.com/lockers/1326";

describe("createOpeningHoursSpecification", () => {
  it("매일 같은 시간으로 열고 닫는 시각을 적는다", () => {
    expect(
      createOpeningHoursSpecification({ open: "05:30:00", close: "24:00" }),
    ).toMatchObject({ opens: "05:30", closes: "24:00" });
  });

  it("00:00~00:00 은 24시간 운영이라 23:59 에 닫는다고 적는다", () => {
    expect(
      createOpeningHoursSpecification({ open: "00:00", close: "00:00" }),
    ).toMatchObject({ opens: "00:00", closes: "23:59" });
  });

  it("시각을 모르거나 모양이 틀리면 운영 시간을 내지 않는다", () => {
    expect(createOpeningHoursSpecification(null)).toBeUndefined();
    expect(
      createOpeningHoursSpecification({ open: "새벽", close: "23:00" }),
    ).toBeUndefined();
  });
});

describe("createLockerJsonLd", () => {
  it("이름·주소·좌표를 schema.org Place 로 낸다", () => {
    expect(createLockerJsonLd({ detail: baseDetail, url: URL })).toEqual({
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": URL,
      url: URL,
      name: "9호선 중앙보훈병원",
      address: {
        "@type": "PostalAddress",
        streetAddress: "서울 강동구 동남로 지하 625",
        addressCountry: "KR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 37.52911,
        longitude: 127.148736,
      },
    });
  });

  it("없는 값은 빈 값으로 두지 않고 키째 뺀다", () => {
    const jsonLd = createLockerJsonLd({
      detail: { ...baseDetail, address: "", latitude: undefined },
      url: URL,
    });

    expect(jsonLd).not.toHaveProperty("address");
    expect(jsonLd).not.toHaveProperty("geo");
    expect(jsonLd).not.toHaveProperty("openingHoursSpecification");
    expect(jsonLd).not.toHaveProperty("additionalProperty");
  });

  it("장소·운영 시간·가격대·이미지를 함께 싣는다", () => {
    const jsonLd = createLockerJsonLd({
      detail: {
        ...baseDetail,
        placeName: "중앙보훈병원역 3번 출구",
        operatingHours: { open: "05:30", close: "24:00" },
        minPrice: 2000,
        maxPrice: 4000,
      },
      url: URL,
      imageUrl: "https://zimdugo.com/og/1326.png",
    });

    expect(jsonLd).toMatchObject({
      image: "https://zimdugo.com/og/1326.png",
      containedInPlace: { "@type": "Place", name: "중앙보훈병원역 3번 출구" },
      openingHoursSpecification: { opens: "05:30", closes: "24:00" },
      additionalProperty: [{ name: "priceRange", value: "₩2000-4000" }],
    });
  });

  it("최대 요금이 없거나 최소와 같으면 가격대를 한 값으로 적는다", () => {
    const priceOf = (maxPrice?: number) =>
      createLockerJsonLd({
        detail: { ...baseDetail, minPrice: 2000, maxPrice },
        url: URL,
      }).additionalProperty?.[0]?.value;

    expect(priceOf(undefined)).toBe("₩2000");
    expect(priceOf(2000)).toBe("₩2000");
  });
});
