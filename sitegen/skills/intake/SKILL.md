---
name: intake
description: Sub-skill intake data bisnis. Mendukung dua mode: Mode 1 (PDF Extraction) jika user memiliki file PDF Company Profile, dan Mode 2 (Questionnaire) jika user tidak memiliki PDF. Output kedua mode identik: `intake_compro.md`.
---

# Sitegen Intake

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum menjalankan mode apapun (Mode 1 maupun Mode 2), Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Aturan ini berlaku untuk kedua mode tanpa pengecualian. Penanaman label `[No-Video Default]` bila tidak tersedia aset video adalah wajib di kedua mode.

Panduan Operasional Sub-skill Intake: Agen ini bertugas menyiapkan data bisnis dan aset visual, lalu merekonstruksinya menjadi dokumen `intake_compro.md` yang terstruktur untuk dikonsumsi oleh skill `planning`. Agen ini TIDAK MERANCANG struktur halaman atau merencanakan kode.

Sub-skill ini mendukung **dua mode operasi** tergantung ketersediaan aset dari user. Output akhir kedua mode **identik**: file `landings/<brand>/intake/intake_compro.md`.

---

## ⚡ ROUTING GATE — BACA DAN TENTUKAN MODE INI SEBELUM MELAKUKAN APAPUN

> [!IMPORTANT]
> Sebelum menjalankan satu langkah pun, periksa instruksi yang diberikan oleh master orchestrator (`sitegen`).
> Master orchestrator sudah mencatat apakah user berada dalam `[PDF Mode]` atau `[No-PDF Mode]`.

| Kondisi dari Orchestrator | Mode yang Dijalankan | Langsung Lompat ke |
|--------------------------|---------------------|--------------------|
| User memberikan path file PDF (`[PDF Mode]`) | **MODE 1: PDF Extraction** | Lanjutkan membaca ke bawah ↓ |
| User tidak punya PDF (`[No-PDF Mode]`) | **MODE 2: Questionnaire** | **Lewati seluruh MODE 1. Langsung lompat ke bagian `## MODE 2` di bawah.** |

> [!CAUTION]
> **DILARANG KERAS** menjalankan `extract.py` atau langkah apapun dari MODE 1 jika orchestrator sudah mencatat `[No-PDF Mode]`.
> **DILARANG KERAS** menampilkan questionnaire MODE 2 jika orchestrator sudah mencatat `[PDF Mode]`.

---

## MODE 1: PDF Extraction

*Jalankan mode ini HANYA jika orchestrator menetapkan `[PDF Mode]`.*

Alur kerja ini menerapkan arsitektur hybrid produser-konsumen: script `extract.py` bertindak sebagai **produser data terstruktur** (ekstraksi mentah dan metadata visual), sedangkan agen bertindak sebagai **konsumen, analis semantik, dan perename aset** sebelum menyusun dokumen akhir `intake_compro.md`.

## 1. Jalankan Ekstraksi (Produser Data)
Jalankan perintah ekstraksi dalam SATU rantai eksekusi shell berurutan:
`python -m venv venv && venv\Scripts\activate && pip install -r ./intake/scripts/requirements.txt && python ./intake/scripts/extract.py <path_ke_compro.pdf> [direktori_output]`

Script `extract.py` menghasilkan log teks di terminal DAN file terstruktur `intake_raw.json` di direktori output (misal: di `landings/<brand>/intake/`). File JSON ini memuat:
- **`colors`**: Daftar warna brand terklasifikasi (`primary`, `secondary`, `neutral`) dalam format hex `#RRGGBB`.
- **`images`**: Metadata visual termasuk nomor halaman (`page`), dimensi resolusi (`width`, `height`), dan teks judul/heading terdekat (`nearby_heading`). Gambar berukuran <50px telah difilter secara otomatis oleh script sehingga hanya tersisa gambar bermakna yang disimpan di direktori `assets/` (atau `landings/<brand>/intake/assets/`).

