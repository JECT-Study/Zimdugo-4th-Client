import {
  Tab as AriaTab,
  TabList,
  Tabs,
  type TabProps as AriaTabProps,
  type TabsProps,
} from "react-aria-components";
import { tab, tabBar } from "./Tab.css.ts";

export interface TabItem {
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface TabProps extends Omit<AriaTabProps, "className" | "children"> {
  className?: string;
  children: string;
}

export interface TabBarProps
  extends Omit<TabsProps, "children" | "orientation"> {
  items: TabItem[];
  className?: string;
}

export function Tab({ className, children, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      className={({ isSelected }: { isSelected: boolean }) =>
        [tab({ isSelected }), className].filter(Boolean).join(" ")
      }
    >
      {children}
    </AriaTab>
  );
}

export function TabBar({ items, className, ...props }: TabBarProps) {
  return (
    <Tabs {...props} orientation="horizontal">
      <TabList className={[tabBar, className].filter(Boolean).join(" ")}>
        {items.map((item) => (
          <Tab key={item.id} id={item.id} isDisabled={item.isDisabled}>
            {item.label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
