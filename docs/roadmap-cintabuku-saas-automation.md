# Roadmap CintaBuku SaaS Undangan & Automation Engine

Dokumen ini menjadi panduan kerja utama untuk membangun CintaBuku sebagai SaaS undangan digital, lalu memperluasnya menjadi mesin otomasi promosi lintas platform. Tujuannya bukan hanya membuat fitur, tetapi memastikan setiap fase punya arah bisnis, prioritas teknis, ukuran selesai, risiko, dan urutan kerja yang jelas.

## 1. Visi Produk

CintaBuku adalah platform SaaS untuk membuat, mengelola, mempublikasikan, dan mempromosikan undangan digital. Produk utama adalah undangan digital yang cepat, indah, dan mudah dijual. Produk pendukungnya adalah automation engine untuk membantu promosi otomatis ke WhatsApp, Instagram, Facebook, TikTok, dan YouTube.

Prinsip utama:

- Core SaaS harus stabil sebelum otomasi promosi dibuat terlalu besar.
- Setiap aksi sensitif, seperti posting sosial media dan kirim pesan massal, harus punya approval manusia.
- Sistem harus ringan, murah dijalankan, dan mudah dipindah hosting.
- Fitur AI dipakai untuk mempercepat produksi konten, bukan menggantikan kontrol owner.
- Integrasi platform harus mengutamakan API resmi agar akun tidak berisiko.

## 2. Arsitektur Target

Stack awal yang disarankan:

- Frontend: Vite React.
- Backend API: Go.
- Database: PostgreSQL.
- Object storage: S3-compatible storage atau storage VPS di fase awal.
- Automation: n8n untuk fase cepat, lalu custom workflow engine jika sudah jelas kebutuhan produknya.
- AI operator: OpenClaw untuk perintah natural language, operasi internal, dan koordinasi workflow.
- WhatsApp: WA Gateway Baileys di VPS untuk notifikasi dan operator internal.

Alur besar:

```text
User Dashboard
  -> CintaBuku API
  -> PostgreSQL
  -> Public Invitation Page
  -> RSVP / Guestbook / Analytics

Order / Event / Schedule
  -> Automation Engine
  -> AI Content Generator
  -> Approval Queue
  -> Social Publishing API
  -> Report & Analytics

Telegram / Admin Command
  -> OpenClaw
  -> Internal Tools
  -> WA Gateway / API / Automation
```

## 3. Fase Roadmap

### Phase 0: Fondasi Proyek

Tujuan:

Merapikan struktur awal agar pengembangan berikutnya tidak berantakan.

Pekerjaan:

- Tetapkan folder utama SaaS di `undangan`.
- Pisahkan web, api, infra, dan docs.
- Buat standar env development.
- Buat README operasional lokal.
- Buat seed data awal template dan undangan.
- Tentukan naming convention slug, template, dan package.
- Pastikan build frontend dan test API bisa dijalankan lokal.

Flow kerja:

```text
Clone repo
  -> copy env
  -> start postgres
  -> run api
  -> run web
  -> open demo invitation
  -> run build/lint/test
```

Acceptance criteria:

- `npm run build:web` berhasil.
- `npm run test:api` berhasil.
- API `/health` mengembalikan status OK.
- Halaman `/`, `/templates`, `/dashboard`, dan `/u/joko-cikita` bisa dibuka.
- Dokumentasi lokal cukup untuk developer baru menjalankan project.

Risiko:

- File eksperimen lama tercampur dengan project baru.
- Env production dan local tidak konsisten.
- Data dummy terlalu hardcoded sehingga susah berkembang.

Prioritas:

Tinggi. Fase ini harus selesai sebelum fitur SaaS utama diperluas.

### Phase 1: Core SaaS Undangan

Tujuan:

User bisa membuat undangan, mengedit data penting, mempublikasikan, dan membagikan link.

Modul:

- Auth user.
- Workspace atau tenant.
- Template katalog.
- Invitation builder.
- Public invitation page.
- RSVP dan guestbook.
- Admin dashboard.

Flow user utama:

```text
User daftar/login
  -> pilih template
  -> buat undangan
  -> isi data mempelai
  -> isi jadwal acara
  -> isi lokasi dan link maps
  -> upload foto/galeri
  -> pilih musik
  -> preview
  -> publish
  -> share link
```

Flow public guest:

```text
Guest buka link undangan
  -> lihat cover
  -> klik buka undangan
  -> lihat detail acara
  -> buka maps
  -> lihat galeri
  -> isi RSVP
  -> tulis ucapan
  -> submit
```

