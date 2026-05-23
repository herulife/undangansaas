# MASTER BLUEPRINT: PLATFORM SAAS UNDANGAN DIGITAL
### Dokumen Arsitektur & Strategi Bisnis Komprehensif
**Versi:** 1.0 | **Bahasa:** Indonesia | **Skala Target:** Jutaan Pengguna

---

# DAFTAR ISI

1. [Executive Summary](#1-executive-summary)
2. [Model Bisnis SaaS](#2-model-bisnis-saas)
3. [Peran & Izin Pengguna](#3-peran--izin-pengguna)
4. [Daftar Fitur Lengkap](#4-daftar-fitur-lengkap)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Arsitektur Database](#6-arsitektur-database)
7. [Sistem Invitation Builder](#7-sistem-invitation-builder)
8. [Sistem AI](#8-sistem-ai)
9. [Arsitektur Frontend](#9-arsitektur-frontend)
10. [Arsitektur Backend](#10-arsitektur-backend)
11. [Sistem Subscription](#11-sistem-subscription)
12. [Arsitektur Keamanan](#12-arsitektur-keamanan)
13. [Strategi SEO & Growth](#13-strategi-seo--growth)
14. [Infrastruktur & DevOps](#14-infrastruktur--devops)
15. [Strategi Skalabilitas](#15-strategi-skalabilitas)
16. [Ekspansi Monetisasi](#16-ekspansi-monetisasi)
17. [Roadmap 12 Bulan](#17-roadmap-12-bulan)
18. [Rekomendasi Akhir](#18-rekomendasi-akhir)

---

# 1. EXECUTIVE SUMMARY

## Positioning Produk

**NamaApp** (sementara: **UndanganKu.id**) adalah platform SaaS undangan digital berbasis cloud yang memungkinkan siapa saja membuat undangan pernikahan, ulang tahun, aqiqah, wisuda, acara korporat, dan acara keagamaan secara profesional tanpa keahlian desain. Platform ini menggabungkan kemudahan drag-and-drop builder, kecerdasan buatan (AI), dan ekosistem reseller yang kuat untuk mendominasi pasar Indonesia.

## Unique Selling Proposition (USP)

| USP | Penjelasan |
|-----|------------|
| **AI-Powered Copywriting** | Konten undangan dibuat otomatis oleh AI dalam hitungan detik |
| **Template Premium Lokal** | Ratusan template dengan nuansa budaya Indonesia (Jawa, Sunda, Batak, dll) |
| **Builder Visual Intuitif** | Drag & drop tanpa coding, preview real-time di HP dan desktop |
| **WhatsApp Integration** | Kirim undangan langsung via WhatsApp dengan tracking buka undangan |
| **Custom Domain** | Undangan bisa diakses via domain sendiri (mis: nikahku.com) |
| **RSVP Digital Otomatis** | Konfirmasi kehadiran digital dengan export ke Excel |
| **Reseller Program** | Ekosistem agen/reseller dengan komisi kompetitif |
| **Multi-bahasa** | Bahasa Indonesia, Inggris, dan bahasa daerah |

## Keunggulan Kompetitif

Dibanding kompetitor lokal (LinkUndangan, Undangan.co, Moment.id), platform ini unggul dalam:
- Arsitektur multi-tenant enterprise-grade
- Fitur AI generatif untuk konten dan desain
- Ekosistem bisnis (reseller, affiliate, white-label)
- Performa tinggi dengan CDN Cloudflare
- Analytics mendalam untuk event organizer
- API terbuka untuk integrasi pihak ketiga

## Peluang Pasar

Indonesia memiliki:
- **+2,5 juta pernikahan per tahun**
- **+200 juta pengguna internet aktif**
- **Penetrasi smartphone 70%+**
- Tren digitalisasi undangan naik 300% pasca pandemi
- Nilai pasar wedding industry Rp 12 triliun+/tahun
- Kurangnya platform undangan digital yang benar-benar enterprise-grade

**Target Revenue Tahun 1:** Rp 1,2 Miliar  
**Target Revenue Tahun 3:** Rp 15 Miliar  
**Target Pengguna Aktif Tahun 1:** 50.000 pengguna  
**Target Pengguna Aktif Tahun 3:** 500.000 pengguna

---

# 2. MODEL BISNIS SAAS

## Aliran Pendapatan (Revenue Streams)

### 1. Subscription Plans (Berulang)
Sumber pendapatan utama dan paling prediktif. Pengguna membayar bulanan atau tahunan untuk akses fitur premium.

### 2. Template Marketplace
Desainer independen dapat menjual template di marketplace internal. Platform mengambil komisi 30-40% dari setiap penjualan template.

### 3. Upgrade Custom Domain
Pengguna premium dapat menghubungkan domain sendiri dengan biaya tambahan Rp 50.000-150.000/tahun.

### 4. Reseller Program
Reseller membeli kredit undangan di harga khusus, lalu menjual ke end-user dengan margin keuntungan sendiri.

### 5. Affiliate System
Afiliasi mendapatkan komisi 20-30% dari setiap pelanggan yang berhasil subscribe melalui link referral mereka.

### 6. AI Features Add-on
Fitur AI premium (copywriting lanjutan, AI image enhancement) dijual sebagai add-on atau kredit.

### 7. White-Label Licensing
Lisensi platform untuk agensi digital atau perusahaan wedding organizer besar.

### 8. Iklan & Sponsorship Vendor (Masa Depan)
Vendor wedding (katering, fotografer, dekorasi) dapat memasang iklan atau featured listing di platform.

## Strategi Harga

### Tabel Paket Berlangganan

| Fitur | **Free** | **Starter (Rp 49k/bln)** | **Pro (Rp 129k/bln)** | **Business (Rp 349k/bln)** |
|-------|----------|--------------------------|------------------------|----------------------------|
| Jumlah Undangan Aktif | 1 | 3 | 10 | Unlimited |
| Template | 5 template dasar | 50+ template | Semua template | Semua + prioritas baru |
| Custom Domain | ✗ | ✗ | ✓ | ✓ |
| RSVP Digital | ✓ (maks 50) | ✓ (maks 200) | ✓ (unlimited) | ✓ (unlimited) |
| Hapus watermark | ✗ | ✓ | ✓ | ✓ |
| AI Copywriting | 3x/bulan | 10x/bulan | 50x/bulan | Unlimited |
| Analytics Dasar | ✓ | ✓ | ✓ | ✓ |
| Analytics Lanjutan | ✗ | ✗ | ✓ | ✓ |
| WhatsApp Blast | ✗ | ✗ | ✓ (100/bln) | ✓ (500/bln) |
| Galeri Foto/Video | ✗ | 50 foto | 200 foto | Unlimited |
| Support | Email | Email | Priority Email | Dedicated Support |
| Sub-akun | ✗ | ✗ | ✗ | 5 sub-akun |
| API Akses | ✗ | ✗ | ✗ | ✓ |

### Diskon Tahunan
- Bayar tahunan = hemat 20% (2 bulan gratis)
- Strategi: dorong konversi ke tahunan untuk meningkatkan LTV dan mengurangi churn

### Paket Reseller
| Paket | Harga/Bulan | Kredit Undangan | Margin Keuntungan |
|-------|-------------|-----------------|-------------------|
| Reseller Basic | Rp 199.000 | 20 undangan/bln | 30% |
| Reseller Pro | Rp 499.000 | 60 undangan/bln | 40% |
| Reseller Agency | Rp 999.000 | 150 undangan/bln | 50% |

## Strategi Upselling

1. **In-app nudge:** Saat pengguna free membuat undangan ke-2, tampilkan modal upgrade
2. **Feature preview:** Tunjukkan fitur locked dengan tombol "Upgrade untuk Akses"
3. **AI trial:** Berikan 3x AI gratis, lalu lock di balik paywall
4. **RSVP limit:** Saat RSVP hampir penuh, notifikasi dan tawarkan upgrade
5. **Template premium lock:** Gambar template blur, bisa di-klik tapi perlu upgrade
6. **Email drip:** Sekuens email 7 hari setelah registrasi dengan promosi upgrade

## Strategi Lifetime Value (LTV)

- **Trial periode:** 14 hari trial Pro gratis tanpa kartu kredit
- **Annual billing:** Dorong pembayaran tahunan dengan diskon 20%
- **Loyalitas:** Badge "Member Setia" untuk pengguna > 1 tahun, akses beta fitur baru
- **Cross-sell:** Pengguna wedding direkomendasikan paket untuk aqiqah anak
- **Referral reward:** Kredit gratis untuk setiap referral yang berhasil

## Strategi Retensi

- Onboarding yang smooth: wizard setup undangan dalam 5 menit
- Progress email: "Undangan Anda sudah dilihat 245 orang!" 
- Fitur yang terus berkembang: rilis fitur baru setiap sprint
- Community: Grup Facebook/WhatsApp eksklusif untuk pengguna premium
- Renewal reminder: Email H-30, H-14, H-7, H-1 sebelum expired

---

# 3. PERAN & IZIN PENGGUNA

## Matriks Izin Lengkap

| Aksi | Guest | Free | Starter | Pro | Business | Reseller | Admin | Super Admin |
|------|-------|------|---------|-----|----------|----------|-------|------------|
| Lihat contoh undangan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Registrasi akun | ✓ | - | - | - | - | - | - | - |
| Buat undangan | ✗ | ✓(1) | ✓(3) | ✓(10) | ✓(∞) | ✓(∞) | ✓ | ✓ |
| Gunakan template dasar | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gunakan template premium | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload media | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Custom domain | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| RSVP management | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Analytics dasar | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Analytics lanjutan | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI Copywriting | ✗ | ✓(3x) | ✓(10x) | ✓(50x) | ✓(∞) | ✓(∞) | ✓ | ✓ |
| WhatsApp blast | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hapus watermark | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sub-akun | ✗ | ✗ | ✗ | ✗ | ✓(5) | ✓ | ✓ | ✓ |
| API akses | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Kelola reseller | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Kelola template global | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Kelola semua user | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Akses billing semua | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Konfigurasi sistem | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Kelola reseller program | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

## Detail Peran

### Guest
- Dapat browsing landing page, lihat contoh undangan
- Dapat mengakses demo preview terbatas
- Tidak dapat membuat atau menyimpan undangan
- CTA utama: registrasi gratis

### Registered User (Free)
- Akun terverifikasi email
- Dapat membuat 1 undangan aktif
- Akses 5 template dasar
- Watermark platform pada undangan
- RSVP maksimal 50 tamu
- AI copywriting 3x/bulan

### Premium User (Starter/Pro/Business)
- Sesuai tabel di atas per level
- Business: akses sub-akun untuk tim
- Business: akses API untuk integrasi

### Reseller
- Dashboard khusus reseller
- Beli kredit undangan di harga grosir
- Kelola client di bawah akun reseller
- Laporan komisi real-time
- Branding kustom untuk client
- Support prioritas dari tim platform

### Affiliate
- Link referral unik
- Dashboard tracking klik dan konversi
- Laporan komisi (20-30%)
- Pembayaran komisi via transfer bank/ewallet
- Materi promosi siap pakai (banner, copywriting)

### Admin
- Kelola pengguna (ban, upgrade, downgrade)
- Kelola template global
- Approve/reject template dari marketplace
- Lihat analytics platform
- Kelola tiket support
- Kelola reseller dan affiliate

### Super Admin
- Semua izin Admin
- Akses konfigurasi sistem
- Kelola harga dan paket
- Akses laporan keuangan penuh
- Kelola API key global
- Disaster recovery tools

---

# 4. DAFTAR FITUR LENGKAP

## 4.1 Fitur Website Publik

- Landing page dengan hero section, demo langsung
- Galeri showcase undangan terbaik
- Halaman harga yang transparan dengan perbandingan paket
- Blog/artikel (SEO-driven content)
- Halaman template browsing dengan filter kategori
- Demo builder interaktif (tanpa login)
- Testimonial pelanggan dengan foto
- FAQ komprehensif
- Halaman affiliate/reseller join
- Halaman tentang kami dan kontak
- Live chat widget (Crisp/Tidio)
- Notifikasi promo banner
- Countdown timer untuk promo terbatas
- Multi-bahasa (ID/EN)
- Dark/light mode

## 4.2 Fitur Invitation Builder

### Editor Visual
- Drag & drop builder berbasis blok/section
- Preview real-time (desktop + mobile)
- Undo/redo (history 50 langkah)
- Auto-save setiap 30 detik
- Zoom in/out canvas
- Grid dan alignment guides
- Multi-select element
- Copy-paste element antar section

### Manajemen Section
- Section: Header/Halo Tamu
- Section: Foto Couple/Anak
- Section: Informasi Acara (waktu, tempat)
- Section: Galeri Foto
- Section: Video YouTube/Vimeo embed
- Section: Countdown Timer
- Section: RSVP Form
- Section: Peta lokasi (Google Maps)
- Section: Ucapan/Quotes
- Section: Gift Registry / Bank Transfer
- Section: Music Player (background music)
- Section: Guestbook/Buku Tamu
- Section: Live Streaming embed
- Section: Instagram Feed
- Section: Protokol Kesehatan
- Section: Story (timeline cerita pasangan)
- Tambah/hapus/reorder section
- Collapse/expand section di editor
- Section visibility toggle (sembunyikan tanpa hapus)

### Kustomisasi Desain
- Pilih font dari 100+ Google Fonts
- Custom color palette
- Background: warna solid, gradien, gambar, video
- Border dan shadow kustomisasi
- Spacing (padding/margin) per section
- Animasi masuk (fade, slide, zoom, dll) per section
- Custom CSS untuk pengguna advanced
- Responsive breakpoint preview

### Media & Aset
- Upload foto (max sesuai paket)
- Upload video (max 50MB)
- Crop & resize foto langsung di editor
- Filter foto (brightness, contrast, dll)
- Library ikon SVG bawaan (500+ ikon)
- Stiker dan ilustrasi dekorasi
- Background music library (royalty-free)
- AI image enhancement

## 4.3 Fitur Dashboard Pengguna

### Manajemen Undangan
- Daftar semua undangan dengan status
- Duplikasi undangan (cloning)
- Arsip undangan lama
- Download laporan RSVP (Excel/PDF)
- Share link dengan UTM tracking
- QR code generator untuk undangan
- Password protection untuk undangan private
- Tanggal expired otomatis setelah hari H

### RSVP & Tamu
- Tambah/import daftar tamu (Excel/CSV)
- RSVP form kustom (field tambahan)
- Notifikasi RSVP masuk (email/WA)
- Filter tamu (hadir/tidak/belum konfirmasi)
- Kirim blast undangan via WhatsApp
- Kirim blast undangan via Email
- Cetak daftar tamu per meja (seating chart)
- Export QR code per tamu untuk check-in

### Analytics & Tracking
- Total kunjungan undangan
- Unique visitors
- Perangkat (HP vs Desktop vs Tablet)
- Sumber traffic (WhatsApp, Instagram, dll)
- Heatmap interaksi (klik section mana)
- Grafik kunjungan harian
- Total RSVP vs target tamu
- Status buka undangan per penerima

### Pengaturan Akun
- Profil pengguna
- Ganti password
- Notifikasi email preferences
- Billing & subscription management
- Invoice download
- API keys (Business plan)
- Sub-akun management (Business)
- Connected social accounts

## 4.4 Fitur Admin

- Dashboard overview (DAU, MAU, revenue, churn)
- User management (search, filter, ban, upgrade)
- Template management (publish, unpublish, kategorisasi)
- Marketplace approval queue
- Subscription management
- Transaction history & refund
- Support ticket system
- Announcement system (banner, email blast)
- Coupon & promo code generator
- Analytics platform-wide
- Audit log viewer
- API rate limit management
- CDN cache purge
- Email template editor
- SEO settings (meta, sitemap, robots)
- Blog/CMS management
- Feature flag system

## 4.5 Fitur Affiliate

- Dashboard affiliate dengan statistik real-time
- Link referral unik + custom UTM
- Laporan klik, registrasi, konversi
- Laporan komisi (pending, approved, paid)
- Withdrawal request (Bank/GoPay/OVO/Dana)
- Materi promosi siap download (banner, caption)
- Leaderboard top affiliate bulan ini
- Notifikasi komisi masuk
- History pembayaran

## 4.6 Fitur Reseller

- Dashboard reseller dengan overview client
- Manajemen client (tambah, hapus, upgrade)
- Beli kredit undangan (invoice/auto-debit)
- White-label branding (logo reseller pada undangan)
- Laporan penjualan dan keuntungan
- Harga jual ke client (bisa set sendiri)
- Sub-reseller (Agency plan)
- Support prioritas dari platform
- Training material & SOP PDF

## 4.7 Fitur AI

- AI Copywriting untuk semua section undangan
- AI Wedding Quotes generator
- AI warna palette berdasarkan foto/tema
- AI rekomendasi template berdasarkan preferensi
- AI rekomendasi musik berdasarkan tema
- AI SEO metadata generator
- AI enhancement foto (sharpen, denoise)
- AI background remover foto
- AI terjemahan undangan (ID/EN/daerah)
- AI proofread dan grammar check

---

# 5. ARSITEKTUR SISTEM

## 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN / WAF                     │
│         (DDoS Protection, SSL, Edge Cache, Rules)           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                  │
│              (Rate Limiting, Load Balancing)                │
└──────┬───────────────────────────────────────┬──────────────┘
       │                                       │
┌──────▼──────────────┐              ┌─────────▼───────────┐
│   Next.js Frontend  │              │   NestJS Backend API │
│   (SSR + CSR)       │              │   (REST + WebSocket) │
│   Port: 3000        │              │   Port: 4000         │
└─────────────────────┘              └──────────────────────┘
                                              │
              ┌───────────────────────────────┤
              │                               │
┌─────────────▼────┐              ┌───────────▼──────────┐
│   PostgreSQL      │              │    Redis Cluster     │
│   (Primary DB)    │              │ (Cache + Sessions    │
│   + Read Replica  │              │  + Queue + PubSub)   │
└──────────────────┘              └──────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│                   WORKER SERVICES                         │
│   Queue Worker (BullMQ) | Email Service | WA Service      │
│   AI Service | Analytics Processor | Cron Jobs            │
└──────────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│                EXTERNAL SERVICES                          │
│  Cloudflare R2 | Midtrans | Xendit | OpenAI | Resend     │
│  Fonnte/Wablas (WA) | Google OAuth | Sentry | PostHog    │
└──────────────────────────────────────────────────────────┘
```

## 5.2 Multi-Tenant Architecture

Platform ini menggunakan **Schema-based Multi-Tenancy** dengan satu database namun setiap data dilabeli dengan `tenantId` (userId atau resellerId). Arsitektur ini optimal untuk fase awal hingga 500k pengguna.

Pada skala enterprise, dapat migrasi ke **Database-per-Tenant** untuk reseller/white-label premium.

```
Pendekatan Multi-Tenant:
├── Semua pengguna di database yang sama
├── Row-level security dengan tenantId
├── Reseller memiliki namespace terpisah
├── White-label: subdomain kustom per reseller
└── Custom domain: mapping via Cloudflare Worker
```

**Isolasi Data:**
- Setiap query wajib menyertakan filter `userId` atau `tenantId`
- Middleware global memvalidasi ownership sebelum query
- Audit log mencatat semua aksi data-sensitif

## 5.3 Backend Service Structure

```
Backend Microservice-Ready Monolith (Modular Monolith):
├── Auth Service         → JWT, OAuth, refresh token
├── User Service         → profil, settings, billing
├── Invitation Service   → CRUD undangan, builder data
├── Template Service     → template management, marketplace
├── Media Service        → upload, resize, CDN sync
├── RSVP Service         → manajemen tamu, konfirmasi
├── Analytics Service    → tracking events, laporan
├── AI Service           → prompt management, OpenAI calls
├── Payment Service      → Midtrans/Xendit webhook
├── Notification Service → email, WhatsApp, push
├── Reseller Service     → kredit, client management
├── Affiliate Service    → tracking, komisi
└── Admin Service        → manajemen platform
```

Arsitektur ini dimulai sebagai monolith modular, mudah dipecah menjadi microservice saat traffic membutuhkan.

## 5.4 API Gateway

Nginx bertindak sebagai API Gateway dengan konfigurasi:

```nginx
# Rate limiting per IP
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

# Routing
location /api/v1/auth     → NestJS (rate: 10/min)
location /api/v1/public   → NestJS (rate: 200/min)
location /api/v1/         → NestJS (rate: 100/min)
location /                → Next.js (static/SSR)

# Headers keamanan
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: ...
```

## 5.5 CDN Strategy

**Cloudflare** digunakan sebagai CDN utama:

| Tipe Konten | Cache TTL | Strategi |
|-------------|-----------|----------|
| Gambar media (R2) | 365 hari | Immutable, hash di filename |
| Aset JS/CSS Next.js | 30 hari | Vercel-style hash |
| Halaman undangan (HTML) | 5 menit | Stale-while-revalidate |
| API response publik | 1 menit | Cache-Control + ETag |
| API response private | No-cache | Authorization header |

**Cloudflare R2** untuk penyimpanan media:
- Tidak ada biaya egress (bandwidth keluar gratis)
- Sama ekosistem dengan Cloudflare CDN
- S3-compatible API
- Lifecycle rules untuk arsip otomatis

## 5.6 Queue System (BullMQ + Redis)

```
Queue Architecture:
├── email-queue          → Kirim email (welcome, notif, blast)
├── whatsapp-queue       → Kirim pesan WA (undangan, notif)
├── media-queue          → Resize gambar, generate thumbnail
├── ai-queue             → OpenAI API calls (async)
├── analytics-queue      → Batch write analytics events
├── pdf-queue            → Generate PDF undangan
├── notification-queue   → Push notif, in-app notif
└── cleanup-queue        → Hapus file expired, arsip data
```

Setiap queue memiliki:
- Retry strategy (exponential backoff)
- Dead Letter Queue untuk job gagal
- Concurrency control per queue type
- Priority levels untuk job penting

## 5.7 Event-Driven Architecture

```
Event Bus (Redis PubSub / Internal EventEmitter):
├── user.registered      → kirim welcome email
├── user.upgraded        → buka fitur, kirim email konfirmasi
├── invitation.published → update sitemap, analytics
├── rsvp.submitted       → notif ke pemilik undangan
├── payment.success      → aktifkan subscription
├── payment.failed       → notif, retry billing
├── media.uploaded       → trigger resize job
└── affiliate.converted  → hitung dan catat komisi
```

## 5.8 Caching Strategy

**Layer 1 - Cloudflare Edge Cache:** HTML dan aset statis

**Layer 2 - Redis Cache:**
```
Cache Keys:
├── user:{userId}:profile          → TTL 1 jam
├── invitation:{slug}:public       → TTL 5 menit
├── templates:list:{page}          → TTL 10 menit
├── analytics:{invId}:summary      → TTL 1 jam
├── ai:quota:{userId}:{month}      → TTL 1 hari
└── subscription:{userId}:active   → TTL 5 menit
```

**Cache Invalidation:**
- Tag-based invalidation: semua cache terkait invitation di-invalidate saat edit
- Event-driven: setiap update data memicu invalidasi cache terkait

## 5.9 File Storage Strategy

```
Cloudflare R2 Bucket Structure:
├── /media/{userId}/{invitationId}/{filename}  → foto tamu
├── /templates/{templateId}/{asset}            → aset template
├── /system/fonts/                             → font custom
├── /system/music/                             → musik background
├── /exports/{userId}/{date}/{report}          → laporan export
└── /backups/{date}/                           → backup database
```

**Naming Convention:** `{uuid}-{timestamp}.{ext}` untuk mencegah konflik dan memudahkan CDN cache immutable.

## 5.10 Request Flow

```
Pengguna Mengakses Undangan (slug):
1. Browser → Cloudflare CDN
2. Cache HIT → Return HTML dari edge (< 50ms)
3. Cache MISS → Forward ke Nginx
4. Nginx → Next.js server
5. Next.js getServerSideProps → Redis (cache check)
6. Cache HIT → Return dari Redis
7. Cache MISS → NestJS API → PostgreSQL
8. Data dikembalikan → render HTML → kirim ke Cloudflare (cache) → browser
Total latency target: < 200ms untuk cache miss, < 50ms untuk cache hit
```

---

# 6. ARSITEKTUR DATABASE

## 6.1 Prisma Schema Lengkap

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm, uuid_ossp]
}

// ==========================================
// ENUMS
// ==========================================

enum UserRole {
  GUEST
  USER
  ADMIN
  SUPER_ADMIN
}

enum SubscriptionPlan {
  FREE
  STARTER
  PRO
  BUSINESS
  RESELLER_BASIC
  RESELLER_PRO
  RESELLER_AGENCY
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  EXPIRED
  CANCELLED
  PAST_DUE
}

enum InvitationType {
  WEDDING
  BIRTHDAY
  AQIQAH
  GRADUATION
  CORPORATE
  RELIGIOUS
  OTHER
}

enum InvitationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  EXPIRED
}

enum RSVPStatus {
  PENDING
  ATTENDING
  NOT_ATTENDING
  MAYBE
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  EXPIRED
}

enum PaymentMethod {
  CREDIT_CARD
  BANK_TRANSFER
  GOPAY
  OVO
  DANA
  SHOPEEPAY
  QRIS
  VIRTUAL_ACCOUNT
}

enum PaymentGateway {
  MIDTRANS
  XENDIT
}

enum AffiliateStatus {
  PENDING
  ACTIVE
  SUSPENDED
}

enum CommissionStatus {
  PENDING
  APPROVED
  PAID
  REJECTED
}

enum NotificationChannel {
  EMAIL
  WHATSAPP
  PUSH
  IN_APP
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
}

enum DomainStatus {
  PENDING_VERIFICATION
  ACTIVE
  FAILED
  EXPIRED
}

// ==========================================
// USER & AUTH
// ==========================================

model User {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String    @unique
  emailVerified     Boolean   @default(false)
  emailVerifiedAt   DateTime?
  phone             String?   @unique
  name              String
  avatar            String?
  password          String?   // null jika OAuth only
  role              UserRole  @default(USER)
  isActive          Boolean   @default(true)
  isBanned          Boolean   @default(false)
  bannedReason      String?
  bannedAt          DateTime?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // soft delete

  // Relations
  profile           UserProfile?
  subscription      Subscription?
  invitations       Invitation[]
  media             Media[]
  rsvps             RSVP[]
  transactions      Transaction[]
  notifications     NotificationLog[]
  auditLogs         AuditLog[]
  oauthAccounts     OAuthAccount[]
  apiKeys           ApiKey[]
  reseller          Reseller?
  affiliate         Affiliate?
  
  // Reseller client relation
  resellerClientId  String?   @db.Uuid
  resellerClient    ResellerClient? @relation(fields: [resellerClientId], references: [id])

  @@index([email])
  @@index([role])
  @@index([createdAt])
  @@index([isActive, isBanned])
  @@map("users")
}

model UserProfile {
  id            String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String  @unique @db.Uuid
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  city          String?
  province      String?
  country       String  @default("ID")
  timezone      String  @default("Asia/Jakarta")
  language      String  @default("id")
  bio           String?
  website       String?
  instagram     String?
  whatsapp      String?
  
  // Preferences
  emailNotifications Boolean @default(true)
  whatsappNotifications Boolean @default(true)
  marketingEmails   Boolean @default(false)
  
  @@map("user_profiles")
}

model OAuthAccount {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @db.Uuid
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider      String   // "google", "facebook"
  providerAccountId String
  accessToken   String?
  refreshToken  String?
  expiresAt     DateTime?
  createdAt     DateTime @default(now())

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("oauth_accounts")
}

model ApiKey {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  key         String   @unique  // hashed
  prefix      String   // first 8 chars for display
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  scopes      String[] // ["read:invitations", "write:rsvp"]
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([key])
  @@map("api_keys")
}

// ==========================================
// SUBSCRIPTION & BILLING
// ==========================================

model Subscription {
  id                String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String             @unique @db.Uuid
  user              User               @relation(fields: [userId], references: [id])
  plan              SubscriptionPlan   @default(FREE)
  status            SubscriptionStatus @default(ACTIVE)
  
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  trialEnd           DateTime?
  cancelledAt        DateTime?
  cancelReason       String?
  
  // Usage tracking
  invitationsUsed   Int @default(0)
  invitationsLimit  Int @default(1)
  aiCreditsUsed     Int @default(0)
  aiCreditsLimit    Int @default(3)
  storageUsedMb     Int @default(0)
  storageLimitMb    Int @default(100)
  
  // External billing
  gatewayCustomerId  String?  // Midtrans/Xendit customer ID
  gatewaySubId       String?  // External subscription ID
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  transactions Transaction[]
  
  @@index([status, currentPeriodEnd])
  @@index([plan])
  @@map("subscriptions")
}

model Transaction {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String            @db.Uuid
  user            User              @relation(fields: [userId], references: [id])
  subscriptionId  String?           @db.Uuid
  subscription    Subscription?     @relation(fields: [subscriptionId], references: [id])
  
  amount          Int               // dalam Rupiah
  currency        String            @default("IDR")
  plan            SubscriptionPlan
  billingPeriod   Int               // jumlah bulan
  
  status          TransactionStatus @default(PENDING)
  paymentMethod   PaymentMethod?
  gateway         PaymentGateway
  
  // Gateway data
  gatewayOrderId  String    @unique
  gatewayPaymentId String?
  gatewayResponse Json?
  
  // Affiliate/Reseller tracking
  affiliateCode   String?
  resellerId      String?   @db.Uuid
  commissionAmount Int?     // komisi dalam Rupiah
  
  paidAt     DateTime?
  expiredAt  DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  commissions Commission[]

  @@index([userId])
  @@index([status])
  @@index([gatewayOrderId])
  @@index([createdAt])
  @@map("transactions")
}

// ==========================================
// TEMPLATES
// ==========================================

model Template {
  id              String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  slug            String           @unique
  name            String
  description     String?
  type            InvitationType
  
  // Creator
  creatorId       String?          @db.Uuid   // null = official template
  isOfficial      Boolean          @default(false)
  isPublished     Boolean          @default(false)
  isPremium       Boolean          @default(false)
  price           Int              @default(0) // Harga template marketplace
  
  // Design
  thumbnail       String           // URL thumbnail
  previewUrl      String?          // URL demo undangan
  colorPalette    String[]         // warna utama template
  tags            String[]
  categories      String[]
  
  // Data
  config          Json             // konfigurasi layout, section defaults
  defaultSections Json[]           // struktur section default
  
  // Stats
  usedCount       Int @default(0)
  likeCount       Int @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  invitations     Invitation[]
  templateSales   TemplateSale[]

  @@index([type, isPublished])
  @@index([isPremium])
  @@index([slug])
  @@index([tags])
  @@map("templates")
}

model TemplateSale {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  templateId  String   @db.Uuid
  template    Template @relation(fields: [templateId], references: [id])
  userId      String   @db.Uuid
  amount      Int
  commission  Int      // komisi ke creator
  createdAt   DateTime @default(now())

  @@index([templateId])
  @@index([userId])
  @@map("template_sales")
}

// ==========================================
// INVITATIONS
// ==========================================

model Invitation {
  id          String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String           @db.Uuid
  user        User             @relation(fields: [userId], references: [id])
  templateId  String?          @db.Uuid
  template    Template?        @relation(fields: [templateId], references: [id])
  
  slug        String           @unique  // URL: undangan.app/{slug}
  title       String
  type        InvitationType
  status      InvitationStatus @default(DRAFT)
  
  // Couple/Event info
  coupleNameA  String?         // nama mempelai/pemilik
  coupleNameB  String?         // nama pasangan (untuk wedding)
  eventDate    DateTime?
  eventEndDate DateTime?
  
  // Config
  config       Json            // warna, font, musik, dll
  sections     Json[]          // array section data dengan konten
  
  // Settings
  isPasswordProtected Boolean @default(false)
  password     String?
  hasWatermark Boolean         @default(true)
  isIndexed    Boolean         @default(true)  // apakah diindex mesin pencari
  customDomain String?         // custom domain yang terhubung
  
  // SEO
  metaTitle    String?
  metaDescription String?
  ogImage      String?
  
  // Stats
  viewCount    Int @default(0)
  uniqueViewCount Int @default(0)
  shareCount   Int @default(0)
  
  publishedAt  DateTime?
  expiredAt    DateTime?       // auto-expire setelah hari H + 30 hari
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
  
  // Relations
  guests       Guest[]
  rsvps        RSVP[]
  analyticsEvents AnalyticsEvent[]
  media        Media[]
  guestbook    GuestbookEntry[]
  domain       CustomDomain?

  @@index([userId])
  @@index([slug])
  @@index([status])
  @@index([type])
  @@index([eventDate])
  @@map("invitations")
}

model Section {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String   @db.Uuid
  // Note: sections disimpan sebagai JSON dalam invitation.sections untuk performa
  // Model ini untuk tracking history section tertentu jika diperlukan
  type         String
  order        Int
  config       Json
  content      Json
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([invitationId])
  @@map("sections")
}

// ==========================================
// GUESTS & RSVP
// ==========================================

model Guest {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String     @db.Uuid
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  
  name         String
  phone        String?
  email        String?
  table        String?    // nomor/nama meja
  group        String?    // kategori undangan (keluarga, teman, dll)
  notes        String?
  
  // Tracking
  qrCode       String     @unique  // untuk check-in
  isWhatsappSent Boolean  @default(false)
  isEmailSent  Boolean    @default(false)
  openedAt     DateTime?  // kapan undangan pertama kali dibuka
  
  rsvp         RSVP?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([invitationId])
  @@index([qrCode])
  @@map("guests")
}

model RSVP {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String     @db.Uuid
  invitation   Invitation @relation(fields: [invitationId], references: [id])
  guestId      String?    @unique @db.Uuid
  guest        Guest?     @relation(fields: [guestId], references: [id])
  userId       String?    @db.Uuid
  user         User?      @relation(fields: [userId], references: [id])
  
  // Response
  name         String
  email        String?
  phone        String?
  status       RSVPStatus
  attendeeCount Int       @default(1)
  message      String?    // ucapan/pesan
  
  // Custom fields (dari invitation config)
  customFields Json?
  
  // Metadata
  ipAddress    String?
  userAgent    String?
  submittedAt  DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([invitationId, status])
  @@index([guestId])
  @@map("rsvps")
}

model GuestbookEntry {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String     @db.Uuid
  invitation   Invitation @relation(fields: [invitationId], references: [id])
  
  name         String
  message      String
  isApproved   Boolean    @default(false) // moderasi
  ipAddress    String?
  createdAt    DateTime   @default(now())

  @@index([invitationId, isApproved])
  @@map("guestbook_entries")
}

// ==========================================
// MEDIA
// ==========================================

model Media {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String     @db.Uuid
  user         User       @relation(fields: [userId], references: [id])
  invitationId String?    @db.Uuid
  invitation   Invitation? @relation(fields: [invitationId], references: [id])
  
  type         MediaType
  filename     String     // original filename
  storedName   String     // stored filename (uuid-based)
  url          String     // CDN URL
  thumbnailUrl String?
  mimeType     String
  sizeBytes    Int
  width        Int?
  height       Int?
  duration     Int?       // untuk video/audio (detik)
  
  // AI Enhancement
  isEnhanced   Boolean    @default(false)
  enhancedUrl  String?
  
  createdAt    DateTime   @default(now())

  @@index([userId])
  @@index([invitationId])
  @@map("media")
}

// ==========================================
// ANALYTICS
// ==========================================

model AnalyticsEvent {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String     @db.Uuid
  invitation   Invitation @relation(fields: [invitationId], references: [id])
  
  eventType    String     // page_view, section_view, rsvp_click, share_click
  sessionId    String
  visitorId    String     // fingerprint (anonymous)
  
  // Context
  referrer     String?
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  
  // Device
  device       String?    // mobile, desktop, tablet
  os           String?
  browser      String?
  country      String?
  city         String?
  
  // Section tracking
  sectionType  String?
  sectionId    String?
  
  createdAt    DateTime   @default(now())

  @@index([invitationId, createdAt])
  @@index([visitorId])
  @@index([eventType])
  @@map("analytics_events")
}

model AnalyticsSummary {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitationId String   @db.Uuid
  date         DateTime @db.Date
  
  totalViews      Int @default(0)
  uniqueViews     Int @default(0)
  mobileViews     Int @default(0)
  desktopViews    Int @default(0)
  rsvpClicks      Int @default(0)
  shareClicks     Int @default(0)
  
  // Agregasi harian (dibuat oleh cron job)
  @@unique([invitationId, date])
  @@index([invitationId])
  @@map("analytics_summaries")
}

// ==========================================
// DOMAINS
// ==========================================

model CustomDomain {
  id           String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String       @db.Uuid
  invitationId String       @unique @db.Uuid
  invitation   Invitation   @relation(fields: [invitationId], references: [id])
  
  domain       String       @unique
  status       DomainStatus @default(PENDING_VERIFICATION)
  
  // Verification
  verificationToken String
  verifiedAt   DateTime?
  
  // Cloudflare
  cfRecordId   String?
  cfZoneId     String?
  
  sslStatus    String?      // active, pending, error
  sslExpiresAt DateTime?
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([domain])
  @@index([userId])
  @@map("custom_domains")
}

// ==========================================
// RESELLER
// ==========================================

model Reseller {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @unique @db.Uuid
  user            User     @relation(fields: [userId], references: [id])
  
  businessName    String
  businessType    String?  // wedding organizer, freelancer, agency
  npwp            String?
  bankName        String?
  bankAccount     String?
  bankAccountName String?
  
  // Kredit sistem
  creditBalance   Int      @default(0)   // kredit undangan tersisa
  totalCreditBought Int    @default(0)
  
  // Branding
  logoUrl         String?
  brandName       String?
  subdomain       String?  @unique       // reseller.undanganku.id
  
  isActive        Boolean  @default(true)
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  clients         ResellerClient[]
  creditLogs      ResellerCreditLog[]

  @@map("resellers")
}

model ResellerClient {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  resellerId  String   @db.Uuid
  reseller    Reseller @relation(fields: [resellerId], references: [id])
  
  users       User[]
  
  // Client info
  clientName  String
  clientEmail String
  clientPhone String?
  notes       String?
  
  // Paket yang dibeli reseller untuk client ini
  plan        SubscriptionPlan
  isActive    Boolean @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([resellerId])
  @@map("reseller_clients")
}

model ResellerCreditLog {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  resellerId  String   @db.Uuid
  reseller    Reseller @relation(fields: [resellerId], references: [id])
  
  type        String   // "purchase", "use", "refund", "bonus"
  amount      Int      // positif = tambah, negatif = kurang
  balance     Int      // saldo setelah transaksi
  description String?
  refId       String?  // reference ID (transaction, invitation)
  
  createdAt   DateTime @default(now())

  @@index([resellerId])
  @@map("reseller_credit_logs")
}

// ==========================================
// AFFILIATE
// ==========================================

model Affiliate {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String          @unique @db.Uuid
  user            User            @relation(fields: [userId], references: [id])
  
  code            String          @unique  // kode referral unik
  status          AffiliateStatus @default(PENDING)
  
  commissionRate  Float           @default(0.20)  // 20%
  
  // Bank info untuk pembayaran
  bankName        String?
  bankAccount     String?
  bankAccountName String?
  
  // Stats
  totalClicks     Int @default(0)
  totalSignups    Int @default(0)
  totalConversions Int @default(0)
  totalEarned     Int @default(0)   // total komisi dalam Rupiah
  totalPaid       Int @default(0)
  pendingBalance  Int @default(0)   // belum dibayarkan
  
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  referrals       AffiliateReferral[]
  commissions     Commission[]

  @@index([code])
  @@map("affiliates")
}

model AffiliateReferral {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  affiliateId   String    @db.Uuid
  affiliate     Affiliate @relation(fields: [affiliateId], references: [id])
  
  referredUserId String   @db.Uuid
  
  clickedAt     DateTime
  signedUpAt    DateTime?
  convertedAt   DateTime?  // saat bayar pertama kali
  
  @@index([affiliateId])
  @@index([referredUserId])
  @@map("affiliate_referrals")
}

model Commission {
  id            String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  affiliateId   String           @db.Uuid
  affiliate     Affiliate        @relation(fields: [affiliateId], references: [id])
  transactionId String           @db.Uuid
  transaction   Transaction      @relation(fields: [transactionId], references: [id])
  
  amount        Int              // komisi dalam Rupiah
  rate          Float
  status        CommissionStatus @default(PENDING)
  
  approvedAt    DateTime?
  paidAt        DateTime?
  paidReference String?
  
  createdAt     DateTime @default(now())

  @@index([affiliateId, status])
  @@map("commissions")
}

// ==========================================
// NOTIFICATIONS
// ==========================================

model NotificationLog {
  id           String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String              @db.Uuid
  user         User                @relation(fields: [userId], references: [id])
  
  channel      NotificationChannel
  type         String              // welcome, rsvp_received, payment_success, dll
  subject      String?
  body         String
  recipient    String              // email/phone/pushToken
  
  isDelivered  Boolean @default(false)
  deliveredAt  DateTime?
  errorMessage String?
  
  metadata     Json?
  
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([channel, type])
  @@index([createdAt])
  @@map("notification_logs")
}

// ==========================================
// AUDIT LOG
// ==========================================

model AuditLog {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String?  @db.Uuid
  user       User?    @relation(fields: [userId], references: [id])
  
  action     String   // "invitation.create", "user.ban", "payment.refund"
  resource   String   // nama entitas
  resourceId String?
  
  oldValue   Json?
  newValue   Json?
  
  ipAddress  String?
  userAgent  String?
  
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([resource, resourceId])
  @@index([createdAt])
  @@map("audit_logs")
}

// ==========================================
// SYSTEM
// ==========================================

model Coupon {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code            String   @unique
  description     String?
  
  discountType    String   // "percentage" atau "fixed"
  discountValue   Int      // persen atau rupiah
  maxDiscount     Int?     // maksimal diskon untuk percentage
  
  applicablePlans SubscriptionPlan[]
  
  usageLimit      Int?     // null = unlimited
  usedCount       Int      @default(0)
  
  startAt         DateTime?
  expiredAt       DateTime?
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())

  @@index([code])
  @@map("coupons")
}

model SystemSetting {
  key         String   @id
  value       String
  description String?
  updatedAt   DateTime @updatedAt

  @@map("system_settings")
}
```

## 6.2 Strategi Index & Optimasi

```sql
-- Index untuk query undangan publik (paling sering diakses)
CREATE INDEX CONCURRENTLY idx_invitations_slug_status 
  ON invitations(slug, status) WHERE status = 'PUBLISHED';

-- Index untuk analytics time-series
CREATE INDEX CONCURRENTLY idx_analytics_events_inv_date 
  ON analytics_events(invitation_id, created_at DESC);

-- Full text search untuk template
CREATE INDEX CONCURRENTLY idx_templates_fts 
  ON templates USING gin(to_tsvector('indonesian', name || ' ' || coalesce(description, '')));

-- Index partial untuk user aktif
CREATE INDEX CONCURRENTLY idx_users_active 
  ON users(email) WHERE is_active = true AND is_banned = false;

-- Index untuk subscription expiry checks (cron job)
CREATE INDEX CONCURRENTLY idx_subscriptions_expiry 
  ON subscriptions(current_period_end) WHERE status = 'ACTIVE';
```

## 6.3 Partisi Database untuk Skalabilitas

```sql
-- Partisi analytics_events per bulan (setelah skala besar)
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Auto-archive undangan expired ke tabel terpisah
-- Gunakan pg_cron untuk move data > 2 tahun ke cold storage
```

---

# 7. SISTEM INVITATION BUILDER

## 7.1 Arsitektur Builder

Builder menggunakan pendekatan **Section-based Block Editor** yang mirip Notion namun dioptimalkan untuk undangan digital.

```
Builder State Architecture:
├── InvitationState
│   ├── metadata (judul, slug, type)
│   ├── config (tema, font, warna, musik)
│   ├── sections[]
│   │   ├── id (uuid)
│   │   ├── type (hero, gallery, rsvp, map, dll)
│   │   ├── order (integer untuk sorting)
│   │   ├── isVisible (boolean)
│   │   ├── content (konten spesifik per type)
│   │   └── style (override style per section)
│   └── isDirty (ada perubahan belum disimpan)
```

## 7.2 Section Types & Component

| Section Type | Konten | Kustomisasi |
|---|---|---|
| `hero` | Nama, foto utama, ucapan pembuka | Layout, foto, animasi, overlay |
| `couple_info` | Profil A & B, foto, nama orang tua | Layout 2-kolom, foto bulat/kotak |
| `event_info` | Tanggal, waktu, venue, Google Maps | Ikon, warna card, countdown |
| `countdown` | Timer real-time menuju hari H | Style digital/analog, warna |
| `gallery` | Grid/carousel foto | Layout, jumlah kolom, gap |
| `video` | YouTube/Vimeo embed | Autoplay, mute, thumbnail |
| `rsvp` | Form konfirmasi kehadiran | Field custom, warna tombol |
| `guestbook` | Kolom pesan tamu | Moderasi, tampilan feed |
| `gift` | Info rekening bank/wishlist | Jumlah rekening, QR code |
| `story` | Timeline cerita pasangan | Style horizontal/vertikal |
| `music` | Background music player | Auto-play, floating player |
| `map` | Google Maps embed | Zoom level, marker custom |
| `livestream` | YouTube/Zoom embed | Thumbnail, jadwal |
| `protokol` | Protokol kesehatan | Ikon, teks |
| `closing` | Penutup, tanda tangan | Font kaligrafi, teks |

## 7.3 Dynamic Component Rendering

```typescript
// Frontend: Section renderer dinamis
const SectionRenderer = ({ section }: { section: SectionData }) => {
  const componentMap: Record<string, React.ComponentType> = {
    hero: HeroSection,
    couple_info: CoupleInfoSection,
    event_info: EventInfoSection,
    countdown: CountdownSection,
    gallery: GallerySection,
    rsvp: RSVPSection,
    guestbook: GuestbookSection,
    gift: GiftSection,
    story: StorySection,
    music: MusicSection,
    map: MapSection,
    closing: ClosingSection,
  };

  const Component = componentMap[section.type];
  if (!Component) return null;
  
  return (
    <AnimateSection animation={section.style?.animation}>
      <Component 
        content={section.content} 
        style={section.style}
        isEditing={useBuilderStore(s => s.isEditing)}
      />
    </AnimateSection>
  );
};
```

## 7.4 Animation Engine

Menggunakan **Framer Motion** dengan preset animasi:

```typescript
const animationPresets = {
  fade: { 
    initial: { opacity: 0 }, 
    animate: { opacity: 1 },
    transition: { duration: 0.8 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  slideLeft: { /* ... */ },
  zoom: { /* ... */ },
  bounce: { /* ... */ },
  none: { /* no animation */ }
};

// IntersectionObserver untuk trigger animasi saat scroll
const AnimateSection = ({ children, animation = 'fade' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      variants={animationPresets[animation]}
      initial="initial"
      animate={inView ? "animate" : "initial"}
    >
      {children}
    </motion.div>
  );
};
```

## 7.5 Theme Engine

```typescript
// CSS Variables sebagai theme tokens
const applyTheme = (config: InvitationConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-secondary', config.secondaryColor);
  root.style.setProperty('--color-accent', config.accentColor);
  root.style.setProperty('--color-bg', config.backgroundColor);
  root.style.setProperty('--color-text', config.textColor);
  root.style.setProperty('--font-primary', config.primaryFont);
  root.style.setProperty('--font-secondary', config.secondaryFont);
  root.style.setProperty('--border-radius', config.borderRadius + 'px');
};
```

## 7.6 Auto-Save System

```typescript
// Debounced auto-save ke API
const useAutoSave = (invitationId: string) => {
  const state = useBuilderStore();
  
  const debouncedSave = useDebouncedCallback(async () => {
    if (!state.isDirty) return;
    await saveInvitation(invitationId, state);
    state.setIsDirty(false);
    toast.success("Tersimpan otomatis");
  }, 3000); // save setelah 3 detik tidak ada perubahan
  
  useEffect(() => {
    if (state.isDirty) debouncedSave();
  }, [state.sections, state.config]);
};
```

## 7.7 Mobile Optimization

- Builder preview toggle: Desktop / Tablet / Mobile
- Section yang responsif: flex-direction berubah di mobile
- Touch-friendly drag handle untuk reorder section di mobile
- Font size scaling otomatis untuk small screen
- Lazy loading gambar di undangan final
- WebP format otomatis untuk gambar

---

# 8. SISTEM AI

## 8.1 Arsitektur AI

```
AI System Architecture:
├── AI Gateway (custom middleware)
│   ├── Rate limiting per user/plan
│   ├── Quota tracking (Redis)
│   ├── Prompt caching (Redis)
│   ├── Fallback handling
│   └── Token counting
│
├── AI Services
│   ├── CopywritingService
│   ├── QuoteGeneratorService
│   ├── ThemeRecommendationService
│   ├── ColorPaletteService
│   ├── MusicRecommendationService
│   ├── SEOMetaService
│   └── ImageEnhancementService
│
└── Providers
    ├── OpenAI (GPT-4o untuk teks)
    ├── Replicate (image enhancement)
    └── Local fallback (template-based untuk quota habis)
```

## 8.2 Prompt Architecture

### AI Copywriting Undangan

```typescript
const generateCopywriting = async (data: InvitationData) => {
  const systemPrompt = `
Kamu adalah penulis undangan profesional Indonesia dengan pengalaman 15 tahun.
Tugas kamu adalah menulis teks undangan yang elegan, hangat, dan sesuai budaya Indonesia.
Selalu tulis dalam Bahasa Indonesia yang baik dan benar.
Gunakan nada yang sesuai dengan jenis acara: ${data.type}.
Hasil harus dalam format JSON yang valid.
`;

  const userPrompt = `
Buat teks undangan dengan detail berikut:
- Jenis: ${data.type} (${typeLabels[data.type]})
- Nama: ${data.names}
- Tanggal: ${data.eventDate}
- Lokasi: ${data.venue}
- Tema: ${data.theme || 'umum'}
- Tone: ${data.tone || 'formal dan hangat'}

Hasilkan:
{
  "opening": "kalimat pembuka undangan",
  "body": "isi utama undangan",
  "closing": "kalimat penutup",
  "quotes": ["quote 1", "quote 2", "quote 3"],
  "hashtag": "#hashtag_untuk_media_sosial"
}
`;

  // Cek cache dulu
  const cacheKey = `ai:copy:${hashData(data)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",  // lebih murah untuk copywriting standar
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content);
  
  // Cache hasil 24 jam
  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  
  return result;
};
```

### AI Color Palette Generator

```typescript
const generateColorPalette = async (theme: string, type: InvitationType) => {
  const prompt = `
Buat palet warna undangan digital Indonesia untuk:
- Tema: ${theme}
- Jenis: ${type}

Berikan 5 palet warna berbeda dalam format JSON:
{
  "palettes": [
    {
      "name": "nama palet",
      "primary": "#hexcode",
      "secondary": "#hexcode", 
      "accent": "#hexcode",
      "background": "#hexcode",
      "text": "#hexcode",
      "description": "deskripsi singkat nuansa"
    }
  ]
}

Pastikan kontras warna cukup untuk keterbacaan (WCAG AA minimum).
`;
  // ... similar implementation
};
```

## 8.3 Token Optimization

| Model | Use Case | Est. Token/Request | Biaya/Request |
|-------|----------|-------------------|---------------|
| gpt-4o-mini | Copywriting standard | ~600 token | Rp 0,12 |
| gpt-4o | Copywriting premium, complex | ~800 token | Rp 1,20 |
| gpt-4o-mini | Color palette, SEO meta | ~400 token | Rp 0,08 |
| DALL-E 3 | Tidak digunakan (pakai R2 assets) | - | - |
| Replicate | Image enhancement | Per run | Rp 0,50 |

**Strategi penghematan token:**
1. Gunakan gpt-4o-mini untuk 90% request
2. Cache response AI selama 24 jam (jika input sama)
3. Batasi max_tokens sesuai kebutuhan per feature
4. Gunakan JSON response_format (lebih efisien)
5. Batch request jika memungkinkan (multiple quotes sekaligus)

## 8.4 Quota & Rate Limiting AI

```typescript
// Cek quota AI sebelum eksekusi
const checkAIQuota = async (userId: string, plan: SubscriptionPlan) => {
  const quotaLimits = {
    FREE: 3,
    STARTER: 10,
    PRO: 50,
    BUSINESS: 999999, // unlimited
  };
  
  const monthKey = format(new Date(), 'yyyy-MM');
  const redisKey = `ai:quota:${userId}:${monthKey}`;
  
  const current = await redis.incr(redisKey);
  if (current === 1) {
    await redis.expire(redisKey, 60 * 60 * 24 * 32); // 32 hari
  }
  
  const limit = quotaLimits[plan];
  if (current > limit) {
    throw new QuotaExceededException(`Kuota AI bulan ini sudah habis (${limit}x)`);
  }
  
  return { used: current, limit };
};
```

---

# 9. ARSITEKTUR FRONTEND

## 9.1 Struktur Folder Next.js

```
frontend/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route group publik
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── templates/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── i/[slug]/page.tsx     # Halaman undangan publik
│   │
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (dashboard)/              # Dashboard pengguna (protected)
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── dashboard/page.tsx    # Overview
│   │   ├── invitations/
│   │   │   ├── page.tsx          # List undangan
│   │   │   ├── new/page.tsx      # Buat undangan baru
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx # Builder
│   │   │       ├── guests/page.tsx
│   │   │       ├── rsvp/page.tsx
│   │   │       └── analytics/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── affiliate/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (admin)/                  # Admin panel (protected)
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx
│   │   ├── admin/users/page.tsx
│   │   └── admin/templates/page.tsx
│   │
│   ├── api/                      # API routes (minimal, mostly proxy)
│   ├── layout.tsx                # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── sections/                 # Section components untuk builder
│   │   ├── HeroSection.tsx
│   │   ├── GallerySection.tsx
│   │   └── ...
│   ├── builder/                  # Builder-specific components
│   │   ├── BuilderCanvas.tsx
│   │   ├── SectionPanel.tsx
│   │   ├── StylePanel.tsx
│   │   └── PreviewToggle.tsx
│   ├── dashboard/                # Dashboard components
│   └── shared/                   # Shared components
│
├── lib/
│   ├── api/                      # API client (axios/fetch wrappers)
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   │   ├── builderStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils/                    # Utility functions
│   └── validations/              # Zod schemas
│
├── public/
│   ├── fonts/                    # Local fonts
│   ├── images/                   # Static images
│   └── icons/
│
└── config/
    ├── site.ts                   # Site config (name, URL, etc)
    └── plans.ts                  # Subscription plan config
```

## 9.2 State Management

**Zustand** untuk state global:

```typescript
// stores/builderStore.ts
interface BuilderState {
  invitation: InvitationData | null;
  sections: SectionData[];
  selectedSectionId: string | null;
  isDirty: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  
  // Actions
  setSection: (sectionId: string, data: Partial<SectionData>) => void;
  addSection: (type: SectionType, position?: number) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateConfig: (config: Partial<InvitationConfig>) => void;
  setDirty: (isDirty: boolean) => void;
}

const useBuilderStore = create<BuilderState>()(
  immer((set) => ({
    // ... implementasi
  }))
);
```

**TanStack Query (React Query)** untuk server state:

```typescript
// hooks/useInvitation.ts
export const useInvitation = (id: string) => {
  return useQuery({
    queryKey: ['invitation', id],
    queryFn: () => api.invitations.getById(id),
    staleTime: 30 * 1000, // 30 detik
  });
};

export const useUpdateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.invitations.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitation', data.id] });
    },
  });
};
```

## 9.3 SSR vs CSR Strategy

| Halaman | Strategi | Alasan |
|---------|----------|--------|
| Landing page | SSG (Static) | Performa maksimal, SEO |
| Halaman undangan publik | SSR (Server-side) | SEO kritis, OG image dinamis |
| Dashboard | CSR (Client) | Data privat, tidak perlu SEO |
| Builder | CSR (Client) | Interaktif, real-time state |
| Blog | SSG + ISR | SEO, update tanpa redeploy |
| Template gallery | SSR + ISR | SEO + data berubah |
| Admin panel | CSR (Client) | Data privat |

## 9.4 SEO Optimization

```typescript
// app/i/[slug]/page.tsx - Halaman undangan dengan metadata dinamis
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const invitation = await getInvitation(params.slug);
  
  return {
    title: invitation.metaTitle || `Undangan ${invitation.title}`,
    description: invitation.metaDescription || `Anda diundang ke ${invitation.title}`,
    openGraph: {
      title: invitation.title,
      description: invitation.metaDescription,
      images: [{ url: invitation.ogImage || invitation.coverImage }],
      type: 'website',
    },
    other: {
      'og:type': 'event',
    }
  };
}
```

## 9.5 Performance Optimization

- **Image optimization:** Next.js Image component + WebP + blur placeholder
- **Font loading:** `next/font` dengan `display: swap` dan font lokal subset
- **Code splitting:** Dynamic import untuk builder (heavy), section components
- **Bundle analysis:** `@next/bundle-analyzer` untuk monitoring ukuran bundle
- **Prefetching:** Link prefetch untuk halaman yang kemungkinan dikunjungi
- **Virtual list:** React Virtual untuk daftar tamu panjang

---

# 10. ARSITEKTUR BACKEND

## 10.1 Struktur Modul NestJS

```
backend/src/
├── main.ts
├── app.module.ts
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── jwt.config.ts
│
├── common/
│   ├── decorators/           # Custom decorators (@CurrentUser, @Roles)
│   ├── filters/              # Exception filters
│   ├── guards/               # Auth, Role, Subscription guards
│   ├── interceptors/         # Logging, transform response
│   ├── pipes/                # Validation pipe (class-validator + Zod)
│   └── middleware/           # Tenant context, request logging
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/       # JWT, Google OAuth strategies
│   │   └── dto/
│   │
│   ├── users/
│   ├── invitations/
│   ├── templates/
│   ├── media/
│   ├── rsvp/
│   ├── guests/
│   ├── analytics/
│   ├── ai/
│   ├── payments/
│   │   ├── payment.module.ts
│   │   ├── payment.service.ts
│   │   ├── midtrans.service.ts
│   │   ├── xendit.service.ts
│   │   └── webhook.controller.ts
│   │
│   ├── notifications/
│   │   ├── email/            # Resend/Nodemailer
│   │   └── whatsapp/         # Fonnte/Wablas integration
│   │
│   ├── subscriptions/
│   ├── affiliates/
│   ├── resellers/
│   ├── domains/
│   └── admin/
│
├── database/
│   ├── prisma.service.ts
│   └── migrations/
│
├── queue/
│   ├── queue.module.ts
│   ├── processors/           # BullMQ job processors
│   └── producers/            # Job producers
│
└── events/
    ├── events.module.ts
    └── handlers/             # Domain event handlers
```

## 10.2 Clean Architecture & Repository Pattern

```typescript
// Repository pattern dengan Prisma
// modules/invitations/invitation.repository.ts
@Injectable()
export class InvitationRepository {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        user: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
      },
    });
  }

  async findByUserId(userId: string, opts: PaginationOptions) {
    return this.prisma.invitation.findMany({
      where: { userId, deletedAt: null },
      skip: opts.skip,
      take: opts.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateInvitationDto, userId: string) {
    return this.prisma.invitation.create({
      data: { ...data, userId },
    });
  }
}

// Service layer
@Injectable()
export class InvitationService {
  constructor(
    private repo: InvitationRepository,
    private subscriptionService: SubscriptionService,
    private eventBus: EventBus,
    private cacheService: CacheService,
  ) {}

  async create(dto: CreateInvitationDto, userId: string) {
    // 1. Cek kuota subscription
    await this.subscriptionService.checkInvitationQuota(userId);
    
    // 2. Generate slug unik
    const slug = await this.generateUniqueSlug(dto.title);
    
    // 3. Buat undangan
    const invitation = await this.repo.create({ ...dto, slug }, userId);
    
    // 4. Emit event
    this.eventBus.emit('invitation.created', { invitationId: invitation.id, userId });
    
    // 5. Update usage count
    await this.subscriptionService.incrementInvitationUsage(userId);
    
    return invitation;
  }
}
```

## 10.3 Queue Jobs (BullMQ)

```typescript
// queue/processors/email.processor.ts
@Processor('email-queue')
export class EmailProcessor {
  @Process('send-welcome')
  async sendWelcomeEmail(job: Job<{ userId: string }>) {
    const user = await this.userService.findById(job.data.userId);
    await this.emailService.send({
      to: user.email,
      template: 'welcome',
      data: { name: user.name }
    });
  }

  @Process('send-rsvp-notification')
  async sendRSVPNotification(job: Job<{ rsvpId: string }>) {
    // Notifikasi ke pemilik undangan saat ada RSVP masuk
  }
}

// queue/processors/media.processor.ts
@Processor('media-queue')
export class MediaProcessor {
  @Process('resize-image')
  async resizeImage(job: Job<{ mediaId: string; sizes: ImageSize[] }>) {
    // Resize dan upload ke R2 untuk berbagai ukuran
  }
}
```

## 10.4 Cron Jobs

```typescript
@Injectable()
export class ScheduledTasks {
  // Setiap jam: cek subscription expired
  @Cron('0 * * * *')
  async checkExpiredSubscriptions() { }

  // Setiap hari jam 3 pagi: agregasi analytics
  @Cron('0 3 * * *')
  async aggregateAnalytics() { }

  // Setiap hari jam 2 pagi: expire undangan lewat hari H + 30
  @Cron('0 2 * * *')
  async expireOldInvitations() { }

  // Setiap Senin: proses pembayaran komisi affiliate
  @Cron('0 10 * * MON')
  async processAffiliateCommissions() { }

  // Setiap jam: cleanup file orphan di R2
  @Cron('0 4 * * *')
  async cleanupOrphanMedia() { }
}
```

## 10.5 Logging & Monitoring

```typescript
// Gunakan Pino untuk structured logging
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Setiap request log:
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "url": "/api/v1/invitations",
  "userId": "uuid",
  "duration": 45,
  "statusCode": 201,
  "requestId": "uuid"
}
```

---

# 11. SISTEM SUBSCRIPTION

## 11.1 Feature Gating

```typescript
// guards/subscription.guard.ts
@Injectable()
export class FeatureGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredFeature = this.reflector.get('feature', context.getHandler());
    
    const subscription = await this.subscriptionService.getActive(user.id);
    const hasFeature = PLAN_FEATURES[subscription.plan].includes(requiredFeature);
    
    if (!hasFeature) {
      throw new ForbiddenException({
        code: 'FEATURE_LOCKED',
        message: 'Upgrade plan Anda untuk mengakses fitur ini',
        requiredPlan: this.getMinPlanForFeature(requiredFeature),
      });
    }
    
    return true;
  }
}

// Konfigurasi fitur per plan
const PLAN_FEATURES = {
  FREE: ['basic_templates', 'rsvp_50', 'ai_3x'],
  STARTER: ['all_templates', 'rsvp_200', 'ai_10x', 'no_watermark'],
  PRO: ['custom_domain', 'rsvp_unlimited', 'ai_50x', 'analytics_advanced', 'whatsapp_blast'],
  BUSINESS: ['sub_accounts', 'api_access', 'ai_unlimited', 'whatsapp_500'],
};
```

## 11.2 Billing Lifecycle

```
Payment Flow:
1. User pilih plan → Frontend hit /api/payments/create-order
2. Backend buat order di Midtrans/Xendit
3. Frontend tampilkan payment popup/redirect
4. User bayar
5. Gateway kirim webhook ke /api/webhooks/payment
6. Backend verifikasi signature webhook
7. Backend aktifkan/perpanjang subscription
8. Emit event: payment.success
9. Kirim email konfirmasi pembayaran
10. Update Redis cache subscription user

Renewal Flow (Auto):
1. Cron: H-3 sebelum expired → kirim email reminder
2. Cron: H-1 sebelum expired → kirim email final reminder  
3. Jika ada stored payment method → auto-charge
4. Jika gagal → status: PAST_DUE, grace period 3 hari
5. Setelah 3 hari → status: EXPIRED, downgrade ke FREE
6. Kirim email notifikasi downgrade
```

## 11.3 Trial System

```typescript
// Aktivasi trial 14 hari untuk registrasi baru
const activateTrial = async (userId: string) => {
  const trialEnd = addDays(new Date(), 14);
  
  await prisma.subscription.create({
    data: {
      userId,
      plan: 'PRO',  // Trial dengan fitur PRO
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      trialEnd,
      invitationsLimit: 10,
      aiCreditsLimit: 50,
    }
  });
  
  // Kirim email "Trial dimulai"
  await emailQueue.add('trial-started', { userId, trialEnd });
  
  // Schedule email H-3 sebelum trial habis
  await emailQueue.add('trial-ending', { userId }, {
    delay: differenceInMs(subDays(trialEnd, 3), new Date())
  });
};
```

---

# 12. ARSITEKTUR KEAMANAN

## 12.1 RBAC (Role-Based Access Control)

Implementasi multi-layer:
1. **Route Guard** di NestJS: cek role dari JWT
2. **Feature Guard**: cek plan subscription
3. **Resource Guard**: cek ownership (apakah resource milik user ini)
4. **Row-level**: setiap query wajib filter userId

## 12.2 JWT Security

```typescript
// JWT configuration
const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_SECRET,  // 256-bit random secret
    expiresIn: '15m',                // Short-lived access token
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '30d',
    rotation: true,  // Rotate setiap kali digunakan
  }
};

// Refresh token disimpan di httpOnly cookie (bukan localStorage)
// Access token disimpan di memory (Zustand) - bukan localStorage
// Setiap refresh, token lama di-blacklist di Redis
```

## 12.3 Rate Limiting

```typescript
// Berbeda limit per endpoint
const rateLimits = {
  '/api/auth/login': '5 requests per minute per IP',
  '/api/auth/register': '3 requests per minute per IP',
  '/api/auth/forgot-password': '3 requests per 15 minutes',
  '/api/ai/*': '10 requests per minute per user',
  '/api/webhooks/*': '100 requests per minute per IP',
  '/api/*': '100 requests per minute per user/IP',
};
```

## 12.4 File Upload Security

```typescript
// Validasi upload
const uploadConfig = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
  maxFileSize: {
    image: 10 * 1024 * 1024,  // 10MB
    video: 50 * 1024 * 1024,  // 50MB
  },
  virusScan: true,  // ClamAV / Cloudflare scan
  stripExif: true,  // Hapus metadata EXIF dari foto
  validateMagicBytes: true,  // Tidak cukup cek ekstensi saja
};
```

## 12.5 Payment Security

- Verifikasi signature setiap webhook dari Midtrans/Xendit
- Idempotency key untuk setiap payment order (cegah double charge)
- Simpan seluruh raw payload webhook untuk audit
- Tidak pernah simpan data kartu kredit (Midtrans yang handle)
- TLS 1.3 untuk semua komunikasi HTTPS

## 12.6 Anti-Abuse

- Honeypot field di form registrasi (bot trap)
- reCAPTCHA v3 di form publik (RSVP, registrasi)
- Deteksi multiple account per IP/device fingerprint
- Auto-suspend akun dengan aktivitas mencurigakan
- Limit ukuran payload request (1MB default)
- SQL injection protection via Prisma (parameterized queries)
- XSS protection via DOMPurify untuk konten user-generated

## 12.7 Encryption

```typescript
// Data sensitif dienkripsi di database
const encryptSensitive = (data: string): string => {
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, IV);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

// Field yang dienkripsi:
// - bankAccount number reseller/affiliate
// - NPWP
// - API key third-party
// - custom domain SSL cert
```

---

# 13. STRATEGI SEO & GROWTH

## 13.1 Programmatic SEO

Buat ribuan halaman terindeks secara otomatis:

```
URL Structure:
/templates/                        → Semua template
/templates/pernikahan/             → Template pernikahan
/templates/pernikahan/jawa/        → Template pernikahan Jawa
/templates/pernikahan/modern/      → Template pernikahan modern
/undangan/pernikahan/contoh/       → Contoh undangan pernikahan
/undangan/ulang-tahun/contoh/      → Contoh undangan ulang tahun
/cara-membuat-undangan-digital/    → Landing SEO artikel
/blog/                             → Blog SEO
/blog/[kategori]/[slug]/           → Artikel blog
```

Target: 10.000+ halaman terindeks dalam 6 bulan pertama.

## 13.2 Structured Data (Schema.org)

```json
// Untuk halaman undangan
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Pernikahan Ahmad & Siti",
  "startDate": "2024-06-15",
  "location": {
    "@type": "Place",
    "name": "Hotel Grand Mercure Jakarta",
    "address": "Jl. Sudirman, Jakarta"
  },
  "organizer": { "@type": "Person", "name": "Ahmad" },
  "image": "https://cdn.undanganku.id/og/abc123.jpg"
}

// Untuk halaman template  
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Template Undangan Pernikahan Elegant Rose",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" }
}
```

## 13.3 Viral Sharing System

**WhatsApp Viral Loop (paling efektif di Indonesia):**

```
Alur viral:
1. Pengguna buat undangan
2. Platform suggest: "Kirim undangan via WhatsApp"
3. Pesan WA otomatis dengan link undangan + CTA
4. Penerima undangan buka halaman → lihat branding platform
5. Footer undangan: "Buat undangan digitalmu di UndanganKu.id - GRATIS"
6. Link footer → landing page dengan UTM tracking
7. Viral coefficient target: > 1.2 (setiap pengguna bawa 1,2 pengguna baru)
```

**Pesan WA template:**
```
Bismillah 🤍
Kepada Yth. Bapak/Ibu/Saudara/i [NAMA TAMU]

