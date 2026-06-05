import { SizeCard, type SizeCardType } from "./SizeCard.tsx";
import { root } from "./SizeList.css.ts";

export interface SizeListLabels {
  S: string;
  M: string;
  L: string;
}

export interface SizeListProps {
  labels: SizeListLabels;
  value?: SizeCardType[];
  onChange?: (value: SizeCardType[]) => void;
}

export function SizeList({ labels, value = [], onChange }: SizeListProps) {
  const handleToggle = (size: SizeCardType, isSelected: boolean) => {
    const nextValue = isSelected
      ? [...value, size]
      : value.filter((v) => v !== size);
    onChange?.(nextValue);
  };

  return (
    <div className={root}>
      <SizeCard
        size="S"
        labelText={labels.S}
        isSelected={value.includes("S")}
        onSelectedChange={(val) => handleToggle("S", val)}
      />
      <SizeCard
        size="M"
        labelText={labels.M}
        isSelected={value.includes("M")}
        onSelectedChange={(val) => handleToggle("M", val)}
      />
      <SizeCard
        size="L"
        labelText={labels.L}
        isSelected={value.includes("L")}
        onSelectedChange={(val) => handleToggle("L", val)}
      />
    </div>
  );
}
