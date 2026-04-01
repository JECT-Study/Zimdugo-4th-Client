import type { Meta, StoryObj } from "@storybook/react";
import { radius } from "./radius.css.ts";
import * as styles from "./Stories.css.ts";

const meta = {
  title: "Foundation/Radius",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  name: "Tokens",
  render: () => <RadiusTokens />,
};

type RadiusKey = keyof typeof radius.scale;

const RADIUS_TOKENS: Array<{ key: RadiusKey; value: string }> = (
  Object.keys(radius.scale) as unknown as RadiusKey[]
).map((key) => ({ key, value: radius.scale[key] }));

/** 모든 radius 토큰을 미리보기와 테이블로 표시합니다 */
function RadiusTokens() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Radius Tokens</h2>
        <p className={styles.pageSubtitle}>
          컴포넌트의 모서리 둥글기를 일관되게 적용하기 위한 토큰입니다.
        </p>
      </div>

      <div className={styles.tokenGrid}>
        {RADIUS_TOKENS.map(({ key, value }) => (
          <RadiusCard key={String(key)} tokenKey={String(key)} value={value} />
        ))}
      </div>

      <RadiusTokenTable />
    </div>
  );
}

/** 단일 radius 토큰을 미리보기 박스와 메타 정보로 표시합니다 */
function RadiusCard({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <div className={styles.tokenCard}>
      <div
        className={styles.previewBox}
        style={{ borderRadius: value }}
        title={`radius.${tokenKey}: ${value}`}
      />
      <div className={styles.tokenMeta}>
        <span className={styles.tokenKey}>radius.{tokenKey}</span>
        <span className={styles.tokenValue}>{value}</span>
      </div>
    </div>
  );
}

/** 모든 radius 토큰을 이름과 값으로 나열합니다 */
function RadiusTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Radius Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {RADIUS_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`radius.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
