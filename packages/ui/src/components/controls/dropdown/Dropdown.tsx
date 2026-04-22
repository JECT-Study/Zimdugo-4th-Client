import { Link, type LinkProps } from "react-aria-components";
import { IconNormalArrow24 } from "../../../tokens/icons/Icons.tsx";
import { dropdownRecipe, iconWrap, label } from "./Dropdown.css.ts";

export type DropdownState = "default" | "active";

export interface DropdownProps
  extends Omit<LinkProps, "className" | "children"> {
  children: string;
  state?: DropdownState;
  className?: string;
}

/** 필터 드롭다운 트리거. Figma `pb08Ww9owybybpwWkySqu7` · `1097-5905`. */
export function Dropdown({
  children,
  state = "default",
  className,
  ...props
}: DropdownProps) {
  const rootClass = dropdownRecipe({ state });
  return (
    <Link
      {...props}
      className={[rootClass, className].filter(Boolean).join(" ")}
    >
      <span className={label}>{children}</span>
      <span className={iconWrap}>
        <IconNormalArrow24
          size={16}
          direction="down"
          tone={state === "active" ? "active" : "default"}
        />
      </span>
    </Link>
  );
}
