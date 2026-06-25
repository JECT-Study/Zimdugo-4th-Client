import { useEffect, useRef, useState } from "react";
import { IconCheck24, IconNormalGlobe32 } from "../../tokens/icons/Icons.tsx";
import {
  checkIcon,
  chevron,
  option,
  optionSelected,
  options,
  optionsOpen,
  optionText,
  root,
  rootExpanded,
  trigger,
  triggerLabel,
} from "./LanguageDropdown.css.ts";

export interface LanguageDropdownOption {
  value: string;
  label: string;
}

export interface LanguageDropdownProps {
  options: readonly LanguageDropdownOption[];
  value: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function LanguageDropdown({
  options: languageOptions,
  value,
  onChange,
  ariaLabel = "Language",
  className,
}: LanguageDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const selectedOption =
    languageOptions.find((optionItem) => optionItem.value === value) ??
    languageOptions[0];

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setIsOptionsOpen(true);
      return;
    }

    if (isOptionsOpen) {
      setIsOptionsOpen(false);
      return;
    }

    setIsOptionsOpen(true);
  };

  const handleSelect = (nextValue: string) => {
    setIsOptionsOpen(false);
    setIsExpanded(false);
    onChange?.(nextValue);
  };

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleDocumentPointerDown = (event: globalThis.PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOptionsOpen(false);
        setIsExpanded(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOptionsOpen(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isExpanded]);

  return (
    <div
      ref={dropdownRef}
      className={[root, isExpanded ? rootExpanded : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={trigger}
        aria-label={ariaLabel}
        aria-expanded={isOptionsOpen}
        onClick={handleToggle}
      >
        <IconNormalGlobe32 />
        <span className={triggerLabel}>{selectedOption?.label}</span>
        <span className={chevron} aria-hidden />
      </button>
      <div
        className={[options, isOptionsOpen ? optionsOpen : ""]
          .filter(Boolean)
          .join(" ")}
        role="listbox"
      >
        {languageOptions.map((languageOption) => {
          const isSelected = languageOption.value === selectedOption?.value;

          return (
            <button
              key={languageOption.value}
              type="button"
              className={[option, isSelected ? optionSelected : ""]
                .filter(Boolean)
                .join(" ")}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(languageOption.value)}
            >
              <span className={optionText}>{languageOption.label}</span>
              {isSelected ? (
                <span className={checkIcon}>
                  <IconCheck24 />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
