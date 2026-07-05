# 🗺️ MASTER ROADMAP: ADVANCED PERSONAL FINANCE TRACKER & AI WEALTH ADVISOR

Dokumen ini adalah **Rencana Induk (Master Plan)** untuk mengubah project *Personal Finance Tracker* menjadi super-app keuangan pribadi & kelas enterprise yang mengalahkan fitur aplikasi berbayar seperti **Wallet by BudgetBakers**, **Spendee**, dan **Monefy**.

---

## 🏆 VISI UTAMA
Membangun ekosistem keuangan pintar bergaya **Omnichannel (WhatsApp Gateway + Web Dashboard + Mobile PWA)** yang dipersenjatai dengan **Agentic AI Financial Advisor**, **Automated Bank Sync**, dan **Enterprise-Grade Accounting**.

---

## 📅 STRATEGI IMPLEMENTASI BERTAHAP (5 PHASES)

### 🔴 PHASE 1: Immediate Visual Excellence & UI/UX Polish (Quick Wins)
*Fokus: Menyempurnakan visual dasbor agar terasa mewah, interaktif, dan mulus digunakan di semua perangkat.*

1. **📊 Unified Income/Expense Interactive Toggle Chart**
   - **Konsep:** Menggabungkan grafik *Expense by Category*, *Income by Category*, dan *Net Cash Flow* ke dalam **1 Section/Card interaktif** di Dashboard.
   - **Teknis:** Menggunakan Recharts / Chart.js dengan tombol *Switch Toggle* (Expense ↔ Income) agar UI tetap bersih, tidak penuh, dan mudah dibandingkan secara langsung.
2. **🌙 PWA (Progressive Web App) & Dark Mode**
   - **PWA:** Bisa di-*Add to Homescreen* di iOS & Android, berjalan fullscreen layaknya aplikasi native tanpa bar browser, serta mendukung *offline caching*.
   - **Dark Mode:** Tema gelap premium bergaya *OLED Dark / Glassmorphism* dengan transisi halus menggunakan Framer Motion.
3. **🏷️ Multi-Dimensional Tags & Labels**
   - **Konsep:** Menambahkan sistem `#Tag` (contoh: `#LiburanBali2026`, `#Dinas`, `#Kondangan`) di setiap transaksi selain Kategori utama.
   - **Benefit:** Memungkinkan pemfilteran silang (misal: melihat total pengeluaran *Makan* khusus selama `#LiburanBali`).

---

### 🟠 PHASE 2: Next-Gen AI Omnichannel & Voice/Vision Intelligence
*Fokus: Memaksimalkan kecerdasan AI di WhatsApp dan Web agar pencatatan semudah berbicara dan memotret.*

4. **🎙️ Voice Note (VN) Speech-to-Text Scanner**
   - **Konsep:** User mengirim Voice Note ke WA Bot: *"Catat tadi beli bensin Pertamax seratus lima puluh ribu pakai Mandiri"*.
   - **Teknis:** Integrasi **Groq Whisper API** (transkrip kilat <0.5 detik) di WA Gateway, disuapkan ke Central AI Brain untuk eksekusi tool otomatis.
5. **🧾 Enhanced Multi-Modal Receipt OCR Scanner**
   - **Konsep:** Foto struk belanja / tagihan makan dikirim ke WA atau di-upload ke Web.
   - **Teknis:** AI Vision mengekstrak daftar barang (*line items*), pajak, diskon, dan nama merchant, lalu meminta konfirmasi akun pembayaran sebelum disimpan.
6. **🌅 Proactive Morning Briefing & Financial Health Alerts**
   - **Konsep:** Bot WA secara proaktif mengirim laporan pagi otomatis (misal pukul 08:00 WIB) atau peringatan batas kritis anggaran.
   - **Teknis:** Cron jobs terdesentralisasi (Vercel Cron / Node-Cron) yang memanggil AI untuk meracik sapaan personal dan analisis sisa uang harian (*Safe-to-Spend*).

---

### 🟡 PHASE 3: Social Finance, Debt Tracking & Advanced Forecasting
*Fokus: Menyelesaikan masalah keuangan sosial (utang/patungan) dan memberikan prediksi masa depan.*

7. **🤝 Smart Split-Bill & Debt Tracking (Catatan Utang / Piutang Teman)**
   - **Konsep:** Pencatatan patungan makan/nongkrong. Misal talangan Rp300rb untuk 3 orang.
   - **Teknis:** Sistem memecah transaksi menjadi pengeluaran pribadi (Rp100rb) dan piutang teman (Rp200rb). AI bisa mengingatkan: *"Budi belum bayar utang dimsum minggu lalu!"*
