# Care Tower v1.3.1 — Copy & UX Language Polish

This release retains the complete Care Tower v1.3 gameplay, scoring, multiplayer, and Vercel code. Changes are limited to user-facing wording and theme labels.

## Voice and tone
- Use English for game titles, CTA labels, game status, arcade feedback and navigation.
- Use natural Malay for short instructions, contextual guidance, and clarifications.
- Keep academic quiz questions and official teaching points unchanged.
- Avoid mentioning internal technology or development modes in player/presenter screens.
- Solo Play remains available when opening `public/index.html` as a file, but is presented as a real game mode rather than as a demo.

## Run
- Local: run `START-WINDOWS.bat` or `node server/index.js` (Node.js 20+).
- Vercel: follow the original v1.3 instructions; this release does not alter APIs, environment variables, Blob configuration or permissions.
- The build command `node scripts/build-vercel.js` recreates `dist` and excludes the private offline answer key.

## Copy QA
- Compare game, waiting, quiz, stacking, results, presenter lobby, live leaderboard, final and question review.
- Verify screen layout at mobile widths, especially quiz cards and CTAs.
- Verify answer choices and server-side answer keys remain identical to v1.3.

---

# Care Tower v1.3 — Cozy Quiz × Arcade Stacking

**Pembetulan daripada v1.1 + sokongan Vercel Private Blob (satu sesi aktif sahaja).**

Permainan untuk sesi ceramah *Teacher–PDRM Collaboration in Addressing Online Sexual Harassment and Cyberbullying in Schools*. Kira-kira 40 peserta bermain sendiri menggunakan telefon. 10 soalan, 10 blok, 4 minit, skor maksimum 1,000 (70% kuiz, 30% stacking). Gaya pastel/cozy, ilustrasi dan audio dikekalkan.

## Pembaikan baharu v1.3

- Kemaskan teks antaramuka Bahasa Melayu dan ganti ikon fungsi utama dengan ikon SVG seragam, tanpa mengubah 10 soalan.
- Butang audio kini jelas menunjukkan **Mati/Hidup**, memainkan chime ujian apabila dihidupkan, dan cuba memulihkan AudioContext Safari selepas terganggu. Bunyi masih **mati secara lalai**.
- Animasi blok bermula **sebaik pemain mengetuk**, tidak menunggu respons API; markah sebenar masih disahkan oleh server.
- Server menerima pampasan masa tap yang terhad (maksimum 110 ms) untuk mengurangkan kesan latency. Ini bukan sistem anti-cheat yang sempurna.
- Pengambilan state menggunakan semakan revision dan satu sync aktif untuk mengelakkan respons lama menindih kemajuan.
- Leaderboard pada telefon mendapat kedudukan terkini daripada respons server / status awam, bukan cache awal.
- Heartbeat dalam browser aktif dikurangkan kepada 25 saat, dengan tempoh online 55 saat untuk mengelakkan status offline palsu.
- Tambah diagnostik delay (`?debug=1`) dan QA visual Chromium serta ujian baharu.
- **Lihat `docs/QA_v1.3.md` untuk perkara yang lulus dan ujian peranti/Blob yang masih wajib.**

## Asas yang dikekalkan daripada v1.2

- **Fixed:** fungsi `drawRank()` menggunakan `pos` tanpa deklarasi, menyebabkan ranking kosong di skrin Live dan Final Results.
- Lobby memaparkan **nama peserta secara live** dalam chip pastel dengan status online/offline, selain bilangan joined dan connected. Penanda pemain baru muncul dengan animasi lembut.
- QR menerangkan URL dengan lebih kemas: di internet memaparkan nama domain, **tanpa dropdown alamat IP**. Dropdown hanya ditunjukkan untuk presenter pada `localhost` yang sedang memilih antara alamat LAN PC.
- Final podium menyembunyikan slot kosong jika hanya 1–2 orang join.
- Tambah ujian unit DOM/render dan ujian penyertaan/markah 40 pemain.
- Deploy-ready *architecture* untuk Vercel menggunakan **Node.js Functions + satu Private Vercel Blob store** (bukan SQLite / TXT / Supabase).
- **Critical:** build awam di `dist/` mengecualikan `public/demo-answers.js`, yang mengandungi jawapan demo offline. Kunci jawapan sebenar disimpan di sisi server.

