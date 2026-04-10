import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { typography } from "./typography.css.ts";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type FontWeightKey = keyof typeof typography.scale.fontWeight;
type SampleTextKey = keyof typeof SAMPLE_TEXT;

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  Metropolis: "Stay hungry, stay foolish.",
} as const;

const FONT_WEIGHT_TOKENS: Array<{ key: FontWeightKey; value: string }> = (
  Object.keys(typography.scale.fontWeight) as FontWeightKey[]
).map((key) => ({ key, value: typography.scale.fontWeight[key] }));

const FONT_TOKENS = [
  {
    id: "default",
    label: "Pretendard",
    fontFamily: "Pretendard",
    sampleTextKey: "Pretendard",
  },
  {
    id: "english",
    label: "Metropolis",
    fontFamily: "Metropolis",
    sampleTextKey: "Metropolis",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  fontFamily: string;
  sampleTextKey: SampleTextKey;
}>;

export const FontWeight: Story = {
  name: "FontWeight",
  render: () => <FontWeights />,
};

function FontWeights() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Font Weight Tokens</h2>
        <p className={styles.pageSubtitle}>폰트 두께 토큰입니다.</p>
      </div>

      <div className={styles.fontPreviewHeader}>
        {FONT_TOKENS.map(({ id, label }) => (
          <h4 key={id} className={styles.fontColumnTitle}>
            {label}
          </h4>
        ))}
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {FONT_WEIGHT_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontTokenItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_TOKENS.map(({ id, fontFamily, sampleTextKey }) => (
              <div
                key={`${id}-${String(key)}`}
                className={styles.fontPreviewColumn}
                style={{ fontWeight: value, fontFamily }}
              >
                {SAMPLE_TEXT[sampleTextKey]}
              </div>
            ))}

            <div className={styles.fontTokenMeta}>
              <span
                className={styles.tokenKey}
              >{`fontWeight.${String(key)}`}</span>
              <span className={styles.tokenValue}>{value}</span>
            </div>
          </div>
        </div>
      ))}

      <FontWeightTokenTable />
    </div>
  );
}

function FontWeightTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Font Weight Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {FONT_WEIGHT_TOKENS.map(({ key, value }) => (
            <tr
              key={`font-weight-${String(key)}`}
              className={styles.tokenTableRow}
            >
              <td className={styles.tokenTableCellName}>
                {`fontWeight.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
