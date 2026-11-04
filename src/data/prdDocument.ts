export interface PRDSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  summary: string;
  summaryEn: string;
  content: string; // Markdown formatted in Indonesian
  contentEn: string; // Markdown formatted in English
}

export const PRD_METADATA = {
  title: 'PRD: Sistem Monitoring Ruangan Server 3D (Suhu, Kelembaban, Deteksi Asap)',
  titleEn: 'PRD: 3D Server Room Environmental Monitoring System (Temperature, Humidity, Smoke Detection)',
  documentCode: 'PRD-DC-ENV-3D-V2.4',
  author: 'Data Center Infrastructure Engineering & SRE Team',
  status: 'Approved / In Production',
  lastUpdated: '2026-11-04',
  targetPlatform: 'Web SPA (Three.js r170+, WebGL 2.0 / WebGPU)',
  docReference: 'drive-uploaded-file-1ikkuztMrP-56oCelySp_V8Lk9T858mV3g3HkD6nsdnU',
};

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'intro',
    title: '1. Pendahuluan & Latar Belakang',
    titleEn: '1. Introduction & Background',
    icon: 'FileText',
    summary: 'Urgensi monitoring fisik lingkungan pusat data guna mencegah downtime dan kerusakan termal.',
    summaryEn: 'Urgency of physical data center environment monitoring to prevent downtime and thermal hardware failure.',
    content: `### 1.1 Latar Belakang Masalah
Pusat Data (Data Center) dan Ruangan Server modern menampung ratusan node komputasi berkerapatan tinggi (*high-density server racks*), unit penyimpanan SAN/NAS, serta perangkat jaringan *core*. Kegagalan pengendalian kondisi lingkungan fisik—khususnya anomali temperatur ekstrem (*thermal hotspots*), kelembaban udara di luar toleransi (yang memicu kondensasi air atau pelepasan elektrostatik/ESD), dan kebakaran akibat korsleting kelistrikan—merupakan salah satu penyebab utama *hardware degradation*, *unplanned outages*, dan kerugian finansial bernilai miliaran rupiah.

Berdasarkan pedoman **ASHRAE TC 9.9 (Thermal Guidelines for Data Processing Environments)**:
- **Suhu Masuk Udara (*Inlet Air Temp*) Direkomendasikan:** 18.0°C hingga 27.0°C.
- **Kelembaban Relatif (*Relative Humidity*) Direkomendasikan:** 40% RH hingga 60% RH.
- **Titik Embun Maksimum (*Dew Point*):** 15.0°C (mencegah kelembaban berkondensasi menjadi tetesan air pada motherboard server).

Sistem monitoring 2D konvensional (tabel angka dan grafik bar datar) memiliki kelemahan mendasar: **ketiadaan spatial context**. Operator NOC (*Network Operations Center*) sering kali mengalami keterlambatan mengidentifikasi rak fisik mana yang mengalami pemanasan berlebih (*overheating*) atau di mana titik sensor asap yang pertama kali menyala di antara labirin lorong dingin (*cold aisle*) dan lorong panas (*hot aisle*).

### 1.2 Urgensi Solusi Digital Twin 3D
Penerapan *Digital Twin 3D* berbasis WebGL/Three.js merevolusi pemantauan ruang server dengan menghadirkan:
1. **Spatial Awareness Seketika:** Visualisasi posisi spasial rak, unit pendingin CRAC, dan sensor asap dengan kode warna instan (*color-coded beacons*).
2. **Hot/Cold Aisle Dynamics:** Memvisualisasikan pola aliran udara (*airflow CFD representation*) dan gradien termal (*thermal heatmap*).
3. **Penyelamatan Aset Pra-Bencana:** Deteksi dini partikel asap sebelum kobaran api membakar rangkaian kabel serat optik dan modul server.`,
    contentEn: `### 1.1 Background & Problem Statement
Modern Data Centers and Server Rooms house hundreds of high-density compute nodes, SAN/NAS storage arrays, and mission-critical network backbones. Environmental anomalies—specifically thermal hotspots, out-of-tolerance humidity (causing condensation or Electrostatic Discharge / ESD), and electrical smoldering fires—rank among the top causes of unplanned downtime and catastrophic equipment damage.

According to **ASHRAE TC 9.9 Thermal Guidelines for Data Processing Environments**:
- **Recommended Inlet Air Temperature:** 18.0°C to 27.0°C.
- **Recommended Relative Humidity:** 40% to 60% RH.
- **Maximum Dew Point:** 15.0°C (prevents condensation on active electronic PCBs).

Traditional 2D monitoring systems (numeric tables and flat charts) suffer from a critical flaw: **lack of spatial context**. SREs and NOC operators struggle to pinpoint which physical rack among dozens in cold/hot aisles is overheating or which ceiling optical sensor triggered first.

### 1.2 Urgency of 3D Digital Twin Solution
A WebGL/Three.js-driven 3D Digital Twin transforms server room supervision:
1. **Instant Spatial Awareness:** 3D layout mapping with color-coded beacons and dynamic thermal gradients.
2. **Aisle Micro-climate Visibility:** Visualizes cold air intake, warm exhaust, and hotspot accumulation.
3. **Early Incident Mitigation:** Detects smoke particulates at the sub-visual PPM stage before open flames erupt.`,
  },
  {
    id: 'goals',
    title: '2. Tujuan Produk (Product Goals)',
    titleEn: '2. Product Goals & Success Metrics',
    icon: 'Target',
    summary: 'Target Real-Time Spatial Awareness, Early Warning System berkecepatan tinggi, dan 60 FPS performance.',
    summaryEn: 'Targets for Real-Time Spatial Awareness, sub-second Early Warning System, and 60 FPS performance.',
    content: `### 2.1 Tujuan Strategis Produk
1. **Real-Time Spatial Awareness (Kesadaran Spasial Real-Time):** Menampilkan representasi 3D interaktif 1:1 dari ruang server, lorong dingin, lorong panas, unit pendingin presisi (CRAC), dan kisi-kisi sensor asap di plafon.
2. **Early Warning System (EWS < 1 Detik):** Menerjemahkan lonjakan telemetri IoT menjadi sinyal visual (lampu suar berkedip pada rak), sinyal audio (procedural Web Audio alarm), dan *automated webhook dispatch* ke Telegram Bot serta WhatsApp On-Call Engineer.
3. **High-Performance 3D Visualization (60 FPS Native):** Memastikan visualisasi 3D berjalan mulus pada browser standar tanpa membebani workstation tim operasional NOC.
4. **Historical Analytics & Audit Trail:** Menyediakan rekaman time-series fluktuasi suhu/kelembaban untuk evaluasi efisiensi daya (PUE) dan investigasi akar masalah (*root cause analysis*).

### 2.2 Target Pengguna (User Personas)
- **Data Center Facility Engineer:** Bertanggung jawab atas stabilitas suhu ruangan, efisiensi unit CRAC, kelembaban, dan beban daya PDU.
- **SRE & NOC Operator:** Mengawasi kesehatan server 24/7, merespons insiden peringatan dini, dan mengeksekusi penanganan insiden darurat.
- **IT Infrastructure Manager:** Mengevaluasi tren historis, kapasitas ekspansi rak server, dan kepatuhan SLA ketersediaan 99.982% (Tier III/IV).`,
    contentEn: `### 2.1 Strategic Product Goals
1. **Real-Time Spatial Awareness:** 1:1 interactive 3D digital twin of server racks, cold/hot aisles, precision CRAC units, and ceiling optical sensors.
2. **Early Warning System (EWS Latency < 1s):** Instantly translates IoT telemetry spikes into 3D beacon flashes, procedural Web Audio buzzer alerts, and automated multi-channel webhook dispatch (Telegram & WhatsApp).
3. **60 FPS Performance on Modern Browsers:** Smooth rendering with hardware-accelerated WebGL 2.0 and graceful software-gl fallback.
4. **Historical Analytics & Audit Trail:** Full time-series telemetry trends, PUE computation, and downloadable event logs for root cause analysis (RCA).

### 2.2 Target Personas
- **Facility Engineers:** Monitors HVAC/CRAC units, PDU power draw, and floor airflow distribution.
- **NOC & SRE Operators:** 24/7 real-time monitoring, triage of thermal hotspots, and acknowledging emergency drills.
- **Infrastructure Directors:** Reviews monthly compliance against ASHRAE TC 9.9 standards and Tier III SLA targets.`,
  },
  {
    id: 'architecture',
    title: '3. Lingkup Sistem & Arsitektur Teknis',
    titleEn: '3. System Scope & Architecture',
    icon: 'Cpu',
    summary: 'Diagram arsitektur end-to-end: Sensor IoT, Gateway, MQTT/WebSocket Broker, Three.js Frontend Engine.',
    summaryEn: 'End-to-end architecture diagram: IoT Sensors, Gateway, MQTT/WebSocket Broker, Three.js Frontend Engine.',
    content: `### 3.1 Arsitektur Tiga Lapisan (3-Tier IoT Architecture)

\`\`\`
+-------------------------------------------------------------+
|               LAPISAN 1: HARDWARE & SENSOR IOT              |
|  - Sensor Suhu & Kelembaban: Sensirion SHT35 / DHT22 (±0.2°C)|
|  - Sensor Partikel Asap: Optical MQ-2 / Photoelectric Smoke |
|  - Sensor Aliran Udara & Arus: Hall Effect Current / PDU CT |
|  - Edge Microcontroller: ESP32 Industrial / Modbus RS485    |
+------------------------------+------------------------------+
                               | MQTT over TLS (Port 8883)
                               v
+-------------------------------------------------------------+
|               LAPISAN 2: BACKEND, BROKER & LOGIC            |
|  - Telemetry Ingestion Broker: Mosquitto / EMQX Enterprise  |
|  - Processing Service: Node.js / Go microservice            |
|  - Database: Time-series DB (TimescaleDB / InfluxDB)        |
|  - Alert Rule Evaluator: Ambang Batas Warning & Critical    |
|  - Notification Gateways: Telegram Bot API & WhatsApp WABA  |
+------------------------------+------------------------------+
                               | WebSocket Stream (JSON, <1s)
                               v
+-------------------------------------------------------------+
|               LAPISAN 3: FRONTEND DASHBOARD 3D              |
|  - Core 3D Engine: Three.js r170+ (WebGL2 / PBR Shading)    |
|  - Procedural Asset Pipeline: Canvas Textures, RoomEnv PMREM|
|  - State Management & Store: Reactive Realtime Store        |
|  - Telemetry Charts: High-performance SVG Time-Series       |
|  - Spatial Raycasting: Click-to-inspect 1U-42U Rack Assets  |
+-------------------------------------------------------------+
\`\`\`

### 3.2 Spesifikasi Sensor Fisik yang Didukung
1. **Suhu & Kelembaban (DHT22 / SHT35 / PT100 RTD):**
   - Rentang Pengukuran Suhu: -40°C hingga +80°C (Akurasi: ±0.2°C).
   - Rentang Kelembaban: 0% hingga 100% RH (Akurasi: ±1.5% RH).
   - Frekuensi Sampling: 1 detik per siklus baca.
2. **Sensor Asap & Gas Pembakaran (MQ-2 / Optical Photoelectric Chamber):**
   - Sensitivitas Partikel: 10 PPM hingga 10,000 PPM (Particulate Matter & Hydrocarbons).
   - Waktu Respons: < 10 milidetik (Deteksi asap awal sebelum gas beracun membesar).
3. **Sensor Daya PDU & Fan Speed:**
   - CT Current Sensor: Pembacaan daya per rak (0 - 15 kW).
   - Pulse Tachometer: Pemantauan putaran kipas pembuangan (*Fan Exhaust RPM*).`,
    contentEn: `### 3.1 Three-Tier IoT Architecture
- **Layer 1: Hardware & IoT Edge Sensors:** Industrial SHT35 temperature/humidity probes, photoelectric optical smoke chambers, and ESP32 edge concentrators transmitting over MQTT with TLS.
- **Layer 2: Ingestion Broker & Event Dispatch:** High-throughput MQTT/WebSocket broker, rule engine comparing live streams to ASHRAE thresholds, and outbound webhook dispatchers.
- **Layer 3: 3D Visualization Client:** Three.js scene engine with hardware PBR shaders, dynamic hot/cold air particle currents, raycasting inspector, and audio synthesizers.

### 3.2 Supported Hardware Specifications
- **Temperature & Humidity:** SHT35 / PT100 RTD (Accuracy ±0.2°C, 0-100% RH).
- **Smoke & Particulate Chamber:** Optical ionization chamber detecting 10-10,000 PPM particulate density.
- **Power & Airflow:** Modbus CT meters for Rack PDU (kW) and tachometer sensor for CRAC fan RPM.`,
  },
  {
    id: 'features',
    title: '4. Spesifikasi Fitur Utama',
    titleEn: '4. Detailed Functional Features',
    icon: 'Layers',
    summary: 'Rincian modul 3D Three.js, monitoring sensor real-time, alerting multi-kanal, dan analitik tren.',
    summaryEn: 'Breakdown of 3D Three.js engine, sensor monitoring, multi-channel alerting, and trend analytics.',
    content: `### 4.1 Modul Visualisasi 3D (Three.js)
1. **Model Ruangan & Rak Server Prosedural:**
   - 8 unit rak server standar 42U yang terbagi dalam Baris A (*Row A*) dan Baris B (*Row B*).
   - Komponen rak komposit 3–12 bagian: *base plinth, extruded vertical posts, perforated front door, internal server blades (1U/2U/4U), cable management runs, rear fans, and overhead status beacons*.
   - Unit pendingin presisi (CRAC Unit 01 & 02) dengan kisi-kisi sirkulasi udara dingin.
   - Detektor asap plafon dengan lampu indikator optik.
2. **Indikator Status Warna Visual:**
   - **Hijau Solid:** Normal (Suhu 18-24°C, Kelembaban 40-60% RH, Asap <120 PPM).
   - **Kuning / Oranye:** Peringatan / Warning (Suhu 25-30°C atau Kelembaban 30-40% / 60-70% RH).
   - **Merah Berkedip:** Kritis / Critical Alarm (Suhu >31°C atau Deteksi Asap >240 PPM).
3. **Mode Tampilan Termal (*Heatmap Mode*):**
   - Mengubah pewarnaan material rak dan ubin lantai menjadi gradien warna suhu (Biru 18°C -> Cyan -> Hijau -> Kuning -> Merah 35°C).
4. **Visualisasi Aliran Udara & Efek Asap:**
   - Partikel biru mengalir dari lantai berlubang lorong dingin (*cold aisle*).
   - Partikel oranye naik di lorong panas (*hot aisle*).
   - Simulasi partikel asap volumetrik tebal yang mengepul dari rak jika status deteksi asap aktif.
5. **Interaksi Raycasting & Tooltip:**
   - Hover pada rak menampilkan tooltip cepat: Nama Rak, Suhu, Kelembaban, Partikel Asap, Daya.
   - Klik pada rak menggerakkan kamera (*smooth fly-to camera interpolation*) dan membuka modal inspeksi bilah server 1U–42U.

### 4.2 Modul Monitoring Sensor Real-Time
- Pembacaan telemetri per detik dengan visualisasi metrik utama: Suhu Rata-rata, Kelembaban Rata-rata, Tingkat Asap Tertinggi, Total Konsumsi Daya (kW), dan PUE (*Power Usage Effectiveness*).
- Status operasional unit CRAC: Setpoint, Suhu Suplai (*Supply Air*), Suhu Udara Balik (*Return Air*), dan Kecepatan Kipas.

### 4.3 Modul Peringatan (Early Warning & Alerting)
- **Konfigurasi Ambang Batas Fleksibel:** Pengguna dapat menyesuaikan batas temperatur warning/critical, batas toleransi kelembaban, dan PPM asap.
- **Alarm Audio Prosedural:** Menggunakan Web Audio API oscillator untuk memicu sirene dwitone darurat tanpa file MP3 eksternal.
- **Workflow Insiden:** Tombol *Acknowledge* (Konfirmasi Penerimaan Insiden oleh Petugas) dan *Resolve* (Penyelesaian Insiden).
- **Integrasi Webhook Otomatis:** Pengiriman otomatis notifikasi insiden berformat Markdown/Rich Text ke Telegram Bot dan WhatsApp Gateway.

### 4.4 Modul Riwayat & Analitik
- Grafik deret waktu interaktif (*Time-Series Chart*) untuk membandingkan fluktuasi suhu 8 rak server secara bersamaan.
- Grafik toleransi kelembaban terhadap rentang rekomendasi ASHRAE.
- Log peristiwa (*Event Log*) lengkap dengan filter keparahan (*Info, Warning, Critical*) dan tombol ekspor CSV.`,
    contentEn: `### 4.1 3D Visualization Module (Three.js)
1. **Procedural Model Construction:**
   - 8 standard 42U server racks organized in Hot/Cold aisle containment (Row A and Row B).
   - Detailed procedural assemblies: base plinths, perforated front doors, server blade chassis with blinking activity LEDs, rear exhaust fans, and overhead dome beacon lights.
   - Dual In-Row CRAC units and 4 ceiling-mounted optical smoke detector units.
2. **Visual Color Encodings:**
   - Solid Green: Nominal operation (18-24°C, 40-60% RH, Smoke <120 PPM).
   - Amber / Yellow: Warning threshold breach (25-30°C or humidity excursion).
   - Flashing Red: Critical emergency (>31°C or Smoke >240 PPM).
3. **Thermal Heatmap View:**
   - Color grading overlay across rack chassis and floor tiles visualizing thermal distribution.
4. **Airflow Particles & Dynamic Smoke:**
   - Cold aisle laminar flow (blue upward particles), hot aisle exhaust (warm orange particles), and volumetric billowy smoke particles upon fire sensor activation.
5. **Raycasting & Camera Presets:**
   - Hover raycasting with quick specs tooltip; click-to-focus with exponential camera damping and server blade telemetry inspection.

### 4.2 Real-time Telemetry & Metrics
- Metrics refreshed continuously: Average Temperature, Humidity, Max Smoke PPM, Total Power (kW), and PUE index.
- Precision CRAC diagnostics: Setpoint vs Supply Temp vs Return Air Temp and Fan RPM.

### 4.3 Alerting & Multi-Channel Webhooks
- Configurable thresholds for Warning, Critical, and Extreme limits.
- Procedural Web Audio API emergency siren synthesizer with mute toggle.
- Acknowledge and Resolve incident lifecycle tracking.
- Outbound webhook simulation to Telegram Channel (@DataCenterSentinelBot) and WhatsApp API.

### 4.4 Historical Analytics & Logging
- Interactive multi-line SVG time-series charts comparing rack temperatures.
- ASHRAE humidity compliance envelope graph.
- Filterable event log with CSV export capability.`,
  },
  {
    id: 'nfr',
    title: '5. Kebutuhan Non-Fungsional (NFR)',
    titleEn: '5. Non-Functional Requirements (NFR)',
    icon: 'ShieldCheck',
    summary: 'Target framerate 60 FPS, latensi WebSocket < 1 detik, keamanan TLS/JWT, dan efisiensi memori.',
    summaryEn: '60 FPS framerate target, <1s WebSocket latency, TLS/JWT security, and zero memory leaks.',
    content: `### 5.1 Kebutuhan Performa (Performance Requirements)
1. **Framerate Visualisasi 3D:**
   - Target minimum 60 Frame Per Second (FPS) pada perangkat desktop dengan GPU terdedikasi atau GPU terintegrasi modern (Intel Iris Xe / Apple Silicon / AMD Radeon).
   - Otomatis mengaktifkan *Software WebGL Guard* pada lingkungan tanpa GPU (SwiftShader / llvmpipe) dengan membatasi *device pixel ratio* pada 1.0 dan menonaktifkan *expensive post-processing* agar browser tidak freeze.
2. **Latensi Transmisi Data:**
   - Latensi transmisi data telemetri dari broker IoT ke tampilan layar 3D wajib < 1.000 milidetik (< 1 detik).
3. **Efisiensi Alokasi Memori (Zero Garbage Collection in Loop):**
   - Vektor dan matriks Three.js dialokasikan di luar *animation loop* (\`_vec3\`, \`_mat4\`, \`_color\`) untuk mencegah *micro-stutters* akibat siklus *garbage collection*.

### 5.2 Kebutuhan Keamanan (Security Requirements)
1. **Enkripsi Data in-Transit:**
   - Protokol transmisi data wajib menggunakan WSS (*WebSocket Secure*) dan HTTPS dengan sertifikat TLS 1.3.
   - Komunikasi broker MQTT dilindungi oleh otentikasi berbasis token JWT dan sertifikat client X.509.
2. **Kontrol Akses Berbasis Peran (RBAC):**
   - Level *Viewer*: Hanya dapat melihat tampilan 3D dan analitik.
   - Level *Operator*: Dapat melakukan *Acknowledge* alarm dan mengubah sudut kamera.
   - Level *Administrator*: Berwenang mengubah konfigurasi ambang batas (*thresholds*) dan endpoint webhook.

### 5.3 Kompatibilitas Browser & Responsivitas
- Kompatibel dengan Google Chrome 110+, Mozilla Firefox 115+, Microsoft Edge 110+, dan Safari 16+.
- UI Overlay responsif yang mengadopsi prinsip *Collapsible Bottom Dock* untuk menjaga bidang pandang 3D tetap 100% bebas hambatan (*unobstructed view*).`,
    contentEn: `### 5.1 Performance Standards
- **3D Render Performance:** Locked 60 FPS under standard GPU conditions. Software WebGL detection automatically scales pixel ratio to 1.0 and optimizes frame pacing.
- **End-to-End Latency:** < 1,000 ms from physical sensor trigger to 3D beacon alarm.
- **Resource Discipline:** Zero per-frame memory allocation inside requestAnimationFrame to eliminate GC hitches.

### 5.2 Security & Compliance
- **In-Transit Encryption:** TLS 1.3 enforced over WSS and HTTPS endpoints.
- **RBAC Matrix:** Strict permission separation between Viewers, SRE Operators (can acknowledge alerts), and Administrators (can modify safety thresholds).

### 5.3 Browser Support & Responsive Layout
- Fully validated across modern Chromium, Gecko, and WebKit rendering engines.
- Ergonomic Collapsible Bottom Control Dock ensuring 100% unobstructed central 3D viewport.`,
  },
  {
    id: 'userflow',
    title: '6. Alur Kerja Pengguna & Uji Coba Insiden',
    titleEn: '6. User Flows & Incident Drills',
    icon: 'Activity',
    summary: 'Diagram alur deteksi insiden, eskalasi petugas NOC, dan simulasi skenario kegagalan sistem.',
    summaryEn: 'Incident detection workflow, NOC triage escalation, and interactive drill simulation scenarios.',
    content: `### 6.1 Alur Penanganan Insiden Peringatan Dini (EWS User Flow)

\`\`\`
[ Sensor IoT Mendeteksi Suhu > 31°C / Asap > 240 PPM ]
                       │
                       ▼
[ Evaluasi Ambang Batas Kritis (< 500 ms) ]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Tampilan 3D Three.js ]     [ Outbound Webhook Dispatch ]
- Rak Berubah Merah Kedip    - Pesan Darurat Telegram Bot
- Efek Partikel Asap Aktif   - WhatsApp On-Call Escalation
- Sirene Audio Buzzer Bunyi  - Tercatat di Alert History
       │                               │
       └───────────────┬───────────────┘
                       ▼
[ Petugas NOC Membuka 3D Digital Twin ]
- Mengklik Rak yang Ditandai Merah (Raycasting Zoom)
- Meninjau Suhu Tiap Bilah Server 1U-42U
- Menekan Tombol "Acknowledge" (Sirene Berhenti, Status: Diinvestigasi)
                       │
                       ▼
[ Tindakan Fisik / Otomasi HVAC ]
- Menyesuaikan Setpoint CRAC / Disinfeksi Asap Ruangan
- Suhu Kembali Turun ke < 24°C / Asap < 50 PPM
                       │
                       ▼
[ Penutupan Tiket Insiden: "Resolve" & Ekspor Log Audit ]
\`\`\`

### 6.2 Skenario Uji Coba (Simulation / Incident Drill)
Sistem dilengkapi modul uji coba darurat interaktif:
1. **Simulasi Overheating Rak B2:** Menaikkan suhu inlet secara drastis hingga 36.8°C untuk menguji reaksi visual suar kuning -> merah dan dispatch webhook.
2. **Simulasi Deteksi Asap Zona A:** Memicu sensor optik plafon SD-01 hingga 380 PPM, mengaktifkan kepulan asap 3D, dan membunyikan alarm audio.
3. **Simulasi Kegagalan CRAC Unit 01:** Menonaktifkan kompresor pendingin CRAC-01 sehingga suhu suplai naik dan memicu pemanasan bertahap di seluruh ruangan.
4. **Normalisasi Sistem (Reset State):** Mengembalikan seluruh parameter ke kondisi nominal ASHRAE dalam 1 klik.`,
    contentEn: `### 6.1 Emergency Incident Workflow
1. **Sensor Trigger:** Smoke particulates exceed 240 PPM or temperature surpasses 31°C.
2. **Autonomous Dispatch:** 3D digital twin flashes red beacon, triggers audio buzzer, generates smoke particles, and fires webhooks to Telegram & WhatsApp.
3. **NOC Triage:** Engineer clicks the flashing 3D rack, examines server blade diagnostics, and acknowledges the alert.
4. **Resolution & Audit:** HVAC stabilizes environment, engineer marks the incident as Resolved, and audit log is saved.

### 6.2 Interactive Simulation Sandbox
The dashboard includes an integrated Incident Drill suite:
- **Simulate Rack B2 Overheating:** Spikes inlet temperature to 36.8°C to verify thermal alerts.
- **Simulate Zone A Smoke Fire:** Activates ceiling optical sensor to 380 PPM, spawning 3D animated smoke particles and audio sirens.
- **Simulate CRAC Cooling Failure:** Disables CRAC-01 compressor, simulating supply air rise.
- **System Normalization:** Instantly restores all parameters to nominal ASHRAE values.`,
  },
];
