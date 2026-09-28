import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import AnimatedSection from "../AnimatedSection";

/** `icon` menerima komponen lucide-react; halaman memetakan nama ikon dari PRD ke komponen. */
export interface Benefit { title: string; desc: string; icon?: ReactNode; }
interface SolutionProps { title: string; valueProp: string; benefits: Benefit[]; }

export default function Solution({ title, valueProp, benefits }: SolutionProps) {
  return (
    <section aria-label="Solusi">
      <AnimatedSection>
        <h2>{title}</h2>
        <p>{valueProp}</p>
        <ul>
          {benefits.map((b) => (
            <li key={b.title} className="stagger-item" tabIndex={0} aria-label={b.title}>
              {b.icon ?? <CheckCircle2 size={24} aria-hidden="true" />}
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </li>
          ))}
        </ul>
      </AnimatedSection>
    </section>
  );
}