Dengan penuh kebahagiaan, kami mengundang kehadiran Anda
di acara pernikahan kami.

📱 Buka undangan: [LINK]

Merupakan kehormatan bagi kami apabila Bapak/Ibu berkenan hadir.

Hormat kami,
[NAMA PENGANTIN]
```

## 13.4 TikTok & Instagram Funnel

**TikTok:**
- Konten: "POV: Undangan digitalmu viral di WhatsApp" (tutorial format)
- Konten: Before-after undangan kertas vs digital
- Challenge: #UndanganDigital2024
- Kolaborasi dengan wedding content creator

**Instagram:**
- Showcase undangan indah dengan link di bio
- Reels tutorial cara buat undangan
- Story poll: "Undangan digital atau cetak?"
- UGC (User Generated Content): minta pengguna tag platform

**SEO Content Calendar:**
| Bulan | Tema | Target Keyword |
|-------|------|----------------|
| Jan | Undangan Pernikahan 2024 | undangan pernikahan digital |
| Feb | Valentine + Anniversary | undangan anniversary digital |
| Mar | Tips Undangan Modern | cara buat undangan digital |
| Apr | Aqiqah Season | undangan aqiqah digital |
| ... | ... | ... |

---

# 14. INFRASTRUKTUR & DEVOPS

## 14.1 Docker Architecture

```yaml
# docker-compose.yml (Production)
version: '3.8'
services:
  frontend:
    build: ./frontend
    image: undanganku-frontend:latest
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=https://api.undanganku.id
    restart: always
    
  backend:
    build: ./backend
    image: undanganku-backend:latest
    ports: ["4000:4000"]
    depends_on: [postgres, redis]
    restart: always
    
  worker:
    image: undanganku-backend:latest
    command: node dist/worker.js
    depends_on: [postgres, redis]
    restart: always
    
  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: undanganku
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always
    
  redis:
    image: redis:7-alpine
    volumes: ["redisdata:/data"]
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    restart: always
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx/:/etc/nginx/conf.d/"]
    depends_on: [frontend, backend]
    restart: always

