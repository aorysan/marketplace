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
- Kanvas Utama: `--canvas-bg: #FFFFFF;`
- Kartu / Permukaan: `--canvas-surface: #FFFFFF;`
- Border: `--surface-border: rgba(11, 59, 130, 0.10);`
- Border Hover: `--surface-border-hover: rgba(0, 155, 173, 0.4);`
- Elevation Shadow: `--surface-shadow: 0 4px 20px -2px rgba(11, 59, 130, 0.08);`

### Kontras Slate
- Slate Dark: `--slate-dark: #0F172A;`
- Slate Card: `--slate-card: #1E293B;`
- Slate Subtle: `--slate-subtle: rgba(15, 23, 42, 0.03);`

### Tipografi
- Headline: `--text-headline: #0B3B82;`
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

---

## 5. RT Online Light Tokens (v2.8.0)

White canvas + blue headline system:

| Token | Nilai |
|---|---|
| `--canvas-bg` | `#FFFFFF` |
| `--text-headline` | `#0B3B82` |
| `--text-body` | `#334155` |
| `--text-muted` | `#64748B` |
| `--brand-primary` | `#009BAD` |
| `--brand-dark` | `#007A87` |

### Feature Archetype Classes

- `.feature-cards-grid` — grid 2 kolom (`1fr 1fr`, gap 20px) untuk arketipe `feature-cards`.
- `.feature-card` — kartu putih (`#FFFFFF`), border `rgba(11,59,130,0.10)`, radius 16px, padding 24px, shadow `rgba(11,59,130,0.08)`; `h3` headline `#0B3B82` 22px, `p` body `#334155` 15px.
- `.feature-split` — grid split `78% 22%`, gap 24px untuk arketipe `feature-split`.
- `.split-photo` — bingkai foto radius 16px dengan overlay `rgba(0,155,173,0.20)` via `::after`.
- `.card-icon-brand` — ikon kartu brand (`#009BAD`, `line-height: 1`).

### Generated Art Exemption (spec §5.4 carve-out)

`assets/closing-banner.svg` adalah vector art per-build yang ditulis `build-deck.js`
setiap kompilasi dan di-embed slide closing by-design — bukan foto slot, jadi
dikecualikan dari aturan "slot images must be .jpg". Aturan SVG-inlined tetap
berlaku untuk fallback foto slot (harus `<svg>` inline, bukan `<img src="assets/*.svg">`).

### Classifier Routing (§5.3)

- `services`/`solution`-scope + ≥4 bullets → `feature-cards` (density-first; judul generik tercakup, bukan cuma kosakata RT).
- Narasi/WA/spotlight (`whatsapp|wa ai|narrative|narasi|sorotan|spotlight|cerita|aplikasi mobile`) + ≤4 bullets → `feature-split`.
- `services` jarang (≤3 bullets) tetap → `services`; `pricing`/`ecosystem`/`metrics`/`differentiator`/`problem` menyimpan renderer khusus masing-masing.
