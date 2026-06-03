# Roadmap Full SaaS Undanganku

Tanggal update: 2026-06-03

Dokumen ini menjadi bahan kerja lanjutan untuk menaikkan aplikasi dari MVP SaaS yang sudah berjalan menjadi produk undangan online production-ready.

## Kondisi Saat Ini

Sudah tersedia:

- Frontend React/Vite/TanStack.
- Backend Go + PostgreSQL.
- Login dummy user dan admin.
- Dashboard user dan admin.
- Builder undangan dasar.
- Template registry dari database.
- Public invitation page dengan RSVP, gift, musik, maps link, watermark conditional, dan dynamic OG.
- Tier gating frontend/backend.
- Payment demo/manual, webhook Midtrans/Xendit scaffold, refund admin, voucher.
- Buku tamu dan personal link WhatsApp.
- Mobile UX awal: bottom nav user/admin, card mobile untuk Users, Orders, Tamu, sticky action builder.
- Deploy VPS aktif untuk `cintabuku.site`.

## Prinsip Eksekusi

- Jangan refactor besar jika fitur lama stabil.
- Kerjakan per fase kecil, build, test, deploy.
- Desktop jangan rusak saat memperbaiki mobile.
- Data penting harus divalidasi di backend, bukan hanya UI.
- Template baru harus bisa masuk tanpa edit kode aplikasi utama.
- Fitur yang menyentuh uang, user, domain, dan public page wajib ada acceptance test manual minimal.

## Phase 1 - Builder Undangan Pro

Target: builder terasa seperti produk utama, bukan form demo.

### Scope

- Ubah builder mobile menjadi wizard satu kolom penuh.
- Desktop builder tetap 3 area: step, form, preview.
- Tambah field penting:
  - nama orang tua
  - ayat/kutipan pembuka
  - tanggal akad/resepsi
  - maps embed URL
  - alamat lengkap
  - musik upload/pilih
  - rekening/gift multi item
  - galeri prewedding
  - RSVP limit warning
- Preview builder memakai data real yang disimpan, bukan mock terlalu sederhana.
- Tambah autosave draft ringan, minimal debounce 2-3 detik.
- Tambah validasi sebelum publish:
  - slug wajib
  - pasangan wajib
  - tanggal wajib
  - venue wajib
  - gallery tidak melebihi tier
  - custom domain hanya Pro/Business
  - dynamic OG hanya Pro/Business

### Files Awal

- `lovable/src/routes/dashboard.buat.tsx`
- `lovable/src/lib/api.ts`
- `apps/api/cmd/api/invitations.go`
- `apps/api/cmd/api/tiers.go`

### Acceptance

- User bisa create draft.
- User bisa edit undangan lama via `?slug=...`.
- Publish gagal kalau limit/tier dilanggar.
- Preview publik berubah mengikuti input builder.
- Mobile builder nyaman tanpa horizontal scroll.

## Phase 2 - Template Upload & Registry Full

Target: admin bisa memasukkan template baru tanpa code change.

### Scope

- Admin upload template ZIP.
- ZIP wajib berisi:
  - `index.html`
  - `template.json`
  - folder `assets/`
  - optional `preview.webp`
- Backend validasi ZIP:
  - ukuran maksimal
  - path traversal blocked
  - remote scripts disanitasi atau diberi warning
  - `template.json` valid JSON schema
- Extract ke storage lokal/VPS untuk fase awal.
- Insert/update ke tabel `templates`.
- Admin preview template setelah upload.
- UI admin tampilkan status valid/invalid.
- Tambah CLI/helper untuk register template dari folder lokal.

### Files Awal

- `lovable/src/routes/admin.templates.tsx`
- `lovable/src/routes/admin.media.tsx`
- `apps/api/cmd/api/admin_templates.go`
- `apps/api/cmd/api/uploads.go`
- `apps/api/cmd/api/migrations.go`

### Acceptance