Data minimal:

- users: id, name, email, password_hash, role, created_at.
- workspaces: id, owner_id, name, plan, created_at.
- templates: id, name, slug, category, preview_image, status, created_at.
- invitations: id, workspace_id, template_id, slug, status, published_at, created_at.
- invitation_content: invitation_id, couple, event, families, gallery, music, story, settings.
- rsvps: id, invitation_id, name, phone, attendance_status, guests, message, created_at.

API minimal:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/templates`
- `GET /api/templates/{slug}`
- `POST /api/invitations`
- `GET /api/invitations`
- `GET /api/invitations/{slug}`
- `PATCH /api/invitations/{slug}`
- `POST /api/invitations/{slug}/publish`
- `POST /api/invitations/{slug}/rsvp`
- `GET /api/invitations/{slug}/rsvps`

Frontend halaman:

- Landing page.
- Template catalog.
- Template preview.
- Dashboard overview.
- Invitation list.
- Create invitation.
- Invitation editor.
- Public invitation.
- RSVP management.

Acceptance criteria:

- User bisa membuat minimal 1 undangan dari template.
- Data undangan tersimpan di PostgreSQL, bukan hardcoded frontend.
- Public page mengambil data dari API atau static generated output.
- RSVP tersimpan dan muncul di dashboard.
- Slug unik dan public URL stabil.
- Status draft dan published berjalan.

Metrik:

- Time to first invitation: maksimal 10 menit untuk user baru.
- Public page load target: kurang dari 2 detik di koneksi normal.
- Build frontend: kurang dari 60 detik.
- API p95 response untuk read endpoint: kurang dari 300 ms di VPS.

Risiko:

- Editor terlalu kompleks di awal.
- Template terlalu banyak sebelum sistem data matang.
- Upload media membengkakkan storage VPS.

Strategi:

Mulai dari 1 template matang, bukan banyak template setengah jadi.

### Phase 2: Template System

Tujuan:

Template bisa dikelola, dipreview, dan dipakai ulang untuk banyak undangan.

Jenis template awal:

- Adat Jawa klasik.
- Modern editorial.
- Floral soft.

Flow template:

```text
Admin tambah template
  -> upload preview
  -> define schema field
  -> define default content
  -> publish template
  -> user pilih template
  -> editor mengikuti schema template
```

Komponen template:

- Cover.
- Couple section.
- Date countdown.
- Event detail.
- Location/maps.
- Gallery.
- Love story.
- RSVP.
- Guestbook.
- Gift/amplop digital.
- Closing section.
- Audio/music.

Schema template minimal:

- `theme`: warna, font, ornament, background.
- `sections`: urutan section aktif.
- `fields`: field yang wajib diisi.
- `assets`: default image, audio, ornament.
- `animations`: preset animasi.

Acceptance criteria:

- Template punya preview card.
- Template punya public demo.
- Editor bisa render field sesuai template.
- Undangan dari template yang sama bisa punya konten berbeda.
- Perubahan template tidak merusak undangan lama tanpa migrasi.

Risiko:

- Mengejar 100% clone template luar bisa melanggar aset/hak cipta.
- Template engine terlalu dinamis bisa memperlambat development.

Strategi:

Buat template yang secara rasa mirip dan kompetitif, tetapi aset dan code milik sendiri.

### Phase 3: Billing, Paket, dan Operasional

Tujuan:

Produk mulai bisa dijual dan dioperasikan secara rapi.

Paket awal:

- Free: 1 undangan, watermark, fitur terbatas.
- Basic: 1 undangan aktif, tanpa watermark, RSVP.
- Premium: galeri lebih banyak, musik, custom tema, amplop digital.
- Agency: multi-client, custom domain, prioritas support.

Flow order manual:

```text
User pilih paket
  -> buat order
  -> sistem tampilkan invoice
  -> user transfer
  -> admin verifikasi
  -> paket aktif
  -> WA konfirmasi otomatis
```

Flow payment gateway:

```text
User checkout
  -> payment gateway
  -> webhook payment success
  -> subscription/order aktif
  -> invoice tersimpan
  -> WA/email konfirmasi
