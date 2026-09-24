import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "../AnimatedSection";

export interface HeroStat { value: string; label: string; }
interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaTarget: string;
  heroImage?: { src: string; alt: string; title: string };
  stats?: HeroStat[];
}

export default function Hero({ headline, subheadline, ctaText, ctaTarget, heroImage, stats = [] }: HeroProps) {
  return (
    <section className={heroImage ? "hero hero-split" : "hero hero-center"} aria-label="Hero">
      <AnimatedSection>
        <h1>{headline}</h1>
        <p>{subheadline}</p>
        <Link href={ctaTarget} title={ctaText} className="cta-primary">{ctaText}</Link>
      </AnimatedSection>
      {heroImage ? (
        <AnimatedSection delay={120}>
          <Image src={heroImage.src} alt={heroImage.alt} title={heroImage.title} width={960} height={640} className="hero-image" priority />
        </AnimatedSection>
      ) : null}
      {stats.length > 0 && (
        <dl className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="stagger-item">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
