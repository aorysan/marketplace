---
name: seo
description: Audit, plan, and implement SEO improvements across technical SEO, on-page optimization, structured data, Core Web Vitals, dan content strategy.
metadata:
  origin: ECC (adapted for Sitegen)
---

# Sitegen SEO

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengaudit dokumen dan kode web, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Kepatuhan audit terhadap atribut ganda `alt`/`title` dan keaslian foto bersifat mutlak.

Skill ini bertindak sebagai **Auditor/Checker Akhir** SEO. Agen `seo` bertugas memeriksa website (source code di folder `landings/<brand>/web/` dan infrastruktur SEO buatan skill `generator`) terhadap SOP Checklist SEO di bawah ini. Agen `seo` TIDAK membuat atau mengedit file `sitemap.ts`, `robots.ts`, atau JSON-LD secara langsung, melainkan membaca source code hasil kerja `generator`. Tulis hasil analisis dan seluruh temuan error/poin yang gagal ke dalam file `landings/<brand>/reports/SEO-AUDIT.md` secara detail agar dapat dibaca dan diperbaiki oleh skill `debug`.

- **Input**: Proyek landing page berarsitektur Next.js yang terletak di `landings/<brand>/web/` (dan data intake di `landings/<brand>/intake/` jika relevan).
- **Output**: File dokumen audit komprehensif bertarget di `landings/<brand>/reports/SEO-AUDIT.md` beserta modifikasi kode in-place perbaikan SEO langsung pada folder `web/`.

## When to Use

Use this skill when:
- auditing crawlability, indexability, canonicals, or redirects
- improving title tags, meta descriptions, and heading structure
- adding or validating structured data
- improving Core Web Vitals
- doing keyword research and mapping keywords to URLs
- planning internal linking or sitemap / robots changes

## How It Works

### Principles

1. Fix technical blockers before content optimization.
2. One page should have one clear primary search intent.
3. Prefer long-term quality signals over manipulative patterns.
4. Mobile-first assumptions matter because indexing is mobile-first.
5. Recommendations should be page-specific and implementable.

### Technical SEO checklist

#### Crawlability
- `robots.txt` should allow important pages and block low-value surfaces
- no important page should be unintentionally `noindex`
- important pages should be reachable within a shallow click depth
- avoid redirect chains longer than two hops
- canonical tags should be self-consistent and non-looping

#### Indexability
- preferred URL format should be consistent
- multilingual pages need correct hreflang if used
- sitemaps should reflect the intended public surface
- no duplicate URLs should compete without canonical control

#### Performance
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- common fixes: preload hero assets, reduce render-blocking work, reserve layout space, trim heavy JS

#### Structured data
- homepage: organization or business schema where appropriate
- editorial pages: `Article` / `BlogPosting`
- product pages: `Product` and `Offer`
- interior pages: `BreadcrumbList`
- Q&A sections: `FAQPage`

### Sitegen Internal SEO Checklist

Simpan dokumen laporan verifikasi audit lengkap di path `landings/<brand>/reports/SEO-AUDIT.md` (atau sampaikan rincian perubahannya di terminal dengan struktur serupa).

Selain praktik Technical SEO di atas, pastikan Anda juga mengecek poin-poin wajib dari prosedur internal berikut ini:

| **Based Content from Company Profile** |
| --- |
| Informasi diambil dari company profile, kalimat yang menarik dan persuasi yang sudah di bahas diletakkan di company profile harus tetap muncul di website |
| **Struktur Keyword & Halaman** |
| Apakah data keyword diambil dari Google Search Console dalam kurun waktu 3 bulan terakhir? |
| Setiap halaman sudah memiliki peruntukan SEO yang jelas dengan fokus pada satu grup keyword utama, sehingga tidak terjadi tumpang tindih atau keyword cannibalization antar halaman |
| Apakah keyword utama termasuk buying keyword? |
| Apakah tersedia LSI (Latent Semantic Indexing) keywords yang relevan sebagai pendukung? |
| Apakah keyword diprioritaskan berdasarkan: Apakah impression tinggi? Apakah CTR masih rendah (opportunity keyword)? |
| Apakah url sudah memuat keyword utama halaman? |
| **Title & Meta Description** |
| Apakah Title tag sudah memuat 2-3 keyword dengan impression paling tinggi, CTR-oriented copywriting serta menarik untuk dibaca (value proposition, urgency, atau benefit)? |
| Apakah Meta Description ditulis dengan memuat keyword yang belum termasuk dalam Title tag serta CTR-oriented copywriting dan menarik untuk dibaca (value proposition, urgency, atau benefit) ? |
| Apakah panjang Title Tag ≤ 55 karakter dan tidak terpotong di SERP Google? |
| Apakah panjang Meta Description ≤ 155 karakter dan tidak terpotong di hasil pencarian? |
| **Untuk Halaman Baru** |
| Apakah topik utama website telah ditetapkan berdasarkan layanan inti bisnis dan memiliki potensi kebutuhan pencarian yang dapat divalidasi melalui riset keyword? |
| Apakah riset keyword dilakukan menggunakan Google Ads Keyword Planner (atau tools setara)? |
| Apakah keyword memiliki buying keyword? |
| **Backlink (External Link)** |
| Apakah halaman memiliki 3 Artikel Backlink berkualitas? (diposting di wajibaca.com) |
| Apakah judul sudah memuat 1 buying keyword sebagai ide utama, serta mencerminkan search intent pengguna sehingga artikel benar-benar relevan, solutif, dan sesuai dengan kebutuhan pembaca berdasarkan keyword yang ditargetkan? |
| Apakah artikel baclink sudah memuat gambar yang berisi foto yang merepresentasikan atau mewakili produk serta dapat di klik atau tulisan yang dapat mengarah pada website utama? |
| **Social Media Optimization** |
| Apakah tersedia 1 video konten yang relevan untuk setiap keyword utama? |
| Apakah di setiap page sudah ada section untuk men-embed video SMO terkait ? |
