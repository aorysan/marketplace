import { User } from "lucide-react";
import AnimatedSection from "../AnimatedSection";

export interface Manager { title: string; desc: string; }
interface ManagementProps { title: string; items: Manager[]; }

export default function Management({ title, items }: ManagementProps) {
  return (
    <section aria-label="Manajemen">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul>
        {items.map((m) => (
          <li key={m.title} className="stagger-item" tabIndex={0} aria-label={m.title}>
            <User size={24} aria-hidden="true" />
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
