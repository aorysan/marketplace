import Image from "next/image";
import AnimatedSection from "../AnimatedSection";

interface AboutProps {
  title: string;
  story: string[];
  teamPhoto?: { src: string; alt: string; title: string };
}

export default function About({ title, story, teamPhoto }: AboutProps) {
  return (
    <section aria-label="Tentang">
      <AnimatedSection>
        <h2>{title}</h2>
        {story.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </AnimatedSection>
      {teamPhoto ? (
        <AnimatedSection delay={120}>
          <Image src={teamPhoto.src} alt={teamPhoto.alt} title={teamPhoto.title} width={960} height={640} className="about-photo" />
        </AnimatedSection>
      ) : null}
    </section>
  );
}
