# 🛡️ INTAKE SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Ekstraktor Dokumen (`intake`).

---

## PASAL I: VERIFIKASI KEHADIRAN ASET & MEDIA COM PRO
1. **Penegakan Fakta Aset:**
   - Saat memproses data ekstraksi dari dokumen Company Profile, agen wajib mengecek dan mengidentifikasi keberadaan aset foto maupun tautan video murni.
   - **Label No-Video Default:** Apabila dokumen compro terbukti TIDAK MENYEDIAKAN tautan media/video, agen dilarang membuat asumsi tautan palsu. Wajib mencantumkan status **`[No-Video Default]`** secara jelas dalam file `intake_compro.md` sebagai patokan validasi bagi perancang layout berikutnya.
