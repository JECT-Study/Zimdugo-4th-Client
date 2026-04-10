import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { typography } from "./typography.css.ts";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type FontSizeKey = keyof typeof typography.scale.fontSize;
type SampleTextKey = keyof typeof SAMPLE_TEXT;

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  Metropolis: "Stay hungry, stay foolish.",
} as const;

const FONT_SIZE_TOKENS: Array<{ key: FontSizeKey; value: string }> = (
  Object.entries(typography.scale.fontSize) as Array<[`${FontSizeKey}`, string]>
).map(([key, value]) => ({ key: Number(key) as FontSizeKey, value }));

const FONT_FAMILY_TOKENS = [
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

export const FontSize: Story = {
  name: "FontSize",
  render: () => <FontSizes />,
};

function FontSizes() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Font Size Tokens</h2>
        <p className={styles.pageSubtitle}>폰트 크기 토큰입니다.</p>
      </div>

      <div className={styles.fontPreviewHeader}>
        {FONT_FAMILY_TOKENS.map(({ id, label }) => (
          <h4 key={id} className={styles.fontColumnTitle}>
            {label}
          </h4>
        ))}
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {FONT_SIZE_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontTokenItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_FAMILY_TOKENS.map(({ id, fontFamily, sampleTextKey }) => (
              <div
                key={`${id}-${String(key)}`}
                className={styles.fontPreviewColumn}
              >
                <span
                  className={styles.fontPreviewText}
                  style={{ fontSize: value, fontFamily }}
                >
                  {SAMPLE_TEXT[sampleTextKey]}
                </span>
              </div>
            ))}

            <div className={styles.fontTokenMeta}>
              <span
                className={styles.tokenKey}
              >{`fontSize.${String(key)}`}</span>
              <span className={styles.tokenValue}>{value}</span>
            </div>
          </div>
        </div>
      ))}

      <FontSizeTokenTable />
    </div>
  );
}

function FontSizeTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Font Size Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {FONT_SIZE_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`fontSize.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
