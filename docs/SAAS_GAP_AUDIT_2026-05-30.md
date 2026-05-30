# Audit Gap SaaS CintaBuku

Tanggal audit: 2026-05-30  
Scope: `lovable` frontend, `apps/api` backend Go, PostgreSQL production VPS, dan flow undangan publik.

## Ringkasan Status

SaaS sudah punya fondasi penting: auth user, daftar/login, edit profil/password, create/publish undangan, upload gambar, generate image fallback, template registry dasar, RSVP submit, dan public URL `/u/{slug}`.

Yang belum lengkap paling besar adalah layer admin dan operasional SaaS: pengelolaan users, role admin yang benar-benar diproteksi, pembayaran, voucher, media library, template manager, guest management, analytics, dan render engine template premium yang benar-benar mengambil semua data builder.

## Data Production Saat Audit

Hasil cek langsung dari database production VPS:

| Tabel | Jumlah |
| --- | ---: |
| `users` | 18 |
| `templates` | 14 |
| `invitations` | 16 |
| `rsvps` | 3 |
| `payments` | 0 |
| `events` | 0 |

Catatan: jumlah ini membuktikan user dan undangan sudah masuk DB, tetapi transaksi dan analytics belum berjalan.

## Yang Sudah Ada Dan Real

### Auth User

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Session JWT tersimpan di frontend localStorage.
- Me/profile: `GET /api/auth/me`
- Edit profil/email/nama: `PATCH /api/auth/me`
- Ganti password: `PATCH /api/auth/password`
- Logout user/admin sudah menghapus token dan redirect ke `/login`.

### Invitation Core

- User bisa membuat undangan dari dashboard builder.
- Simpan draft dan publish sudah masuk DB.
- User hanya bisa update undangan miliknya, admin boleh update via backend logic.
- Public page `/u/{slug}` mengambil data undangan dari API.
- Upload gambar ke `/api/uploads` sudah tersimpan per user.
- Generate image sudah ada fallback SVG jika provider eksternal gagal.
- Gallery image dan pilihan musik tersimpan di `config` undangan.

### RSVP Dasar

- Public page bisa submit RSVP ke DB.
- Backend membatasi RSVP berdasarkan tier.
- Tabel `rsvps` sudah ada.

### Tier Dasar

- Tier `free`, `creator`, `pro`, `business` sudah ada di schema.
- Feature map sudah ada di backend: watermark, RSVP limit, gallery limit, custom domain, dynamic OG, export CSV, API access, white label.

## Gap Kritis

### 1. Admin User Management Belum Ada

Status: belum real.

Frontend `/admin/users` masih memakai `adminUsers` dari `lovable/src/lib/mock.ts`. Tombol filter, tambah user, dan detail belum melakukan apa-apa.

Yang belum ada:

- Endpoint admin list users.
- Endpoint detail user.
- Endpoint create user oleh admin.
- Endpoint edit user: nama, email, role, tier, masa aktif, status.
- Endpoint suspend/activate user.
- Endpoint reset password user.
- Endpoint delete/archive user.
- Filter/search/pagination users.
- Statistik per user: jumlah undangan, total RSVP, total pembayaran, last login.
- Audit log perubahan user.

Prioritas: sangat tinggi.

### 2. Admin Route Belum Diproteksi

Status: berisiko.

Route `/admin` di frontend belum mengecek token dan role admin. Siapa pun yang membuka URL admin bisa melihat halaman admin mock.

Yang dibutuhkan:

- Frontend guard untuk `/admin`.
- Backend middleware `RequireAdmin`.
- Semua endpoint admin wajib cek role `admin`.
- Redirect non-admin ke dashboard atau login.

Prioritas: sangat tinggi.

### 3. Dashboard Admin Masih Mock

Status: sebagian besar mock.

Halaman berikut masih membaca `lovable/src/lib/mock.ts`:

- `/admin`
- `/admin/users`
- `/admin/orders`
- `/admin/templates`
- `/admin/media`
- `/admin/voucher`
- `/admin/reports`

Yang dibutuhkan:

- API KPI admin.
- API orders/payments.
- API template manager.
- API media manager.
- API voucher/promo.
- API report/analytics.

Prioritas: tinggi.

### 4. Payments/Billing Belum Jalan

Status: schema ada, transaksi 0, flow belum real.

Tabel `payments` sudah ada, tetapi belum ada endpoint create checkout, webhook, invoice real, atau upgrade tier otomatis.