volumes:
  pgdata:
  redisdata:
```

## 14.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          npm ci
          npm run test
          npm run test:e2e

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: |
          docker build -t frontend:${{ github.sha }} ./frontend
          docker build -t backend:${{ github.sha }} ./backend
          
      - name: Push to Registry
        run: |
          docker push ghcr.io/undanganku/frontend:${{ github.sha }}
          docker push ghcr.io/undanganku/backend:${{ github.sha }}
          
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker pull ghcr.io/undanganku/frontend:${{ github.sha }}
            docker pull ghcr.io/undanganku/backend:${{ github.sha }}
            # Zero-downtime deploy dengan docker rolling update
            docker-compose up -d --no-deps --build frontend backend worker
            docker-compose exec backend npx prisma migrate deploy
```

## 14.3 VPS Specification

### Fase MVP (0-10k pengguna)
| Server | Spec | Fungsi | Biaya/bulan |
|--------|------|--------|-------------|
| VPS Utama | 4 vCPU, 8GB RAM | App + DB + Redis | Rp 600k (Hetzner CX21) |
| Total | | | ~Rp 600k/bulan |

### Fase Growth (10k-100k pengguna)
| Server | Spec | Fungsi | Biaya/bulan |
|--------|------|--------|-------------|
| App Server | 8 vCPU, 16GB RAM | Frontend + Backend | Rp 1,2jt |
| DB Server | 8 vCPU, 32GB RAM | PostgreSQL primary | Rp 2,4jt |
| DB Replica | 4 vCPU, 16GB RAM | Read replica | Rp 1,2jt |
| Redis | 4 vCPU, 8GB RAM | Cache + Queue | Rp 800k |
| Worker | 4 vCPU, 8GB RAM | Queue workers | Rp 800k |
| **Total** | | | **~Rp 6,4jt/bulan** |

