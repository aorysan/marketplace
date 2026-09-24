import { HelpCircle } from "lucide-react";
import AnimatedSection from "../AnimatedSection";

export interface FaqItem { question: string; answer: string; }
interface FaqProps { title: string; items: FaqItem[]; }

export default function Faq({ title, items }: FaqProps) {
  return (
    <section aria-label="Pertanyaan umum">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul>
        {items.map((f) => (
          <li key={f.question} className="stagger-item">
            <HelpCircle size={24} aria-hidden="true" />
            <h3>{f.question}</h3>
            <p>{f.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
