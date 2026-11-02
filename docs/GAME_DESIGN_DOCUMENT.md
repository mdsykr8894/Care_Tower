# CARE TOWER — GAME DESIGN DOCUMENT (GDD)

**Tagline:** *Build the Safest Response*  
**Versi:** 1.0 — Spesifikasi pra-pembangunan  
**Status:** Arah visual dipersetujui; mekanik dalam dokumen ini ialah cadangan lengkap untuk semakan sebelum coding.  
**Konteks pembentangan:** *Teacher–PDRM Collaboration in Addressing Online Sexual Harassment and Cyberbullying in Schools*  
**Jenis:** Cozy educational quiz × arcade stacking  
**Audiens:** ±40 pemain individu, setiap seorang menggunakan telefon  
**Tempoh sasaran:** 4 minit permainan (240 saat), *tidak termasuk* masa role-play dan pengimbasan QR sebelum permainan dimulakan.  
**Platform sasaran:** Pelayar telefon; komputer presenter untuk live leaderboard.  
**Akses:** Penggunaan peribadi dalam satu pembentangan; tidak perlu akaun, room creation atau penerbitan awam.

---

## 1. Visi permainan

Care Tower ialah permainan pendidikan bergaya cozy storybook. Pemain menjawab **10 soalan berdasarkan ceramah**, kemudian menggunakan kemahiran *timing* untuk menjatuhkan blok yang bergerak ke kiri dan kanan, membina menara perlindungan simbolik. Skor akhir menggabungkan ketepatan pembelajaran (70%) dengan kemahiran stacking (30%). Semua pemain bersaing secara individu dalam satu sesi yang sama. **Leaderboard langsung** menunjukkan kedudukan dan meraikan tempat pertama selepas tamat.

**Janji pengalaman:** Permainan benar-benar mempunyai gerakan blok, tap-to-drop, perubahan menara, partikel dan animasi yang boleh dirasai — bukan hanya kuiz di dalam dashboard cantik.

**Prinsip pendidikan:** Menara mewakili respons selamat yang dibina melalui tindakan profesional. Kes yang dibincangkan serius: grafik tidak akan menjadikan penderitaan murid, gangguan seksual atau ugutan sebagai bahan jenaka. Kes dan mesej bersifat rekaan; tiada maklumat pelajar sebenar digunakan.

## 2. Skop dan keputusan asas

| Perkara | Keputusan |
|---|---|
| Nama kerja | **Care Tower** (tiada lagi nama projek lama) |
| Mode | Individu; semua peserta dalam satu sesi bersama |
| Jumlah pemain | Sasaran 40 serentak; kapasiti diuji di rangkaian sebenar |
| Soalan | 10 soalan berasaskan bank soalan pengguna, semua pilihan dan kunci jawapan terpelihara |
| Genre | Quiz + arcade block-stacking; bukan RPG/escape room |
| Tempoh | 240 saat dari Start hingga hasil mula dipaparkan; sesi daftar nama sebelum Start |
| Live leaderboard | Ya: semasa bermain dan di akhir permainan |
| Pendaftaran | Nickname sahaja; tiada e-mel/password pemain |
| Hosting | Server kecil di PC presenter pada Wi-Fi/LAN yang sama; satu QR/link tetap |
| Frontend | HTML + Tailwind CSS (CSS siap bina) + vanilla JavaScript + Canvas 2D |
| Backend | Node.js ringan **khusus** untuk sesi, masa, keputusan dan leaderboard; tiada database wajib |
| Audio | Kesan bunyi + muzik lembut, muted secara lalai pada telefon; butang unmute |
| Reka bentuk | Cozy Storybook Arcade; rujukan visual 2 set yang telah dipersetujui |
| Bahasa utama | Bahasa Melayu bagi semua soalan dan butang; tagline boleh kekal English |

### Bukan dalam skop

Tiada sistem cipta pelbagai bilik, akaun, chat, avatar shop, iklan, pertandingan awam, admin panel besar, integrasi media sosial, atau penerbitan laman untuk khalayak luar. Tiada mod co-op. Tiada ciri tambahan sekadar memenuhi demo teknikal.

## 3. Objektif pembelajaran (berkaitan langsung dengan pembentangan)

Permainan menguji kebolehan peserta untuk:

1. **Identify the Problem:** mengenal pasti aduan, tekanan emosi dan risiko keselamatan murid.
2. **Assess and Plan:** menilai risiko, mengendalikan bukti secara selamat dan merancang perlindungan.
3. **Consult and Refer:** memahami bila memaklumkan pentadbir serta melibatkan kaunselor/PDRM menurut keperluan.
4. **Implement Actions:** melaksanakan tindakan mengikut prosedur tanpa menghukum sebelum proses yang wajar atau menyebarkan maklumat.
5. **Monitor and Evaluate:** memantau keselamatan, emosi dan kehadiran selepas tindakan diambil.

**Batas profesional:** Guru mendengar, menyokong, merekod dan merujuk; PDRM menilai laporan dan menjalankan siasatan apabila berkenaan; kaunselor menyokong emosi; pentadbir menyelaras; penjaga menyokong menurut prosedur. Tidak menjanjikan kerahsiaan mutlak; kongsi pada prinsip *need-to-know*.

## 4. Identiti visual — dikunci sebagai sasaran

**Rujukan:** Dua moodboard Care Tower yang telah dipersetujui dalam perbualan: reka bentuk skrin Home, Question, Stacking, Perfect Feedback, Leaderboard, aset ilustrasi dan background. Gunakan sebagai **arah art**, bukan satu gambar penuh yang ditempel pada laman.

- **Art style:** 2D illustrated / cozy storybook / refined mobile indie arcade; bukan dark cyberpunk atau sistem pengurusan korporat.
- **Suasana:** kawasan sekolah kecil, taman, daun, awan, cahaya lembut waktu petang; tumbuhan kecil, buku dan bendera di puncak menara.
- **Menara:** blok warna pastel dengan simbol abstrak perlindungan, buku, sokongan, prosedur, pemantauan; dasar menara seperti bangunan sekolah kecil.
- **UI:** kad rounded, bayang lembut, panel seperti kertas nota, butang besar, tipografi jelas, hud skor kecil.
- **Perubahan suasana:** latar bergerak perlahan (parallax) dan bertambah tinggi seiring menara; kemajuan visual kekal positif.
- **Elakkan:** neon hacker, merah amaran berlebihan, karakter murid sebenar, gambar seksual, screenshot WhatsApp sebenar, elemen ganas.

### Palet awal

| Nama | Hex | Kegunaan |
|---|---|---|
| Warm Cream | `#FAF3E5` | Panel dan latar cerah |
| Sage Green | `#A8BA9A` | Elemen sokongan, blok |
| Sky Blue | `#C5E5E8` | Langit, panel sekunder |
| Warm Peach | `#E9B99F` | Aksen dan blok |
| Cocoa Brown | `#695448` | Teks utama, garis ilustrasi |
| Soft Lavender | `#C7B5E8` | Blok, badge kombo |
| Sun Gold | `#F2C66D` | Perfect dan juara |

Pastikan teks memenuhi kontras yang selesa; jangan gunakan pastel terang sebagai teks kecil di atas krim.

### Aset yang perlu dibina kemudian

- Background sekolah, langit dan horizon dalam beberapa lapisan (WebP/SVG); minimum satu scene mobile portrait.
- Dasar bangunan sekolah, set blok pastel (5–6 corak), ikon bertema lima langkah, mahkota/bendera menara.
- Butang, panel kuiz, bar progres, chime/hiasan Perfect, trophy, podium 1/2/3, partikel bintang.
- Semua UI interaktif dibina sebagai komponen HTML/CSS/Canvas yang sebenar, bukan bergantung kepada mockup gambar yang tidak responsif.

## 5. Aliran masuk pemain — paling ringkas

1. Presenter membuka permainan pada PC yang disambungkan ke Wi-Fi/LAN yang boleh diakses audiens.
2. Paparan projector menunjukkan satu **QR code / URL tetap** dan status bilangan peserta.
3. Semua peserta membuka link, taip nickname (maksimum 18 aksara; nama berganda diberi akhiran yang membezakan) dan tekan **Join**.
4. Skrin telefon menunjukkan pemandangan menara kecil dengan status **Ready — tunggu permainan bermula**.
5. Presenter menekan **Start** sekali untuk semua; tidak perlu membuat room baharu.
6. Semua pengguna mengikuti jadual 10 pusingan yang sama. Projector menampilkan timer/leaderboard; telefon menampilkan gameplay pemain.
7. Tamat 240 saat, skrin ranking akhir muncul. Presenter boleh Reset untuk sesi latihan baharu sekiranya perlu.

**Nota:** Masa untuk scan QR dan memasukkan nickname berlaku sebelum timer 4 minit bermula. Jika pengguna benar-benar mahu semua aktiviti masuk dalam 4 minit, jadual perlu disemak semula.

## 6. Core gameplay loop — 10 kali