### Fase Scale (100k+ pengguna) → Kubernetes
Migrasi ke managed Kubernetes (GKE/EKS) dengan autoscaling.

## 14.4 Monitoring Stack

```
Monitoring:
├── Uptime Robot       → Uptime monitoring (gratis)
├── Sentry             → Error tracking (aplikasi)
├── Prometheus         → Metrics collection
├── Grafana            → Dashboard metrics
├── Loki               → Log aggregation
└── PagerDuty/Telegram → Alert on-call

Key Metrics yang dimonitor:
├── API response time (P50, P95, P99)
├── Error rate (< 0.1% target)
├── Database query time
├── Redis hit rate (> 80% target)
├── Queue depth dan processing time
├── Memory dan CPU usage
└── Active websocket connections
```

## 14.5 Backup Strategy

```
Backup Policy:
├── Database: 
│   ├── Hourly: pg_dump ke R2 (retensi 24 jam)
│   ├── Daily: full backup ke R2 (retensi 30 hari)
│   └── Weekly: cold storage ke Wasabi (retensi 1 tahun)
│
├── Media (R2):
│   └── Versioning enabled (otomatis)
│
├── Config & Secrets:
│   └── HashiCorp Vault atau AWS Secrets Manager
│
└── Recovery Test:
    └── Test restore bulanan (wajib)
```

