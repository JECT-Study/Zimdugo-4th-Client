import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { HeaderSkeleton } from "@repo/ui/components/layout/header";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  content,
  header,
  menuGroup,
  menuRow,
  page,
  profileSection,
} from "./-my.css.ts";

export function MyPageSkeleton() {
  return (
    <div className={page} aria-hidden="true">
      <HeaderSkeleton className={header} />

      <main className={content}>
        <section className={profileSection}>
          <Skeleton
            width={111}
            height={111}
            variant="circle"
            style={SKELETON_SURFACE_STYLE}
          />
          <Skeleton
            width={120}
            height={16}
            borderRadius={4}
            style={{ ...SKELETON_SURFACE_STYLE, marginTop: 32 }}
          />
        </section>

        <section className={menuGroup}>
          <div className={menuRow}>
            <Skeleton
              width={72}
              height={16}
              borderRadius={4}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width={24}
              height={12}
              borderRadius={4}
              style={SKELETON_SURFACE_STYLE}
            />
          </div>
          <div className={menuRow}>
            <Skeleton
              width={96}
              height={16}
              borderRadius={4}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width={24}
              height={12}
              borderRadius={4}
              style={SKELETON_SURFACE_STYLE}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
