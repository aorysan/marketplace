# SOP Pengembangan Next.js TypeScript & SEO/UI Checklist (Sitegen V3.1)

Dokumen ini berisi standar teknis (Standard Operating Procedure) dan **Checklist SEO & UI/UX Mutlak** bagi agen ketika merancang kode *Next.js TypeScript* untuk klien korporat.

---

## 1. Standard TypeScript & App Router
- Semua komponen dan halaman WAJIB menggunakan format TypeScript (`.tsx`).
- Buat tipe data/interface yang jelas untuk *props* komponen:
  ```tsx
  interface SectionProps {
    title: string;
    description?: string;
  }
  ```
- Selalu gunakan `app/` router. Halaman disimpan di rutenya masing-masing (misal `app/about/page.tsx`).

## 2. Anti-AI Slop & Standar Ikon
- **DILARANG KERAS MENGGUNAKAN EMOJI** (seperti 🚀, 💡, 🛡️) di elemen UI mana pun.
- Gunakan ikon profesional berbasis SVG murni atau dari pustaka `lucide-react`:
  ```tsx
  import { ShieldCheck, Zap, BarChart } from 'lucide-react';
  ```

## 3. Gambar: Unik, Terverifikasi & Tahan Mati (Anti-404 / Dilarang Placeholder)
- **DILARANG MENGGUNAKAN GAMBAR BERULANG**: Setiap kartu, latar belakang, atau gambar berita HARUS unik.
- **DILARANG PLACEHOLDER (`picsum.photos` dll)**: DILARANG KERAS menggunakan layanan gambar *placeholder* seperti `picsum.photos` atau sejenisnya.
- **Verifikasi HTTP Status 200 OK**: Seluruh URL gambar eksternal WAJIB diverifikasi via HTTP Ping untuk memastikan status 200 OK (bukan 404).
- **Prosedur Fallback jika Gambar Tidak Valid**: Jika tidak ditemukan gambar eksternal yang valid (200 OK), HENTIKAN proses (*halt*) dan minta pengguna untuk menempatkan file gambar di folder `public/assets/`.
- Daftarkan domain gambar di `next.config.ts`:
  ```ts
  experimental: {
    turbopack: { root: "../../" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
  ```

## 4. Standar CSS Global & Layout Mobile (Anti-Bleeding & Grid Blowout)
1. **Global CSS Anti-Bleeding**: Di dalam `app/globals.css`, WAJIB menyertakan aturan berikut pada elemen akar:
   ```css
   html, body {
     overflow-x: hidden;
     width: 100vw;
     max-width: 100%;
   }
   ```
2. **Anti-Grid Blowout (Anti-Teks Terpotong)**: Setiap kali menggunakan CSS Grid (`display: grid`), WAJIB menggunakan `grid-template-columns: minmax(0, 1fr)` atau menyematkan `min-width: 0` pada *grid items*.
3. **Header Overlap Prevention**: Komponen `<main>` di seluruh halaman WAJIB memiliki `padding-top: 80px;` agar konten teratas tidak tertutup *Fixed Navbar*.
4. **Header Burger Menu**: Ikon menu hamburger HARUS menggunakan 3 garis simetris (Lucide `Menu` / `X`) dan miliki animasi transisi yang mulus.

## 5. Layout Mobile & Komponen Interaktif (Swipe, Marquee & Table)
1. **HUKUM MUTLAK Swipeable Cards**: Setiap kali Anda membuat *grid* berisi daftar item (seperti fitur, values/visi misi, testimoni, tabel harga, artikel blog, portofolio, dll) yang berjumlah 2 kolom atau lebih di desktop, *grid* tersebut WAJIB dibungkus oleh komponen `<SwipeableCards>` di mobile (`max-width: 768px`). DILARANG KERAS membiarkan item-item ini bertumpuk memanjang (stacked vertically) secara kaku di layar HP! 
   - **SANGAT PENTING**: Anda WAJIB mengoper kelas CSS Grid Desktop ke dalam *prop* `className` (contoh: `<SwipeableCards className={styles.featureGrid}>`) agar tata letak desktop tidak hancur.
   - **WAJIB IMPORT**: Jangan lupa menuliskan `import SwipeableCards from "@/components/SwipeableCards";` di setiap *file* halaman yang menggunakannya untuk menghindari `ReferenceError`.
   - **PAGINATION DOTS WAJIB**: Komponen `<SwipeableCards>` WAJIB memiliki indikator titik-titik (*dotsContainer*) di bagian bawahnya pada tampilan mobile yang secara dinamis mengikuti posisi *scroll* item aktif, sebagai penanda visual jumlah item yang bisa di-swipe.
