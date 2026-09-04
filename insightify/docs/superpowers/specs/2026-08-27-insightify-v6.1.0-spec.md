# Insightify v6.1.0 Spec & Design Document

## Ringkasan Perubahan v6.1.0

Insightify v6.1.0 membawa optimalisasi besar pada sisi kecepatan eksekusi (concurrency) dan perbaikan alur evaluasi pengguna (User Review Flow). Perubahan difokuskan pada 2 area utama untuk menekan waktu tunggu (wait time) dan meningkatkan kualitas *feedback loop*.

### 1. User Review Relocation (P0)

- **End-of-Reviewer Approval:** Langkah konfirmasi `Approve plan?` di akhir fase Planner dihapus dan diganti menjadi konfirmasi final `Approve doc?` di akhir fase Reviewer. 
- **Contextual Review:** Dengan perubahan ini, pengguna kini mereview hasil dokumentasi asli yang sudah jadi (setelah melalui proses AI Review) alih-alih mereview *abstract plan* yang seringkali kurang memberikan konteks hasil akhir.
- **Fast-Fix Loop:** Jika pengguna memilih `revise`, *feedback* dapat langsung diarahkan kembali ke Writer atau diperbaiki langsung oleh Reviewer sebelum masuk ke tahap Builder.

### 2. Sub-Agent Concurrency Optimization (P0)

Untuk mencegah *bottleneck* kecepatan dan mematuhi *rate limit* API, eksekusi pipeline kini menggunakan *pool* sub-agent dengan batas konkurensi maksimal 5 agen yang berjalan serentak.

- **Parallel Extraction (Planner):** Proses ekstraksi kategori (Map-Reduce) tidak lagi dilakukan secara berurutan. Sub-agent ditugaskan secara paralel (maksimal 5 serentak) untuk mengekstrak berbagai *knowledge categories* dari *sources* yang ada.
- **Parallel Writing (Writer):** Dokumen final tidak lagi dirender dalam 5 gelombang berurutan (*sequential waves*). Sub-agent kini merender bagian/seksi dokumen secara independen dalam paralel.
- **Parallel Review (Reviewer):** Pemeriksaan 9 *quality dimensions* dibagi ke sub-agent yang beroperasi serentak, lalu seluruh laporannya (report) digabung (*merged*) di akhir proses.

---

*Spec ini disusun saat upgrade dari v6.0.0 ke v6.1.0 untuk meningkatkan performa eksekusi secara drastis melalui multi-agent concurrency.*
