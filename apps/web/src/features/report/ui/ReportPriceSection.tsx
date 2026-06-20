import { m } from "@repo/i18n";
import { Input } from "@repo/ui/components/input";
import { Radio, RadioGroup } from "@repo/ui/components/radio";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  priceFreeRadio,
  priceInputContainer,
  priceInputRow,
  pricePaidRadio,
  priceRadioGroup,
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
  formatPrice?: (val: string) => string;
  onMinPriceBlur?: () => void;
  onMaxPriceBlur?: () => void;
}

interface ReportPriceSectionViewProps extends ReportPriceSectionProps {
  errorMessage?: string;
}

export function ReportPriceSection(props: ReportPriceSectionProps) {
  const errorMessage = useReportSectionError(
    ["isFree", "minPrice", "maxPrice"],
    props.sectionServerError,
  );

  return <ReportPriceSectionView {...props} errorMessage={errorMessage} />;
}

export function ReportPriceSectionView({
  priceType,
  setPriceType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  errorMessage,
  onFieldChange,
  formatPrice,
  onMinPriceBlur,
  onMaxPriceBlur,
}: ReportPriceSectionViewProps) {
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
        <RadioGroup
          aria-label={m.report_section_price()}
          className={priceRadioGroup}
          optionsDirection="row"
          value={priceType === "none" ? undefined : priceType}
          onChange={(value) => {
            setPriceType(value as "free" | "paid");
            onFieldChange?.();
          }}
        >
          <Radio className={priceFreeRadio} value="free">
            {m.report_price_free()}
          </Radio>
          <Radio className={pricePaidRadio} value="paid">
            {m.report_price_paid()}
          </Radio>
        </RadioGroup>
      </div>
      {priceType === "paid" && (
        <div className={priceInputRow}>
          <div className={priceInputContainer}>
            <Input
              placeholder={m.report_price_min_placeholder()}
              value={minPrice}
              onChange={(val) => {
                setMinPrice(formatPrice?.(val) ?? val);
                onFieldChange?.();
              }}
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
              onChange={(val) => {
                setMaxPrice(formatPrice?.(val) ?? val);
                onFieldChange?.();
              }}
              inputMode="numeric"
              aria-label={m.report_price_max_input_aria()}
              onBlur={() => onMaxPriceBlur?.()}
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