> **Status ujian:** Semua ujian automatik tempatan lulus. Vercel sebenar, Private Blob sebenar, DNS/QR HTTPS dan 40 telefon fizikal **belum diuji dalam akaun Vercel anda**. Anda perlu jalankan smoke-test selepas deploy. Browser automatik di persekitaran penyediaan ini menyekat navigasi, jadi pengesahan render browser fizikal belum boleh didakwa.

## A. Uji dahulu pada Windows (tidak memerlukan Blob)

1. Extract ZIP ke folder berasingan `Care_Tower_v1.3` (jangan campur fail lama).
2. Gunakan Node.js v20 atau lebih baharu.
3. Jalankan `START-WINDOWS.bat`, atau:

   ```powershell
   $env:HOST_PIN = "YOUR-STRONG-PRESENTER-PIN"
   node server/index.js
   ```

4. Buka `http://localhost:3000/presenter`, masukkan PIN.
5. Imbas QR dengan telefon dalam Wi-Fi sama untuk uji nama peserta di lobby dan live ranking.
6. Cara demo individu tanpa server: double-click `public/index.html` (demo offline, **tiada leaderboard berbilang pemain**).

Tiada `npm install` diperlukan untuk menjalankan **server Windows tempatan**. Dependencies cloud hanya digunakan apabila deploy ke Vercel.

## B. Deploy ke Vercel (tanpa database luaran)

Vercel Functions **tidak mempunyai filesystem kekal untuk SQLite atau TXT**. Oleh itu, satu **Vercel Blob Store jenis Private** digunakan untuk menyimpan fail keadaan permainan JSON secara kekal. Ini masih storan terurus, tetapi ia dibuat dan diurus terus dari dashboard Vercel, bukan Supabase. Ia mungkin tertakluk kepada kuota/penggunaan storan Vercel.