---

# 15. STRATEGI SKALABILITAS

## 15.1 Horizontal Scaling

```
Phase 1 (MVP): Single VPS monolith
Phase 2 (Growth): 2 app servers + load balancer
Phase 3 (Scale): Kubernetes cluster + auto-scaling
Phase 4 (Enterprise): Multi-region deployment

Load Balancer Strategy:
├── Nginx: round-robin untuk app servers
├── Sticky sessions: TIDAK (gunakan Redis untuk session)
└── Health check: /api/health setiap 10 detik
```

## 15.2 Database Scaling

```
Read Replica Strategy:
├── Primary: semua write operations
├── Replica 1: dashboard queries, analytics
├── Replica 2: admin panel, reports
└── Connection pooling: PgBouncer (maks 100 koneksi per pool)

Query Optimization:
├── EXPLAIN ANALYZE untuk semua query lambat
├── Index pada semua foreign key dan filter umum
├── Pagination cursor-based (bukan offset) untuk tabel besar
├── Denormalisasi selektif untuk query analytics berat
└── Archiving: data > 2 tahun pindah ke cold storage tabel
```

## 15.3 CDN & Image Optimization

```
Image Pipeline:
1. Upload original → R2 (preserve kualitas)
2. Worker job: generate 3 ukuran
   ├── thumbnail: 400x300, WebP, 80% quality
   ├── medium: 800x600, WebP, 85% quality
   └── large: 1600x1200, WebP, 90% quality
3. Simpan URL setiap ukuran di database
4. Frontend: gunakan srcset untuk responsive images
5. CDN: serve dari edge Cloudflare (cache 365 hari)

Target: LCP (Largest Contentful Paint) < 2.5 detik
```

