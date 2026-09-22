# Scraped Assets: RT Online Company Profile (`compro.pdf`)

Direktori ini berisi seluruh aset hasil scraping dan ekstraksi dari dokumen presentasi:
`/home/aorysan/Downloads/compro.pdf`

---

## 📁 Struktur Direktori

```
assets/compro/
├── README.md                      # Dokumentasi hasil scraping ini
├── metadata.json                  # Data terstruktur (judul, total halaman, per-slide breakdown, harga, kontak)
├── content.md                     # Transkrip lengkap terstruktur dari seluruh 15 slide
│
├── slides/                        # 15 Halaman Render Slide HD 1920x1080 (16:9, 192 DPI)
│   ├── slide-01.png               # Cover / Hero Slide
│   ├── slide-02.png               # Problem Slide
│   ├── slide-03.png               # Stress-Free Solutions
│   ├── slide-04.png               # Social Proof / Klien RT
│   ├── slide-05.png               # Key Software Features
│   ├── slide-06.png               # Warga & Iuran
│   ├── slide-07.png               # Data Kependudukan & Pengumuman
│   ├── slide-08.png               # Mobile Apps
│   ├── slide-09.png               # WhatsApp AI Agent
│   ├── slide-10.png               # Showcase Fitur App & Chatbot
│   ├── slide-11.png               # Workflow Pembayaran & Kas
│   ├── slide-12.png               # Subscription Pricing Matrix
│   ├── slide-13.png               # Promo 1 Tahun Bayar 10 Bulan
│   ├── slide-14.png               # Fasilitas Premium Terbatas
│   └── slide-15.png               # Closing / Let's Collaborate
│
├── slides-text/                   # Teks individual per slide (slide-01.md s/d slide-15.md)
│   ├── slide-01.md
│   ├── slide-02.md
│   └── ...
│
├── images/
│   ├── key-assets/                # Aset visual utama yang telah diidentifikasi & dinamai rapi
│   │   ├── logo-rtonline.png                       # Logo resmi RT Online (transparan)
│   │   ├── hero-officer-with-robot-devices.png     # Komposisi hero petugas + robot + perangkat
│   │   ├── hero-devices-and-officer.png            # Komposisi perangkat laptop/monitor/tablet/HP
│   │   ├── mascot-whatsapp-ai-robot.png            # Maskot 3D robot AI WhatsApp melambai
│   │   ├── problem-headache-officer.png            # Foto petugas RT pusing/stres (cutout)
│   │   ├── solution-smiling-officer-arms-crossed.png# Foto petugas RT tersenyum percaya diri (cutout)
│   │   ├── illustration-citizen-data-card.png      # Ilustrasi kartu profil warga digital
│   │   ├── mockup-mobile-app-preview.png           # Mockup preview layar aplikasi
│   │   ├── mockup-slide-10-whatsapp-ai-features.png# Mockup visual slide 10
│   │   ├── mockup-slide-11-finance-and-cash-flow.png# Mockup visual slide 11
│   │   ├── community-happy-citizens-outdoors.png   # Foto interaksi warga perumahan
│   │   ├── company-team-aria-gajayana.png          # Foto tim Venturo Town Hall di Aria Gajayana
│   │   ├── tech-ai-chip-circuits-bg.png            # Background sirkuit AI teknologi
│   │   ├── officer-holding-phone-horizontal.png    # Foto petugas memegang ponsel
│   │   ├── badge-best-seller.png                   # Pita emas badge 'Best Seller'
│   │   ├── banner-special-offer-guarantee.png      # Banner 'Fasilitas Premium Terbatas'
│   │   ├── promo-guarantee-badge.png               # Banner 'Special Offer!!'
│   │   ├── icon-whatsapp.png                       # Ikon WhatsApp transparan
│   │   ├── icon-instagram.png                      # Ikon Instagram transparan
│   │   ├── icon-globe-website.png                  # Ikon Website transparan
│   │   └── icon-location.png                       # Ikon Lokasi transparan
│   │
│   └── raw/                       # 104 gambar asli hasil ekstraksi objek PDF (RGB + Mask RGBA)
│       ├── page-01-img-*.png
│       └── ...
│
└── input-drafts/                  # Dokumen standar input pipeline Layer 3 Compro (siap pakai)
    ├── business-knowledge-base.md # Data faktual bisnis & teknis
    ├── business-audit-report.md   # Problem statement & analisis kompetitif
    └── brand-story-guide.md       # Brand persona, color palette, & tone of voice
```

---

## 🚀 Integrasi dengan Pipeline Compro

Aset ini telah disiapkan agar kompatibel penuh dengan pipeline orchestrator `/compro` (Layer 3). File di folder `input-drafts/` dapat langsung disalin ke folder `input/` proyek utama:

```bash
cp -r assets/compro/input-drafts/* input/
```
