import { createFileRoute } from "@tanstack/react-router";
import { useSettingsStyleReady } from "./-useSettingsStyleReady";
import {
  SettingsHeaderSkeleton,
  SettingsSkeletonFrame,
  SettingsWithdrawSkeleton,
} from "./route-skeletons/-SettingsRouteSkeleton";

export const Route = createFileRoute("/settings/withdraw")({
  loader: async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  },
  pendingMs: 0,
  pendingMinMs: 180,
  pendingComponent: () => (
    <SettingsSkeletonFrame>
      <SettingsHeaderSkeleton />
      <SettingsWithdrawSkeleton />
    </SettingsSkeletonFrame>
  ),
  component: SettingsWithdrawPage,
});

function SettingsWithdrawPage() {
  const { isStyleReady } = useSettingsStyleReady();

  if (!isStyleReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsWithdrawSkeleton />
      </SettingsSkeletonFrame>
    );
  }

  return <div>Withdraw placeholder</div>;
}
