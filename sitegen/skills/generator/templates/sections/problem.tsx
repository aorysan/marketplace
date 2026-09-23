import { AlertTriangle } from "lucide-react";
import AnimatedSection from "../AnimatedSection";

export interface ProblemItem { title: string; desc: string; }
interface ProblemProps { title: string; items: ProblemItem[]; }

export default function Problem({ title, items }: ProblemProps) {
  return (
    <section aria-label="Masalah">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul>
        {items.map((item) => (
          <li key={item.title} className="stagger-item" tabIndex={0} aria-label={item.title}>
            <AlertTriangle size={24} aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
