import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { LabelTitle } from "@repo/ui/components/label-title";
import {
  priceErrorText,
  priceInputContainer,
  priceInputRow,
  priceRow,
  priceUnit,
  section,
} from "./SearchFilterBottomSheet.css.ts";

export interface SearchFilterPriceSectionProps {
  priceType: "free" | "paid" | "none";
  setPriceType: (value: "free" | "paid" | "none") => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  errorMessage?: string;
  formatPrice: (value: string) => string;
  onMinPriceBlur?: () => void;
  onMaxPriceBlur?: () => void;
}

export function SearchFilterPriceSection({
  priceType,
  setPriceType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  errorMessage,
  formatPrice,
  onMinPriceBlur,
  onMaxPriceBlur,
}: SearchFilterPriceSectionProps) {
  const errorId = errorMessage ? "search-filter-price-error" : undefined;

  return (
    <section className={section} aria-describedby={errorId}>
      <LabelTitle size="small">{m.report_section_price()}</LabelTitle>
      {errorMessage ? (
        <p className={priceErrorText} id={errorId}>
          {errorMessage}
        </p>
      ) : null}
      <div className={priceRow}>
        <Checkbox
          labelText={m.report_price_free()}
          isSelected={priceType === "free"}
          onSelectedChange={(selected) => {
            if (selected) {
              setPriceType("free");
              return;
            }
            if (priceType === "free") {
              setPriceType("none");
            }
          }}
          labelLocation="right"
        />
        <Checkbox
          labelText={m.report_price_paid()}
          isSelected={priceType === "paid"}
          onSelectedChange={(selected) => {
            if (selected) {
              setPriceType("paid");
              return;
            }
            if (priceType === "paid") {
              setPriceType("none");
            }
          }}
          labelLocation="right"
        />
      </div>
      {priceType === "paid" ? (
        <div className={priceInputRow}>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_min_placeholder()}
              value={minPrice}
              onChange={(value) => setMinPrice(formatPrice(value))}
              inputMode="numeric"
              aria-label={m.report_price_min_input_aria()}
              onBlur={() => onMinPriceBlur?.()}
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
          <span style={{ color: "#8E8E8E", flexShrink: 0 }}>~</span>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_max_placeholder()}
              value={maxPrice}
              onChange={(value) => setMaxPrice(formatPrice(value))}
              inputMode="numeric"
              aria-label={m.report_price_max_input_aria()}
              onBlur={() => onMaxPriceBlur?.()}
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
