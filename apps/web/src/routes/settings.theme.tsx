import { createFileRoute } from "@tanstack/react-router";
import { useSettingsStyleReady } from "./-useSettingsStyleReady";
import {
  SettingsHeaderSkeleton,
  SettingsSkeletonFrame,
  SettingsThemeSkeleton,
} from "./route-skeletons/-SettingsRouteSkeleton";

export const Route = createFileRoute("/settings/theme")({
  loader: async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  },
  pendingMs: 0,
  pendingMinMs: 180,
  pendingComponent: () => (
    <SettingsSkeletonFrame>
      <SettingsHeaderSkeleton />
      <SettingsThemeSkeleton />
    </SettingsSkeletonFrame>
  ),
  component: SettingsThemePage,
});

function SettingsThemePage() {
  const { isStyleReady } = useSettingsStyleReady();

  if (!isStyleReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsThemeSkeleton />
      </SettingsSkeletonFrame>
    );
  }

  return <div>Theme placeholder</div>;
}
