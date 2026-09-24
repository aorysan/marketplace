import Image from "next/image";
import Link from "next/link";

export interface SocialLink { label: string; href: string; }
interface FooterProps {
  email: string;
  phone: string;
  address: string;
  socials: SocialLink[];
  dark?: boolean;
}

export default function Footer({ email, phone, address, socials, dark = true }: FooterProps) {
  return (
    <footer className={dark ? "site-footer site-footer-dark" : "site-footer"}>
      <div className="site-footer-inner">
        <Link href="/" title="{{BRAND}} — Beranda" aria-label="{{BRAND}} — Beranda" className={dark ? "site-logo site-logo-lightbox" : "site-logo"}>
          <Image src="{{LOGO_PATH}}" alt="Logo {{BRAND}}" width={160} height={36} className="h-9 w-auto object-contain" />
        </Link>
        <address className="site-contact">
          <a href={`mailto:${email}`} title="Email {{BRAND}}">{email}</a>
          <a href={`https://wa.me/${phone}`} title="WhatsApp {{BRAND}}">{phone}</a>
          <span>{address}</span>
        </address>
        <ul className="site-socials">
          {socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} title={`${s.label} — {{BRAND}}`} rel="noopener noreferrer">{s.label}</a>
            </li>
          ))}
        </ul>
        <p className="site-copy">© {{YEAR}} {"{{BRAND}}"}. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
