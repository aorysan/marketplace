# Modern Template (`modern`)

Sistem desain presentasi Company Profile korporat tech modern berbasis **Bento Grid & Dark Slate Architecture**.

---

## 1. Identitas Visual & Filosofi Desain

Template `modern` mengusung arsitektur visual modern tech lookbook dengan susunan bento grid proporsional, permukaan kontras tinggi, kartu elevated melayang, dan aksen Venturo Teal dinamis.

- **Target Resolusi:** 1920×1080 piksel (Native 16:9).
- **Arsitektur Zero Dead Space:** Memaksimalkan kanvas 1080p dengan pembagian area grid geometris yang seimbang dan rapi.
- **Hirarki Visual:** Tipografi kontras tinggi Plus Jakarta Sans untuk display headline dan Inter untuk body text yang tajam.

---

## 2. Design System Tokens (`theme.css`)

### Surface & Canvas
- Kanvas Utama: `--canvas-bg: #F8FAFC;`
- Kartu / Permukaan: `--canvas-surface: #FFFFFF;`
- Border: `--surface-border: rgba(15, 23, 42, 0.08);`
- Border Hover: `--surface-border-hover: rgba(0, 155, 173, 0.4);`
- Elevation Shadow: `--surface-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);`

### Kontras Slate
- Slate Dark: `--slate-dark: #0F172A;`
- Slate Card: `--slate-card: #1E293B;`
- Slate Subtle: `--slate-subtle: rgba(15, 23, 42, 0.03);`

### Tipografi
- Headline: `--text-headline: #0F172A;`
- Body: `--text-body: #334155;`
- Muted: `--text-muted: #64748B;`
- Inverse: `--text-inverse: #FFFFFF;`
- Font Display: `'Plus Jakarta Sans', sans-serif;`
- Font Body: `'Inter', sans-serif;`

### Brand Venturo & Status
- Primary Brand: `--brand-primary: #009BAD;`
- Dark Brand: `--brand-dark: #007A87;`
- Light Brand: `--brand-light: #38BDF8;`
- Success: `--color-success: #10B981;`
- Danger: `--color-danger: #DC2626;`
- Warning: `--color-warning: #D97706;`

---

## 3. Arketipe Layout

| Arketipe | Slot ID | Deskripsi Layout |
|---|---|---|
| `cover` | `hero` | Split hero bento grid dengan headline besar, badge, dan media visual |
| `problem` | `problem` | Grid kartu masalah dengan pain-point callout berbobot |
| `solution` | `solution` | Solusi terstruktur dengan diagram dan pilar nilai |
| `services` | `services` | Multi-card bento grid menampilkan layanan utama |
| `ecosystem` | `ecosystem` | Framework arsitektur ekosistem terpadu |
| `metrics` | `metrics` | Stat counter cards dengan big numbers & metric progress |
| `differentiator` | `differentiator` | Matriks kapabilitas komparatif keunggulan kompetitif |
| `pricing` | `pricing` | Tabel paket komersial modern dengan tier unggulan |
| `closing` | `closing` | Slide penutup ringkas dengan saluran kontak & CTA |
| `social-proof` | `traction` | Testimoni, logo mitra, atau bukti sosial |

---

## 4. Struktur File Bundle

```text
skills/builder/templates/modern/
├── manifest.json   # Registrasi metadata tema, archetypes, slots, renderer
├── shell.html      # Reveal.js presentation shell (1920x1080)
├── theme.css       # Bento grid stylesheet & modern CSS tokens
└── README.md       # Dokumentasi spesifikasi template modern
```