---

# 16. EKSPANSI MONETISASI

## 16.1 White-Label Solution

Tawarkan platform sebagai white-label untuk:
- Wedding organizer besar (> 100 acara/tahun)
- Percetakan yang ingin go-digital
- Agensi digital periklanan

**Harga:** Rp 5jt-20jt/bulan setup fee + Rp 2jt/bulan lisensi

**Includi:** Subdomain kustom, logo sendiri, template eksklusif, support dedicated.

## 16.2 Template Marketplace Economy

Bangun ekosistem desainer independen:

```
Marketplace Flow:
1. Desainer daftar sebagai Template Creator
2. Upload template + preview demo
3. Tim review kualitas (1-3 hari)
4. Publish dengan harga desainer set sendiri (Rp 25k-150k)
5. Platform ambil 30% per penjualan
6. Desainer terima 70% via transfer bulanan

Insentif Desainer:
├── Badge "Featured Designer" untuk penjualan terbaik
├── Promosi gratis di social media platform
├── Bonus untuk template viral (> 100 penjualan)
└── Akses ke data tren template terpopuler
```

## 16.3 API Licensing

Buka API untuk integrasi pihak ketiga:
- WO digital yang ingin embed invitation builder
- Aplikasi wedding planning
- Platform e-commerce yang jual paket undangan

