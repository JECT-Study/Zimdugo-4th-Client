import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { errorRoot, errorTitle } from "./my-list.css.ts";

interface MyListErrorStateProps {
  onRetry: () => void;
}

export function MyListErrorState({ onRetry }: MyListErrorStateProps) {
  return (
    <div className={errorRoot} role="alert">
      <p className={errorTitle}>{m.my_list_error_title()}</p>
      <Button variant="filled" intent="primary" size="S" onPress={onRetry}>
        {m.map_error_retry()}
      </Button>
    </div>
  );
}
