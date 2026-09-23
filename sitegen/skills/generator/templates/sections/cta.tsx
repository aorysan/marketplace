import Link from "next/link";
import AnimatedSection from "../AnimatedSection";

interface CtaProps { headline: string; subheadline: string; ctaText: string; guarantee?: string; }

export default function Cta({ headline, subheadline, ctaText, guarantee }: CtaProps) {
  return (
    <section aria-label="Ajakan bertindak" className="cta-final">
      <AnimatedSection>
        <h2>{headline}</h2>
        <p>{subheadline}</p>
        <Link href="/kontak" title={ctaText} className="cta-primary cta-dominant">{ctaText}</Link>
        {guarantee ? <p>{guarantee}</p> : null}
      </AnimatedSection>
    </section>
  );
}
