import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
// import { ChipGroup } from "@repo/ui/components/chip-group";
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
      {/*
      <ChipGroup
        options={[
          { label: m.report_price_free(), value: "free" },
          { label: m.report_price_paid(), value: "paid" },
        ]}
        value={priceType === "none" ? [] : [priceType]}
        onChange={(keys) => {
          const nextKey = keys[keys.length - 1] as "free" | "paid";
          if (nextKey) setPriceType(nextKey);
        }}
        selectionMode="single"
        ariaLabel="가격 유형 선택"
      />
      */}
      <div className={priceRow}>
        <Checkbox
          labelText={m.report_price_free()}
          isSelected={priceType === "free"}
          onSelectedChange={(selected) => setPriceType(selected ? "free" : "none")}
          labelLocation="right"
        />
        <Checkbox
          labelText={m.report_price_paid()}
          isSelected={priceType === "paid"}
          onSelectedChange={(selected) => setPriceType(selected ? "paid" : "none")}
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
