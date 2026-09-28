import { Cpu } from "lucide-react";
import type { ReactNode } from "react";
import AnimatedSection from "../AnimatedSection";

/** `icon` menerima komponen lucide-react; halaman memetakan nama ikon dari PRD ke komponen. */
export interface TechItem { name: string; description: string; icon?: ReactNode; category?: string; }
interface TechStackProps { title: string; items: TechItem[]; }

export default function TechStack({ title, items }: TechStackProps) {
  return (
    <section aria-label="Teknologi">
      <AnimatedSection>
        <h2>{title}</h2>
        <ul className="techstack-grid">
          {items.map((t) => (
            <li key={t.name} className="stagger-item techstack-card" tabIndex={0} aria-label={`Teknologi ${t.name}`}>
              {t.icon ?? <Cpu size={24} aria-hidden="true" />}
              <code>{t.name}</code>
              <p>{t.description}</p>
            </li>
          ))}
        </ul>
      </AnimatedSection>
    </section>
  );
}
