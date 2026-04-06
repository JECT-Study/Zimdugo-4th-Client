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

type FontSizeKey = keyof typeof typography.scale.fontSize;
type FontKey = keyof typeof typography.fontFamily;

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  MetroPolis: "Stay hungry, stay foolish.",
} as const;

const FONT_SIZE_TOKENS: Array<{ key: FontSizeKey; value: string }> = (
  Object.keys(typography.scale.fontSize) as unknown as FontSizeKey[]
).map((key) => ({ key, value: typography.scale.fontSize[key] }));

const FONT_TOKENS = [
  { id: "default", label: "Pretendard" },
  { id: "english", label: "MetroPolis" },
] as const satisfies ReadonlyArray<{ id: string; label: FontKey }>;

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
        {FONT_TOKENS.map(({ id }) => (
          <h4 key={id} className={styles.columnTitle}>
            {id}
          </h4>
        ))}
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {FONT_SIZE_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontSizeItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_TOKENS.map(({ id, label }) => (
              <div
                key={`${id}-${String(key)}`}
                className={styles.fontPreviewColumn}
              >
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
