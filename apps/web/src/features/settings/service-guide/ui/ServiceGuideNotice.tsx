import { IconCaution24 } from "@repo/ui/assets/icons";
import { notice, noticeText } from "./service-guide.css.ts";

export interface ServiceGuideNoticeProps {
  children: string;
}

export function ServiceGuideNotice({ children }: ServiceGuideNoticeProps) {
  return (
    <aside className={notice}>
      <IconCaution24 />
      <p className={noticeText}>{children}</p>
    </aside>
  );
}