**Question → Answer → Moving Block → Tap to Stack → Feedback → Next Question**

1. **Question (maks. 18s):** soalan ringkas BM dan 4 pilihan jawapan; pilihan boleh dikocok per pemain tanpa mengubah jawapan betul.
2. **Answer feedback:** jawapan diterima sekali; sistem merekod tepat/salah. Jika masa habis, ditanda tiada jawapan. Jawapan yang betul ditunjukkan secara ringkas bersama satu ayat penjelasan (ruang masa feedback terhad; huraian lengkap boleh dilihat selepas game).
3. **Stacking (4s):** satu blok bergerak mendatar. Pemain tap untuk menjatuhkannya; ketepatan sejajar blok sebelumnya menghasilkan mata.
4. **Moment (1s):** tulisan Perfect/Great/Good/Saved, partikel, bunyi pendek; transisi kepada soalan seterusnya.
5. Semua pemain menerima **satu blok setiap pusingan**, walaupun mereka menjawab salah. Ini mengelakkan mereka kehilangan peluang bermain dan menjaga pembelajaran tanpa menghukum secara berganda. Jawapan salah **tidak** mendapat mata kuiz.

**Perbezaan gameplay daripada kuiz:** ketepatan tap adalah kemahiran sebenar, dengan blok yang bergerak, objek jatuh, alignment, debu kecil, animasi susunan dan perkembangan menara yang nyata.

## 7. Mekanik blok dan fizik ringan

### Kawalan dan gerakan

- Kawalan utama: **satu tap** pada kawasan stacking yang besar; boleh tekan Space/Enter pada desktop.
- Blok bergerak automatik dari kiri ke kanan lalu berpatah balik; kelajuan dan arah konsisten untuk semua peranti.
- Normalisasikan kedudukan blok kepada koordinat dunia, bukan piksel skrin fizikal, supaya telefon berbeza saiz kekal adil.
- Selepas tap, blok jatuh dengan easing dan kesan bounce/landing yang pendek (sekitar 200–350ms).
- Satu peluang drop bagi setiap soalan; tiada kelebihan spam tap.

### Tahap ketepatan (cadangan awal; perlu playtest)

| Tahap | Jarak pusat blok berbanding sasaran | Mata stacking |
|---|---:|---:|
| Perfect | ≤ 8 unit dunia | 30 |
| Great | > 8 hingga 22 | 24 |
| Good | > 22 hingga 40 | 15 |
| Saved | > 40 atau masa tamat | 5 (jika tap) / 0 (jika tidak tap) |

- Blok boleh nampak sedikit mengimbangi kedudukan apabila tersasar. Kesan trim kecil boleh digunakan secara visual.
- **Tiada game-over mengejut:** jika blok sangat tersasar, sebuah *safety scaffold* yang lembut membetulkan kedudukan selepas markah rendah diberikan. Menara tetap dapat disiapkan sehingga 10 blok.
- Combo Perfect berturut-turut memberi animasi tambahan, **bukan** mata di luar pembahagian 70/30.
- Jika jawapan salah, blok masih diperoleh tetapi bersifat neutral/kurang bercahaya. Jangan kaitkan salah jawab dengan musibah ke atas murid.

## 8. Sistem skor dan syarat kemenangan

**Jumlah maksimum = 1,000 mata.**

- **Quiz (70%)**: 10 soalan × 70 mata setiap jawapan betul = **maksimum 700**.
- **Arcade skill (30%)**: 10 pusingan × maksimum 30 mata = **maksimum 300**.
- Salah jawab atau tidak menjawab = 0 mata kuiz untuk pusingan itu; masih boleh melakukan stacking.
- Skor mesti dihitung atau disahkan pada server, **bukan menerima nilai total rawak yang dihantar browser**.
- Sebarang bonus visual (Perfect streak, penghias menara) tidak boleh menaikkan jumlah maksimum melebihi 1,000.

**Tie-break:** (1) jumlah jawapan betul, (2) bilangan Perfect, (3) jumlah masa menjawab untuk soalan yang betul (paling pendek) — tidak memberi kelebihan mata utama; hanya untuk kes skor sama. Jika masih sama, papar kedudukan berkongsi atau ranking stabil yang dijelaskan.

**Ranking semasa game:** projector boleh menunjukkan Top 5 secara ringkas, dikemas kini setiap kali pusingan selesai. Pada telefon, papar skor sendiri dan kedudukan kasar tanpa menghalang gameplay.

