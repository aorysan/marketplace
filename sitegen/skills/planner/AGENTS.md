# 🛡️ PLANNER SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Perancang Sistem (`planner`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: MENOLAK DESAIN DANGKAL (ANTI-SHALLOW MVP)
1. **Kedalaman Konten Mandatori:**
   - Agen dilarang meringkas halaman spesifik (seperti `/game`, `/teknologi`, `/komunitas`, `/karir`, `/tentang-kami`) menjadi sekadar paragraf pendek atau rangkuman minimalis.
   - **Standar Kedalaman PRD:** Setiap rancangan halaman di `PLAN-<halaman>.md` wajib diisi dengan struktur storytelling bernilai tinggi:
     - *Halaman Game/Produk:* Tabel spesifikasi platform, skor penghargaan riwayat pengunduhan, prasarana Cross-Play, dan showcase visual.
     - *Halaman Teknologi/R&D:* Spesifikasi arsitektur komputasi (contoh: Cel-Shading, AI Deep Learning, Cloud Infrastructure), diagram spesifikasi teknis bergaya monospaced, dan statistik latensi/FPS.
     - *Halaman Komunitas:* Integrasi pemutar video rasional (*Touch-Safe YouTube embeds*), fitur hub komunitas (forum, peta interaktif, alat hitung statistik game), dan agenda event/konser offline.
     - *Halaman Karir:* Jaringan kantor global, filter posisi lowongan interaktif, serta rancangan formulir lamaran berbingkai validasi visual elegan.

---

## PASAL II: KEPATUHAN PILAR DESAIN AAA TIER-1
1. Dokumen perancangan global (`PLAN-GLOBAL.md`) WAJIB mengunci 4 parameter desain antarmuka AAA Tier-1:
   - **Sticky Top Navbar:** Header wajib berkonfigurasi `sticky top-0` atau `fixed top-0` dengan z-index minimum `z-50` serta transisi latar belakang visual (*slate glassmorphism* saat gulir).
   - **Trilogi Dynamic Motion AAA:** Wajib meresepkan pemakaian 3 library standar: (1) **Lenis** untuk *inertial smooth scrolling* di Root Layout, (2) **Anime.js** untuk animasi mikro prosedural & partikel interaktif, dan (3) **Framer Motion** untuk *scroll-reveal* & hover fluiditas kartu dengan penulisan tipe ketat (`as const`).
   - **Touch-Safe Mobile Video:** Pemutar video wajib terbungkus di area ergonomis dengan target tombol >44x44px, menyediakan kontrol eksplisit tanpa auto-lock fullscreen atau autoplay berpotensi macet.
   - **Active Visual Sourcing & Asset Mapping:** Dokumen perancangan wajib menjamin ketersediaan pemetaan aset (`ASSET-MAPPING.md`) menuju URL gambar asli beresolusi tinggi. Dilarang merancang UI hampa gambar (*text-only layout*) ataupun memakai tautan rusak/fiktif.
