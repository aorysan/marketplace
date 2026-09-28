# Scoring Rubric — Planner Self-Check

> **Rujukan tunggal (single source of truth).** Rubrik penilaian A–E **tidak lagi diduplikasi** di file ini karena duplikasi rubrik pernah menyebabkan drift antar dokumen. Materi lengkapnya ada di:
>
> **`skills/qa-reviewer/reference/review-checklist.md`**

## Ambang Kelulusan

| Dokumen | Bagian rubrik | Poin | Threshold |
|---|---|---|---|
| `PLAN-GLOBAL.md` | Bagian A | 100 | ≥ 90 |
| `PLAN-<halaman>.md` | Bagian B (Business 60 + Technical 40) | 100 | ≥ 90 |
| `PLAN-USER-NEEDS.md` | Bagian C | 25 | (lihat subtotal) |
| `PLAN-COMPETITOR.md` | Bagian D | 25 | (lihat subtotal) |
| `PLAN-DESIGN-SYSTEM.md` | Bagian E | 25 | (lihat subtotal) |
| Subtotal C + D + E | — | 75 | ≥ 60 |

## Cara Pakai (MODE global / page)

1. Buka `skills/qa-reviewer/reference/review-checklist.md`.
2. Pilih bagian sesuai mode: `global` → A, `page` → B, `global-extended` → A + C + D + E.
3. Nilai setiap item satu per satu, jumlahkan skornya, dan tulis skor per kategori pada dokumen planning.
4. Jika skor < threshold, perbaiki dulu sebelum menyerahkan ke QA Reviewer.

> Catatan: batas putaran revisi ditetapkan oleh Master Orchestrator (lihat `AGENTS.md` pasal II), bukan oleh rubrik ini.