**Ranking akhir:** podium tempat 1–3, Top 10, opsyen paparan semua ±40 nama, dan pada telefon setiap peserta dapat melihat kedudukan dirinya sendiri. Tiada nama penuh wajib dan tiada maklumat peribadi sensitif.

## 9. Masa tepat 4 minit

**Penting:** 4 minit ialah *tempoh sesi permainan* selepas peserta sudah masuk. Jadual seragam memastikan 10 soalan sempat ditawarkan kepada semua pemain.

| Segmen | Tempoh | Terkumpul |
|---|---:|---:|
| Intro animasi ringkas / Get Ready | 5s | 5s |
| 10 × Question | 10 × 18s = 180s | 185s |
| 10 × Stack | 10 × 4s = 40s | 225s |
| 10 × Feedback | 10 × 1s = 10s | 235s |
| Reveal keputusan / leaderboard | 5s | **240s** |

**Sistem:** semua ronde berasaskan *server scheduled timestamps* (contoh t+5, t+23, t+27). Jika pemain menjawab awal, boleh memulakan animasi bersedia, tetapi peluang stacking pada slot pusingan kekal seragam. Jika soalan tak dijawab sebelum tamat 18 saat, 0 mata kuiz tetapi peluang stacking tetap diberikan. Jika sambungan terganggu, pemain bersambung semula ke pusingan semasa.

**Isu bacaan:** 18 saat untuk soalan asal yang panjang mungkin tidak mencukupi. Oleh itu salinan skrin permainan di §10 mesti lebih padat dan diuji pada telefon sebenar. Jika ujian menunjukkan kadar bacaan terlalu rendah, **keutamaan ialah pembelajaran**: panjangkan permainan atau kurangkan bilangan soalan dengan persetujuan pengguna, bukan memaksa pemain meneka. Kami tidak menganggap jadual ini teruji sehingga dry run dibuat.

**Nota fasilitator:** Papan leaderboard boleh kekal pada projector selepas 240 saat; penjelasan dan Q&A berlaku di luar timer permainan.

## 10. Bank 10 soalan — versi ringkas untuk skrin permainan

> Kandungan berikut disusun semula mengikut logik 5 langkah konsultasi, bukan mengikut urutan asal pengguna. Inti, empat pilihan, dan jawapan betul asal dikekalkan. **Huruf jawapan di bawah ialah rujukan editorial**; UI boleh mengocok lokasi pilihan pada setiap telefon. Semak bahasa akhir dengan kumpulan pembentangan sebelum coding.

### Round 1 — Identify the Problem (soalan asal #5)

**Soalan:** Murid Tingkatan 3 menerima ugutan dalam talian dan kelihatan tertekan. Apakah langkah PERTAMA guru?

- **A.** Mengenal pasti masalah dan risiko murid. ✅
- **B.** Memantau perkembangan selepas laporan dibuat.
- **C.** Terus mengenakan tindakan terhadap pelaku yang disyaki.
- **D.** Terus menghubungi PDRM tanpa penilaian awal.

**Penjelasan:** Guru bermula dengan mendengar dan mengenal pasti masalah serta tahap risiko. Bantuan kecemasan perlu diutamakan jika terdapat ancaman segera.

### Round 2 — Initial Response (soalan asal #10)

**Soalan:** Murid Tingkatan 2 menunjukkan mesej seksual yang tidak diingini serta ugutan. Apakah respons awal guru?

- **A.** Menyuruh murid menyekat akaun sahaja.
- **B.** Mendengar aduan, memastikan keselamatan dan mengendalikan bukti dengan selamat. ✅
- **C.** Meminta murid berdiam diri.
- **D.** Menunggu ibu bapa membuat aduan.

**Penjelasan:** Guru perlu memberi respons yang menyokong, menilai keselamatan dan mengikuti prosedur merekod serta melindungi bukti.

### Round 3 — Assess and Plan (soalan asal #4)

**Soalan:** Guru telah menerima aduan dan maklumat kes buli siber. Apakah langkah seterusnya?

- **A.** Menunggu ibu bapa membuat laporan dahulu.
- **B.** Menilai risiko dan merancang perlindungan murid. ✅
- **C.** Merujuk kes kepada media tempatan.
- **D.** Mengumumkan kes kepada warga sekolah.

**Penjelasan:** Selepas mengenal pasti masalah, guru perlu menilai risiko dan merancang tindakan perlindungan menurut prosedur.

### Round 4 — Evidence and Privacy (soalan asal #8)

**Soalan:** Guru menerima tangkap layar berkaitan buli siber. Tindakan manakah TIDAK sesuai?