```

Data minimal:

- plans.
- orders.
- payments.
- subscriptions.
- invoices.
- usage_limits.

Acceptance criteria:

- Admin bisa melihat order masuk.
- User bisa melihat status paket.
- Payment manual bisa diproses.
- Notifikasi WA terkirim saat order dibuat dan paket aktif.
- Limit fitur berjalan per paket.

Metrik:

- Order created to admin notified: kurang dari 10 detik.
- Payment verification manual: kurang dari 1 menit tindakan admin.
- Error notification WA: tercatat di log.

Risiko:

- Payment gateway terlalu cepat dipasang sebelum flow manual jelas.
- Paket terlalu rumit dan membingungkan user.

Strategi:

Mulai manual dulu, validasi harga dan kebutuhan, baru integrasi gateway.

### Phase 4: Automation Engine

Tujuan:

Membangun otomasi internal seperti n8n, dimulai dari workflow paling bernilai untuk bisnis undangan.

Pendekatan:

- Fase awal pakai n8n untuk validasi workflow.
- Setelah workflow stabil dan berulang, pindahkan ke custom engine di SaaS.

Konsep workflow:

```text
Trigger
  -> Condition
  -> AI Step
  -> Approval
  -> Action
  -> Log
  -> Report
```

Trigger awal:

- Order baru.
- Payment aktif.
- Undangan published.
- RSVP masuk.
- Jadwal posting konten.
- Command Telegram.

Action awal:

- Kirim WA.
- Generate caption.
- Generate gambar.
- Generate script video.
- Simpan draft konten.
- Kirim approval ke Telegram.
- Publish ke social media.

Flow RSVP automation:

```text
Guest submit RSVP
  -> save database
  -> trigger workflow
  -> kirim WA terima kasih jika phone tersedia
  -> update analytics
  -> notify owner jika RSVP penting
```

Flow content automation:

```text
Schedule harian
  -> ambil template/produk yang mau dipromosikan
  -> generate ide konten
  -> generate caption
  -> generate image/video draft
  -> kirim preview ke Telegram
  -> tunggu approval
  -> publish
  -> simpan log
```

Data minimal:

- workflows.
- workflow_triggers.
- workflow_steps.
- workflow_runs.
- workflow_run_logs.
- approvals.
- generated_contents.

Acceptance criteria:

- Minimal 3 workflow berjalan: order WA notify, RSVP notify, content draft.
- Semua workflow punya log.
- Workflow gagal tidak hilang diam-diam.
- Aksi posting/kirim massal butuh approval.
- Admin bisa pause workflow.

Metrik:

- Workflow run success rate: lebih dari 95%.
- Failed workflow terlihat di dashboard.
- Approval response time tercatat.

Risiko:

- Membuat visual workflow builder terlalu awal.
- Workflow tanpa audit log sulit debug.
- AI action bisa menghasilkan konten kurang tepat jika tidak ada approval.

Strategi:

Jangan mulai dari drag-and-drop builder. Mulai dari workflow template yang fixed dan bisa dikonfigurasi.

### Phase 5: AI Content Studio

Tujuan:

Membantu owner membuat konten promosi dari data template, paket, dan contoh undangan.

Output konten:

- Caption Instagram.
- Caption TikTok.
- Script video pendek.
- Hashtag.
- Gambar promosi.
- Carousel outline.
- Voiceover script.
- Short video semi-otomatis.

Flow generate konten:

```text
Admin pilih tujuan
  -> pilih produk/template
  -> pilih platform
  -> pilih gaya bahasa
  -> AI generate draft
  -> admin edit
  -> approve
  -> jadwalkan/publish
```

Input AI:

- Nama template.
- Keunggulan template.
- Target market.
- Harga/promo.
- CTA.
- Style brand CintaBuku.
- Platform tujuan.

Content safety:

- Tidak membuat klaim palsu.
- Tidak spam hashtag.
- Tidak memakai nama brand/platform secara menyesatkan.
- Tidak autopost tanpa approval.

Acceptance criteria:

- Bisa generate minimal 5 variasi caption.
- Bisa generate prompt gambar.
- Bisa membuat draft kalender konten 7 hari.
- Bisa simpan draft dan status approval.
- Bisa kirim preview ke Telegram.

Metrik:

- Waktu generate konten: kurang dari 30 detik untuk caption.
- Minimal 70% draft bisa dipakai setelah edit ringan.
- Semua konten punya metadata asal prompt dan tanggal dibuat.

Risiko:

- Konten AI terasa generik.
- Brand voice tidak konsisten.
- Generate gambar/video bisa mahal.

Strategi:

Buat brand guideline dan prompt template internal sebelum integrasi banyak provider.

### Phase 6: Social Media Publishing

Tujuan:

Mempublikasikan konten promosi ke platform sosial media secara aman dan terukur.

Platform prioritas:

1. Instagram dan Facebook via Meta API.
2. YouTube Shorts via YouTube Data API.
3. TikTok via TikTok Content Posting API.

Flow publish umum:

```text
Draft konten approved
  -> validate media spec
  -> upload media ke storage publik sementara
  -> call platform API
  -> poll status jika async
  -> simpan platform_post_id
  -> laporkan sukses/gagal
