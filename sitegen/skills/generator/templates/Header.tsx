"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export interface NavItem { label: string; href: string; title: string; }
interface HeaderProps { navItems: NavItem[]; }

export default function Header({ navItems }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " site-header-scrolled" : ""}`}>
      <nav className="site-nav" aria-label="Navigasi utama">
        <Link href="/" title="{{BRAND}} — Beranda" aria-label="{{BRAND}} — Beranda" className="site-logo">
          <Image src="{{LOGO_PATH}}" alt="Logo {{BRAND}}" width={160} height={36} className="h-9 w-auto object-contain" priority />
        </Link>
        <ul className="site-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} title={item.title}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="site-burger"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
        </button>
      </nav>
      {open && (
        <ul className="site-mobile-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} title={item.title} onClick={() => setOpen(false)}>{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