2. **Konsistensi Susunan Mobile (Zig-Zag Order)**: Jika menyusun fitur berselang-seling (Teks-Gambar, Gambar-Teks) di desktop, WAJIB menyelaraskan urutan di layar mobile menggunakan CSS `order` agar semua fitur secara konsisten menampilkan Gambar di atas dan Teks di bawah.
3. **Responsive Block Table (Anti Horizontal Scroll)**: DILARANG MEMBIARKAN TABEL BISA DI-SCROLL KE SAMPING di mobile. Seluruh sel `<td data-label="...">` WAJIB disetel menjadi `display: block` dengan label judul (`data-label`) muncul di sisi kiri sel.
4. **Infinite Marquee Carousel**: Untuk daftar panjang (misalnya 10+ nama klien, logo partner, atau lokasi terdaftar), agen WAJIB mengimplementasikan *Infinite CSS Marquee* (animasi geser dari kanan ke kiri yang berjalan otomatis) menggunakan array berulang `[...list, ...list]`.

## 6. Scroll Reveal Animation (Anime.js Standard & DILARANG FRAMER-MOTION / CSS MURNI)
- **DILARANG MENGGUNAKAN `framer-motion` ATAU ANIMASI SCROLL CSS MURNI**: Seluruh animasi *scroll* WAJIB berbasis Anime.js (`animejs`) + `IntersectionObserver` via komponen `AnimatedSection.tsx`.
- **React Strict Mode Cleanup (MANDATORY)**: Untuk mencegah glitch animasi akibat double-mount di React Strict Mode, fungsi cleanup `useEffect` pada `AnimatedSection.tsx` WAJIB memanggil `anime.remove(elementRef.current)`.
- **Aturan Vike Flow (Asymmetric Reset)**: Animasi HANYA Boleh ter-reset jika elemen keluar dari BAWAH layar (`entry.boundingClientRect.top > 0`). Jika elemen keluar dari ATAS layar saat di-scroll turun, ia WAJIB tetap dalam kondisi terlihat.

### Templat Wajib Komponen `components/AnimatedSection.tsx`:
```tsx
"use client";
import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "zoom";
  className?: string;
}

export default function AnimatedSection({ children, delay = 0, direction = "up", className = "" }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const getInitialTransform = () => {
      switch (direction) {
        case "left": return { translateX: 30 };
        case "right": return { translateX: -30 };
        case "zoom": return { scale: 0.9 };
        case "up": default: return { translateY: 30 };
      }
    };

    const getFinalTransform = () => {
      switch (direction) {
        case "left": return { translateX: [30, 0] };
        case "right": return { translateX: [-30, 0] };
        case "zoom": return { scale: [0.9, 1] };
        case "up": default: return { translateY: [30, 0] };
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: el,
              opacity: [0, 1],
              ...getFinalTransform(),
              duration: 800,
              delay: delay,
              easing: "easeOutCubic",
            });
          } else if (entry.boundingClientRect.top > 0) {
            // Asymmetric Reset
            anime.set(el, { opacity: 0, ...getInitialTransform() });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (el) anime.remove(el);
    };
  }, [delay, direction]);

  const getInitialStyle = (): React.CSSProperties => {
    switch (direction) {
      case "left": return { opacity: 0, transform: "translateX(30px)" };
      case "right": return { opacity: 0, transform: "translateX(-30px)" };
      case "zoom": return { opacity: 0, transform: "scale(0.9)" };
      case "up": default: return { opacity: 0, transform: "translateY(30px)" };
    }
  };

  return (
    <div ref={ref} style={getInitialStyle()} className={className}>
      {children}
    </div>
  );
}
```

## 7. Animasi Global: Lenis Smooth Scroll
- Setiap proyek WAJIB menggunakan paket `lenis`.
- Komponen `components/SmoothScroll.tsx`:
  ```tsx
  "use client";
  import { useEffect } from "react";
  import Lenis from "lenis";

  export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => lenis.destroy();
    }, []);

    return <>{children}</>;
  }
  ```

## 8. SEO Checklist Mutlak
- **1 Halaman = 1 Grup Keyword Utama** (Anti-Kanibalisasi).
- **Title Tag**: Memuat 2-3 kata kunci, CTR-oriented, **≤ 55 karakter**.
- **Meta Description**: Memuat kata kunci LSI, CTR-oriented, **≤ 155 karakter**.
- **Atribut A11y**: SEMUA `<a>` dan `<img>` WAJIB punya atribut `title` dan `alt`.
- **File Search Engine Wajib**: `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`, dan *JSON-LD Schema* di `app/layout.tsx`.
