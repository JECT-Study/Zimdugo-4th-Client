import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { spacing } from "./spacing.css.ts";

const meta = {
  title: "Foundation/Spacing",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  name: "Tokens",
  render: () => <SpacingTokens />,
};

type SpacingKey = keyof typeof spacing.scale;

const SPACING_TOKENS: Array<{ key: SpacingKey; value: string }> = (
  Object.keys(spacing.scale) as unknown as SpacingKey[]
).map((key) => ({ key, value: spacing.scale[key] }));

const MAX_PX = 28;

/** 모든 spacing 토큰을 바 시각화와 테이블로 표시합니다 */
function SpacingTokens() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Spacing Tokens</h2>
        <p className={styles.pageSubtitle}>
          여백·간격·패딩 등 레이아웃 공간을 일관되게 적용하기 위한 토큰입니다.
        </p>
      </div>

      <div className={styles.tokenList}>
        {SPACING_TOKENS.map(({ key, value }) => (
          <SpacingRow key={String(key)} tokenKey={String(key)} value={value} />
        ))}
      </div>

      <SpacingTokenTable />
    </div>
  );
}

/** 단일 spacing 토큰을 비례 바와 메타 정보로 표시합니다 */
function SpacingRow({ tokenKey, value }: { tokenKey: string; value: string }) {
  const px = Number.parseInt(tokenKey, 10);
  const widthPct = (px / MAX_PX) * 100;

  return (
    <div className={styles.tokenRow}>
      <div className={styles.barWrapper}>
        <div
          className={styles.bar}
          style={{ width: `${widthPct}%` }}
          title={`spacing.${tokenKey}: ${value}`}
        />
      </div>
      <div className={styles.tokenMeta}>
        <span className={styles.tokenKey}>spacing.{tokenKey}</span>
        <span className={styles.tokenValue}>{value}</span>
      </div>
    </div>
  );
}

/** 모든 spacing 토큰을 이름과 값으로 나열합니다 */
function SpacingTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Spacing Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {SPACING_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`spacing.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
