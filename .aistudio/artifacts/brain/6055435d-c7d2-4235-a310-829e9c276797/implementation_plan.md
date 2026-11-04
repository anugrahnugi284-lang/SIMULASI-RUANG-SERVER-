# Dasbor Telemetri Radial Gauge Ruangan Server

Menambahkan tab dasbor visualisasi instrumen radial gauge interaktif berpresisi tinggi untuk memantau status sensor lingkungan ruang server—meliputi suhu rata-rata ruangan, kelembaban relatif (% RH), kepadatan partikel asap (PPM), dan konsumsi daya PDU (kW)—lengkap dengan busur warna zona aman (optimal, warning, critical), jarum penunjuk dinamis, pembacaan digital font tabular, serta filter pemantauan per rak server individual.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi yang telah Anda berikan pada sesi klarifikasi:
> - **Penempatan Layar:** Ditambahkan sebagai tab navigasi utama baru bernama **"Gauges"** pada bilah menu atas, berdiri berdampingan secara mulus dengan tab 3D Twin, Analitik Tren, Event Log, dan Dokumen PRD.
> - **Gaya Visual Gauge:** Format *Circular Arc Instrument Meter* dengan jarum penunjuk (*needle indicator*), skala pembagian (*tick marks*), dan zona gradasi warna (Hijau Aman ASHRAE, Kuning Warning, Merah Kritis).
> - **Cakupan Sensor Utama:** 4 instrumen hero gauge (Suhu Rata-rata Ruangan, Kelembaban Relatif, Kepadatan Asap/Gas PPM, Total Beban Daya PDU) serta pemilih sekunder (*Rack Selector*) untuk melihat gauge masing-masing rak (A1–B4).

---

### 1. Overview & Core Concept

- **Apa yang Dibangun:** Dasbor instrumen fisik analog-digital (*cockpit industrial telemetry*) yang menerjemahkan data streaming sensor real-time menjadi visualisasi instrumen gauge melingkar yang mudah dibaca secara intuitif oleh tim operator NOC dan SRE.
- **Target Persona:** SRE Operator, Facilities Engineer, dan IT Infrastructure Manager yang membutuhkan pemindaian visual cepat status ambang batas (*threshold safety zones*) tanpa harus membaca tabel numerik padat.
- **Nilai Tambah Utama:** Mempercepat waktu identifikasi anomali (*Mean Time to Detect / MTTD*) dengan menyajikan sudut simpangan jarum dan kode warna zona batas aman ASHRAE TC 9.9 secara seketika.

---

### 2. User Experience & Visual Design

- **Alur Pengguna (User Flow):**
  1. Pengguna membuka aplikasi dan mengklik tab **"Gauges"** pada bilah navigasi atas (Top Header).
  2. Layar menampilkan 4 *Hero Radial Gauges* teratas:
     - **Suhu Lingkungan (°C):** Rentang 10°C – 45°C, zona optimal hijau (18°C – 24°C), zona kuning (25°C – 30°C), zona merah kritis (>31°C).
     - **Kelembaban Relatif (% RH):** Rentang 0% – 100%, zona aman ASHRAE (40% – 60% RH), zona kuning (30-40% & 60-70%), zona bahaya (<30% ESD risk & >70% condensation).
     - **Deteksi Partikel Asap (PPM):** Rentang 0 – 500 PPM, zona udara bersih (0 – 100 PPM), zona pre-alarm (120 – 240 PPM), zona bahaya alarm kebakaran (>240 PPM).
     - **Konsumsi Daya PDU (kW):** Rentang 0 – 80 kW, dengan batas efisiensi beban daya.
  3. Di bawah ringkasan hero, pengguna dapat memilih tombol rak spesifik (Rak A1 hingga B4) untuk membandingkan gauge suhu inlet vs exhaust dan pembacaan sensor asap mikro pada rak tersebut.
  4. Perubahan simulasi (seperti Overheat B2 atau Asap Zona A) secara langsung menggerakkan jarum gauge secara halus (*smooth transition*) dan mengubah status meter menjadi mode peringatan.

