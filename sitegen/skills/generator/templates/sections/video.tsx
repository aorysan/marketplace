import AnimatedSection from "../AnimatedSection";

export interface VideoItem { embedUrl: string; title: string; desc: string; }
interface VideoProps { title: string; items: VideoItem[]; }

export default function Video({ title, items }: VideoProps) {
  return (
    <section aria-label="Video">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      {items.map((v) => (
        <figure key={v.embedUrl} className="stagger-item video-touchsafe">
          <iframe
            src={v.embedUrl}
            title={v.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <figcaption>{v.desc}</figcaption>
        </figure>
      ))}
    </section>
  );
}