**Pricing API:**
- Starter API: 1000 req/bulan = Rp 500k
- Pro API: 10.000 req/bulan = Rp 2jt
- Enterprise: custom pricing + SLA

## 16.4 Agency Partnership

Program untuk digital agency:
- Resell dengan margin 40-50%
- White-label dashboard untuk end-client
- Co-marketing: joint webinar, konten bersama
- Priority support dan dedicated account manager

## 16.5 Enterprise Solution

Paket untuk perusahaan besar (BUMN, korporasi):
- Custom deployment (on-premise atau private cloud)
- Integrasi dengan sistem HR untuk undangan internal
- SSO dengan sistem perusahaan
- Kontrak tahunan: Rp 50jt-200jt/tahun

---

# 17. ROADMAP 12 BULAN

## Bulan 1-2: Foundation (MVP Core)

**Teknis:**
- Setup infrastruktur dasar (VPS, Nginx, Docker)
- Database schema dan Prisma setup
- Auth system (JWT + Google OAuth)
- Basic invitation CRUD
- 10 template dasar
- Upload media ke R2
- Halaman undangan publik (SSR)
- RSVP form dasar

**Bisnis:**
- Landing page
- Daftar harga
- Integrasi Midtrans (basic)
- Email system (welcome, notification)

**Target:** Platform berjalan, bisa buat undangan sederhana