- **Tema & Tipografi:**
  - *Latar Belakang & Permukaan:* Slate gelap industri (`#0b0e14` dan `#121824`), garis pemisah tipis (`border-slate-800`).
  - *Aksentuasi Gauge:* Jarum penunjuk berpendar halus, busur gradien SVG anti-aliased presisi tinggi.
  - *Tipografi:* Angka digital tebal menggunakan font monospace dengan *tabular-nums* (`font-mono tabular-nums text-white`) guna mencegah getaran tata letak saat nilai streaming berubah tiap detik.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Render SVG Murni vs Library Eksternal Canvas**
  - *Pendekatan Terpilih:* Membangun komponen radial gauge interaktif berbasis SVG kustom (`<svg>` dengan `stroke-dasharray`, `path` arc trigonometri, dan jarum yang berotasi via CSS/transform).
  - *Alasan:* Ringan, tajam di semua resolusi layar (Retina/4K), zero-dependency (tidak membutuhkan package npm baru yang rentan breaking changes), serta 100% responsif.
- **Keputusan 2: Penempatan Tab Navigasi Khusus**
  - *Pendekatan Terpilih:* Menjadikannya tab mandiri di sebelah "3D Twin", "Analitik Tren", "Event Log", dan "Dokumen PRD".
  - *Alasan:* Memberikan ruang pandang penuh untuk instrumen multi-gauge tanpa mengorbankan atau menutupi kanvas WebGL 3D, mematuhi prinsip *unobstructed viewport*.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               TopHeader Navigation Bar                 │
│   [3D Twin]   [Analitik Tren]   [Event Log]   [Gauges] │
└───────────────────────────┬────────────────────────────┘
                            │ (Tab Active = 'gauges')
                            ▼
┌────────────────────────────────────────────────────────┐
│              GaugeDashboardContainer.tsx               │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Hero Gauges Row (4 Primary Dial Meters)      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐  │  │
│  │  │ Suhu (°C)  │ │ Kelembaban │ │ Partikel Asap│  │  │
│  │  └────────────┘ └────────────┘ └──────────────┘  │  │
│  │  ┌────────────┐ ┌─────────────────────────────┐  │  │
│  │  │ Daya (kW)  │ │ Ringkasan Status & ASHRAE   │  │  │
│  │  └────────────┘ └─────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Rack-Level Detailed Gauge Matrix (A1 - B4)     │  │
│  │   [Rak A1] [Rak A2] [Rak A3] ... [Rak B4]        │  │
│  │   - Inlet Temp Gauge                             │  │
│  │   - Delta-T Exhaust Gauge                        │  │
│  │   - Local Smoke PPM Meter                        │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────▲────────────────────────────┘
                            │ Subscribed
┌───────────────────────────┴────────────────────────────┐
│              telemetryStore (Real-time Stream)         │
│  - racks[] : RackData (temp, humidity, smokePpm, kW)   │
│  - thresholds : ThresholdConfig                        │
└────────────────────────────────────────────────────────┘
```

- **Komponen yang Dibuat & Dimodifikasi:**
  1. `src/components/Gauges/RadialGauge.tsx`: Komponen atomik SVG Radial Gauge serbaguna (menerima nilai min, max, current, safeMin, safeMax, warningMin, warningMax, unit, label, dan warna status).
  2. `src/components/Gauges/GaugeDashboard.tsx`: Tampilan dasbor lengkap berisi 4 hero gauges, kartu analitik ambang batas, dan pemilih inspeksi rak individu.
  3. `src/components/HUD/TopHeader.tsx`: Menambahkan tab navigasi `"Gauges"` pada bar navigasi.
  4. `src/App.tsx`: Menghubungkan state navigasi `'gauges'` dan me-render `GaugeDashboard` saat tab aktif.
