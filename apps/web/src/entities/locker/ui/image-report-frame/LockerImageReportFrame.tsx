import { m } from "@repo/i18n";
import { IconCamera24 } from "@repo/ui/tokens/icons";
import {
  frame,
  frameSizeVariants,
  textColumn,
  textLine,
} from "./LockerImageReportFrame.css.ts";

export type LockerImageReportFrameSize = "compact" | "half" | "full";

export interface LockerImageReportFrameProps {
  size?: LockerImageReportFrameSize;
  titleText?: string;
  helperText?: string;
  className?: string;
}

const DEFAULT_NO_IMAGE_TITLE = m.locker_detail_no_image_title();
const DEFAULT_NO_IMAGE_HELPER = m.locker_detail_no_image_helper();

export function LockerImageReportFrame({
  size = "half",
  titleText = DEFAULT_NO_IMAGE_TITLE,
  helperText = DEFAULT_NO_IMAGE_HELPER,
  className,
}: LockerImageReportFrameProps) {
  return (
    <div
      className={[frame, frameSizeVariants[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      <IconCamera24 />
      <div className={textColumn}>
        <span className={textLine}>{titleText}</span>
        {helperText ? <span className={textLine}>{helperText}</span> : null}
      </div>
    </div>
  );
}
