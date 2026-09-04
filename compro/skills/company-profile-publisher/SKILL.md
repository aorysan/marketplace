# Company Profile Publisher

> **Skill untuk:** Mendeploy HTML Company Profile (hasil dari company-profile-builder) ke Vercel sebagai website live, lengkap dengan technical SEO auto-fix, user confirmation gate, dan live GET 200 verification.

## Tujuan
Menerima file HTML presentasi dari builder, memvalidasi, melakukan technical SEO auto-fix, menyiapkan folder deployment bersih, serta mendeploy ke Vercel menggunakan Vercel CLI. Kembalikan preview URL dan status live ke user.

## Input
- Path ke HTML file: `<project>/compros/<name>/index.html`
- Folder assets (opsional): `<project>/compros/<name>/assets/`
- (Opsional) Informasi nama project dari caller

## Output
- **Technical SEO patch** pada `index.html` (Title, Description, OpenGraph, JSON-LD Schema)
- `qa/seo-report.md` — audit log hasil auto-fix
- User confirmation prompt sebelum deploy
- Vercel preview deployment via `deploy.js` dengan live HTTP GET 200 verification
- `deploy/deployment-status.md`
- Preview URL + status live

## Prinsip
1. **Selalu preview:** Deploy sebagai preview URL, bukan production, kecuali user minta eksplisit.
2. **Validasi dulu:** Cek file ada dan bisa dibaca sebelum deploy.
3. **SEO dulu, deploy kemudian:** Lakukan audit dan auto-fix technical SEO sebelum deployment.
4. **Konfirmasi dulu:** Jangan pernah deploy tanpa persetujuan eksplisit user (User Confirmation Gate).
5. **CDN dependency check:** Pastikan CDN Reveal.js reachable (karena HTML bergantung ke CDN).

## Langkah Kerja

### 1. Pre-flight Audit & Auto-Fix
Sebelum menyiapkan deployment, lakukan audit technical SEO pada `index.html`:

1. **Scan** `index.html` untuk elemen berikut:
   - `<title>`
   - `<meta name="description">`
   - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
   - Schema.org JSON-LD (`<script type="application/ld+json">`)
   - `alt` attributes pada gambar (untuk accessibility)
2. Jika ada yang **missing**, lakukan **Auto-Fix**:
   - Ekstrak entity name dan tagline dari Hero Slide (misalnya dari judul slide pertama).
   - Inject structured data ke `<head>`: `<title>`, `<meta name="description">`, Open Graph tags, dan JSON-LD Schema (misal tipe `Organization`/`WebSite`).
   - Tambahkan `alt` pada gambar yang belum punya.
3. **Tulis audit log** ke `qa/seo-report.md`:
   - Daftar item yang dicek dan statusnya (ok / missing / fixed).
   - Ringkasan tindakan Auto-Fix yang dilakukan.
   - Entity name dan tagline yang diekstrak dan digunakan.

> **Konfirmasi**: Laporkan hasil audit dan auto-fix pada user, dan minta persetujuan sebelum melanjutkan ke deployment.

### 2. Clean Deployment Preparation
Siapkan folder deployment yang bersih agar hanya berisi file yang dibutuhkan website live:

- Buat folder deployment sementara (misal: `<temp>/deploy-<timestamp>/`).
- Copy **hanya** `index.html` (versi yang sudah di-auto-fix) ke root folder deployment.
- Jika ada `assets/` folder: copy seluruh isinya ke `assets/` dalam folder deployment.
- **Tidak ada file lain** yang ikut ter-copy (hindari file build/config/dev yang bocor ke deploy).
- Folder deployment harus flat: `index.html` di root, `assets/` di root.

### 3. User Confirmation Gate
Sebelum mengeksekusi deploy, tampilkan ringkasan dan minta persetujuan eksplisit:

1. Tampilkan summary kepada user:
   - Jumlah slide yang siap dideploy.
   - Status SEO (item yang di-auto-fix, path `qa/seo-report.md`).
   - Folder deployment bersih yang akan digunakan.
   - Mode deploy (preview atau `--prod`).
2. **Pause dan tanya** user untuk persetujuan eksplisit (misal: "Lanjutkan deploy ke Vercel? (y/N)").
3. Jika user tidak menyetujui, batalkan dan jangan jalankan deploy.

### 4. Deploy Execution via `scripts/deploy.js`
Setelah disetujui, jalankan script deploy:

- Cek Vercel CLI tersedia: `vercel --version`
- Jika tidak ada: error "Vercel CLI not found. Install with: npm i -g vercel"
- Cek autentikasi: `vercel whoami`
- Jalankan deploy:

```bash
vercel deploy --yes --no-wait <deployment-directory> [--prod]
```

- Parse output CLI menggunakan regex `https://[a-zA-Z0-9-]+\.vercel\.app` untuk mendapatkan preview URL.
- **Live GET 200 check:** Lakukan HTTP GET aktif ke preview URL menggunakan `https.get`; tunggu sampai status `200` (dengan 3 retries dan delay singkat).
- Return ke user:
  - Preview URL
  - Status live (LIVE jika GET 200 terkonfirmasi)
  - Tulis `deploy/deployment-status.md`

### 5. Post-deploy
- Cek preview URL accessibility: HTTP GET, pastikan 200 (sudah dilakukan di langkah 4).
- Kembalikan ke user:
  - Preview URL
  - Status: live / deployed
  - (Opsional) Claim URL jika tersedia

## Error Handling

| Skenario | Tindakan |
|----------|----------|
| HTML file tidak ada | Error: "HTML file not found at <path>" |
| Vercel CLI tidak ter-install | Error: "Vercel CLI not found. Install: npm i -g vercel" |
| Vercel CLI tidak ter-auth | Error: "Vercel CLI not authenticated. Run: vercel login" |
| Deploy gagal | Kembalikan error message dari CLI |
| Preview URL tidak reachable setelah retries | Laporkan URL + status deployed (belum live), beri instruksi cek ulang |

## Contoh Penggunaan

**User request:** "Deploy company profile slides ke Vercel"

**Skill execution:**
1. Audit & Auto-Fix technical SEO `index.html`, tulis `qa/seo-report.md`
2. Siapkan folder deployment bersih (hanya `index.html` + `assets/`)
3. User Confirmation Gate — tampilkan summary, minta persetujuan
4. Jalankan `scripts/deploy.js`, verifikasi GET 200
5. Return: "Company profile berhasil di-deploy ke: https://project-git-branch-user.vercel.app (LIVE)"
