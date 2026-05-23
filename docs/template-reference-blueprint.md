# Template Reference Blueprint

Dokumen ini mencatat fitur dan flow template undangan yang menjadi benchmark internal. Tujuannya adalah membuat template CintaBuku yang punya kelengkapan fitur setara, tetapi dengan visual, asset, dan code milik sendiri.

## Prinsip

- Jangan membawa script obfuscated, tracking, endpoint, atau branding pihak ketiga.
- Jangan memakai asset remote dari template pihak ketiga.
- Gunakan referensi hanya untuk urutan flow, jenis section, dan kualitas interaksi.
- Produk final harus menjadi template original CintaBuku.

## Flow Template Lengkap

1. Cover undangan.
2. Tombol buka undangan.
3. Kontrol musik.
4. Salam pembuka.
5. Profil mempelai.
6. Countdown acara.
7. Detail akad.
8. Detail resepsi.
9. Lokasi dan maps.
10. Galeri foto.
11. Cerita cinta.
12. RSVP.
13. Buku tamu/ucapan.
14. Amplop digital/kado.
15. Penutup.
16. Navigasi bawah.

## Acceptance Criteria Template Flagship

- Mobile-first, nyaman di viewport 390px sampai 750px.
- Semua section utama tersedia walau sebagian masih placeholder.
- Navigasi bawah bisa lompat ke section penting.
- RSVP tetap tersambung ke API.
- Visual punya identitas CintaBuku, bukan copy mentah template pihak ketiga.
- Tidak ada request ke domain template pihak ketiga.
- Tidak ada script anti-clone/obfuscated.

## Iterasi Polishing

Prioritas polishing:

1. Ornament atas/bawah tiap frame.
2. Font display khas CintaBuku.
3. Motion buka cover.
4. Animasi reveal section saat scroll.
5. Icon navigasi bawah.
6. Asset foto dan pattern original.
7. Musik dan audio control sungguhan.
8. Maps embed dari data editor.

