import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";

/**
 * 보관함 상세의 구조화 데이터(schema.org JSON-LD).
 *
 * 검색엔진과 생성형 답변 엔진이 "어디에 있고, 언제 열고, 얼마인지" 를 본문 해석 없이
 * 읽게 하려는 것이다. 타입은 `Place` 로 둔다. 보관함은 영업하는 사업체가 아니라서
 * `LocalBusiness` 는 뜻이 어긋난다.
 *
 * 자주 바뀌는 값(실시간 잔여 칸, 거리)은 넣지 않는다. 수집 시점의 값이 오래 남아
 * 틀린 정보가 된다. 없는 값은 키째 뺀다. 빈 값을 내면 검증 도구가 오류로 본다.
 */

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TIME_PATTERN = /^(\d{2}):(\d{2})(?::\d{2})?$/;

const toHourMinute = (value: string | undefined): string | null => {
  const match = value?.trim().match(TIME_PATTERN);
  return match ? `${match[1]}:${match[2]}` : null;
};

/**
 * 운영 시간. 매일 같은 시간으로 본다(API 가 요일별 시간을 주지 않는다).
 *
 * 00:00~00:00 은 24시간 운영이라는 뜻이다. schema.org 는 이를 00:00~23:59 로 적는다.
 */
export const createOpeningHoursSpecification = (
  operatingHours: LockerDetailItem["operatingHours"],
) => {
  const opens = toHourMinute(operatingHours?.open);
  const closes = toHourMinute(operatingHours?.close);
  if (!opens || !closes) return undefined;

  const isAllDay = opens === "00:00" && closes === "00:00";
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...ALL_DAYS],
    opens,
    closes: isAllDay ? "23:59" : closes,
  };
};

/** 원 단위 가격대. 최소만 있으면 그 값 하나로, 둘 다 없으면 뺀다. */
const createPriceRange = (minPrice?: number, maxPrice?: number) => {
  if (minPrice == null) return undefined;
  if (maxPrice == null || maxPrice <= minPrice) return `₩${minPrice}`;
  return `₩${minPrice}-${maxPrice}`;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const createLockerJsonLd = ({
  detail,
  url,
  imageUrl,
  description,
}: {
  detail: LockerDetailItem;
  url: string;
  imageUrl?: string;
  description?: string;
}) => {
  const openingHoursSpecification = createOpeningHoursSpecification(
    detail.operatingHours,
  );
  const priceRange = createPriceRange(detail.minPrice, detail.maxPrice);
  const hasGeo =
    isFiniteNumber(detail.latitude) && isFiniteNumber(detail.longitude);

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": url,
    url,
    name: detail.title,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(detail.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: detail.address,
            addressCountry: "KR",
          },
        }
      : {}),
    ...(hasGeo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: detail.latitude,
            longitude: detail.longitude,
          },
        }
      : {}),
    ...(detail.placeName
      ? { containedInPlace: { "@type": "Place", name: detail.placeName } }
      : {}),
    ...(openingHoursSpecification ? { openingHoursSpecification } : {}),
    ...(priceRange
      ? {
          // Place 에는 priceRange 가 없어 additionalProperty 로 싣는다.
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "priceRange",
              value: priceRange,
            },
          ],
        }
      : {}),
  };
};
