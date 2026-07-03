# 🚀 The Next Level: Menyaingi "Wallet by BudgetBakers"

Kalau visi lo adalah bikin *Personal Finance Tracker* ini sekelas (atau bahkan lebih nyaman) dari aplikasi raksasa kayak **Wallet by BudgetBakers** (khusus untuk penggunaan personal/keluarga kecil 1-3 orang), ini adalah fitur-fitur **"Killer"** yang menurut gue harus kita garap selanjutnya:

## 1. 👨‍👩‍👧 Shared Spaces / Joint Accounts (Fitur Suami-Istri / Partner)
**Konteks 1-3 Orang:** Di BudgetBakers, fitur *Group Sharing* berbayar mahal. Kita bisa bikin gratis!
- **Fitur:** Lo bisa nge-*share* spesifik akun (contoh: "Rekening Belanja Dapur") ke akun *tracker* istri/partner lo. 
- **Benefit:** Setiap transaksi yang dia catat masuk ke laporan keluarga, dan kelihatan siapa yang nyatet (*"Logged by Naqib"* atau *"Logged by Istri"*).
- **Teknis:** Bikin tabel `SharedAccount` di *database* buat ngatur hak akses (Owner, Editor, Viewer).

## 2. 🧾 AI Receipt Scanner (Integrasi Gemini Vision di WA)
- **Fitur:** Alih-alih ngetik `!catat 50000 makan`, lo cukup foto struk Indomaret/Kopi Kenangan dan kirim ke Bot WA.
- **Benefit:** Gemini AI (karena mendukung Vision) otomatis mendeteksi total belanjaan, menebak kategori, dan mencatatnya langsung. Lo cuma tinggal balas "Oke". Ini *magic* banget dan jadi nilai jual utama dibanding BudgetBakers yang scan struknya lambat.

## 3. 🏷️ Tags & Labels (Multi-Dimensi)
- **Fitur:** Saat ini kita cuma punya `Category` (Makan, Bensin). Gimana kalau lo mau ngelacak total pengeluaran liburan? Kalo dibikin Kategori "Liburan", nanti kecampur antara makan liburan dan tiket pesawat.
- **Benefit:** Dengan fitur *Tags* (`#LiburanBali2026`, `#Kondangan`), lo bisa masukin Makan (Food) dengan tag `#LiburanBali`. Di *Dashboard* nanti bisa di-filter khusus tag tertentu. 

## 4. 🔮 Cash Flow Forecasting (Prediksi Sisa Uang)
- **Fitur:** Aplikasi *nggak* cuma ngeliat ke belakang (historis), tapi bisa **melihat ke depan**.
- **Benefit:** Sistem akan ngebaca *Recurring Transactions* (tagihan kos, Netflix yang belum dibayar bulan ini) dan sisa *Budget* yang belum dipakai, lalu nampilin grafik prediksi: *"Saldo BCA lo sekarang Rp5jt, tapi karena ada tagihan kos Rp2jt besok lusa, realita sisa uang aman lo (Safe to Spend) cuma Rp3jt"*.

## 5. 🌙 UI/UX Polish: Dark Mode, PWA & Micro-animations
Untuk mengalahkan *feel* premium dari BudgetBakers:
- **PWA (Progressive Web App):** Bikin Vercel app lo bisa di-Add to Homescreen di HP iOS/Android dan jalan layaknya aplikasi *native* (hilang *bar browser*-nya).
- **Dark Mode:** Wajib ada buat *app* kekinian. Mengingat kita pake Tailwind, ini tinggal nambahin kelas `dark:` dan bikin *toggle* di Settings.
- **Framer Motion:** Nambahin *micro-interaction* (animasi klik, transisi perpindahan halaman yang mulus) biar aplikasinya kerasa "mahal".

## 6. 💰 Split Bill / Hutang Teman (Debt Tracking)
- **Fitur:** Kalau lo makan bareng 3 temen dan lo yang bayarin dulu pakai kartu kredit lo.
- **Benefit:** Waktu nyatat, lo bisa milih "Split Bill", trus aplikasi nambahin catatan "Piutang" dari Si A dan Si B. Pas mereka bayar, saldonya nge-*offset* piutang tersebut. Ini penyakit harian orang Indonesia yang sering bikin *cashflow* berantakan.

---
**Rekomendasi Prioritas (Berdasarkan Impact vs Usaha):**
Gue sangat menyarankan kita mulai dari:
1. **AI Receipt Scanner** (karena kita udah punya ekosistem WA bot yang super *powerful*).
2. **PWA & Dark Mode UI Polish** (usaha kecil tapi impact visual luar biasa).
3. **Tags & Labels** (menyempurnakan struktur data sebelum makin rumit).
