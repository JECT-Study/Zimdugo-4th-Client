import {
  checklist,
  checklistItem,
  checklistMark,
} from "./service-guide.css.ts";

export interface ServiceGuideChecklistProps {
  items: string[];
}

export function ServiceGuideChecklist({ items }: ServiceGuideChecklistProps) {
  return (
    <ul className={checklist}>
      {items.map((item) => (
        <li key={item} className={checklistItem}>
          <span className={checklistMark} aria-hidden="true">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