Yang belum ada:

- Integrasi Midtrans/Xendit.
- Create payment/order.
- Webhook payment settlement/expired/failed.
- Upgrade tier setelah paid.
- Invoice user.
- Admin order detail.
- Refund/cancel/manual payment.
- Voucher apply.
- Renewal/expiry job.

Prioritas: tinggi untuk SaaS monetisasi.

### 5. Voucher Dan Promo Belum Ada Backend

Status: mock.

Frontend `/admin/voucher` masih data statis.

Yang dibutuhkan:

- Tabel vouchers.
- Tabel voucher redemptions.
- CRUD voucher admin.
- Validasi quota, expired date, min amount, tier target.
- Apply voucher saat checkout.

Prioritas: tinggi setelah payment.

### 6. Guest/Tamu Management Belum Real

Status: mock.

Frontend `/dashboard/tamu` masih memakai `guestList` mock.

Yang belum ada:

- Tabel guest/tamu.
- CRUD tamu per undangan.
- Import CSV.
- Export CSV.
- Personalized link per tamu.
- Status kirim WhatsApp.
- Tracking opened per tamu.
- Bulk send WA.
- Segment/filter tamu.

Prioritas: tinggi karena ini fitur utama undangan.

### 7. RSVP Dashboard Belum Real

Status: public submit sudah real, dashboard masih mock.

Frontend `/dashboard/rsvp` masih memakai `rsvpList` mock. Backend `GET /api/invitations/{slug}/rsvps` juga masih public dan belum dibatasi owner/admin.

Yang dibutuhkan:

- Dashboard RSVP mengambil data DB sesuai undangan milik user.
- Filter per undangan.
- Export CSV dari data RSVP.
- Proteksi list RSVP supaya tidak terbuka publik.
- Mapping status frontend/backend konsisten: `attending`, `declined`, `pending` atau `maybe/not_attending`.
- Moderasi/hapus ucapan.

Prioritas: tinggi.

### 8. Builder Belum Lengkap

Status: MVP berjalan, belum production-grade.

Yang sudah ada: template, mempelai, acara, lokasi, galeri, media musik pilihan, gift rekening, publish.

Yang belum ada:

- Edit undangan existing dari daftar; tombol edit masih membuka builder default.
- Load data undangan ke builder berdasarkan slug/id.
- Delete/duplicate invitation.
- Search/filter undangan.
- Validasi slug availability sebelum publish.
- Cover photo terpisah dari gallery.
- Salam pembuka, teks pembuka, teks penutup.
- Data orang tua/keluarga.
- Multi event: akad, resepsi, ngunduh mantu, tambahan acara.
- Maps embed/koordinat.
- Story/kisah cinta.
- Video YouTube.
- Kado fisik/alamat pengiriman.
- Popup banner.
- Private event/password.
- Bahasa Indonesia/English.
- Toggle RSVP, ucapan, gift, music, auto-scroll.
- Custom domain publish flow.
- Dynamic OG image setting.

Prioritas: tinggi.

### 9. Public Invitation Render Masih Generik

Status: real data ada, visual belum memakai template premium asli.

Route `/u/{slug}` saat ini merender satu layout generik, bukan HTML/CSS asli per template premium dari folder template.

Yang belum ada:

- Render engine per template folder.
- Mapping config JSON ke placeholder template.
- Section order sesuai template.
- Animasi template premium 050/042/074.
- Audio file real.
- Auto-scroll real.
- Navigation section.
- Lazy maps embed.
- Watermark berdasarkan tier.
- Hide draft dari publik.
- Published/expired/private guard.

Prioritas: tinggi, karena produk utamanya adalah kualitas undangan publik.

### 10. Media Manager Belum Real

Status: upload endpoint ada, manager belum ada.

Upload file langsung masuk folder server, tetapi tidak ada tabel media dan tidak ada UI library untuk memilih ulang asset.

Yang belum ada:

- Tabel `media`.
- Metadata file: owner, mime, size, folder, source.
- Admin media manager real.
- User media library.
- Delete file.
- Replace image.
- Audio upload/library.
- Ornamen/sticker library.
- Limit storage per tier.
- Optimasi WebP/AVIF dan thumbnail.
- Object storage/S3-compatible untuk VPS jangka panjang.

Prioritas: sedang-tinggi.

### 11. Template Manager Belum Real

