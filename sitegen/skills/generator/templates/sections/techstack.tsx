import { Cpu } from "lucide-react";
import AnimatedSection from "../AnimatedSection";

export interface TechItem { name: string; description: string; category?: string; }
interface TechStackProps { title: string; items: TechItem[]; }

export default function TechStack({ title, items }: TechStackProps) {
  return (
    <section aria-label="Teknologi">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul className="techstack-grid">
        {items.map((t) => (
          <li key={t.name} className="stagger-item techstack-card" tabIndex={0} aria-label={`Teknologi ${t.name}`}>
            <Cpu size={24} aria-hidden="true" />
            <code>{t.name}</code>
            <p>{t.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