## 2. Analisis & Rekonstruksi Komponen Komersial (Konsumen & Analisis Semantik)
Sebelum menyusun dokumen akhir `intake_compro.md`, agen WAJIB membaca dan memproses data terstruktur dari `intake_raw.json` serta melakukan pengelolaan aset visual dengan prosedur berikut:

### A. Semantic Asset Renaming (Penamaan Ulang Aset Semantik)
1. Agen wajib membaca file `intake_raw.json` dari direktori output.
2. Untuk setiap file gambar di direktori output yang tercantum pada daftar `images` di `intake_raw.json`, analisa konteks `nearby_heading`, nomor halaman (`page`), dimensi resolusi, dan perannya dalam presentasi komersial.
3. Tentukan nama file bertiang slug semantis yang jelas dan mendeskripsikan peran atau isi gambar (contoh: dari nama mentah `img_p1_15.jpg` menjadi `hero-produk-unggulan.jpg`, atau dari `img_p2_30.png` menjadi `logo-klien-mandiri.png`).
4. Gunakan tool `run_command` dengan perintah shell (seperti `Move-Item` / `Rename-Item` di PowerShell atau `mv` jika di bash) untuk merename file fisik tersebut secara nyata di dalam direktori `assets/`.

### B. Penyusunan Dokumen `intake_compro.md`
Buat dokumen `intake_compro.md` di folder `landings/<brand>/intake/intake_compro.md` yang memuat rekonstruksi komponen komersial secara terstruktur:
- **Teks Mentah & Komponen Komersial**: Teks yang sudah dirapikan, mempertahankan semua poin persuasi, value proposition, dan informasi kontak.
- **Palet Warna Desain (Color Palette & Design Tokens)**: Rangkuman hasil ekstraksi warna (`#RRGGBB` untuk warna utama, sekunder, dan netral) dari `intake_raw.json` yang akan menjadi dasar token desain UI.
- **Link Aset & Metadata Visual**: Daftar semua path gambar di direktori `assets/` beserta keterangan konteks atau peranan visualnya dalam presentasi.
- **Tujuan & Nilai Bisnis**: Ekstrak tujuan dibuatnya Compro, audiens target, manfaat utama, dan nilai bisnis dari teks PDF.
- **Ketersediaan Aset Media/Video**: Catat status ketersediaan video dari compro; jika video nihil, beri label status *[No-Video Default]* agar perancangan selanjutnya menyiapkan fallback antarmuka interaktif atau mengkonfirmasi input video langsung ke user.

### Aturan Wajib (Mandatory Rules)
- **Mandate Nama Semantik**: Seluruh referensi tautan gambar di dalam dokumen `intake_compro.md` HARUS menggunakan **nama file semantik baru** yang telah direname (bukan lagi nama mentah berawalan `img_pX_Y` atau `extracted_img_`).
- **Batasan Skala Kerja**: JANGAN merencanakan struktur, layout, atau kode halaman website. Satu-satunya output akhir pada tahap ini adalah aset fisik yang telah ter-rename di direktori `assets/` dan file dokumen `landings/<brand>/intake/intake_compro.md`.

---

## MODE 2: Questionnaire (No-PDF Mode)

> Gunakan mode ini HANYA jika user tidak memiliki file PDF Company Profile.
> Tujuan: menghasilkan `intake_compro.md` yang setara dengan hasil ekstraksi PDF, bersumber dari jawaban user.

### Langkah M2-1: Tampilkan Daftar Pertanyaan [HARD STOP]

Tampilkan **seluruh daftar pertanyaan di bawah ini sekaligus** kepada user dalam satu pesan.
Jangan tanya satu per satu. Tampilkan sebagai daftar bernomor yang rapi.
Setelah menampilkan daftar, **langsung HARD STOP** dan tunggu user mengirimkan jawabannya.

Tampilkan pesan berikut ke user (copy persis):

---
Baik! Karena Anda tidak memiliki PDF Company Profile, silakan jawab pertanyaan berikut.
Pertanyaan bertanda **[WAJIB]** harus diisi. Yang lain boleh dikosongkan — AI akan mengisi atau mencarinya secara otomatis.