1. **Upload projek ke GitHub** (repo peribadi pun boleh). Root projek mengandungi `vercel.json`, `package.json`, `public/`, `server/`, `api/`, `scripts/`.
2. Dalam [Vercel](https://vercel.com), pilih **Add New Project → Import Git Repository**. Pilih repo ini. Framework `Other` (`framework: null` sudah dinyatakan).
3. `vercel.json` sudah menetapkan:
   - build: `node scripts/build-vercel.js`
   - static output: `dist/`
   - API routes: `/api/*` ke Node.js Function.
   Jangan menetapkan direktori root kepada `public/`; gunakan root projek.
4. Pada **Project Settings → Environment Variables**, tambah `HOST_PIN` dengan kata laluan presenter yang panjang (sekurang-kurangnya 8 aksara; disyorkan 12+ aksara). Jangan guna PIN mudah.
5. Dalam **Storage** projek, pilih **Create Database → Blob** dan pilih **Private**. Hubungkan ke project dan pilih environment Production. Vercel menyambungkan credentials seperti `BLOB_READ_WRITE_TOKEN` atau OIDC/store ID. Tidak perlu salin token ke frontend.
6. Deploy/ **Redeploy** selepas env dan Blob disambungkan.
7. Uji `https://DOMAIN-ANDA.vercel.app/api/health` → sepatutnya `{"ok":true,"version":"1.3.1",...}`. Jika 503, pastikan Private Blob disambungkan untuk environment deployment yang sedang digunakan.
8. Buka `https://DOMAIN-ANDA.vercel.app/presenter` dan login guna `HOST_PIN`. QR terus menggunakan domain tersebut. Pemain hanya buka `https://DOMAIN-ANDA.vercel.app/`, masukkan nickname dan join. **Tiada room code, akaun pemain atau PIN pemain.**
9. Uji 2 telefon daripada rangkaian berbeza: join → Stack → Quiz → leaderboard → Results → Review → Reset. Lakukan latihan dengan seramai mungkin peserta sebelum ceramah.

> **Nota preview:** Gunakan Blob Store berasingan / `CARE_STATE_PATH` yang berbeza untuk preview jika mahu elakkan preview mengubah sesi Production. Default `CARE_STATE_PATH` ialah `care-tower/current-session.json`.

### Bagaimana satu sesi global disimpan?

- State permainan tersimpan sebagai JSON **private** dalam Vercel Blob. Jangan publish file itu ke storan awam.
- Bacaan menggunakan `get(..., { access:'private', useCache:false })` supaya data tidak stale kerana cache.
- Penulisan menggunakan **ETag conditional write** (`ifMatch`) serta retry apabila dua permintaan serentak cuba mengubah sesi. Ini mencegah *lost updates* dalam ujian simulasi.
- Presenter dan pemain menggunakan polling HTTP sekitar **2 saat** di cloud, bukannya SSE yang memerlukan sambungan panjang. Live ranking di cloud adalah **near-live**, bukan jaminan kemas kini milisaat.
- Status pemain dikekalkan dalam browser melalui `localStorage`; refresh atau membuka semula tab pada browser/peranti sama boleh auto-resume selagi sesi yang sama masih aktif.

**Skalabiliti dan batas:** Private Blob sesuai untuk percubaan pertandingan 40 peserta yang singkat, tetapi ia bukan pangkalan data realtime khusus. Penulisan serentak boleh menyebabkan retry/kelewatan dan bacaan `useCache:false` mempunyai kos serta kuota. Untuk acara kerap atau lebih ramai peserta, pertimbangkan Redis/KV terurus. Versi ini **tidak didakwa diuji live di Vercel**; ujian sebenar masih perlu dibuat.

## C. Urutan presenter (satu tab/projector)

| Fasa | Apa yang dipaparkan |
|---|---|
| Lobby | QR, domain/url, jumlah peserta, **senarai nama live**, Start, Fullscreen |
| Playing | Top 7 ranking live, timer 4 minit, count joined/connected/completed, Pause/End |
| Paused | Ranking dibekukan dengan overlay Pause, Resume |
| Finished | Podium Top 3 yang adaptif (1/2/3), Top 10 Final Rankings, Review |
| Review | 10 soalan dan statistik jawapan A–D, peratus betul, Previous/Next/Winners |

Presenter sahaja menggunakan PIN. **Reset dan End memerlukan pengesahan**, supaya terhindar tersalah tekan ketika ceramah. Kawalan PIN tidak ditayangkan selepas login.

## D. Keputusan permainan

- **Stack → Quiz** bagi 10 pusingan.
- Stacking: Perfect +30, Great +24, Good +15, Saved +5, Missed 0.
- Quiz: Betul +70; Salah/Timeout 0. Tiada bonus kelajuan menjawab (kelajuan hanya pemutus seri).
- Skor maksimum **1,000**.
- Masa pertandingan 4 minit bermula apabila presenter tekan Start. Penyertaan/nickname boleh dilakukan sebelumnya.

## E. Ujian dan troubleshooting

```sh
npm test
```

Ujian dilaksanakan menggunakan Node.js, termasuk logik permainan, API tempatan, 40 players mock, optimistic updates cloud, ujian frontend DOM rendering, dan semakan build.

- Jika leaderboard kosong: refresh presenter dan semak Developer Console. v1.3 mengekalkan `drawRank()` dan mempunyai ujian DOM.
- Jika Cloud `503` / URL kosong: pastikan Private Vercel Blob dan env sudah tersedia untuk environment tersebut.
- Jika QR tidak muncul pada Vercel: semak logs Function `/api/qr.svg`, install `qrcode` dependency semasa build, dan domain preview yang betul.
- Jika pemain hilang token: gunakan browser/peranti sama, tanpa mode private; pastikan sesi belum Reset.
- Jika pemain gagal join ketika ramai orang serentak: cuba lagi sebentar; satu fail Blob mempunyai kawalan tulis serentak (optimistic retry).
- Jika pengiraan markah stacking tidak sepadan pada internet jauh: ujian latency sebenar masih diperlukan. Server menentukan mata berdasarkan masa tindakan diterima, maka latency yang tinggi boleh menjejaskan ketepatan.

## F. Struktur

```text
public/             # Sumber HTML, CSS, JS yang sama, kekalkan demo offline
server/             # GameState, soalan private, local HTTP, Blob CAS
api/handler.js      # API Vercel Node.js
scripts/build-vercel.js # membina dist/ tanpa kunci jawapan demo
dist/               # fail awam untuk Vercel (dihasilkan ketika build)
vercel.json         # konfigurasi Vercel
tests/              # ujian automatik
```

Peringatan: Game untuk simulasi pembelajaran sahaja, bukan untuk merekod identiti mangsa sebenar. Utamakan privasi murid dan prosedur rujukan profesional.


## Audit prestasi selepas pembaikan

Lihat `docs/QA_v1.3.md`. Versi ini **belum diuji terhadap Vercel Blob sebenar**; untuk 40 pengguna serentak, satu fail JSON Blob berkemungkinan masih menjadi kekangan throughput. Jika latency tinggi, storan yang sesuai untuk kemas kini atomik perlu dipertimbangkan.