- Upload ZIP template baru berhasil.
- Template muncul di dashboard user.
- Builder bisa memilih template baru.
- Public preview template bisa dibuka.
- Upload dengan ZIP rusak ditolak dengan pesan jelas.

## Phase 3 - Payment Production

Target: pembayaran siap untuk transaksi nyata.

### Scope

- Isi env production Midtrans atau Xendit.
- Implement create invoice/checkout real.
- Webhook production:
  - signature/token wajib valid
  - idempotent
  - retry safe
  - raw payload tersimpan
- Invoice detail page user.
- Admin payment detail.
- Refund admin lebih lengkap:
  - reason
  - operator admin
  - timestamp
  - optional downgrade user
- Grace period banner di dashboard user.
- Expired tier downgrade cron/job.

### Files Awal

- `apps/api/cmd/api/payments.go`
- `lovable/src/routes/dashboard.billing.tsx`
- `lovable/src/routes/admin.orders.tsx`
- `.env.example`
- VPS `.env.production`

### Acceptance

- Checkout real membuka payment page provider.
- Webhook valid mengubah tier user.
- Webhook retry tidak double extend.
- Voucher `used_count` naik satu kali.
- Refund tercatat.
- Expired tier turun ke Free setelah grace period.

## Phase 4 - Mobile UX Completion

Target: semua halaman dashboard nyaman di HP.

### Scope

- Card mobile untuk:
  - Admin Templates
  - Admin Voucher
  - Admin Media
  - Admin Reports
  - User RSVP
  - User Billing
  - User Template Gallery
  - User Undangan Saya
- Form mobile:
  - input full width
  - tombol sticky jika aksi utama
  - table tidak wajib dipakai di HP
- Bottom nav:
  - aktif jelas
  - drawer tidak menutup tombol penting
  - safe-area untuk iPhone

### Files Awal

- `lovable/src/components/dashboard/MobileDashboardNav.tsx`
- `lovable/src/components/dashboard/Shared.tsx`
- semua route dashboard/admin terkait.

### Acceptance

- Tidak ada horizontal scroll utama di viewport 390px.
- Semua aksi utama bisa dicapai dengan 1-2 tap.
- Card tidak memotong teks penting.
- Desktop tetap sama.

## Phase 5 - WhatsApp Gateway & Guest Automation

Target: undangan bisa dikirim massal dengan tracking.

### Scope

- Integrasi provider WhatsApp gateway.
- Bulk send per undangan.
- Queue job sederhana.
- Status:
  - draft
  - queued
  - sent
  - delivered
  - failed
  - opened
- Template pesan WhatsApp editable.
- Rate limit per user/tier.
- CSV import lebih kuat:
  - nama
  - phone
  - group
  - notes

### Files Awal

- `apps/api/cmd/api/guests.go`
- `lovable/src/routes/dashboard.tamu.tsx`
- `apps/api/cmd/api/migrations.go`

### Acceptance

- User bisa import 100 tamu.
- User bisa bulk send.
- Status terkirim tersimpan.
- Link personal memuat `?to=Nama`.
- Event `guest_opened` tercatat.

## Phase 6 - Analytics & Conversion Dashboard

Target: user dan admin melihat performa undangan.

### Scope

- User analytics per undangan:
  - page views
  - unique visitors
  - RSVP count
  - share click
  - open by guest
  - conversion RSVP
- Admin analytics:
  - revenue
  - MRR
  - active users
  - active invitations
  - template usage
  - conversion free to paid
- Filter tanggal.
- Export report CSV untuk Creator ke atas.

### Files Awal

- `apps/api/cmd/api/events.go`
- `apps/api/cmd/api/admin_reports.go`
- `lovable/src/routes/admin.reports.tsx`
- `lovable/src/routes/dashboard.rsvp.tsx`

### Acceptance

- Event page_view/share/rsvp tampil di dashboard.
- Data bisa difilter.
- Export tier-gated.
- Query tetap cepat untuk data besar dengan index.

## Phase 7 - Public Invitation Performance & SEO

