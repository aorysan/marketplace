# 🛡️ DEPLOY SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Rilis Cloud Vercel (`deploy`).

---

## PASAL I: PRASYARAT LOLOS BUILD LOKAL TANPA CACAT
1. **Sanity Check Sebelum Deploy:**
   - Sebelum mengeksekusi pengiriman menuju production cloud (Vercel), agen wajib memastikan bahwa proses pemeriksaan tipe statik (`npx tsc --noEmit`) dan tes build produksi secara lokal (`npm run build`) telah terkonfirmasi LULUS 100% tanpa error.
   - Dilarang melakukan deploy apabila masih terdapat error statik atau laporan kegagalan tes Playwright dari tahapan QA sebelumnya.
