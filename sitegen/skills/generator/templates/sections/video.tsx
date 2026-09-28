import AnimatedSection from "../AnimatedSection";

export interface VideoItem { embedUrl: string; title: string; desc: string; }
interface VideoProps { title: string; items: VideoItem[]; }

export default function Video({ title, items }: VideoProps) {
  return (
    <section aria-label="Video">
      <AnimatedSection>
        <h2>{title}</h2>
        <div className="video-list">
          {items.map((v) => (
            <figure key={v.embedUrl} className="stagger-item video-touchsafe">
              <iframe
                src={v.embedUrl}
                title={v.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <figcaption>{v.desc}</figcaption>
            </figure>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
