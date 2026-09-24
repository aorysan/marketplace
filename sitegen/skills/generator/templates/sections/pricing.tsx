import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "../AnimatedSection";

export interface PriceTier { name: string; price: string; features: string[]; cta: string; }
interface PricingProps { title: string; items: PriceTier[]; }

export default function Pricing({ title, items }: PricingProps) {
  return (
    <section aria-label="Harga">
      <AnimatedSection>
        <h2>{title}</h2>
      </AnimatedSection>
      <ul>
        {items.map((tier) => (
          <li key={tier.name} className="stagger-item" tabIndex={0} aria-label={`Paket ${tier.name}`}>
            <h3>{tier.name}</h3>
            <p>{tier.price}</p>
            <ul>
              {tier.features.map((f) => (
                <li key={f}><BadgeCheck size={18} aria-hidden="true" /> {f}</li>
              ))}
            </ul>
            <Link href="/kontak" title={`${tier.cta} — paket ${tier.name}`}>{tier.cta}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
