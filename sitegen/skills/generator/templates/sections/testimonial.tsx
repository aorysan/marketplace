import { Quote } from "lucide-react";
import AnimatedSection from "../AnimatedSection";

export interface Testimony { quote: string; name: string; role: string; }
interface TestimonialProps { title: string; items: Testimony[]; }

export default function Testimonial({ title, items }: TestimonialProps) {
  return (
    <section aria-label="Testimoni">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul>
        {items.map((t) => (
          <li key={t.name} className="stagger-item" tabIndex={0} aria-label={`Testimoni ${t.name}`}>
            <Quote size={24} aria-hidden="true" />
            <blockquote>{t.quote}</blockquote>
            <p>{t.name} — {t.role}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