- **A.** Menyimpan rekod dengan selamat untuk dokumentasi kes.
- **B.** Membuat laporan mengikut prosedur.
- **C.** Merujuk kepada pihak yang berkaitan.
- **D.** Menyebarkan bukti kepada warga sekolah lain. ✅

**Penjelasan:** Maklumat kes hanya dikongsi dengan pihak yang perlu mengetahuinya. Jangan menyebarkan atau menyalin bahan sensitif tanpa asas dan prosedur yang sah.

### Round 5 — Confidentiality (soalan asal #9)

**Soalan:** Murid meminta guru merahsiakan kes kerana takut dimarahi ibu bapa. Apa yang patut guru lakukan?

- **A.** Menjelaskan prosedur dan mengutamakan keselamatan murid. ✅
- **B.** Menceritakan kes kepada rakan sekelas.
- **C.** Menunggu sehingga kes menjadi lebih serius.
- **D.** Menjanjikan rahsia mutlak tanpa tindakan.

**Penjelasan:** Guru perlu menerangkan had kerahsiaan secara sensitif; perlindungan dan pelaporan mengikut prosedur tetap diutamakan.

### Round 6 — PDRM Referral (soalan asal #7)

**Soalan:** Murid menerima ugutan daripada akaun tidak dikenali. Bilakah bantuan PDRM wajar didapatkan?

- **A.** Hanya apabila mesyuarat sekolah membincangkan kes.
- **B.** Apabila semua murid mengetahui kejadian.
- **C.** Apabila terdapat ancaman terhadap keselamatan murid. ✅
- **D.** Apabila sesi persekolahan hampir tamat.

**Penjelasan:** Ancaman keselamatan memerlukan respons segera mengikut tahap risiko dan saluran rujukan yang berkenaan.

### Round 7 — Value of External Consultation (soalan asal #1)

**Soalan:** Murid Tingkatan 4 dibuli siber, mula ponteng dan mengasingkan diri. Mengapa guru perlu konsultasi agensi luar?

- **A.** Membantu menangani kesan terhadap murid secara menyeluruh. ✅
- **B.** Membolehkan murid terus bertukar sekolah.
- **C.** Memastikan semua pelajar mengetahui kejadian.
- **D.** Menyebarkan maklumat kes kepada orang ramai.

**Penjelasan:** Kerjasama sekolah, kaunselor dan agensi berkaitan membantu menangani aspek keselamatan, emosi dan kehadiran.

### Round 8 — Fair Procedures (soalan asal #6)

**Soalan:** Seorang murid disyaki membuli siber, tetapi bukti belum lengkap. Apakah tindakan paling sesuai?

- **A.** Mengumumkan identiti murid yang disyaki.
- **B.** Mengendalikan kes dan siasatan yang berkenaan mengikut prosedur serta bidang kuasa. ✅
- **C.** Mendesak murid mengaku kesalahan serta-merta.
- **D.** Menghukum murid itu tanpa proses yang wajar.

**Penjelasan:** Guru tidak boleh menyiasat secara agresif atau terus menghukum; tindakan rasmi dan siasatan mesti mengikut bidang kuasa dan prosedur.

### Round 9 — Follow-up (soalan asal #3)

**Soalan:** Kes telah dirujuk kepada pentadbir, kaunselor dan PDRM; keadaan murid semakin stabil. Apa guru patut buat?

- **A.** Menganggap kes selesai sepenuhnya.
- **B.** Menyerahkan semua urusan kepada pihak luar.
- **C.** Memantau keselamatan dan emosi murid secara berkala. ✅
- **D.** Membincangkan kes dengan murid lain.

**Penjelasan:** Pemantauan selepas tindakan penting walaupun murid nampak semakin stabil.

### Round 10 — What to Monitor (soalan asal #2)

**Soalan:** Murid takut hadir ke sekolah akibat ugutan media sosial. Apakah perkara utama untuk dipantau?

- **A.** Jumlah pengguna media sosial di sekolah.
- **B.** Bilangan pengikut akaun murid.
- **C.** Keputusan peperiksaan semua murid kelas.
- **D.** Keselamatan, emosi dan kehadiran murid. ✅

**Penjelasan:** Susulan perlu menilai kesejahteraan murid secara menyeluruh, khususnya keselamatan, keadaan emosi dan kehadiran.

**Kunci asal mengikut turutan pengguna:** 1=A, 2=D, 3=C, 4=B, 5=A, 6=B, 7=C, 8=D, 9=A, 10=B.  
**Kunci mengikut round permainan:** A, B, B, D, A, C, A, B, C, D.  
**Peringatan:** Apabila pilihan jawapan di-shuffle semasa bermain, skor mesti bersandar pada ID pilihan betul dan bukan huruf tetap.