```

Instagram/Facebook:

- Butuh akun Instagram Business/Creator.
- Butuh Facebook Page terhubung.
- Butuh Meta App dan permission publishing.
- Cocok untuk feed, reels, dan page post sesuai permission.

YouTube:

- Butuh OAuth Google.
- Video 9:16 bisa dipublish sebagai Shorts jika sesuai format.
- Simpan video id dan URL.

TikTok:

- Butuh TikTok Developer App.
- Butuh Content Posting API.
- Butuh OAuth user.
- Direct posting butuh konfigurasi/review.

Acceptance criteria:

- Sistem bisa menyimpan koneksi akun platform.
- Token OAuth tersimpan terenkripsi.
- Publish manual approved berjalan minimal ke 1 platform.
- Status publish tercatat.
- Error dari API terlihat jelas di dashboard dan Telegram.

Metrik:

- Publish success rate: lebih dari 90% setelah konfigurasi benar.
- Failed publish punya reason yang bisa ditindaklanjuti.
- Waktu dari approve ke publish: kurang dari 2 menit untuk image post.

Risiko:

- API platform berubah.
- App review platform ditolak.
- Token expired.
- Media spec tidak sesuai.

Strategi:

Mulai dari Meta API karena Instagram/Facebook paling relevan untuk bisnis undangan.

### Phase 7: Analytics dan Growth

Tujuan:

Mengukur performa undangan, order, dan promosi agar keputusan bisnis berbasis data.

Analytics undangan:

- Page views.
- Unique visitors.
- Click maps.
- RSVP conversion.
- Guestbook count.
- Share source.

Analytics bisnis:

- Order count.
- Revenue.
- Conversion landing to order.
- Paket terlaris.
- Template terlaris.
- Customer acquisition channel.

Analytics konten:

- Published posts.
- Reach.
- Views.
- Likes.
- Comments.
- Shares.
- CTR ke landing/produk.

Flow report:

```text
Collect events
  -> aggregate daily
  -> dashboard charts
  -> weekly summary
  -> AI insight
  -> recommendation next action
