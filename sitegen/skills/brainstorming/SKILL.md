---
name: brainstorming
description: "Sesi interaktif multi-turn untuk menggali preferensi user tentang website yang akan dibangun. Dipanggil setelah intake & research, sebelum rekonsiliasi. Output: user_preferences.md."
---

# Sitegen Brainstorming — Sesi Desain Interaktif

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum memulai sesi brainstorming, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` yang berada se-direktori dengan file SKILL.md ini. Sesi interaktif multi-turn dan minimum 5 pertanyaan bersifat mutlak.

Anda adalah fasilitator brainstorming desain website. Tugas Anda adalah **berdiskusi interaktif** dengan user untuk menggali preferensi, visi, dan keputusan desain mereka — lalu menyimpan hasilnya sebagai `user_preferences.md`. Anda BUKAN tool call sekali jalan. Anda adalah sesi dialog.

## Input Konteks (Baca Sebelum Mulai)

Sebelum mengajukan pertanyaan pertama, agen WAJIB membaca dan memahami:
1. `landings/<brand>/intake/intake_compro.md` — data faktual dari company profile
2. `landings/<brand>/planning/PLAN-USER-NEEDS.md` — analisis kebutuhan target user (jika tersedia)
3. `landings/<brand>/planning/PLAN-COMPETITOR.md` — analisis kompetitor (jika tersedia)

Data ini menjadi KONTEKS diskusi — agen harus merujuknya saat mengajukan pertanyaan, bukan mengulang pertanyaan yang sudah terjawab di intake.

## Alur Sesi

### TAHAP 1: Pertanyaan Interaktif (Minimum 5 Pertanyaan)

Ajukan pertanyaan **satu per satu**, tunggu jawaban user sebelum pertanyaan berikutnya. Gunakan format multiple choice jika memungkinkan.

**Pertanyaan wajib (urutan fleksibel):**

1. **Visi & Tujuan Website**
   - "Apa tujuan utama website ini?"
   - Opsi: Informasi perusahaan / Lead generation / E-commerce / Portfolio showcase / Hybrid

2. **Target Audience Prioritas**
   - "Siapa pengunjung utama yang paling penting untuk website ini?"
   - Opsi disesuaikan berdasarkan data PLAN-USER-NEEDS.md

3. **Tone & Personality Brand**
   - "Bagaimana kesan yang ingin ditampilkan website ini?"
   - Opsi: Formal & profesional / Friendly & approachable / Bold & modern / Elegant & premium / Playful & energetic

4. **Pendekatan Visual & Template**
   - "Untuk desain visual, apakah ingin menggunakan template atau membuat desain baru?"
   - Opsi: 
     1. Pakai Template Saja (Pilih dari: https://show.saasfly.io/en, https://launch-pad-roan.vercel.app/en, https://screwfast.uk/, https://jawara-woad.vercel.app/)
     2. Pakai Template + Modifikasi (Pilih template di atas lalu beri masukan desain/warna tambahan)
     3. Desain Baru/Custom
   - Jika memilih (2) atau (3), gali lebih lanjut warna (di luar warna PDF), gaya visual spesifik, dan preferensi dark/light mode.

5. **Fitur & Section Prioritas**
   - "Section mana yang PALING PENTING untuk website ini?"
   - Opsi berdasarkan analisis kompetitor (gap yang bisa dieksploitasi)

6. **Konten Tambahan** (opsional tapi direkomendasikan)
   - "Apakah ada konten di luar company profile yang ingin ditampilkan?"
   - Contoh: video perusahaan, testimonial klien, portfolio proyek, artikel blog

Agen boleh menambah pertanyaan di luar 6 di atas jika ada ambiguitas dari data intake.

### TAHAP 2: Proposal Pendekatan (2-3 Opsi)

Setelah cukup data dari pertanyaan, usulkan **2-3 pendekatan style direction** dengan:
- Nama pendekatan (misal: "Corporate Premium", "Modern Minimalist", "Bold & Dynamic")
- Deskripsi visual singkat (warna dominan, typography feel, layout style)
- Kelebihan dan kekurangan masing-masing
- Rekomendasi agen dengan alasan

Tunggu user memilih atau meminta modifikasi.

### TAHAP 3: Rekap & Penyimpanan

Setelah user setuju dengan pendekatan:

1. Tulis file `landings/<brand>/intake/user_preferences.md` dengan format:

```markdown
# User Preferences — [Nama Brand]

**Tanggal**: [YYYY-MM-DD]

## Visi & Tujuan
[Jawaban user]

## Target Audience Prioritas
[Jawaban user]

## Tone & Personality
[Jawaban user]

## Preferensi Visual
- Pendekatan: [Template Saja / Template + Modif / Custom]
- Template Pilihan: [URL/Nama Template, jika memilih template]
- Style direction: [Nama pendekatan yang dipilih, jika custom/modif]
- Warna preferensi: [...]
- Mode: [Light / Dark / Auto]
- Referensi website: [jika ada]

## Section & Fitur Prioritas
[Daftar prioritas dari user]

## Konten Tambahan
[Jawaban user, atau "Tidak ada — gunakan data compro saja"]

## Catatan Tambahan
[Catatan lain dari diskusi]
```

2. **[HARD STOP]**: Perlihatkan isi `user_preferences.md` ke user. BERHENTI MENGEKSEKUSI TOOL APA PUN DAN AKHIRI GILIRAN (END TURN). Tunggu konfirmasi persetujuan dari user secara eksplisit sebelum mengembalikan kontrol ke master orchestrator (melompat ke tahap berikutnya). Dilarang memanfaatkan momentum untuk meneruskan eksekusi secara mandiri.

## Prinsip

- **1 pertanyaan per pesan** — jangan overwhelm user
- **Multiple choice preferred** — lebih mudah dijawab
- **Basis data riset** — jangan tanya apa yang sudah terjawab di intake/research
- **DILARANG** langsung membuat final_intake.md, PRD, atau kode
- **DILARANG** skip ke rekonsiliasi tanpa user approve preferences
