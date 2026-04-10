import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { typography } from "./typography.css.ts";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type FontKey = keyof typeof typography.scale.font;
type SampleTextKey = keyof typeof SAMPLE_TEXT;
type FontValue = (typeof typography.scale.font)[FontKey];
type FontFamilyToken = {
  id: string;
  label: string;
  fontFamily: string;
  sampleTextKey: SampleTextKey;
};

const SAMPLE_TEXT = {
  Pretendard: "다람쥐 헌 쳇바퀴에 타고파.",
  Metropolis: "Stay hungry, stay foolish.",
} as const;

const removePxSuffix = (value: string) => value.replace(/px$/u, "");
const formatFontValue = (value: FontValue) =>
  `${value.fontSize} / ${value.fontWeight} / ${value.lineHeight}`;

const FONT_TOKENS: Array<{ key: FontKey; value: FontValue }> = (
  Object.keys(typography.scale.font) as FontKey[]
).map((key) => ({ key, value: typography.scale.font[key] }));

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
] as const satisfies ReadonlyArray<FontFamilyToken>;

export const Font: Story = {
  name: "Font",
  render: () => <Fonts />,
};

function Fonts() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Font Tokens</h2>
        <p className={styles.pageSubtitle}>폰트 토큰입니다.</p>
      </div>

      <div className={styles.fontPreviewHeader}>
        {FONT_FAMILY_TOKENS.map(({ id, label }) => (
          <h4 key={id} className={styles.fontColumnTitle}>
            {label}
          </h4>
        ))}
        <div aria-hidden="true" style={{ height: "16px" }} />
      </div>

      {FONT_TOKENS.map(({ key, value }) => (
        <div key={String(key)} className={styles.fontTokenItem}>
          <div className={styles.fontPreviewGrid}>
            {FONT_FAMILY_TOKENS.map(({ id, fontFamily, sampleTextKey }) => (
              <div
                key={`${id}-${String(key)}`}
                className={styles.fontPreviewColumn}
              >
                <span
                  className={styles.fontPreviewText}
                  style={{
                    fontSize: value.fontSize,
                    fontWeight: value.fontWeight,
                    lineHeight: value.lineHeight,
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
              >{`font.${String(key)}.${removePxSuffix(value.fontSize)}`}</span>
              <span className={styles.tokenValue}>
                {formatFontValue(value)}
              </span>
            </div>
          </div>
        </div>
      ))}

      <FontTokenTable />
    </div>
  );
}

function FontTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Font Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {FONT_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td
                className={styles.tokenTableCellName}
              >{`font.${String(key)}.${removePxSuffix(value.fontSize)}`}</td>
              <td className={styles.tokenTableCellValue}>
                {formatFontValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