## 11. Reka bentuk skrin

### 11.1 Home / Join
- Logo ilustrasi Care Tower dan tagline *Build the Safest Response*.
- Bangunan sekolah/taman, langit dan awan bergerak perlahan.
- Input nickname jelas, butang **Join Game**, toggle muzik/SFX, info ringkas «10 questions • 4 minutes».
- Tiada email, login atau room code.

### 11.2 Waiting / Ready
- Menara kecil bernyawa dengan bendera, teks «Tunggu permainan bermula».
- Jumlah pemain sudah masuk, progress ringkas dan pengenalan kawalan «Tap to drop».
- Tidak memulakan timer sebelum presenter menekan Start.

### 11.3 Question
- Panel nota besar, meter masa (18s), counter `Soalan 3/10`, empat butang yang boleh ditekan dengan satu jari.
- Font mudah dibaca pada 360px lebar; jawapan panjang dibungkus rapi, bukan perlu horizontal scrolling.
- HUD skor sendiri tidak mengganggu teks.

### 11.4 Tower Stacking (skrin identiti utama)
- Menara di tengah skrin, blok bergerak ke kiri/kanan, satu kawasan tap besar.
- Pilihan «Tap anywhere to stack» bagi kejelasan.
- Blok memberi bayang pada blok sasaran; efek partikel dan perubahan scenery ketika tinggi bertambah.
- HUD kecil untuk skor, `5/10`, combo, dan sisa masa 4s.

### 11.5 Moment / Feedback
- Perfect/Great/Good/Saved + partikel dan kesan suara khas.
- Feedback jawapan betul/salah ringkas; konteks pembelajaran lengkap boleh dilihat pada results/review.

### 11.6 Final Player Results
- Menara lengkap, jumlah skor, berapa /10 betul, ketepatan stacking, ranking sendiri.
- Boleh lihat senarai jawapan tepat dan penerangan pendek; tiada main semula dalam sesi yang sama untuk memanipulasi skor.

### 11.7 Projector / Presenter
- Paparan besar (16:9) dengan QR sebelum start; selepas start timer, bilangan peserta aktif dan Top 5.
- Akhir permainan: podium 1–3, Top 10, opsyen senarai penuh 40.
- Kawalan presenter minimal: **Start / Pause / Reset / Reveal Results**, dilindungi PIN tempatan.

## 12. Reka bentuk animasi

| Peristiwa | Animasi | Durasi sasaran |
|---|---|---:|
| Home idle | Awan perlahan + daun berayun + bendera bergerak | Loop 8–20s |
| Jawapan ditekan | Button compress dan highlight lembut | 120–180ms |
| Jawapan betul | Bintang kecil + sentuhan cahaya | 250–450ms |
| Jawapan salah | Gentle shake sangat ringan, tiada flash merah keras | 180–250ms |
| Blok bergerak | Gerakan kanan/kiri menggunakan delta-time | Sepanjang 4s |
| Blok jatuh | Easing graviti dan micro bounce | 200–350ms |
| Perfect | Glow emas, pop tulisan dan sparkles | 500–700ms |
| Menara bertambah | Kamera menaik/scroll perlahan | 300–500ms |
| Tukar round | Slide kertas / fade pantas | 180–300ms |
| Leaderboard | Kad ranking masuk berturutan; trophy bersinar | 1–2s |

**Fungsi aksesibiliti:** `prefers-reduced-motion`, butang mute, teks/status yang tidak hanya disampaikan oleh warna atau audio. Animasi tidak boleh melambatkan jadual 240 saat.

## 13. Audio design

**Prinsip:** Audio penting untuk rasa bermain, tetapi 40 telefon dalam satu bilik ceramah boleh menyebabkan gangguan. **Muted secara lalai pada telefon.** Pemain boleh menghidupkan sendiri setelah interaksi pertama. Presenter boleh memainkan muzik latar yang sangat lembut melalui speaker projector jika sesuai.

| Cue | Karakter bunyi | Bila dimainkan |
|---|---|---|
| UI tap | Lembut, pluck / click | Tekan butang |
| Correct | Chime pendek mesra | Jawapan betul |
| Incorrect | Nada lembut neutral | Jawapan salah |
| Block motion | Hampir senyap | Elak bunyi berterusan |
| Block landed | Wooden tap | Selepas tap-to-drop |
| Perfect | Sparkle/chime lembut lebih kaya | Alignment sangat baik |
| Streak | 2–3 nota positif ringkas | Streak tertentu |
| Final results | Fanfare mini cozy | Ranking akhir |
| BGM | Lo-fi/acoustic instrumental original, loop lembut | Menu/bermain jika dihidupkan |