```

Acceptance criteria:

- Event tracking dasar berjalan di public invitation.
- Dashboard menampilkan metrik utama.
- Weekly report bisa dikirim ke Telegram.
- Konten promosi bisa dikaitkan ke traffic/order jika ada UTM.

Metrik:

- Event ingestion success rate: lebih dari 99%.
- Dashboard query p95: kurang dari 1 detik untuk data kecil-menengah.
- Weekly report terkirim otomatis.

Risiko:

- Tracking terlalu berat untuk public page.
- Data tidak konsisten karena event schema berubah.

Strategi:

Mulai dari event sederhana dan stabil: page_view, rsvp_submit, map_click, share_click.

## 4. Rencana Eksekusi 12 Minggu

### Minggu 1: Stabilkan Fondasi

Target:

- Project lokal mudah dijalankan.
- API dan frontend build clean.
- Data tidak lagi hardcoded penuh.

Pekerjaan:

- Rapikan README.
- Tambah env local.
- Buat API fetch di frontend.
- Tambah fallback jika API mati.
- Seed data lebih lengkap.
- Pastikan deploy VPS tetap berjalan.

Output:

- Demo lokal dan VPS bisa dibuka.
- Dokumen setup jelas.

### Minggu 2: Invitation CRUD Dasar

Target:

User/admin bisa buat dan edit undangan dasar.

Pekerjaan:

- Endpoint create invitation.
- Endpoint update invitation content.
- Halaman create invitation.
- Halaman editor sederhana.
- Preview public dari data API.

Output:

- 1 undangan baru bisa dibuat dari dashboard.

### Minggu 3: Public Invitation Matang

Target:

Halaman public layak dilihat customer.

Pekerjaan:

- Cover interaktif.
- Section acara.
- Countdown.
- Maps.
- Gallery.
- Musik.
- RSVP form.
- Guestbook.
- Mobile optimization.

Output:

- Demo public siap dipakai untuk sales awal.

### Minggu 4: Template Adat Jawa V1

Target:

Template utama punya kualitas visual kuat.

Pekerjaan:

- Pecah komponen section.
- Buat theme token.
- Tambah animasi halus.
- Optimasi asset.
- Buat preview template.

Output:

- Template `adat-jawa` menjadi template flagship.

### Minggu 5: Dashboard User V1

Target:

User punya panel kerja sederhana.

Pekerjaan:

- Invitation list.
- Status draft/published.
- RSVP count.
- Quick actions.
- Preview link.
- Copy link.

Output:

- Dashboard bisa dipakai mengelola undangan awal.

### Minggu 6: Order Manual dan Paket

Target:

Produk mulai bisa dijual.

Pekerjaan:

- Plans.
- Orders.
- Manual payment status.
- Admin verify.
- WA notification order.
- WA notification active.

Output:

- Flow order manual end-to-end.

### Minggu 7: WA Automation Internal

Target:

WA gateway masuk ke SaaS workflow.

Pekerjaan:

- API internal kirim WA.
- Template pesan.
- Log pesan.
- Retry sederhana.
- Trigger RSVP/order.

Output:

- Notifikasi WA otomatis untuk order dan RSVP.

### Minggu 8: Content Studio V1

Target:

AI bisa bantu bikin konten promosi.

Pekerjaan:

- Prompt template caption.
- Generate caption per platform.
- Draft content table.
- Approval status.
- Kirim preview ke Telegram.

Output:

- 1 klik generate 5 draft caption untuk template undangan.

### Minggu 9: Image Generation V1

Target:

AI bisa membuat gambar promosi.

Pekerjaan:

- Pilih provider image generation.
- Simpan hasil ke storage.
- Buat prompt builder.
- Preview image.
- Approval.

Output:

- Gambar promosi bisa dibuat dan disimpan.

### Minggu 10: Scheduler Konten

Target:

Konten bisa dijadwalkan.

Pekerjaan:

- Content calendar.
- Scheduled jobs.
- Approval required.
- Telegram reminder.
- Manual mark as posted.

Output:

- Kalender konten 7 hari bisa dibuat.

### Minggu 11: Meta Publishing

Target:

Posting ke Instagram/Facebook mulai diuji.

Pekerjaan:

- Meta App setup.
- OAuth.
- Store token.
- Publish image post.
- Log response.
- Error handling.

Output:

- Post image/caption ke Facebook Page atau Instagram Business dari sistem.

### Minggu 12: Analytics Dasar

Target:

Mulai ukur performa.

Pekerjaan:

- Track page_view.
- Track rsvp_submit.
- Track map_click.
- Dashboard ringkas.
- Weekly Telegram report.

Output:

- Owner tahu template dan undangan mana yang perform.

## 5. Urutan Prioritas Teknis

Prioritas P0:

- Public invitation stabil.
- Create/edit/publish undangan.
- RSVP.
- Dashboard user.
- Order manual.

Prioritas P1:

- WA notification.
- Template system.
- Content draft AI.
- Approval queue.
- Scheduler.

Prioritas P2:

- Image generation.
- Social publishing.
- Analytics konten.
- Workflow builder custom.

Prioritas P3:

- Advanced video generation.
- Multi-tenant agency.
- Custom domain otomatis.
- Marketplace template.

## 6. Definition of Done

Sebuah fitur dianggap selesai jika:

- Ada flow user yang bisa diuji dari awal sampai akhir.
- Data tersimpan di database jika fitur bersifat dinamis.
- Error utama ditangani dan tampil jelas.
- Ada loading/empty state di frontend.
- API punya response JSON yang konsisten.
- Tidak ada secret hardcoded di source.
- Build frontend berhasil.
- Test API minimal berhasil.
- Dokumentasi singkat diperbarui jika flow berubah.

## 7. Prinsip Keamanan dan Kontrol

Keamanan akun:

- Jangan simpan token platform tanpa enkripsi di production.
- Jangan autopost tanpa approval di fase awal.
- Jangan kirim pesan massal tanpa throttle.
- Jangan memakai browser automation untuk platform sosial jika API resmi tersedia.
- Jangan menyimpan password plaintext.

Kontrol aksi AI:

- AI boleh membuat draft.
- AI boleh menjalankan aksi internal yang aman.
- AI harus minta approval untuk publish, payment action, mass messaging, dan perubahan data penting.

Audit:

- Semua workflow run disimpan.
- Semua kirim WA disimpan statusnya.
- Semua publish sosial disimpan response dan platform_post_id.
- Semua approval punya approver dan timestamp.

## 8. Risiko Produk dan Mitigasi

Risiko: Terlalu banyak fitur sebelum core SaaS matang.

Mitigasi: Setiap fase harus menghasilkan demo yang bisa dipakai atau dijual.

Risiko: Template kalah bagus dari kompetitor.

Mitigasi: Fokus pada 1-3 template flagship dengan visual matang, bukan kuantitas.

Risiko: API platform sosial sulit approval.

Mitigasi: Mulai dari draft dan scheduler manual, lalu integrasi resmi bertahap.

Risiko: Biaya AI image/video tinggi.

Mitigasi: Pakai caption/script dulu, image generation on demand, video semi-otomatis via FFmpeg.

Risiko: WhatsApp gateway putus sesi.

Mitigasi: Buat healthcheck, reconnect guide, dan fallback notifikasi Telegram/email.

## 9. Keputusan Arsitektur Saat Ini

Keputusan:

- Gunakan Vite React, bukan Next.js, untuk menjaga frontend ringan.
- Gunakan Go API untuk backend karena cepat dan hemat resource.
- Gunakan PostgreSQL untuk data inti.
- Gunakan OpenClaw sebagai operator AI, bukan sebagai core SaaS runtime.
- Gunakan n8n dulu untuk eksperimen automation jika butuh cepat.
- Buat custom automation engine hanya setelah workflow berulang terbukti.

Alasan:

- Vite lebih ringan untuk VPS kecil.
- Go cocok untuk API stabil dan murah.
- PostgreSQL cukup untuk SaaS awal sampai menengah.
- OpenClaw kuat untuk operasi berbasis perintah, tetapi core produk harus tetap deterministic.
- n8n mempercepat eksperimen tanpa membuat builder dari nol.

## 10. Flow Development dan Deployment

Urutan kerja resmi:

```text
D:\UNDANGAN
  -> development lokal
  -> lint/test/build
  -> commit git
  -> push GitHub herulife/undangansaas.git
  -> pull/deploy VPS
  -> verifikasi production
