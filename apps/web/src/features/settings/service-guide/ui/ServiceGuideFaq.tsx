import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
} from "react-aria-components";
import plusIconUrl from "../assets/icon-plus.svg";
import {
  faqAnswer,
  faqAnswerClip,
  faqAnswerInner,
  faqHeading,
  faqItem,
  faqList,
  faqPlusIcon,
  faqQuestion,
  faqTrigger,
} from "./service-guide.css.ts";

export interface ServiceGuideFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceGuideFaqProps {
  items: ServiceGuideFaqItem[];
}

export function ServiceGuideFaq({ items }: ServiceGuideFaqProps) {
  return (
    <DisclosureGroup className={faqList}>
      {items.map((item) => (
        <Disclosure key={item.id} id={item.id} className={faqItem}>
          <h3 className={faqHeading}>
            <Button slot="trigger" className={faqTrigger}>
              <span className={faqQuestion}>{item.question}</span>
              <img
                className={faqPlusIcon}
                src={plusIconUrl}
                alt=""
                width={20}
                height={20}
              />
            </Button>
          </h3>
          <DisclosurePanel className={faqAnswer}>
            <div className={faqAnswerClip}>
              <div className={faqAnswerInner}>{item.answer}</div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
