# Profile Template (`profile`)

Sistem desain presentasi Company Profile korporat bertema **Legacy Corporate Slate Cyan**.

---

## 1. Identitas Visual & Filosofi Desain

Template `profile` menggunakan tema korporat klasik dengan aksen slate cyan, kontras gelap elegan, dan kartu konten terstruktur untuk presentasi profil perusahaan formal.

- **Target Resolusi:** 1920×1080 piksel (Native 16:9).
- **Arsitektur:** Self-contained single-file HTML presentation dengan inlined CSS via placeholder token `/* {{CUSTOM_CSS}} */`.
- **Dukungan PDF:** Terintegrasi dengan Reveal.js standard print PDF stylesheet loader.

---

## 2. Arketipe Layout

| Arketipe | Slot ID | Deskripsi |
|---|---|---|
| `cover` | `hero` | Slide sampul utama dengan branding dan judul perusahaan |
| `welcome-problem` | `problem` | Identifikasi permasalahan pasar dan urgensi |
| `welcome-solution` | `solution` | Solusi terpadu dan proposisi nilai perusahaan |
| `services` | `services` | Portofolio layanan utama dan kapabilitas |
| `ecosystem` | `ecosystem` | Framework ekosistem dan model kemitraan |
| `metrics` | `metrics` | Pencapaian kinerja dan indikator kunci (KPI) |
| `differentiator` | `differentiator` | Nilai tambah dan keunggulan diferensiasi bisnis |
| `pricing` | `pricing` | Struktur paket harga dan investasi layanan |
| `closing` | `closing` | Ajakan bertindak (CTA) dan kontak resmi |

---

## 3. Struktur File Bundle

```text
skills/builder/templates/profile/
├── manifest.json   # Registrasi metadata tema, archetypes, slots, renderer
├── shell.html      # Reveal.js presentation shell dengan placeholder inlining
├── theme.css       # Corporate slate cyan stylesheet & token definitions
└── README.md       # Dokumentasi spesifikasi template
```
