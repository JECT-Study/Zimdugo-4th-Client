import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Stories.css.ts";
import { shadow } from "./shadow.css.ts";

const meta = {
  title: "Foundation/Shadow",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  name: "Tokens",
  render: () => <ShadowTokens />,
};

type ShadowKey = keyof typeof shadow.scale;

const SHADOW_TOKENS: Array<{ key: ShadowKey; value: string }> = (
  Object.keys(shadow.scale) as unknown as ShadowKey[]
).map((key) => ({ key, value: shadow.scale[key] }));

/** 모든 shadow 토큰을 미리보기와 테이블로 표시합니다 */
function ShadowTokens() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Shadow Tokens</h2>
        <p className={styles.pageSubtitle}>
          UI 요소 간의 상대적인 깊이와 계층 구조를 시각적으로 표현하기 위한
          토큰입니다.
        </p>
      </div>

      <div className={styles.tokenGrid}>
        {SHADOW_TOKENS.map(({ key, value }) => (
          <ShadowCard key={String(key)} tokenKey={String(key)} value={value} />
        ))}
      </div>

      <ShadowTokenTable />
    </div>
  );
}

/** 단일 shadow 토큰을 미리보기 박스와 메타 정보로 표시합니다 */
function ShadowCard({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <div className={styles.tokenCard}>
      <div
        className={styles.previewBox}
        style={{ boxShadow: value }}
        title={`shadow.${tokenKey}: ${value}`}
      />
      <div className={styles.tokenMeta}>
        <span className={styles.tokenKey}>shadow.{tokenKey}</span>
        <span className={styles.tokenValue}>{value}</span>
      </div>
    </div>
  );
}

/** 모든 shadow 토큰을 이름과 값으로 나열합니다 */
function ShadowTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Shadow Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {SHADOW_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`shadow.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
