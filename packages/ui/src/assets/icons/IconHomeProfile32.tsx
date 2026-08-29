import { glyph, root } from "./IconHomeProfile32.css";

/**
 * 자산 URL 대신 SVG 를 인라인으로 둔다.
 * new URL(..., import.meta.url) 은 클라이언트 번들에서만 자산 경로로 치환되고
 * 서버 번들에는 그대로 남아, 프리렌더된 홈 HTML 에 file:// 경로가 박힌다.
 * 하이드레이션은 속성 불일치를 고쳐주지 않으므로 초기 진입에서 아이콘이 깨진다.
 */
export function IconHomeProfile32({ className }: { className?: string }) {
  return (
    <span
      className={[root, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <svg
        className={glyph}
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden
      >
        <title>프로필</title>
        <g>
          <path
            d="M11 11C12.933 11 14.5 9.433 14.5 7.5C14.5 5.567 12.933 4 11 4C9.067 4 7.5 5.567 7.5 7.5C7.5 9.433 9.067 11 11 11Z"
            stroke="#8E8E8E"
            strokeWidth="1.7"
          />
          <path
            d="M4.75 18C5.4 14.75 7.8 12.85 11 12.85C14.2 12.85 16.6 14.75 17.25 18"
            stroke="#8E8E8E"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}
