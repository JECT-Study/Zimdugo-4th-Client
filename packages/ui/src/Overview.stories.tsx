import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Overview.css.ts";

const meta = {
  title: "Overview",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "Overview",
  render: () => <OverviewPage />,
};

/** 디자인 시스템 개요 페이지 */
function OverviewPage() {
  return (
    <div className={styles.container}>
      <Hero />
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

/** Zimdugo 디자인 시스템 소개 */
function Hero() {
  return (
    <div className={styles.hero}>
      <span className={styles.heroBadge}>Design System</span>
      <h1 className={styles.heroTitle}>Zimdugo Design System</h1>
      <p className={styles.heroSubtitle}>
        Zimdugo 서비스를 위한 디자인 시스템입니다. 컬러, 타이포그래피, 간격 등의
        디자인 토큰과 공통 UI 컴포넌트를 제공하여 일관된 사용자 경험을 만들 수
        있도록 지원합니다.
      </p>
    </div>
  );
}
