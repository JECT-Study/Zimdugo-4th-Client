import { useId, useState } from "react";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  type PopoverProps,
  Select,
  type SelectProps,
  SelectValue,
} from "react-aria-components";
import { IconNormalArrow24 } from "../../icons/Icons.tsx";
import {
  button,
  chevronRecipe,
  item,
  listbox,
  popover,
  root,
  valueText,
} from "./Dropdown.css.ts";
import { type Placement, SyncPlacement } from "./SyncPlacement.tsx";

export interface DropdownOption {
  id: string | number;
  label: string;
}

export type DropdownSize = "default" | "compact";

export interface DropdownProps
  extends Omit<SelectProps<DropdownOption>, "children" | "items"> {
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  "aria-label"?: string;
  popoverPlacement?: PopoverProps["placement"];
  size?: DropdownSize;
}

export function Dropdown({
  options,
  placeholder = "Select option",
  className,
  label,
  "aria-label": ariaLabel,
  name,
  popoverPlacement = "bottom",
  size = "default",
  ...props
}: DropdownProps & { name?: string }) {
  const computedAriaLabel = ariaLabel ?? label ?? placeholder;
  const [actualPlacement, setActualPlacement] = useState<Placement>("bottom");
  const labelId = useId();
  const selectId = useId();

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <span
          id={labelId}
          style={{
            display: "block",
            marginBottom: 4,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {label}
        </span>
      )}
      <Select
        id={selectId}
        name={name}
        className={[root, className].filter(Boolean).join(" ")}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : computedAriaLabel}
        {...props}
      >
        {({ isOpen }: { isOpen: boolean }) => {
          const shouldRotate = isOpen && actualPlacement.startsWith("top");

          return (
            <>
              <Button className={button({ size })}>
                <SelectValue className={valueText({ size })}>
                  {({ selectedItem }) =>
                    (selectedItem as DropdownOption | null)?.label ||
                    placeholder
                  }
                </SelectValue>
                <span
                  className={chevronRecipe({
                    rotation: shouldRotate ? "up" : "down",
                  })}
                >
                  <IconNormalArrow24 direction="down" />
                </span>
              </Button>
              <Popover
                className={popover({ size })}
                placement={popoverPlacement}
              >
                {({ placement }) => (
                  <>
                    {placement ? (
                      <SyncPlacement
                        placement={placement}
                        setPlacement={setActualPlacement}
                      />
                    ) : null}
                    <ListBox items={options} className={listbox({ size })}>
                      {(option: DropdownOption) => (
                        <ListBoxItem
                          id={option.id}
                          textValue={option.label}
                          className={item({ size })}
                        >
                          {option.label}
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </>
                )}
              </Popover>
            </>
          );
        }}
      </Select>
    </div>
  );
}
