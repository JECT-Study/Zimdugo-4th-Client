import { Checkbox } from "@repo/ui/components/checkbox";
import { IconSizeL, IconSizeM, IconSizeS } from "@repo/ui/tokens/icons";
import { useState } from "react";
import { useLockerSettings } from "../../hooks/useLockerSettings.ts";
import { root } from "./SizeCard.css.ts";

export type SizeCardType = "S" | "M" | "L";

export interface SizeCardProps {
  size: SizeCardType;
  labelText: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  className?: string;
}

/**
 * 보관함 사이즈 카드 엔티티 컴포넌트.
 * 보관함 설정 정보를 조회(useQuery)하여 해당 사이즈의 가용 여부 등을 자동으로 판단할 수 있습니다.
 */
export function SizeCard({
  size,
  labelText,
  isSelected,
  defaultSelected,
  onSelectedChange,
  isDisabled: initialIsDisabled = false,
  className,
}: SizeCardProps) {
  const [uncontrolledSelected, setUncontrolledSelected] = useState(
    defaultSelected || false,
  );

  // FSD Entity Pattern: 엔티티 설정을 조회(useQuery)하여 컴포넌트 상태에 반영
  const { data: settings } = useLockerSettings();

  const isAvailable = settings?.availableSizes.includes(size) ?? true;
  const isDisabled = initialIsDisabled || !isAvailable;

  const isControlled = isSelected !== undefined;
  const selected = isControlled ? isSelected : uncontrolledSelected;

  const handleChange = (val: boolean) => {
    if (!isControlled) {
      setUncontrolledSelected(val);
    }
    onSelectedChange?.(val);
  };

  const iconState = isDisabled ? "disabled" : selected ? "selected" : "default";
  return (
    <div className={[root, className].filter(Boolean).join(" ")}>
      {size === "S" && <IconSizeS state={iconState} />}
      {size === "M" && <IconSizeM state={iconState} />}
      {size === "L" && <IconSizeL state={iconState} />}
      <Checkbox
        isSelected={selected}
        onSelectedChange={handleChange}
        isDisabled={isDisabled}
        labelText={labelText}
        labelLocation="bottom"
      />
    </div>
  );
}