8. **👨‍👩‍👧 Shared Spaces / Joint Accounts (Fitur Suami-Istri / Partner)**
   - **Konsep:** Berbagi akun tertentu (misal: "Dompet Belanja Rumah Tangga") dengan pasangan atau partner bisnis.
   - **Teknis:** Sistem hak akses granular (Owner, Editor, Viewer) dengan pelacakan *Log by User* di setiap transaksi.
9. **🔮 Cash Flow Forecasting (Prediksi Safe-to-Spend)**
   - **Konsep:** AI memprediksi sisa uang riil sampai akhir bulan dengan memperhitungkan tagihan rutin (*Recurring Bills*) yang belum jatuh tempo dan tren kecepatan pengeluaran (*Spending Velocity*).
10. **📑 AI Executive Monthly Report (PDF Generator)**
    - **Konsep:** Pembuatan laporan keuangan bulanan berformat PDF eksekutif lengkap dengan bagan profesional dan *Executive Critique & Advice* yang ditulis oleh AI.

---

### 🟢 PHASE 4: Open Banking, Mutasi Reader & Multi-Asset Wealth Tracking
*Fokus: Otomatisasi penuh tanpa ketik dan pelacakan seluruh portofolio kekayaan.*

11. **📲 Cross-Bank Notification Reader & SMS Parser (Baca Notif Bank Lain)**
    - **Konsep:** Companion App (Android Notification Listener) atau Parser SMS yang membaca notifikasi masuk dari BCA, BRI, Mandiri, GoPay, Dana, dan OVO.
    - **Alur:** Begitu ada mutasi keluar/masuk di HP, sistem mengirim draf ke WA: *"Terdeteksi keluar Rp50.000 dari BCA di Indomaret. Mau dicatat sebagai Makanan?"*
12. **🏦 Real Bank API & M-Banking Integration**
    - **Konsep:** Integrasi *Open Banking / Account Aggregation API* (misal: BRIAPI, Moota, Ayoconnect, OneBrick, atau Plaid) untuk tarik data mutasi rekening secara otomatis & *real-time*.
13. **💱 Multi-Currency & Investment Portfolio Tracking**
    - **Konsep:** Melacak aset mata uang asing (USD, EUR), Saham (BBRI, BBCA), Reksadana, Emas, dan Crypto (BTC, ETH).
    - **Teknis:** Integrasi API kurs valas dan harga saham/crypto live sehingga total kekayaan (*Net Worth*) terupdate secara *real-time*.

---

### 🔵 PHASE 5: Enterprise Architecture, Docker & Complex Accounting
*Fokus: Skalabilitas infrastruktur, self-hosting deployment, dan standar akuntansi profesional.*

14. **🐳 Full-Stack Docker Containerization**
    - **Konsep:** Membungkus seluruh ekosistem (Backend Express, PostgreSQL, Frontend Next.js/Vite, WA Gateway Bot) ke dalam **Docker & Docker Compose**.
    - **Benefit:** Deployment 1-klik di server manapun (VPS, AWS, DigitalOcean, atau server lokal) dengan isolasi environment yang sempurna.
15. **🏢 Complex Multi-Tenant & Role-Based Access Control (RBAC)**
    - **Konsep:** Dukungan untuk organisasi kompleks, manajemen multi-user tingkat lanjut, ruang kerja terisolasi (*Workspaces*), dan *Audit Logging*.
16. **📚 Double-Entry Accounting Ledger (Sistem Akuntansi Rumit)**
    - **Konsep:** Di balik layar antarmuka yang simpel, sistem menjalankan mesin akuntansi standar profesional (*Debits & Credits*).
    - **Fitur:** *Chart of Accounts (COA)*, *Journal Entries*, *General Ledger*, *Trial Balance*, *Balance Sheet (Neraca)*, dan *Income Statement (Laporan Laba Rugi)* yang valid untuk keperluan audit atau bisnis kecil.

---

## 🎯 RECOMMENDED STARTING POINT (NEXT SESSION)
Untuk mulai melangkah ke Phase 1 dengan impak visual tertinggi sesuai request, kita akan mulai dari:
1. **Membuat Unified Income/Expense Toggle Chart di Dashboard** (1 section untuk ganti-ganti tampilan Income/Expense dengan mulus).
2. **Setup PWA & Dark Mode UI Polish**.
