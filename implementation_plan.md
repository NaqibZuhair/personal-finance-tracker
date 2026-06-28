# Product Roadmap & Implementation Plan

Dokumen ini adalah cetak biru (blueprint) untuk mengubah *Personal Finance Tracker* menjadi sistem kaliber *production*. Implementasi dibagi menjadi dua pilar: **Main App (Vercel Backend & Frontend)** dan **WhatsApp Gateway (AI Bot)**.

## User Review Required

> [!IMPORTANT]
> Silakan tinjau seluruh roadmap di bawah ini. Setelah lo baca dan setuju, tolong beritahu gue **Fase mana** (atau fitur nomor berapa) yang mau lo garap pertama kali bareng gue. Gue sangat menyarankan mulai dari **Fase 1 (Keamanan & Auth)**.

---

## 🛡️ Fase 1: Security, Auth & Basic Flow
Fokus utama adalah mengamankan aplikasi dari akses publik dan menyempurnakan alur akuntansi dasar.

### 🏢 Main App (Vercel)
- **Auth / Login:** 
  - *Backend:* Implementasi JWT Middleware atau Integrasi Clerk/Supabase Auth.
  - *Database:* Modifikasi `schema.prisma` dengan menambahkan tabel `User` dan merelasikan field `userId` ke `Transaction`, `Account`, dan `Category`.
  - *Frontend:* Pembuatan halaman Login/Register dan proteksi *Routing* dashboard.
- **Transfer Antar Account:** 
  - *Database:* Tambahkan nilai `transfer` pada ENUM `TransactionType`.
  - *Backend:* Buat endpoint baru untuk mencatat pemindahan uang (mengurangi satu akun, menambah akun lain secara atomik/transactional).
- **Dockerization (Backend):**
  - Pembuatan `Dockerfile` dan `docker-compose` jika ingin di-deploy di VPS mandiri.

### 🤖 WA Gateway (AI Bot)
- **API Key Injection:** Modifikasi `vercelApiService.js` agar selalu menempelkan token rahasia (`Authorization: Bearer <token>`) atau mengidentifikasi ID user (nomor WA) agar Vercel backend tahu siapa yang request.
- **Dockerization (Bot):** Pembuatan `Dockerfile` agar bot WA tidak gampang mati saat di-deploy ke server *cloud*.

---

## ⚙️ Fase 2: Logika Finansial Inti
Fokus pada otomatisasi pengeluaran dan penargetan anggaran.

### 🏢 Main App (Vercel)
- **Budget Bulanan:** 
  - *Database & Backend:* Buat tabel `Budget` (Target pengeluaran per kategori) dan API `/api/budgets`.
  - *Frontend:* UI Progress Bar (contoh: "Food: Rp1.5jt / Rp2jt - 75%").
- **Savings Goal:** 
  - *Database & Backend:* Buat tabel `Goal` (Target tabungan) dan API alokasi dana ke *goal*.
  - *Frontend:* UI Card untuk melihat *progress* (contoh: "MacBook M4 - 20% Tercapai").
- **Recurring Transactions:**
  - *Backend:* Implementasi *Cron Job* (`node-cron`) untuk mengeksekusi tagihan otomatis (seperti Netflix, Kosan) setiap tanggal tertentu.

### 🤖 WA Gateway (AI Bot)
- **Notifikasi Limit Budget:** AI Bot secara otomatis memberi peringatan *"Wah, budget makan lo bulan ini sisa 200rb nih!"* setiap kali lo catat pengeluaran makan.

---

## ⚡ Fase 3: Quick Input & Export
Fokus pada UX, kemudahan memasukkan data, dan mengeluarkan data.

### 🏢 Main App (Vercel)
- **Export CSV / Backup:**
  - *Backend:* Pembuatan endpoint `/api/export` yang mengonversi data JSON transaksi menjadi format `.csv`.
  - *Frontend:* Tombol *Download Backup CSV* di menu Settings.

### 🤖 WA Gateway (AI Bot)
- **WhatsApp Quick Entry (Fast Fallback):**
  - Pembuatan *Regex Parser* di `messageController.js`.
  - *Fungsi:* Lo bisa ketik `!catat 50000 makan gopay`. Bot akan langsung mencatat ke database dalam 0.1 detik tanpa menggunakan kuota/limit Gemini API. Sangat berguna untuk input super cepat.

---

## 📊 Fase 4: Advanced Analytics
Fokus pada visualisasi data tingkat lanjut.

### 🏢 Main App (Vercel)
- **Better Analytics & Advanced Charts:**
  - *Frontend:* Integrasi library `Recharts` atau `Chart.js` untuk membuat grafik garis (tren pengeluaran bulanan) dan grafik batang (perbandingan *income* vs *expense*).
- **Dashboard Account Breakdown:**
  - *Frontend:* Menampilkan *Pie Chart* komposisi harta kekayaan. Berapa persen aset lo di Bank, E-Wallet, dan Cash.

### 🤖 WA Gateway (AI Bot)
- **Conversational Analytics (AI Enhancement):**
  - Mengajari Gemini untuk bisa menjawab pertanyaan super kompleks: *"Bulan ini pengeluaran gue paling boros buat apa? Coba bandingin sama bulan lalu!"* (Membutuhkan penambahan API Vercel untuk menarik komparasi bulan lalu).

---

*Setiap fase di atas bisa kita mulai kerjakan dengan menggunakan command `/grill-me` (jika lo mau diskusi teknis sebelum eksekusi) atau langsung instruksikan "Ayo mulai Fase 1!".*
