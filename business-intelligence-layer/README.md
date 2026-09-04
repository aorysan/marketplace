# business-intelligence-layer

Plugin Claude Code yang menjadi jembatan antara produk dan strategi komersial:
mengubah **Product Knowledge Base**, **Pitch Deck**, **Pricing**, dan **Market
Notes** menjadi kerangka bisnis siap pakai untuk evaluasi strategi, pricing,
persona, analisis kompetitor, PMF, SWOT, keputusan go/no-go, hingga brand
story.

## Alur Kerja (3 Tahap)

```
Product KB + Pitch Deck + Pricing + Market Notes
              │
              ▼
     [business-strategist]
              │
              ▼
      Business Knowledge Base
              │
              ▼
 [business-strategist-reviewer]
              │
              ▼
       Business Audit Report
              │
              ▼
      [brand-story-writer]
              │
              ▼
        Brand Story Guide
```

## Skill di Dalam Plugin Ini

### 1. `business-strategist`
**Input:** Product Knowledge Base, Pitch Deck, Pricing, Market Notes
**Output:** Business Knowledge Base — target pelanggan, problem statement,
value proposition/USP, positioning, pricing logic, competitor landscape, PMF
hypothesis, SWOT, feasibility assessment, go/no-go recommendation.

### 2. `business-strategist-reviewer`
**Input:** Business Knowledge Base
**Output:** Business Audit Report — apa yang kuat, apa yang lemah, apa yang
belum valid, risiko strategi, rekomendasi perbaikan.

### 3. `brand-story-writer`
**Input:** Business Knowledge Base + Business Audit Report
**Output:** Brand Story Guide — brand narrative, core message, key claims,
tone of voice, messaging pillars, elevator pitch.

## Cara Pakai (testing lokal)

```bash
claude --plugin-dir ./business-intelligence-layer
```

Ketiga skill bersifat **model-invoked** — Claude otomatis memilih skill yang
sesuai berdasarkan permintaanmu. Contoh:

```
Buatkan business knowledge base untuk produk ini: [tempel deskripsi produk, pricing, catatan pasar]
```

```
Review business knowledge base ini, apakah sudah cukup kuat untuk dipakai ambil keputusan?
```

```
Susun brand story dari analisis bisnis di atas.
```

Setelah plugin di-load, jalankan `/reload-plugins` bila kamu mengubah isi
salah satu `SKILL.md` saat development.

## Use Case

- Startup yang sedang menyusun strategi awal
- Produk baru yang belum jelas pasarnya
- Evaluasi/penyesuaian pricing
- Tim marketing yang butuh positioning
- Founder yang ingin validasi kelayakan bisnis
- Tim brand yang ingin menyusun narasi brand dari analisis bisnis

## Struktur

```
business-intelligence-layer/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── business-strategist/
│   │   └── SKILL.md
│   ├── business-strategist-reviewer/
│   │   └── SKILL.md
│   └── brand-story-writer/
│       └── SKILL.md
└── README.md
```

## Mengembangkan Lebih Lanjut

- Tambahkan slash command eksplisit (mis. `/business-intelligence-layer:strategist`)
  jika kamu ingin memaksa urutan tahap, alih-alih mengandalkan auto-invoke.
- Tambahkan skill tambahan sebagai modul terpisah, mis. `pricing-analysis`
  atau `competitor-mapping`, jika salah satu area butuh analisis lebih dalam.
- Publikasikan lewat [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
  agar bisa dipakai tim lewat `/plugin install`.

## Referensi

- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/plugins-reference