Cukup balas pesan ini dengan menyalin daftar di bawah dan mengisi jawaban setelah tanda titik dua (:).

**IDENTITAS BISNIS**
1. [WAJIB] Nama bisnis/brand:
2. [WAJIB] Industri atau jenis usaha (contoh: konstruksi, IT, kuliner, fashion):
3. [WAJIB] Lokasi/kota utama atau wilayah layanan bisnis:
4. [WAJIB] Deskripsi singkat bisnis dalam 2-4 kalimat (ceritakan apa yang Anda lakukan dan untuk siapa):
5. Tagline atau slogan brand (jika ada):
6. Tahun berdiri bisnis:

**LAYANAN & PRODUK**
7. [WAJIB] Daftar layanan atau produk utama (sebutkan nama dan jelaskan singkat masing-masing):
8. [WAJIB] Keunggulan utama bisnis Anda dibanding kompetitor (USP):
9. Kisaran harga layanan/produk (atau tulis "hubungi kami" jika tidak ingin ditampilkan):
10. Pencapaian atau angka yang bisa dibanggakan (contoh: 500+ klien, 10 tahun pengalaman):
11. Proses atau tahapan kerja bisnis Anda (jika relevan):

**TARGET PELANGGAN**
12. [WAJIB] Siapa target pelanggan utama Anda (contoh: UMKM, perusahaan enterprise, ibu rumah tangga):
13. Masalah utama apa yang bisnis Anda selesaikan untuk pelanggan:
14. Apakah ada segmen industri khusus yang Anda sasar:

**KONTAK & MEDIA SOSIAL**
15. [WAJIB] Nomor WhatsApp atau telepon bisnis:
16. [WAJIB] Email bisnis:
17. Alamat lengkap bisnis (jika ada kantor fisik):
18. Link media sosial aktif (Instagram, LinkedIn, Facebook, TikTok — satu per baris):
19. URL website lama (jika sedang di-redesign):

