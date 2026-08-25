import type { Meta, StoryObj } from "@storybook/react";
import {
  beforeSurface,
  comparisonGrid,
  panel,
  panelNote,
  panelTitle,
  surface,
} from "./SearchAsyncFeedback.stories.css.ts";
import {
  SearchAsyncFeedback,
  type SearchAsyncFeedbackVariant,
} from "./SearchAsyncFeedback.tsx";

const VARIANTS: SearchAsyncFeedbackVariant[] = [
  "suggest-invalid-format",
  "suggest-empty",
  "suggest-error",
  "result-error",
];

const meta = {
  title: "Product/Search/Search Async Feedback",
  component: SearchAsyncFeedback,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: VARIANTS,
    },
  },
  args: {
    variant: "suggest-empty",
  },
} satisfies Meta<typeof SearchAsyncFeedback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * 세로 여백 수정 전후 비교.
 *
 * `padding` 이 `vars.spacing[40]` 을 참조했는데 spacing 스케일은 28 까지라
 * 값이 `undefined` 였다. `padding: "undefined 20px"` 는 브라우저가 선언 전체를
 * 버리므로 여백이 아예 없었다. 왼쪽이 그 상태, 오른쪽이 의도한 40px 이다.
 */
export const PaddingBeforeAfter: StoryObj<typeof meta> = {
  name: "여백 수정 전후 비교",
  parameters: {
    layout: "padded",
    controls: { disable: true },
  },
  render: () => (
    <div className={comparisonGrid}>
      <div className={panel}>
        <p className={panelTitle}>수정 전 — 여백 없음</p>
        <p className={panelNote}>
          spacing[40] 이 undefined 라 padding 선언이 통째로 무효였다.
        </p>
        {VARIANTS.map((variant) => (
          <div
            key={variant}
            className={`${surface} ${beforeSurface}`}
            data-variant={variant}
          >
            <SearchAsyncFeedback variant={variant} onRetry={() => undefined} />
          </div>
        ))}
      </div>

      <div className={panel}>
        <p className={panelTitle}>수정 후 — 위아래 40px</p>
        <p className={panelNote}>토큰에 없는 값이라 리터럴 40px 로 두었다.</p>
        {VARIANTS.map((variant) => (
          <div key={variant} className={surface} data-variant={variant}>
            <SearchAsyncFeedback variant={variant} onRetry={() => undefined} />
          </div>
        ))}
      </div>
    </div>
  ),
};
