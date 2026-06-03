# Midtrans Setup

Integrasi pembayaran SaaS memakai Midtrans Snap redirect. Backend Go membuat transaksi Snap, frontend hanya membuka `redirect_url`, dan status tier berubah hanya dari webhook yang signature-nya valid.

## Environment

Isi variable ini di server:

```env
PAYMENT_PROVIDER=midtrans
MIDTRANS_ENV=sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
ALLOW_DEMO_PAYMENTS=true
APP_PUBLIC_URL=https://cintabuku.site
```

Saat production:

```env
MIDTRANS_ENV=production
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
ALLOW_DEMO_PAYMENTS=false
```

## Dashboard Midtrans

Atur Payment Notification URL:

```text
https://cintabuku.site/api/v1/payments/webhook?provider=midtrans
```

Server key Sandbox dan Production berbeda. Jangan memakai key sandbox di mode production.

## Flow

1. User klik upgrade paket di `Billing & Paket`.
2. Frontend memanggil `POST /api/v1/payments/checkout` dengan provider `midtrans`.
3. Backend membuat order lokal berawalan `CB-`.
4. Backend meminta Snap token ke Midtrans.
5. Frontend redirect ke `redirect_url` Midtrans.
6. Midtrans mengirim webhook ke backend.
7. Backend validasi `signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)`.
8. Jika status berhasil, backend mengaktifkan tier dan mengisi `tier_expires_at`.

## Test Sandbox

1. Set `MIDTRANS_ENV=sandbox`.
2. Isi `MIDTRANS_SERVER_KEY` sandbox.
3. Restart service API.
4. Login user, buka Billing, pilih paket Creator/Pro/Business.
5. Pastikan browser diarahkan ke halaman Snap Sandbox.
6. Selesaikan pembayaran sandbox.
7. Cek menu Admin Orders dan endpoint `/api/v1/me/features`.

## Official References

- Snap redirect/token API: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Authorization: https://docs.midtrans.com/reference/authorization
- HTTP notification/webhook signature: https://docs.midtrans.com/docs/https-notification-webhooks