**ASET VISUAL**
20. Path atau URL file logo Anda (contoh: C:\Users\Nama\logo.png atau https://...) — kosongkan jika tidak ada:
21. Path folder foto produk/layanan/tim (contoh: C:\Users\Nama\foto-produk\) — kosongkan jika tidak ada:
22. URL video profil perusahaan di YouTube atau Vimeo — kosongkan jika tidak ada:

**BRAND & KONTEN TAMBAHAN**
23. Warna brand resmi (hex code seperti #1A2B3C, atau deskripsi seperti "biru dongker dan emas") — kosongkan jika belum punya:
24. Testimonial klien (nama, jabatan, dan kutipannya — satu testimonial per baris):
25. Logo atau nama klien/mitra yang boleh ditampilkan di website:
26. Portofolio atau proyek yang ingin ditampilkan (nama proyek + deskripsi singkat):

Kirimkan jawaban Anda. AI akan melanjutkan setelah menerima semua jawaban di atas.
---

**[HARD STOP]**: Setelah menampilkan daftar pertanyaan di atas, BERHENTI MENGEKSEKUSI TOOL APA PUN DAN AKHIRI GILIRAN (END TURN). Tunggu user mengirimkan jawabannya secara eksplisit sebelum melanjutkan ke Langkah M2-2.

---

### Langkah M2-2: Validasi Jawaban Wajib

Setelah menerima jawaban dari user, periksa apakah **9 pertanyaan wajib** sudah dijawab:

| No | Pertanyaan Wajib | Nomor di Daftar |
|----|------------------|-----------------|
| 1 | Nama bisnis/brand | No. 1 |
| 2 | Industri/jenis usaha | No. 2 |
| 3 | Lokasi/wilayah layanan | No. 3 |
| 4 | Deskripsi singkat bisnis | No. 4 |
| 5 | Daftar layanan/produk utama | No. 7 |
| 6 | Keunggulan/USP | No. 8 |
| 7 | Target pelanggan utama | No. 12 |
| 8 | Nomor WA/telepon | No. 15 |
| 9 | Email bisnis | No. 16 |

Jika ada pertanyaan wajib yang **belum dijawab atau kosong**:
- Tanyakan ulang **hanya pertanyaan yang kosong** tersebut. Jangan tampilkan ulang semua 26 pertanyaan.
- **[HARD STOP]**: Tunggu jawaban user sebelum melanjutkan.

Jika semua 9 pertanyaan wajib sudah terisi → lanjut ke Langkah M2-3.

---

### Langkah M2-3: Proses Aset Visual

Untuk setiap aset yang disebutkan user, lakukan proses berikut:

**A. Logo (dari Jawaban No. 20)**
- Jika user memberikan path lokal → verifikasi file ada menggunakan tool.
  - Jika file ada → catat path-nya untuk dimasukkan ke `intake_compro.md`.
  - Jika file tidak ada → catat `logo_source: not_found`. Generator akan membuat logo berbasis teks.
- Jika user tidak memberikan path (kosong) → lakukan web search untuk menemukan logo resmi brand. Jika tidak ditemukan, catat `logo_source: web_not_found`.

**B. Foto Produk/Tim (dari Jawaban No. 21)**
- Jika user memberikan path folder → catat path-nya. Foto akan dipindahkan ke `landings/<brand>/intake/assets/` saat proses generator.
- Jika kosong → catat `photos_source: none`. Generator akan search gambar relevan dari web di tahap eksekusi.

**C. Video (dari Jawaban No. 22)**
- Jika user memberikan URL YouTube/Vimeo → catat URL tersebut.
- Jika kosong → catat status **`[No-Video Default]`** sesuai aturan AGENTS.md. Perancangan UI wajib menyiapkan fallback animasi interaktif.

---

### Langkah M2-4: Buat File `intake_compro.md`

Buat file `landings/<brand>/intake/intake_compro.md`.
Gunakan template di bawah ini sebagai struktur — isi setiap bagian dari jawaban questionnaire user.
Format harus **sama persis** dengan mode PDF agar skill planner dan generator dapat membacanya tanpa perubahan apapun.

```markdown
# Intake Company Profile — [Nama Brand dari Jawaban No.1]

**Tanggal Intake**: [tanggal hari ini dalam format YYYY-MM-DD]
**Mode Intake**: Questionnaire (No-PDF)

---

## 1. Teks Mentah & Komponen Komersial

### Profil Perusahaan
[Isi dari jawaban No. 4]

**Industri**: [Jawaban No. 2]
**Lokasi/Wilayah Layanan**: [Jawaban No. 3]
**Tagline**: [Jawaban No. 5, atau tulis "—" jika kosong]
**Tahun Berdiri**: [Jawaban No. 6, atau tulis "—" jika kosong]

### Layanan & Produk Utama
[Isi dari jawaban No. 7]

### Value Proposition & USP
[Isi dari jawaban No. 8]

### Pencapaian & Angka
[Isi dari jawaban No. 10, atau tulis "—" jika kosong]

### Proses Kerja
[Isi dari jawaban No. 11, atau tulis "—" jika kosong]

### Target Pelanggan
[Isi dari jawaban No. 12]

### Pain Points yang Diselesaikan
[Isi dari jawaban No. 13, atau tulis "AI akan mengidentifikasi melalui research"]

### Segmen Khusus
[Isi dari jawaban No. 14, atau tulis "—"]

### Testimonial Klien
[Isi dari jawaban No. 24, atau tulis "Tidak tersedia — pivot ke social proof angka di planner"]

### Portofolio/Proyek
[Isi dari jawaban No. 26, atau tulis "—"]

---

## 2. Palet Warna & Design Tokens

[JIKA jawaban No. 23 diisi oleh user]:
- **Primary Color**: [warna dari jawaban No. 23]
- **Secondary Color**: Akan ditentukan di sesi Brainstorming
- **Neutral**: Akan ditentukan di sesi Brainstorming

[JIKA jawaban No. 23 KOSONG]:
- **Status**: Warna brand belum ditetapkan — akan ditentukan sepenuhnya di sesi Brainstorming (Step 3).

---

## 3. Link Aset & Metadata Visual

### Logo
- **Status**: [isi salah satu berdasarkan hasil Langkah M2-3:
  - `Tersedia — path: [path file logo]`
  - `Tidak ditemukan di path yang diberikan`
  - `Tidak tersedia — AI akan membuat logo berbasis teks`]

### Foto Produk/Tim
- **Status**: [isi salah satu:
  - `Tersedia — folder: [path folder foto]`
  - `Tidak tersedia — AI akan search gambar relevan dari web di tahap generator`]

### Video
- **Status**: [isi salah satu:
  - `Tersedia — URL: [url video]`
  - `[No-Video Default] — tidak ada video profil, wajib siapkan fallback animasi interaktif`]

### Klien/Mitra
[Isi dari jawaban No. 25, atau tulis "—"]

---

## 4. Tujuan & Nilai Bisnis

- **Industri**: [Jawaban No. 2]
- **Target Audience**: [Jawaban No. 12]
- **Masalah yang Diselesaikan**: [Jawaban No. 13]
- **Nilai Bisnis Utama**: [Ringkasan dari jawaban No. 4, 7, dan 8]
- **Geografi Target**: [Jawaban No. 3]

---

## 5. Ketersediaan Aset Media/Video

[Jika ada URL video dari jawaban No. 22]: Tersedia — lihat Section 3 di atas.
[Jika tidak ada]: **[No-Video Default]** — Tidak ada video profil. Tahap UI Design wajib menyiapkan fallback antarmuka interaktif (animasi, slider, atau konten motion).

---

## 6. Data Kontak & Footer

- **WhatsApp/Telepon**: [Jawaban No. 15]
- **Email**: [Jawaban No. 16]
- **Alamat**: [Jawaban No. 17, atau tulis "—"]
- **Media Sosial**: [Jawaban No. 18, atau tulis "—"]
- **Website Lama**: [Jawaban No. 19, atau tulis "—"]
```

---

### Langkah M2-5: Verifikasi & Laporan ke Master Orchestrator

Setelah file `intake_compro.md` selesai dibuat, lakukan:

1. Baca ulang file yang baru dibuat. Pastikan tidak ada section yang kosong tanpa keterangan.
2. Pastikan label `[No-Video Default]` sudah tercantum jika video tidak tersedia (wajib sesuai AGENTS.md).
3. Laporkan ke master orchestrator dengan format berikut:

```
✅ Intake Mode 2 (Questionnaire) selesai.
- Path file: landings/<brand>/intake/intake_compro.md
- Status logo: [tersedia di path X / tidak tersedia / logo teks]
- Status video: [tersedia URL X / No-Video Default]
- Jumlah layanan tercatat: [angka]
- Pertanyaan wajib terjawab: 9/9
```

Master orchestrator akan melanjutkan ke **Step 2 (Research)** menggunakan `intake_compro.md` yang baru dibuat — identik dengan alur mode PDF.

---

### Aturan Tambahan Mode 2

- **DILARANG** menjalankan script `extract.py` di mode ini (tidak ada PDF untuk diproses).
- **DILARANG** membuat file `intake_raw.json` (file ini hanya dihasilkan oleh `extract.py`).
- **WAJIB** mengisi setiap section di `intake_compro.md` — jika data tidak ada, tulis keterangan eksplisit seperti `"—"` atau `"Akan ditentukan di tahap [X]"`. Jangan biarkan section kosong tanpa keterangan.
- **WAJIB** mencatat `[No-Video Default]` jika tidak ada video (aturan dari AGENTS.md).
- Untuk aset gambar yang tidak disediakan user: cukup catat statusnya di Section 3. Jangan mencoba download atau generate gambar di tahap intake — biarkan generator yang menanganinya di tahap eksekusi nanti.