Target: undangan publik cepat dan share preview akurat.

### Scope

- Lighthouse audit mobile.
- Optimasi LCP image:
  - preload hero
  - responsive image
  - WebP/AVIF
  - lazy below fold
- Cache static asset.
- Dynamic OG test real:
  - WhatsApp
  - Facebook
  - Telegram
- Meta per undangan:
  - title pasangan + tamu
  - description
  - image dynamic
- Optional SSR/ISR lebih serius jika dibutuhkan.

### Files Awal

- `lovable/src/routes/u.$slug.tsx`
- `apps/api/cmd/api/og.go`
- template public assets di `lovable/public/templates`

### Acceptance

- LCP target < 1.5-2.5 detik untuk template ringan.
- CLS < 0.1.
- OG image muncul di WhatsApp.
- Maps tetap aktif.

## Phase 8 - Security, Ops, Backup

Target: aplikasi aman dijalankan untuk client nyata.

### Scope

- Backup PostgreSQL harian.
- Restore drill dokumentasi.
- Audit log admin:
  - create user
  - update tier
  - refund
  - template upload
  - delete/suspend
- Rate limit lebih kuat:
  - auth
  - RSVP
  - payment webhook
  - upload
- File upload security:
  - MIME sniff
  - max size
  - extension whitelist
  - image recompress optional
- Error logging.
- Healthcheck detail.

### Files Awal

- `apps/api/cmd/api/rate_limit.go`
- `apps/api/cmd/api/uploads.go`
- `apps/api/cmd/api/admin_users.go`
- `docker-compose*.yml`
- VPS cron/systemd.

### Acceptance

- Backup dibuat otomatis.
- Restore test berhasil.
- Audit log tampil di admin.
- Upload file berbahaya ditolak.
- Rate limit terbukti bekerja.

## Phase 9 - Business Polish

Target: conversion user lebih bagus.

### Scope

- Onboarding user baru:
  - pilih template
  - isi pasangan
  - publish pertama
- Upgrade banner saat limit tercapai.
- Pricing page lebih matang.
- Empty state yang jelas.
- Email/WA setelah daftar dan pembayaran.
- Admin settings untuk brand/platform.

### Files Awal

- `lovable/src/routes/index.tsx`
- `lovable/src/routes/dashboard.index.tsx`
- `lovable/src/routes/dashboard.billing.tsx`
- `lovable/src/routes/register.tsx`

### Acceptance

- User baru tahu langkah berikutnya.
- Free user terdorong upgrade saat kena limit.
- Pricing mudah dipahami.
- Tidak ada halaman kosong yang membingungkan.

## Urutan Eksekusi Disarankan

1. Phase 1 - Builder Undangan Pro.
2. Phase 2 - Template Upload & Registry Full.
3. Phase 4 - Mobile UX Completion.
4. Phase 3 - Payment Production.
5. Phase 5 - WhatsApp Gateway.
6. Phase 6 - Analytics.
7. Phase 7 - Public Performance.
8. Phase 8 - Security/Ops.
9. Phase 9 - Business Polish.

Alasan urutan: builder dan template adalah nilai utama produk. Setelah user bisa membuat undangan dengan enak, payment real dan gateway akan lebih masuk akal untuk dikomersialkan.

## Checklist Sebelum Tiap Deploy

- `go test ./...` di `apps/api`.
- `npm run build` di `lovable`.
- Smoke test:
  - `/login`
  - `/dashboard`
  - `/admin`
  - `/api/health`
  - public invitation sample
- Pastikan `undang.cintabuku.site` tetap tidak terganggu jika deploy hanya untuk `cintabuku.site`.

## Catatan Produk

Positioning yang paling kuat:

> Undangan online premium Indonesia untuk wedding dan acara keluarga, dengan template adat, RSVP, buku tamu WhatsApp, gift, maps, analytics, dan dashboard admin/reseller.

Jangan terlalu cepat mengejar banyak niche acara sebelum workflow wedding premium benar-benar halus.
