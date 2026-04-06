import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { typography } from "./typography.css.ts";

const meta = {
  title: "Foundation/typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

// 이건 왜 필요한거지?
export default meta;
type Story = StoryObj<typeof meta>;

type LineHeightKey = keyof typeof typography.scale.lineHeight;
type FontKey = keyof typeof typography.fontFamily;

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  MetroPolis: "Stay hungry, stay foolish.",
} as const;

const FONT_TOKENS = [
  { id: "default", label: "Pretendard" },
  { id: "english", label: "MetroPolis" },
] as const satisfies ReadonlyArray<{ id: string; label: FontKey }>;

const FONT_SIZE_TOKENS: Array<{ key: LineHeightKey; value: string }> = (
  Object.keys(typography.scale.lineHeight) as unknown as LineHeightKey[]
).map((key) => ({ key, value: typography.scale.lineHeight[key] }));

const LINE_HEIGHT_TOKENS: Array<{ key: LineHeightKey; value: string }> = (
  Object.keys(typography.scale.lineHeight) as LineHeightKey[]
).map((key) => ({ key, value: typography.scale.lineHeight[key] }));

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
        <div className={styles.columnTitle}>Pretendard</div>
        <div className={styles.columnTitle}>MetroPolis</div>
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {FONT_SIZE_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontSizeItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_TOKENS.map(({ id, label }) => (
              <div key={id} className={styles.fontPreviewColumn}>
                <span
                  className={styles.fontPreviewText}
                  style={{
                    fontSize: value,
                    fontFamily: typography.fontFamily[label],
                  }}
                >
                  {SAMPLE_TEXT[label as keyof typeof SAMPLE_TEXT]}
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
