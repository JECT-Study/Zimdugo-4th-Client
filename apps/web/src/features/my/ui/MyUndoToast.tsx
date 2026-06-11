import { undoToast, undoToastAction, undoToastMessage } from "./my-list.css.ts";

interface MyUndoToastProps {
  message: string;
  actionLabel: string;
  onUndo: () => void;
}

export function MyUndoToast({
  message,
  actionLabel,
  onUndo,
}: MyUndoToastProps) {
  return (
    <div className={undoToast} role="status" aria-live="polite">
      <span className={undoToastMessage}>{message}</span>
      <button type="button" className={undoToastAction} onClick={onUndo}>
        {actionLabel}
      </button>
    </div>
  );
}
