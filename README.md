<div align="center">
  <h1>⚗️ McCabe-Thiele Simulator <br/> <small>with AI Co-Pilot & SCADA Visualization</small></h1>
  
  <p><strong>Rigorous Thermodynamic Binary Separation Engine (Ethanol-Water) for Chemical Engineers.</strong></p>

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Recharts-22B573?style=flat-square&logo=react" alt="Recharts">
    <img src="https://img.shields.io/badge/LLM-9Router%20Engine-9333EA?style=flat-square&logo=openai&logoColor=white" alt="9Router Engine">
  </p>
</div>

<br />

## 🌟 Overview

**McCabe-Thiele Co-Pilot** adalah simulator kolom fraksionasi kontinyu (campuran biner Etanol–Air) bertingkat industri. Didesain secara spesifik menggunakan model keseimbangan uap-cair (VLE) berdasarkan data empiris **Perry's Chemical Engineers' Handbook**, lengkap dengan batasan termodinamika azeotrop (1 atm).

Aplikasi ini tidak hanya menampilkan kurva kesetimbangan dan jumlah *stage* operasi, tetapi juga mengintegrasikan **AI Co-Pilot** otonom yang bisa melakukan kalibrasi parameter, optimasi energi (reflux ratio), dan audit HAZOP secara *real-time* via Natural Language.

*(Proyek disiapkan untuk deployment langsung di Vercel: [https://github.com/Praditya27-stack/mccabe-copilot](https://github.com/Praditya27-stack/mccabe-copilot))*

---

## 📸 Demo Interaksi

*(Ganti `demo.gif` dan `screenshot.png` di folder `/public` dengan rekaman Anda)*

<p align="center">
  <img src="https://via.placeholder.com/800x450/090d16/10b981?text=SCADA+Distillation+Column+Preview" alt="SCADA Overview" width="80%">
  <br/><i>Preview Dual-View SCADA: Kurva McCabe-Thiele interaktif & Menara SVG Dinamis</i>
</p>

---

## Arsitektur Sistem

Aplikasi ini dibagi menjadi 3 *engine* komputasi utama yang berjalan secara sinkron (100% Client-Side untuk keamanan dan performa, kecuali jembatan AI):

### 1. Thermodynamic VLE Engine (Perry's Handbook)
- **Data Empiris**: Kurva kesetimbangan Ethanol-Water tidak menggunakan Raoult's Law ideal, melainkan interpolasi spline data nyata dari Perry's Handbook pada tekanan 1 atm (101.325 kPa).
- **Azeotropic Limit**: Terkunci keras (hard-clamped) pada fraksi mol etanol $x_{az} \approx 0.8943$ (~95.6% berat). Sistem akan menolak jika pengguna memasukkan target $x_D \ge 0.8943$.
- **Double Pinch Detection**: Deteksi otomatis untuk Feed Pinch Point (kondisi aliran umpan *q-line* bersinggungan dengan ROL/SOL) dan Tangent Pinch Point pada kurva non-ideal.
- **Golden Staircase Calculation**: Menghitung jumlah baki teoritis (Theoretical Stages) dan menentukan lokasi optimal *Feed Tray* dari titik potong *Operating Lines*.

### 2. SCADA Digital Twin Visualization
- Komponen fisik (Kettle Reboiler, Total Condenser, Nozzle Feed) dirender ulang secara reaktif menggunakan murni SVG (tanpa aset eksternal).
- Posisi *inlet feed* akan berpindah dinamis mengikuti hasil komputasi *Feed Stage* dari McCabe-Thiele solver.
- URL State Sync (`/?xd=0.85&zf=0.4`) memastikan skematik langsung cocok saat link dibagikan.

### 3. AI Co-Pilot (9Router Function Calling)
Sistem memiliki Chatbot AI terintegrasi dengan akses langsung ke panel kontrol SCADA:
- **Natural Language to Dashboard**: Ketik *"optimasi reflux dan hemat beban energi reboiler"* dan AI akan mengirimkan *Tool Call* JSON untuk menyesuaikan slider tanpa interaksi manual pengguna.
- **9Router LLM Engine**: Menghubungkan VPS Tunnel dengan model LLM ber-parameter tinggi.
- **Offline Heuristic Mode (Fallback)**: Jika VPS Tunnel / 9Router API terputus (503/Timeout), aplikasi **tidak akan crash**. Co-Pilot akan secara elegan beralih ke Mode Standalone, dan seluruh tombol **Quick Prompts** (Optimasi, HAZOP, Preset) akan dieksekusi secara heuristik lokal di browser.

---

## Instalasi & Menjalankan Lokal

```bash
# 1. Clone repository
git clone https://github.com/Praditya27-stack/mccabe-copilot.git
cd mccabe-copilot

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Copy file .env.example menjadi .env.local (jika ada), atau set variabel berikut:
# ROUTER_BASE_URL=https://rw3luvx.abc-tunnel.us/v1
# ROUTER_API_KEY=sk-your-vps-api-key
# ROUTER_MODEL=ag/gemini-3.8-flash-high

# 4. Run Development Server
npm run dev
# Server berjalan di http://localhost:3000
```

---

## Deploy to Vercel (Go-Public)

Proyek ini telah dikonfigurasi penuh dengan **Next.js 15 App Router** lengkap dengan metadata Open Graph dan `layout.tsx` siap *production*.

1. Push repository ke GitHub.
2. Login ke [Vercel](https://vercel.com) dan buat Project baru.
3. Import repository GitHub `mccabe-copilot`.
4. Di bagian **Environment Variables**, tambahkan:
   - `ROUTER_BASE_URL`
   - `ROUTER_API_KEY`
   - `ROUTER_MODEL`
5. Klik **Deploy**.
6. Selesai! Link Vercel Anda sudah dilengkapi dengan *Social Preview Thumbnail* (OG Image) yang rapi saat disebar ke WhatsApp atau LinkedIn.

---
*Developed with Next.js & Thermodynamics.*
