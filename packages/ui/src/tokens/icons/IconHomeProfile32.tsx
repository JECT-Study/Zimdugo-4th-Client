import { glyph, root } from "./IconHomeProfile32.css";

const profileGlyphUrl = new URL("./assets/profile-my-page.svg", import.meta.url)
  .href;

export function IconHomeProfile32({ className }: { className?: string }) {
  return (
    <span
      className={[root, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <img className={glyph} src={profileGlyphUrl} alt="" />
    </span>
  );
}
