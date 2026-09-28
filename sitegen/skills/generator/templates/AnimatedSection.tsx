"use client";
import React, { useEffect, useRef } from "react";
import { animate, stagger, utils } from "animejs";

type Direction = "up" | "left" | "right" | "zoom";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  /**
   * Animasikan elemen `.stagger-item` di dalam subtree komponen ini satu per satu.
   * Template section menaruh `<ul>`/kartu detail di dalam `<AnimatedSection>`;
   * jika tidak ada `.stagger-item`, hanya pembungkusnya yang dianimasikan.
   */
  staggerChildren?: boolean;
  /** Jarak antar item pada mode stagger (ms). */
  staggerStep?: number;
}

const HIDDEN: Record<Direction, Record<string, number>> = {
  up: { translateY: 30 },
  left: { translateX: 30 },
  right: { translateX: -30 },
  zoom: { scale: 0.9 },
};

const VISIBLE: Record<Direction, Record<string, number[]>> = {
  up: { translateY: [30, 0] },
  left: { translateX: [30, 0] },
  right: { translateX: [-30, 0] },
  zoom: { scale: [0.9, 1] },
};

/**
 * Anime.js v4 (`import { animate, stagger, utils } from "animejs"`).
 *
 * Aturan unidirectional (WAJIB, lihat AGENTS.md generator Pasal III):
 * - Animasi HANYA terpicu saat elemen masuk viewport DAN arah gulir KE BAWAH
 *   (deteksi via `window.scrollY` vs `lastScrollY`). DILARANG `once: true`.
 * - Pemicu pertama (muat halaman) tetap diizinkan agar konten above-the-fold
 *   tidak kosong; sesudah itu hanya scroll ke bawah yang memicu ulang.
 * - Elemen DI-RESET (`opacity: 0` + transform awal) saat keluar viewport
 *   LEWAT BAWAH, sehingga siap terpicu kembali pada guliran ke bawah berikutnya.
 * - Elemen yang sudah lewat ke atas TIDAK di-reset, supaya konten tetap
 *   terlihat ketika pengguna menggulir balik ke atas (tidak ada konten hilang).
 */
export default function AnimatedSection({
  children,
  delay = 0,
  direction = "up",
  className = "",
  staggerChildren = true,
  staggerStep = 100,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrolledDown = useRef(false);
  const firstTrigger = useRef(true);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = staggerChildren
      ? Array.from(el.querySelectorAll<HTMLElement>(".stagger-item"))
      : [];
    const hasItems = items.length > 0;

    const hidden = HIDDEN[direction];
    const visible = VISIBLE[direction];

    const reset = () => {
      utils.remove(el);
      utils.set(el, { opacity: 0, ...hidden });
      if (hasItems) {
        utils.remove(items);
        utils.set(items, { opacity: 0, translateY: 30 });
      }
    };

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      utils.set(el, { opacity: 1, translateX: 0, translateY: 0, scale: 1 });
      if (hasItems) {
        utils.set(items, { opacity: 1, translateX: 0, translateY: 0, scale: 1 });
      }
      return () => utils.remove([el, ...items]);
    }

    reset();

    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scrolledDown.current = y > lastScrollY.current;
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const play = () => {
      animate(el, {
        opacity: [0, 1],
        ...visible,
        duration: 800,
        delay,
        ease: "outCubic",
      });
      if (hasItems) {
        animate(items, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: stagger(staggerStep, { start: delay }),
          ease: "outCubic",
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Unidirectional: hanya scroll ke bawah (atau pemicu pertama) yang boleh menganimasi.
            if (!played.current && (scrolledDown.current || firstTrigger.current)) {
              played.current = true;
              firstTrigger.current = false;
              play();
            }
            return;
          }

          // Keluar viewport lewat BAWAH (`top > 0`) → reset agar bisa dipicu ulang
          // pada guliran ke bawah berikutnya. Keluar lewat atas TIDAK di-reset.
          if (entry.boundingClientRect.top > 0) {
            reset();
            played.current = false;
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      utils.remove(el);
      if (hasItems) utils.remove(items);
    };
  }, [delay, direction, staggerChildren, staggerStep]);

  /**
   * Anime.js v4 membaca nilai transform HANYA dari inline `element.style.transform`
   * (bukan dari stylesheet, bukan dari *individual transform properties*
   * `translate`/`scale`). Karena itu keadaan awal ditulis sebagai inline
   * `transform`; `animate()` akan menimpanya sendiri saat animasi berjalan.
   *
   * DILARANG memakai `translate`/`scale` (individual transform properties) di sini:
   * properti itu TIDAK dihapus oleh Anime.js dan akan dikomposisikan di atas
   * `transform` hasil animasi, sehingga elemen tertinggal offset permanen
   * (terbukti +30px untuk arah `up`/`left`/`right`) dan skala `zoom` mentok 0.9.
   */
  const getInitialStyle = (): React.CSSProperties => {
    switch (direction) {
      case "left":
        return { opacity: 0, transform: "translateX(30px)" };
      case "right":
        return { opacity: 0, transform: "translateX(-30px)" };
      case "zoom":
        return { opacity: 0, transform: "scale(0.9)" };
      case "up":
      default:
        return { opacity: 0, transform: "translateY(30px)" };
    }
  };

  return (
    <div ref={ref} style={getInitialStyle()} className={className}>
      {children}
    </div>
  );
}