## Bulan 3-4: Builder & Core Features

**Teknis:**
- Drag-and-drop builder lengkap
- Section system (10+ jenis section)
- Theme engine + custom color
- Auto-save
- Preview mobile/desktop
- 30 template (10 premium)
- Custom domain (basic)

**Bisnis:**
- Subscription plan aktif (Free, Starter, Pro)
- Integrasi Midtrans lengkap
- Affiliate program launch
- Blog mulai publish (8 artikel/bulan)

**Target:** 500 pengguna terdaftar, 50 paying customers

## Bulan 5-6: AI & Growth Features

**Teknis:**
- AI Copywriting integration
- AI Color Palette generator
- WhatsApp integration (Fonnte)
- Analytics dashboard
- RSVP management lengkap
- Import tamu via Excel

**Bisnis:**
- Reseller program launch
- Template marketplace (creator program)
- Promo launch campaign
- Instagram + TikTok content strategy aktif

**Target:** 2.000 pengguna terdaftar, 200 paying customers, Rp 15jt MRR

## Bulan 7-8: Scale & Automation

**Teknis:**
- Read replica PostgreSQL
- Redis optimization
- Queue worker scaling
- Email automation sequences
- WhatsApp blast feature
- Advanced analytics (heatmap, UTM)
- Mobile app research (React Native)

**Bisnis:**
- Business plan launch
- White-label pilot dengan 3 partner
- SEO: 500+ artikel/halaman terindeks
- YouTube channel tutorial

**Target:** 8.000 pengguna terdaftar, 700 paying customers, Rp 50jt MRR

## Bulan 9-10: Enterprise & API

**Teknis:**
- API public (REST)
- API documentation (Swagger)
- Webhook system untuk integrasi
- Enterprise SSO (SAML)
- Admin panel advanced
- Performance optimization (Core Web Vitals)

**Bisnis:**
- Enterprise outreach
- API licensing program
- Partnership dengan wedding vendor (cross-sell)
- Afiliasi program expand

**Target:** 20.000 pengguna, 1.500 paying customers, Rp 120jt MRR

## Bulan 11-12: Mobile & Multi-region

**Teknis:**
- React Native app (iOS + Android)
- Multi-language support (EN, Jawa, Sunda)
- Performance: < 2 detik load time
- Disaster recovery test
- Kubernetes migration planning

**Bisnis:**
- App Store & Play Store launch
- PR: media coverage nasional
- Partnership dengan Tokopedia/Shopee seller
- Fundraising exploration (seed round)

**Target:** 50.000 pengguna, 4.000 paying customers, Rp 300jt MRR

---

# 18. REKOMENDASI AKHIR

## 18.1 Arsitektur Terbaik

**Rekomendasi untuk startup:**

Mulai dengan **Modular Monolith** (satu codebase NestJS yang terstruktur per modul). Ini lebih cepat untuk MVP, lebih mudah debugging, dan bisa di-split menjadi microservice saat traffic membutuhkan.

Jangan langsung microservice karena:
- Overhead operasional tinggi untuk tim kecil
- Debugging lebih kompleks
- Networking cost antar service
- Premature optimization

**Kapan split ke microservice:**
- Traffic > 100k pengguna aktif
- Tim engineering > 15 orang
- Ada bottleneck jelas di modul tertentu (mis: AI service sangat berat)

## 18.2 Pendekatan Startup-Friendly

1. **Stack sederhana dulu:** Next.js + NestJS + PostgreSQL + Redis cukup untuk 100k pengguna
2. **Managed service:** Pakai Hetzner VPS (bukan AWS dulu) + Cloudflare untuk menghemat biaya
3. **Template dulu:** Launch dengan 10 template berkualitas tinggi, jangan 100 template biasa
4. **Satu fitur terbaik:** Fokus AI copywriting sebagai pembeda utama dari kompetitor
5. **Comunity-led growth:** Bangun komunitas pengguna di WhatsApp Group/Telegram

## 18.3 Estimasi Biaya Infrastruktur Bulanan

| Fase | Pengguna | Biaya Infra/bulan |
|------|----------|-------------------|
| MVP (bulan 1-3) | 0-1.000 | Rp 300k-800k |
| Early Growth (bulan 4-6) | 1k-10k | Rp 1,5jt-3jt |
| Growth (bulan 7-12) | 10k-100k | Rp 5jt-15jt |
| Scale (tahun 2+) | 100k+ | Rp 30jt-100jt |

**Breakdown biaya MVP:**
- Hetzner VPS CX21 (4vCPU/8GB): €5/bulan ≈ Rp 85k
- Cloudflare R2 (10GB storage + transfer): Free tier
- Cloudflare Pro (WAF + analytics): $20/bulan ≈ Rp 320k
- Resend email (100k email/bulan): $20 ≈ Rp 320k
- OpenAI API (estimasi awal): $30 ≈ Rp 480k
- Midtrans: 0% setup, per-transaksi 0.5-3.5%
- Domain .id: Rp 150k/tahun
- **Total: ~Rp 1,4jt/bulan untuk MVP**

## 18.4 Struktur Tim Ideal

### Tim MVP (Bulan 1-6): 4-5 orang
| Posisi | Tanggung Jawab |
|--------|----------------|
| Co-founder/CTO | Arsitektur, backend, DevOps |
| Full-stack Engineer | Frontend Next.js + fitur backend |
| UI/UX Designer | Desain template + UI platform |
| Marketing/Growth | Konten, SEO, media sosial |
| Business Dev (part-time) | Reseller, partnership |

### Tim Growth (Bulan 7-12): 8-10 orang
Tambahan: Backend Engineer, Frontend Engineer, Customer Support, Finance/Admin

### Tim Scale (Tahun 2+): 20+ orang
Tambahan: Data Engineer, Mobile Developer, DevOps Engineer, Sales Enterprise

## 18.5 Risiko Teknis Terbesar

| Risiko | Level | Mitigasi |
|--------|-------|----------|
| Database bottleneck saat viral | Tinggi | Read replica dari awal, query optimize |
| Biaya OpenAI membengkak | Menengah | Cache agresif, gpt-4o-mini default, quota ketat |
| Abuse sistem (spam undangan) | Menengah | Rate limit, verifikasi email, honeypot |
| Payment webhook failure | Menengah | Idempotency, retry, manual verification |
| CDN cost jika media besar | Rendah | R2 (no egress fee), image optimization |
| Kompetitor copycat | Menengah | Kecepatan iterasi, community, brand |

## 18.6 Strategi Go-to-Market Tercepat

### Minggu 1-2: Soft Launch
- Deploy MVP ke production
- Invite 50 orang beta tester dari lingkaran terdekat
- Kumpulkan feedback intensif

### Minggu 3-4: Product Hunt & Media
- Launch di Product Hunt Indonesia
- Kirim press release ke media teknologi (Techinasia, Dailysocial)
- Viral TikTok: video "Kami baru launch platform ini"

### Bulan 2: Community & Influencer
- Sponsori 5 couple yang lagi nikah (gratis Pro plan)
- Kolaborasi dengan 10 micro-influencer wedding
- Join grup WA/Telegram wedding organizer Indonesia

### Bulan 3: Reseller Activation
- Rekrut 20 reseller pertama dari lingkaran wedding vendor
- Berikan bonus: gratis Pro plan 3 bulan untuk reseller aktif
- Target: setiap reseller bawa 5 client = 100 pengguna baru

### KPI 3 Bulan Pertama:
- 1.000 pengguna terdaftar
- 100 paying customers
- NPS > 50
- Churn rate < 10%/bulan

---

## PENUTUP

Platform undangan digital ini memiliki peluang luar biasa di Indonesia. Kunci sukses bukan pada teknologi semata, tapi pada **eksekusi cepat + product-market fit + community building**.

**Prioritas utama:**
1. Launch cepat dengan 10 template terbaik
2. Obsesif dengan pengalaman pengguna (onboarding < 5 menit)
3. AI copywriting sebagai pembeda utama
4. Bangun ekosistem reseller dari awal
5. Viral loop via WhatsApp adalah pertumbuhan terkuat

**Ingat:** LinkedIn, Tokopedia, Traveloka semua mulai dari MVP sederhana. Yang membedakan bukan teknologi terbaik, tapi tim yang paling cepat belajar dari pengguna.

---

*Blueprint ini dibuat untuk skala jutaan pengguna dengan pendekatan bertahap. Sesuaikan setiap bagian dengan sumber daya dan kondisi tim Anda. Mulai kecil, ukur, iterasi cepat.*

**Semoga sukses! 🚀**
