# Care Tower v1.3 — Double-check / QA

## Audit yang dibuat

1. **Kod JavaScript:** lint sintaks (`node --check`) untuk pemain, tower, presenter, icons dan backend.
2. **Ujian automatik:** permainan 10 pusingan, pemarkahan 70/30, 40 peserta simulasi, reset, pause, token, storage CAS, ujian HTTP serta Vercel handler.
3. **Ujian baharu:** animasi optimistik, had pampasan timestamp jatuhan, revision state, pemulihan audio, pemilihan leaderboard terkini dan ketiadaan kunci jawapan dalam fail awam.
4. **Semakan browser simulasi:** halaman pemain pada viewport mobile 390×844 dan presenter 1600×900 menggunakan Chromium yang diinjeksi data ujian. Sahkan intro, menunggu, empat pilihan jawapan, nama peserta, Live Rankings, keputusan serta tiada ralat JS pada senario ini.
5. **Build awam:** `node scripts/build-vercel.js` membina `dist/` tanpa `demo-answers.js`. Ikon `icons.js` dan CSS dimasukkan.

## Perkara yang belum boleh disahkan di sini

- Bunyi pada **Safari iPhone fizikal**, termasuk silent mode dan background/foreground.
- Latency, kos dan konflik penulisan **Private Vercel Blob sebenar** pada 40 peranti melalui rangkaian berbeza.
- Sambungan dan respons sebenar QR pada domain Vercel yang bakal digunakan.
- Kualiti pada setiap model/versi iPhone dan browser pengguna.

## Ujian wajib sebelum pembentangan

1. Deploy ke Vercel, tetapkan `HOST_PIN` (8+ aksara) dan hubungkan **Private Blob Store**.
2. Dua iPhone/Android pada rangkaian berlainan: masukkan nickname, join, buka semula tab, sambung permainan.
3. Tekan audio: label **Mati → Hidup**, dengar chime; kemudian matikan semula.
4. Jalankan 10 soalan dan stacking, bandingkan markah dengan leaderboard presenter.
5. Jeda semasa blok bergerak, sambung, dan pastikan timer tidak bergerak semasa jeda.
6. Cuba 15–40 pemain serentak dan catat latency. Jika 503/slow masih kerap berlaku, **ganti single-file Blob state dengan storan atomik/realtime** (contoh Redis), bukannya cuba menaikkan angka retry tanpa ujian.
7. Final Results → Semakan Soalan. Pastikan jawapan betul tidak terdedah sebelum tamat.

## Mengukur delay

Tambah `?debug=1` pada URL pemain dan semak `window.__careTower.metrics` di Developer Console.

- `requests`: masa perjalanan permintaan API dalam milisaat, tanpa menyimpan nama/token.
- `drops.visualMs`: masa sejak sentuh sehingga animasi jatuh bermula.
- `drops.confirmationMs`: masa hingga server mengesahkan markah.
- `drops.compensatedMs`: pampasan masa yang server terima (maksimum 110 ms apabila timestamp munasabah).

**Nota:** Pampasan terhad mengurangkan, tetapi tidak menghapuskan kelewatan atau manipulasi oleh klien yang berniat jahat. Tiada tuntutan anti-cheat mutlak.