- Gunakan fail audio original berlesen sesuai atau SFX yang dijana/dicipta sendiri; jangan masukkan muzik komersial tanpa izin.
- Format `ogg`/`mp3` fallback; volume SFX sederhana, BGM sangat rendah, toggle mute tersedia di setiap skrin.
- Browser hanya boleh main audio selepas interaksi pengguna pertama; tangani autoplay restrictions.

## 14. Seni bina teknikal minimum

```text
CARE TOWER — PERSEKITARAN TEMPATAN

Presenter PC (Node.js local server)
  ├─ serves static HTML + compiled Tailwind CSS + vanilla JS
  ├─ hosts one fixed game session
  ├─ receives answers/drop results and calculates/validates scores
  ├─ broadcasts timer, round and leaderboard via SSE
  └─ provides projector screen with Start/Pause/Reset

40 mobile browsers ── Wi-Fi / LAN yang sama ──► Presenter PC
```

**Frontend:** HTML semantik, CSS siap bina daripada Tailwind, JS modular, Canvas 2D + `requestAnimationFrame` untuk stacking. Tidak perlu React. **Backend:** Node.js standard HTTP, SSE ke 40 telefon dan HTTP POST untuk action; tidak perlu Supabase, Firebase, database atau cloud hosting.

**Network:** Projector PC mempunyai LAN/Wi-Fi IP boleh dicapai (contoh `http://192.168.x.x:3000`); satu QR sama untuk semua. Jika Wi-Fi kampus mengaktifkan *client isolation*, telefon mungkin tidak dapat mencapai PC; uji awal atau gunakan router/hotspot khas yang mampu menampung 40 peranti. Kekalkan rangkaian tempatan sahaja, bukan rangkaian awam.

**Data:** nickname rawak/yang ditaip, id sesi, skor dan jawapan; disimpan dalam RAM dan hilang apabila server restart/Reset. Tiada data murid sebenar atau kandungan kes sensitif daripada peserta dikumpul. Semua soalan dibekalkan oleh pembentang.

**Scoring security:** Server tahu jawapan betul, round windows dan menerima satu answer/drop setiap round. Klien tidak dibenarkan menghantar `totalScore` yang terus dipercayai. Untuk stacking, penerimaan ukuran alignment daripada klien bersifat *friendly classroom trust*; pengesahan berpandukan seed/timing server boleh ditambah jika ujian menunjukkan manipulasi masalah, tetapi tidak membebankan versi pertama.

**Prestasi:** Sasarkan 60fps pada telefon sederhana; tekstur terhad, WebP ringan, tiada animasi berat penuh skrin, kurangkan draw calls, cache aset, hentikan rAF apabila tab tidak aktif. Reconnect tanpa membenarkan bermain semula ronde yang tamat.

## 15. Kelemahan dan kompromi yang disedari

1. **10 soalan × 4 minit = ketat.** Versi ringkas dan playtest bacaan adalah wajib; jangan jadikan slot 18s tidak fleksibel jika audiens tidak sempat memahami.
2. **40 pemain dengan LAN:** bukan beban server besar secara automatik, tetapi konfigurasi Wi-Fi, device isolation dan kestabilan rangkaian mesti disahkan menggunakan peranti sebenar.
3. **Leaderboard tanpa room:** satu sesi tunggal sesuai untuk pembentangan ini, tetapi reset perlu dijaga agar peserta tidak hilang skor di tengah permainan.
4. **Keberkesanan bunyi:** audio dari 40 telefon tidak sesuai jika semuanya kuat; opt-in audio melindungi suasana ceramah.
5. **Aset ilustrasi:** moodboard ialah rujukan; UI perlu dibina semula dan aset terpisah, bukan menukar gambar moodboard kepada screenshot palsu sebagai UI.

## 16. Pelan ujian sebelum pembentangan

### Kualiti gameplay
- Satu blok **benar-benar bergerak** dan jatuh apabila ditekan; alignment mengubah mata secara konsisten.
- Menara berkembang untuk 10 pusingan dan tidak terhenti kerana tersasar.
- Soalan ringkas masih tepat dengan jawapan asal; peranan profesional tidak disalahgambarkan.
- Animasi Perfect, salah jawab, combo dan akhir dapat dilihat jelas.
- Grafik nampak seperti reference cozy yang dipersetujui, bukan dashboard.

