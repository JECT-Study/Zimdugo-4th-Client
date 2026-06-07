import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportSectionError } from "./ReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
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
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportPriceSection({
  priceType,
  setPriceType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sectionServerError,
  onFieldChange,
}: ReportPriceSectionProps) {
  const errorMessage = useReportSectionError(
    ["isFree", "minPrice", "maxPrice"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-price-error" : undefined;

  return (
    <section
      className={section}
      data-section="price"
      aria-describedby={errorId}
    >
      <ReportSectionTitleRow errorMessage={errorMessage} errorId={errorId}>
        {m.report_section_price()}
      </ReportSectionTitleRow>
      <div className={priceRow}>
        <Checkbox
          labelText={m.report_price_free()}
          isSelected={priceType === "free"}
          onSelectedChange={(selected) => {
            if (selected) {
              setPriceType("free");
              onFieldChange?.();
              return;
            }
            if (priceType === "free") {
              setPriceType("none");
              onFieldChange?.();
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
              onFieldChange?.();
              return;
            }
            if (priceType === "paid") {
              setPriceType("none");
              onFieldChange?.();
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
              onChange={(val) => {
                setMinPrice(val);
                onFieldChange?.();
              }}
              inputMode="numeric"
              aria-label={m.report_price_min_input_aria()}
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
          <span style={{ color: "#8E8E8E", flexShrink: 0 }}>~</span>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_max_placeholder()}
              value={maxPrice}
              onChange={(val) => {
                setMaxPrice(val);
                onFieldChange?.();
              }}
              inputMode="numeric"
              aria-label={m.report_price_max_input_aria()}
            />
            <span className={priceUnit}>{m.report_price_unit()}</span>
          </div>
        </div>
      )}
      <ReportSectionErrorReserve />
      {/* 롤백용: 하단 에러 영역 — Reserve 제거 후 주석 해제
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        placement="bottom"
      />
      */}
    </section>
  );
}
