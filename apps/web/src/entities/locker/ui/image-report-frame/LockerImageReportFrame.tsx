import { m } from "@repo/i18n";
import { IconCamera24, IconImageUnavailable24 } from "@repo/ui/assets/icons";
import {
  frame,
  frameSizeVariants,
  frameStateVariants,
  textColumn,
  textLine,
} from "./LockerImageReportFrame.css.ts";

type LockerImageReportFrameSize = keyof typeof frameSizeVariants;

/**
 * 이미지 자리에 이미지가 없는 이유.
 *
 * - `empty`: 서버가 사진이 없다고 했다.
 * - `failed`: 사진이 있다고 했는데 못 불러왔다.
 *
 * 사용자에게 다른 사실이라 아이콘과 문구가 갈린다. 예전에는 호출부가 문구를 통째로
 * 넘겨서 어떤 상태를 그리는지가 컴포넌트 안에 없었고, 실패 자리는 아예 다른 곳에
 * 따로 그려져 있었다.
 */
type LockerImageReportFrameState = keyof typeof frameStateVariants;

export interface LockerImageReportFrameProps {
  state?: LockerImageReportFrameState;
  size?: LockerImageReportFrameSize;
  /** 상태별 기본 문구를 덮어쓸 때만 준다. */
  titleText?: string;
  /**
   * 제목 아래 한 줄.
   *
   * 지금은 어느 호출부도 채우지 않아 화면에 나오지 않는다. 다시 안내가 필요해질 때를
   * 위해 자리는 남겨 둔다.
   */
  helperText?: string;
  className?: string;
}

const ICON_BY_STATE = {
  empty: IconCamera24,
  failed: IconImageUnavailable24,
} as const;

const defaultTitleOf = (state: LockerImageReportFrameState) =>
  state === "failed"
    ? m.locker_detail_image_load_failed()
    : m.my_report_image_empty();

export function LockerImageReportFrame({
  state = "empty",
  size = "half",
  titleText,
  helperText,
  className,
}: LockerImageReportFrameProps) {
  const StateIcon = ICON_BY_STATE[state];

  return (
    <div
      className={[
        frame,
        frameStateVariants[state],
        frameSizeVariants[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <StateIcon />
      <div className={textColumn}>
        <span className={textLine}>{titleText ?? defaultTitleOf(state)}</span>
        {helperText ? <span className={textLine}>{helperText}</span> : null}
      </div>
    </div>
  );
}
