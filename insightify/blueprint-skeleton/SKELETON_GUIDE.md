# Blueprint Skeleton Guide — Insightify High-Density Specification

Dokumen panduan ini menjelaskan arsitektur desain, token visual, dan komponen **Skeleton Blueprint** yang diekstrak dari Claude Artifact (`https://claude.ai/code/artifact/d4a1b3fd-2069-437c-822d-5df697a97e3d`).

Skeleton ini dirancang agar output generate plugin `insightify` dapat menjadi **singkat, padat, berdensitas tinggi (high-signal)**, namun tetap terstruktur dengan sangat rapi dan mudah dipahami oleh developer maupun stakeholder.

---

## 📁 Struktur File

```
d:\AryokPunya\Magang\insight\.claude\plugins\insightify\
├── scraped-artifact\
│   ├── index.html                    # Scraped artifact original (100% standalone, dapat langsung dibuka di browser)
│   └── scraped_artifact_data.json    # Metadata & struktur terurai JSON
├── blueprint-skeleton\
│   ├── blueprint-skeleton.html       # Template Skeleton HTML dengan token placeholder
│   ├── blueprint-styles.css          # CSS Design System modular (Design tokens, grids, cards, frames)
│   └── SKELETON_GUIDE.md             # Panduan lengkap implementasi & komponen
└── scraped_artifact_original.html    # Standalone HTML copy di root plugin
```

---

## 🎨 Karakteristik & Visual Design Language

1. **Paper/Parchment Architecture Palette**:
   - Background canvas: `#f2f0eb` (warm architectural parchment)
   - Primary Surface: `#fffefb` (clean paper white)
   - Border lines: `#ddd9d0` & `#c9c4b9` (crisp architectural drawing lines)
   - Highlight Accent: `oklch(0.55 0.11 250)` / `#2563eb` (blueprint blue)
   - Dark Terminals: `#14130f` & `#1a1917` (high-contrast display/terminal)

2. **Dual-Font Precision Hierarchy**:
   - **`IBM Plex Mono`**: Digunakan untuk metadata, status badges, nomor urut (`01`, `02`), protokol API, kode error, dan state machine.
   - **`IBM Plex Sans`**: Digunakan untuk judul, teks deskripsi, bullet points, dan wireframe copy.

3. **High-Density Information Layout**:
   - Menghindari paragraf bertele-tele (no fluff).
   - Menggunakan micro-cards dengan left-border accent (`border-left: 3px solid var(--bp-accent)`).
   - Memadatkan alur ke dalam matriks horizontal, timeline berantai, dan tabel terstruktur.

---

## 🧩 7 Komponen Utama Skeleton

### 1. End-to-End Journey Matrix (`.bp-journey-matrix`)
- **Tujuan**: Memetakan seluruh siklus hidup sistem dari hulu ke hilir dalam 1 tampilan matriks.
- **Kolom**: Dibagi per fase (`Fase 1 · Pendaftaran` → `Fase 2 · Konfirmasi` → `Fase 3 · Kedatangan` → `Fase 4 · Layanan` → `Fase 5 · Pasca Layanan`).
- **Baris**: Dibagi per Aktor / Channel (`User Client`, `Backend Engine`, `Staff/Backoffice`).

### 2. Multi-Tier Architecture Grid (`.bp-arch-grid`)
- **Tujuan**: Visualisasi layer arsitektur backend, gateway, dan kanal input tanpa diagram yang rumit.
- **Tier 1**: Ingress & Channels (Web, Mobile, Bot, Kiosk) + Protokol Tag (`REST`, `WebSocket`).
- **Tier 2**: Core Services & Domain Engines (Queue logic, Auth, Scheduling).
- **Tier 3**: Persistence & Integrations (PostgreSQL, Redis Cache, External APIs).

### 3. State Lifecycle & Transitions (`.bp-state-chain`)
- **Tujuan**: Menjelaskan transisi state entitas utama secara instan.
- **Visual**: Node kotak status monospace (`BOOKED` → `CHECKED_IN` → `SERVING` → `COMPLETED`) dihubungkan panah CSS tipis dengan catatan exception / expiry di bawahnya.

### 4. Operator Step Timeline (`.bp-timeline-chain`)
- **Tujuan**: SOP atau alur eksekusi langkah demi langkah untuk user/petugas.
- **Visual**: Lingkaran nomor urut berantai dengan garis vertikal konektor di samping panel aturan/SOP.

### 5. Technical Policies Grid (`.bp-policy-grid`)
- **Tujuan**: Tempat menaruh keputusan arsitektural (ADR), batasan sistem, kuota, dan validasi penting.
- **Visual**: 2 atau 3 kolom card dengan judul tebal dan kata kunci penting di-bold (misal: **FIFO**, **OTP WhatsApp**, **Rate Limit 5 req/min**).

### 6. Feature Matrix Table (`.bp-feature-table`)
- **Tujuan**: Daftar deliverable fitur & modul pengerjaan yang padat dan jelas.
- **Kolom**: `No`, `Modul / Epik`, `Rincian Item Fitur`, `Target Sprint`.

### 7. Low-Fidelity Device Wireframes (`.bp-wireframe-grid`)
- **Tujuan**: Memberikan gambaran antarmuka langsung tanpa butuh file gambar eksternal (pure CSS wireframe).
- **Frames**:
  - `bp-frame-mobile`: Sketsa tampilan aplikasi ponsel.
  - `bp-frame-kiosk`: Sketsa layar sentuh / kiosk mandiri.
  - `bp-frame-terminal`: Sketsa dashboard meja kerja petugas.
  - `bp-frame-tv`: Sketsa layar monitor publik / TV ruang tunggu (dark theme).

---

## 🚀 Cara Integrasi ke Plugin `insightify`

Untuk mengintegrasikan skeleton ini ke alur generate `insightify`:
1. **Planner / Writer**: Cukup menghasilkan data JSON atau Markdown terstruktur yang memetakan key-key placeholder pada `blueprint-skeleton.html`.
2. **Builder**: Memasukkan konten Markdown/JSON yang diparsing ke dalam template `blueprint-skeleton.html` dan menyertakan `blueprint-styles.css`.
3. Output preview HTML yang dihasilkan akan langsung berbobot, padat, dan berestetika tinggi seperti Claude Artifact aslinya.