```

Repository GitHub:

```text
https://github.com/herulife/undangansaas.git
```

Aturan local development:

- Semua pekerjaan utama dilakukan di `D:\UNDANGAN`.
- Jalankan web, API, dan database lokal sebelum deploy.
- Perubahan schema database harus dicatat dan bisa diulang.
- Jangan menyimpan secret di repository.
- Gunakan `.env.example` untuk contoh konfigurasi, bukan `.env` asli.

Aturan GitHub:

- GitHub menjadi sumber kebenaran source code.
- Setiap milestone harus punya commit yang jelas.
- Branch utama production menggunakan `main`, kecuali nanti diputuskan memakai flow staging.
- Jangan push file build, cache, log, hasil mirror HTTrack, atau asset eksperimen besar yang tidak dipakai.

Aturan VPS:

- VPS deploy dari GitHub, bukan dari copy manual random.
- Edit langsung di VPS hanya untuk hotfix darurat.
- Jika hotfix dilakukan di VPS, perubahan harus dibawa balik ke local dan GitHub.
- Setelah deploy, cek API health, halaman utama, halaman public invitation, dan fitur yang baru diubah.

Checklist sebelum push:

- `npm run build:web`
- `npm run lint:web`
- `npm run test:api`
- Tidak ada secret di diff.
- Tidak ada file sampah besar di status git.
- README atau docs diperbarui jika flow berubah.

Checklist setelah deploy VPS:

- Domain utama bisa dibuka.
- API `/health` OK.
- Halaman public invitation bisa dibuka.
- RSVP atau fitur utama yang berubah sudah dites.
- Log container/service tidak menunjukkan error berulang.

## 11. Langkah Berikutnya

Langkah langsung yang paling terukur:

1. Hubungkan frontend `undangan/apps/web` ke API Go.
2. Tambah endpoint create/update invitation.
3. Ubah public page agar membaca invitation dari API.
4. Buat form RSVP yang benar-benar menyimpan ke API.
5. Rapikan template `adat-jawa` sebagai template flagship.
6. Deploy ulang ke VPS dan verifikasi domain `cintabuku.site`.
7. Buat dashboard order manual.
8. Hubungkan WA notification ke event order dan RSVP.

Checklist sebelum mulai coding berikutnya:

- Pastikan database local bisa jalan.
- Pastikan API env tersedia.
- Pastikan frontend build clean.
- Pastikan folder project bersih dari file eksperimen yang tidak dipakai.
- Tentukan satu slug demo utama untuk testing.