### Ujian masa dan bacaan
- Uji pada sekurang-kurangnya 5 peserta tidak biasa dengan soalan.
- Rekod berapa ramai sempat membaca dan menjawab dalam 18s; sasarkan majoriti boleh menjawab dengan tenang.
- Jika gagal, ubah masa/teks berdasarkan hasil ujian sebelum penilaian akhir.

### Ujian teknikal
- Chrome Android, Safari iPhone, Edge/Chrome desktop; skrin 360×740 hingga 430×932.
- 5, 20 dan 40 sambungan di rangkaian sebenar; buka tab semula, Wi-Fi terputus, telefon sleep.
- Pastikan setiap pemain hanya mencatat satu markah per round.
- Skor maksimum 1000, tie-break konsisten, Top 3 benar, semua nickname unik pada paparan.
- Projek berjalan tanpa internet luar selepas aset dibina secara lokal.
- Presenter Start/Reset dilindungi PIN; Reset tidak dapat dilakukan oleh pengguna biasa.

## 17. Milestone pembangunan — tidak terus bina semuanya

1. **Art prototype:** satu skrin stacking menggunakan aset cozy sebenar, bergerak dan interaktif; tunjuk di telefon. **Gate:** visual dan rasa gameplay diterima pengguna.
2. **Stacking engine:** fizik ringan, alignment, combo visual, kamera/menara tinggi; ujian feel.
3. **Quiz integration:** 10 soalan BM ringkas, timer dan 70/30 score. **Gate:** 4-minute dry run memuaskan.
4. **Leaderboard LAN:** nickname, sesi tunggal, QR, Start, SSE, final ranking; uji 40 peserta.
5. **Audio & polish:** SFX, muzik original/berlesen, reduced-motion, animasi podium, responsive.
6. **Final QA & rehearsal:** uji di lokasi pembentangan menggunakan rangkaian sebenar, sediakan fallback presenter.

**Prinsip gate:** Jangan klaim «game siap» jika stacking visual masih sekadar menekan pilihan atau objek tidak bergerak. Buktikan mekanik teras sebelum mengintegrasikan ciri lain.

## 18. Kriteria penerimaan akhir

- [ ] 10 soalan dan jawapan mengekalkan maksud bahan yang diluluskan.
- [ ] Mempunyai 10 pusingan soalan+stack yang boleh dimainkan, bukan kuiz biasa.
- [ ] Blok bergerak, drop, alignment dan Perfect feedback berfungsi secara nyata.
- [ ] Gaya cozy storybook hampir dengan reference boards yang dipersetujui.
- [ ] Audio ada, kawalan mute ada, bunyi tidak mengganggu kelas.
- [ ] ±40 audiens boleh join serentak dengan **satu QR**, tanpa room creation.
- [ ] Skor 70/30 dan maksimum 1000, leaderboard live, juara no.1 dipaparkan.
- [ ] Perjalanan game kira-kira 240s, tertakluk ujian bacaan sebenar.
- [ ] Cukup HTML/Tailwind/JS + server Node.js minimum, tanpa cloud/database wajib.
- [ ] Tiada data peribadi sebenar murid atau bahan seksual sensitif direkod dalam permainan.
- [ ] Diuji di telefon Android/iOS dan pada Wi-Fi tempat pembentangan.

## 19. Keputusan yang perlu disemak sekali sebelum coding

- Adakah **Care Tower** nama akhir? (Boleh diubah tanpa impak pada gameplay.)
- Adakah **Bahasa Melayu sepenuhnya** pada UI dan soalan yang dipendekkan ini dipersetujui?
- Adakah **4 minit untuk permainan sahaja** (QR/nickname lebih awal) seperti andaian di §9?
- Adakah perkadaran **70% ketepatan / 30% skill** dipersetujui?
- Adakah ranking akhir perlu menunjukkan nama peserta pilihan mereka sahaja? (Disyorkan.)

Apabila perkara tersebut disahkan, langkah pertama bukan backend atau room, tetapi **prototaip stacking sebenar dengan visual cozy yang telah disetujui**.

---

**Nota:** Ini ialah dokumen reka bentuk, bukan permainan atau kod yang telah dibangunkan. Maklumat akademik datang daripada bahan pembentangan yang pengguna berikan; semak istilah perundangan/prosedur terperinci dengan bahan rasmi KPM/PDRM sebelum persembahan akhir jika penjelasan di luar skop kes ditambah.
