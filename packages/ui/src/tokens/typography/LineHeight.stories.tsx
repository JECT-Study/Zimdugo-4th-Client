import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { typography } from "./typography.css.ts";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type LineHeightKey = keyof typeof typography.scale.lineHeight;
type SampleTextKey = keyof typeof SAMPLE_TEXT;

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  Metropolis: "Stay hungry, stay foolish.",
} as const;

const LINE_HEIGHT_TOKENS: Array<{ key: LineHeightKey; value: string }> = (
  Object.keys(typography.scale.lineHeight) as LineHeightKey[]
).map((key) => ({ key, value: typography.scale.lineHeight[key] }));

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

export const LineHeight: Story = {
  name: "LineHeight",
  render: () => <LineHeights />,
};

function LineHeights() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Line Height Tokens</h2>
        <p className={styles.pageSubtitle}>줄 간격 토큰입니다.</p>
      </div>

      <div className={styles.fontPreviewHeader}>
        {FONT_TOKENS.map(({ id, label }) => (
          <h4 key={id} className={styles.fontColumnTitle}>
            {label}
          </h4>
        ))}
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {LINE_HEIGHT_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontTokenItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_TOKENS.map(({ id, fontFamily, sampleTextKey }) => (
              <div key={id} className={styles.fontPreviewColumn}>
                <span
                  className={styles.fontPreviewText}
                  style={{
                    lineHeight: value,
                    fontFamily,
                  }}
                >
                  {SAMPLE_TEXT[sampleTextKey]}
                </span>
              </div>
            ))}

            <div className={styles.fontTokenMeta}>
              <span
                className={styles.tokenKey}
              >{`lineHeight.${String(key)}`}</span>
              <span className={styles.tokenValue}>{value}</span>
            </div>
          </div>
        </div>
      ))}

      <LineHeightTokenTable />
    </div>
  );
}

function LineHeightTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Line Height Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {LINE_HEIGHT_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`lineHeight.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}> {value} </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
