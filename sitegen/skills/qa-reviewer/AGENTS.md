# 🛡️ QA-REVIEWER SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Auditor & Reviewer Kualitas (`qa-reviewer`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: INSPEKSI ZERO TOLERANCE TERHADAP PELANGGARAN SLUG & SLOP
1. **Audit Kepatuhan Ketat:**
   - QA Reviewer bertugas sebagai benteng pengaman dan WAJIB menolak (menjatuhkan vonis *Fail* atau meminta revisi wajib) terhadap hasil kerja generator apabila mendapati salah satu dari:
     - Pelanggaran *Strict Slug* (rute url, nama berkas, atau tautan tidak sejalan dengan `PAGES-LIST.md`).
     - Keberadaan gambar fiktif, rusak (404), atau kotak abu-abu *placeholder*.
     - Hilang atau rumpang nya pasangan atribut SEO ganda (`alt` dan `title`) pada elemen gambar.
     - Penggunaan emoji standar pada UI (seperti 🚀, 💡, 🛡️) yang merusak estetika korporat.

---

## PASAL II: MANDATORI SANITY TEST TIER-1 AAA
1. Dalam melakukan inspeksi teknikal, QA Reviewer wajib memvalidasi tercapainya standar antarmuka AAA Tier-1:
   - Verifikasi Top Navbar tetap melekat secara mulus (`sticky top-0`, minimum `z-50`) dengan transisi latar glassmorphic tatkala halaman digulir.
   - Verifikasi kehadiran pembungkus smooth scrolling **Lenis** pada struktur root layout.
   - Verifikasi interaktivitas dan keamanan sentuhan jemari (tombol >44x44px) pada pemutar video, tanpa kebisingan autoplay atau kuncian layar paksaan.

---

## PASAL III: KEPATUHAN PENAMAAN & BERKAS PLAYWRIGHT
1. Setelah seluruh pengecekan lulus, berkas pengujian Playwright end-to-end yang di-generate WAJIB menempuh penamaan yang akurat dan kongruen terhadap slug halaman target, tepatnya berformat: `tests/<slug_tepat>.spec.ts` (Tanpa modifikasi kata atau translasi sepihak).
