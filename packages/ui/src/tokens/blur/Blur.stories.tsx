import type { Meta, StoryObj } from "@storybook/react";
import { blur } from "./blur.css.ts";
import * as styles from "./Stories.css.ts";

const meta = {
  title: "Foundation/Blur",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  name: "Tokens",
  render: () => <BlurTokens />,
};

type BlurKey = keyof typeof blur.scale;

const BLUR_TOKENS: Array<{ key: BlurKey; value: string }> = (
  Object.keys(blur.scale) as unknown as BlurKey[]
).map((key) => ({ key, value: blur.scale[key] }));

/** 모든 blur 토큰을 미리보기와 테이블로 표시합니다 */
function BlurTokens() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Blur Tokens</h2>
        <p className={styles.pageSubtitle}>
          backdrop-filter 또는 filter에 사용하는 블러 토큰입니다.
          calc를 조합해 단계적으로 조절할 수 있습니다.
        </p>
      </div>

      <div className={styles.tokenGrid}>
        {BLUR_TOKENS.map(({ key, value }) => (
          <BlurCard key={String(key)} tokenKey={String(key)} value={value} />
        ))}
      </div>

      <BlurTokenTable />
    </div>
  );
}

/** 단일 blur 토큰을 체커 배경 + 블러 오버레이로 표시합니다 */
function BlurCard({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <div className={styles.tokenCard}>
      <div className={styles.previewArea}>
        <div className={styles.previewBg} />
        <div
          className={styles.previewOverlay}
          style={{ backdropFilter: value }}
        />
      </div>
      <div className={styles.tokenMeta}>
        <span className={styles.tokenKey}>blur.{tokenKey}</span>
        <span className={styles.tokenValue}>{value}</span>
      </div>
    </div>
  );
}

/** 모든 blur 토큰을 이름·값·사용 예시로 나열합니다 */
function BlurTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Blur Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {BLUR_TOKENS.map(({ key, value }) => (
            <tr key={String(key)} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`blur.${String(key)}`}
              </td>
              <td className={styles.tokenTableCellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
