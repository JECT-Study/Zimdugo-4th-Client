import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { LabelTitle } from "@repo/ui/components/label-title";
import {
  priceInputContainer,
  priceInputRow,
  priceRow,
  priceUnit,
  section,
} from "./report.css.ts";

interface ReportPriceSectionProps {
  priceType: "free" | "paid" | "none";
  setPriceType: (val: "free" | "paid" | "none") => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  formatPrice: (val: string) => string;
}

export function ReportPriceSection({
  priceType,
  setPriceType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  formatPrice,
}: ReportPriceSectionProps) {
  return (
    <section className={section}>
      <LabelTitle size="small">{m.report_section_price()}</LabelTitle>
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
      {priceType === "paid" && (
        <div className={priceInputRow}>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_min_placeholder()}
              value={minPrice}
              onChange={(val) => setMinPrice(formatPrice(val))}
              inputMode="numeric"
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
          <span style={{ color: "#8E8E8E", flexShrink: 0 }}>~</span>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_max_placeholder()}
              value={maxPrice}
              onChange={(val) => setMaxPrice(formatPrice(val))}
              inputMode="numeric"
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
        </div>
      )}
    </section>
  );
}
