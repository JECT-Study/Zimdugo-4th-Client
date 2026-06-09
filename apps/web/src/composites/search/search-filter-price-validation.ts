import {
  formatPriceInput,
  REPORT_PRICE_MAX,
} from "#/features/report/lib/sanitizePriceInput";

/** 검색 필터 가격 입력 하한 (제보 가격 정책과 동일) */
const SEARCH_FILTER_PRICE_MIN = 1_000;

type SearchFilterPriceType = "free" | "paid" | "none";

interface SearchFilterPriceValidationMessages {
  invalidRange: () => string;
}

interface SearchFilterPriceValidationInput {
  priceType: SearchFilterPriceType;
  minPrice: string;
  maxPrice: string;
  messages: SearchFilterPriceValidationMessages;
}

interface SearchFilterPriceRangeNormalizeInput {
  minPrice: string;
  maxPrice: string;
  changedField: "min" | "max";
}

const parseOptionalPrice = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;

  const parsedValue = Number(digits);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
};

const formatNormalizedPrice = (value: number): string =>
  formatPriceInput(
    String(Math.min(Math.max(value, SEARCH_FILTER_PRICE_MIN), REPORT_PRICE_MAX)),
  );

export const normalizeSearchFilterPriceRange = ({
  minPrice,
  maxPrice,
  changedField,
}: SearchFilterPriceRangeNormalizeInput) => {
  let minValue = parseOptionalPrice(formatPriceInput(minPrice));
  let maxValue = parseOptionalPrice(formatPriceInput(maxPrice));

  if (minValue !== null && !Number.isNaN(minValue)) {
    minValue = Math.min(
      Math.max(minValue, SEARCH_FILTER_PRICE_MIN),
      REPORT_PRICE_MAX,
    );
  }

  if (maxValue !== null && !Number.isNaN(maxValue)) {
    maxValue = Math.min(
      Math.max(maxValue, SEARCH_FILTER_PRICE_MIN),
      REPORT_PRICE_MAX,
    );
  }

  if (minValue !== null && maxValue !== null && minValue > maxValue) {
    if (changedField === "min") {
      maxValue = minValue;
    } else {
      minValue = maxValue;
    }
  }

  return {
    minPrice: minValue === null ? "" : formatNormalizedPrice(minValue),
    maxPrice: maxValue === null ? "" : formatNormalizedPrice(maxValue),
  };
};

export const validateSearchFilterPrice = ({
  priceType,
  minPrice,
  maxPrice,
  messages,
}: SearchFilterPriceValidationInput): string | undefined => {
  if (priceType !== "paid") return undefined;

  const minValue = parseOptionalPrice(minPrice);
  const maxValue = parseOptionalPrice(maxPrice);

  if (minValue === null || maxValue === null) {
    return messages.invalidRange();
  }

  if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
    return messages.invalidRange();
  }

  if (minValue < SEARCH_FILTER_PRICE_MIN || maxValue > REPORT_PRICE_MAX) {
    return messages.invalidRange();
  }

  if (minValue > maxValue) {
    return messages.invalidRange();
  }

  return undefined;
};