Status: template list API ada, CRUD admin belum ada.

Yang belum ada:

- Admin tambah template.
- Upload thumbnail dan asset folder.
- Edit kategori/tier access/preview URL.
- Aktif/nonaktif template.
- Versioning template.
- Template schema editor.
- Sync template dari folder `template`.
- Validasi asset missing.
- Preview template dari DB.

Prioritas: sedang-tinggi.

### 12. Analytics Belum Jalan

Status: endpoint event ada, tabel kosong.

Backend `POST /api/v1/events` sudah ada, tetapi frontend belum mengirim page view/share/publish/upgrade events.

Yang belum ada:

- Track page view publik.
- Track open invitation.
- Track share click.
- Track RSVP submit.
- Track map click.
- Track gift copy.
- Dashboard analytics per undangan.
- Admin analytics platform.
- Bot/spam filtering dasar.

Prioritas: sedang.

### 13. Security Dan Abuse Protection Masih Kurang

Yang perlu ditambah:

- Rate limit login/register/RSVP/upload.
- CAPTCHA atau honeypot untuk public RSVP.
- Validasi MIME file upload lebih kuat.
- Scan/limit ukuran file per tier.
- Password reset via email.
- Email verification.
- Session revocation/logout server-side.
- CORS production dibatasi ketat.
- Admin audit log.
- Backup DB rutin.

Prioritas: tinggi sebelum traffic besar.

### 14. Email/WhatsApp Belum Ada

Status: belum real.

Yang dibutuhkan:

- SMTP/Resend untuk verifikasi email dan reset password.
- WhatsApp share template.
- WhatsApp Gateway untuk bulk send.
- Status delivery/open.
- Notification RSVP ke owner.

Prioritas: sedang.

### 15. Operational SaaS Belum Lengkap

Yang belum ada:

- Terms, privacy, refund policy real.
- Support/CS config real.
- Admin setting tersimpan DB.
- Monitoring error.
- Log viewer.
- Backup/restore.
- Cron tier expiry.
- Cron cleanup upload orphan.
- Seed/admin bootstrap yang aman.
- Test suite backend/frontend.
- CI/CD GitHub Actions.

Prioritas: sedang.

## Bug/Ketidakkonsistenan Yang Ditemukan

- Frontend RSVP mengirim `maybe` dan `not_attending`, backend menerima `attending`, `declined`, `pending`; ini bisa membuat submit selain hadir gagal.
- Public RSVP list endpoint belum diproteksi.
- Public invitation masih bisa fallback ke data demo jika API gagal, sehingga slug tidak valid bisa terlihat seperti undangan contoh.
- `/admin` belum auth guard.
- Builder section RSVP hanya placeholder.
- Builder music menyimpan pilihan, tetapi belum memainkan audio fisik.
- Dashboard undangan masih fallback ke demo jika API gagal.
- Beberapa copy masih memakai brand lama `Undanganku`, bukan konsisten `CintaBuku`.

## Prioritas Pengerjaan Berikutnya

### P0 - Wajib Sebelum Admin Dipakai

1. Buat backend admin user management.
2. Proteksi `/admin` frontend dan semua endpoint admin dengan role admin.
3. Sambungkan `/admin/users` ke DB.
4. Tambahkan suspend/activate/edit tier/edit role/reset password.

### P1 - Agar SaaS Bisa Dipakai User Beneran

1. Edit undangan existing dari dashboard.
2. Dashboard RSVP real dan proteksi data RSVP.
3. Tamu/guest management real.
4. Hapus/duplicate/search/filter undangan.
5. Perbaiki status RSVP frontend/backend.

### P2 - Agar Produk Terasa Premium

1. Render engine template asli dari folder template.
2. Audio library real.
3. Maps embed dan auto-scroll real.
4. Watermark/tier enforcement di public page.
5. Media library user/admin.

### P3 - Monetisasi

1. Payment checkout.
2. Webhook payment.
3. Upgrade tier otomatis.
4. Voucher.
5. Invoice user dan admin orders real.

## Kesimpulan

Fondasi MVP sudah hidup, tetapi SaaS belum selesai. Bagian paling mendesak sekarang adalah admin user management dan admin security, karena halaman admin sudah terlihat tetapi datanya masih mock dan belum diproteksi role. Setelah itu baru rapikan dashboard user real: edit undangan, tamu, RSVP, lalu payment.
