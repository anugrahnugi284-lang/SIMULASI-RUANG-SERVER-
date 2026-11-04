import {
  RackData,
  CRACUnitData,
  SmokeDetectorData,
  EnvironmentalHistoryPoint,
  AlertEvent,
  ThresholdConfig,
  WebhookConfig,
  WebhookDispatch,
  RackId,
  SensorStatus,
  AlertSeverity,
} from '../types/monitoring';
import { soundManager } from './soundEffects';

const INITIAL_THRESHOLDS: ThresholdConfig = {
  tempWarning: 25.0,
  tempCritical: 31.0,
  tempOptimalMin: 18.0,
  tempOptimalMax: 24.0,
  humidityMin: 40.0,
  humidityMax: 60.0,
  humidityCriticalMin: 30.0,
  humidityCriticalMax: 70.0,
  smokeWarningPpm: 120,
  smokeCriticalPpm: 240,
};

const INITIAL_WEBHOOK: WebhookConfig = {
  telegramEnabled: true,
  telegramChatId: '-100238491823 (NOC Alert Channel)',
  telegramBotName: '@DataCenterSentinelBot',
  whatsappEnabled: true,
  whatsappPhone: '+62 812-3456-7890 (Duty On-Call)',
};

const INITIAL_RACKS: RackData[] = [
  {
    id: 'A1',
    name: 'Rack A1 - Edge Gateway & Core Switches',
    zone: 'Row A (Cold Intake)',
    temp: 20.8,
    exhaustTemp: 27.4,
    humidity: 48.2,
    smokePpm: 24,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 4.8,
    fanRpm: 4800,
    position: [-4.2, 0, -2.4],
    servers: [
      { slot: 1, uSize: 2, model: 'Nexus 9336C Spine Switch', cpuTemp: 44, status: 'normal', loadPercent: 38 },
      { slot: 2, uSize: 2, model: 'Edge Firewall HA Cluster', cpuTemp: 46, status: 'normal', loadPercent: 52 },
      { slot: 3, uSize: 4, model: 'SAN Storage Array Master', cpuTemp: 48, status: 'normal', loadPercent: 61 },
      { slot: 4, uSize: 2, model: 'Core Router Border-01', cpuTemp: 43, status: 'normal', loadPercent: 44 },
    ],
  },
  {
    id: 'A2',
    name: 'Rack A2 - Compute Cluster Alpha (K8s)',
    zone: 'Row A (Cold Intake)',
    temp: 22.4,
    exhaustTemp: 29.8,
    humidity: 47.5,
    smokePpm: 28,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 7.2,
    fanRpm: 5600,
    position: [-1.4, 0, -2.4],
    servers: [
      { slot: 1, uSize: 2, model: 'HPE ProLiant DL380 Node 01', cpuTemp: 52, status: 'normal', loadPercent: 74 },
      { slot: 2, uSize: 2, model: 'HPE ProLiant DL380 Node 02', cpuTemp: 54, status: 'normal', loadPercent: 78 },
      { slot: 3, uSize: 2, model: 'HPE ProLiant DL380 Node 03', cpuTemp: 51, status: 'normal', loadPercent: 69 },
      { slot: 4, uSize: 2, model: 'HPE ProLiant DL380 Node 04', cpuTemp: 53, status: 'normal', loadPercent: 72 },
    ],
  },
  {
    id: 'A3',
    name: 'Rack A3 - Database Cluster Primary (PostgreSQL)',
    zone: 'Row A (Cold Intake)',
    temp: 23.1,
    exhaustTemp: 30.6,
    humidity: 46.9,
    smokePpm: 22,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 8.5,
    fanRpm: 6000,
    position: [1.4, 0, -2.4],
    servers: [
      { slot: 1, uSize: 4, model: 'Dell PowerEdge R750 DB-Master', cpuTemp: 58, status: 'normal', loadPercent: 82 },
      { slot: 2, uSize: 4, model: 'Dell PowerEdge R750 DB-Replica', cpuTemp: 55, status: 'normal', loadPercent: 64 },
      { slot: 3, uSize: 2, model: 'NVMe Flash Accelerator JBOF', cpuTemp: 47, status: 'normal', loadPercent: 49 },
    ],
  },
  {
    id: 'A4',
    name: 'Rack A4 - High-Density AI Inference Rig',
    zone: 'Row A (Cold Intake)',
    temp: 23.8,
    exhaustTemp: 32.1,
    humidity: 45.8,
    smokePpm: 31,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 9.8,
    fanRpm: 6800,
    position: [4.2, 0, -2.4],
    servers: [
      { slot: 1, uSize: 4, model: 'NVIDIA HGX H100 8-GPU Node', cpuTemp: 64, status: 'normal', loadPercent: 88 },
      { slot: 2, uSize: 4, model: 'Liquid-Assisted Compute Subsystem', cpuTemp: 59, status: 'normal', loadPercent: 80 },
      { slot: 3, uSize: 2, model: '400G InfiniBand Spine Gateway', cpuTemp: 49, status: 'normal', loadPercent: 55 },
    ],
  },
  {
    id: 'B1',
    name: 'Rack B1 - Virtualization Host Cluster',
    zone: 'Row B (Cold Intake)',
    temp: 21.2,
    exhaustTemp: 28.0,
    humidity: 49.1,
    smokePpm: 26,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 5.4,
    fanRpm: 5100,
    position: [-4.2, 0, 2.4],
    servers: [
      { slot: 1, uSize: 2, model: 'Cisco UCS B-Series Chassis', cpuTemp: 49, status: 'normal', loadPercent: 62 },
      { slot: 2, uSize: 2, model: 'VMware ESXi Host Cluster 01', cpuTemp: 50, status: 'normal', loadPercent: 65 },
      { slot: 3, uSize: 2, model: 'VMware ESXi Host Cluster 02', cpuTemp: 48, status: 'normal', loadPercent: 58 },
    ],
  },
  {
    id: 'B2',
    name: 'Rack B2 - Application Services & Microservices',
    zone: 'Row B (Cold Intake)',
    temp: 22.0,
    exhaustTemp: 29.2,
    humidity: 48.0,
    smokePpm: 25,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 6.3,
    fanRpm: 5300,
    position: [-1.4, 0, 2.4],
    servers: [
      { slot: 1, uSize: 2, model: 'API Gateway & Ingress Cluster', cpuTemp: 47, status: 'normal', loadPercent: 57 },
      { slot: 2, uSize: 2, model: 'Redis In-Memory Cache Primary', cpuTemp: 45, status: 'normal', loadPercent: 48 },
      { slot: 3, uSize: 2, model: 'Kafka Streaming Message Broker', cpuTemp: 53, status: 'normal', loadPercent: 71 },
    ],
  },
  {
    id: 'B3',
    name: 'Rack B3 - Backup, DR & Cold Storage Vault',
    zone: 'Row B (Cold Intake)',
    temp: 20.4,
    exhaustTemp: 26.8,
    humidity: 50.2,
    smokePpm: 19,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 3.9,
    fanRpm: 4200,
    position: [1.4, 0, 2.4],
    servers: [
      { slot: 1, uSize: 4, model: 'LTO-9 Tape Library Robotic Jukebox', cpuTemp: 41, status: 'normal', loadPercent: 25 },
      { slot: 2, uSize: 4, model: 'Immutable ZFS Backup Pool', cpuTemp: 43, status: 'normal', loadPercent: 38 },
      { slot: 3, uSize: 2, model: 'Offsite Replication Proxy', cpuTemp: 42, status: 'normal', loadPercent: 32 },
    ],
  },
  {
    id: 'B4',
    name: 'Rack B4 - Security & Identity Infrastructure',
    zone: 'Row B (Cold Intake)',
    temp: 21.6,
    exhaustTemp: 28.5,
    humidity: 48.8,
    smokePpm: 23,
    smokeTriggered: false,
    status: 'normal',
    powerKw: 4.6,
    fanRpm: 4600,
    position: [4.2, 0, 2.4],
    servers: [
      { slot: 1, uSize: 2, model: 'Hardware Security Module (HSM FIPS-140)', cpuTemp: 43, status: 'normal', loadPercent: 30 },
      { slot: 2, uSize: 2, model: 'Active Directory / LDAP Cluster', cpuTemp: 45, status: 'normal', loadPercent: 42 },
      { slot: 3, uSize: 2, model: 'SIEM Log Ingestion Collector', cpuTemp: 51, status: 'normal', loadPercent: 67 },
    ],
  },
];

const INITIAL_CRACS: CRACUnitData[] = [
  {
    id: 'CRAC-01',
    name: 'Precision In-Row CRAC 01 (West Bank)',
    status: 'normal',
    setPointTemp: 19.5,
    supplyTemp: 18.2,
    returnTemp: 28.4,
    fanSpeedPercent: 78,
    compressorActive: true,
    position: [-7.2, 0, 0],
  },
  {
    id: 'CRAC-02',
    name: 'Precision In-Row CRAC 02 (East Bank)',
    status: 'normal',
    setPointTemp: 19.5,
    supplyTemp: 18.4,
    returnTemp: 28.9,
    fanSpeedPercent: 82,
    compressorActive: true,
    position: [7.2, 0, 0],
  },
];

const INITIAL_SMOKE_DETECTORS: SmokeDetectorData[] = [
  { id: 'SD-01', name: 'Optical Smoke Detector 01 (Row A West)', zone: 'Ceiling Row A West', ppm: 24, triggered: false, status: 'normal', position: [-2.8, 3.8, -2.4] },
  { id: 'SD-02', name: 'Optical Smoke Detector 02 (Row A East)', zone: 'Ceiling Row A East', ppm: 27, triggered: false, status: 'normal', position: [2.8, 3.8, -2.4] },
  { id: 'SD-03', name: 'Optical Smoke Detector 03 (Row B West)', zone: 'Ceiling Row B West', ppm: 23, triggered: false, status: 'normal', position: [-2.8, 3.8, 2.4] },
  { id: 'SD-04', name: 'Optical Smoke Detector 04 (Row B East)', zone: 'Ceiling Row B East', ppm: 21, triggered: false, status: 'normal', position: [2.8, 3.8, 2.4] },
];

function generateInitialHistory(): EnvironmentalHistoryPoint[] {
  const points: EnvironmentalHistoryPoint[] = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 60 * 1000);
    const timeFormatted = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const noise = Math.sin(i * 0.4) * 0.6;
    points.push({
      timestamp: t.toISOString(),
      timeFormatted,
      tempAvg: +(21.8 + noise).toFixed(1),
      humidityAvg: +(48.0 + Math.cos(i * 0.3) * 1.5).toFixed(1),
      smokeMaxPpm: +(25 + (i % 3) * 2).toFixed(0),
      pue: +(1.22 + noise * 0.02).toFixed(2),
      rackTemps: {
        A1: +(20.8 + noise).toFixed(1),
        A2: +(22.4 + noise * 1.1).toFixed(1),
        A3: +(23.1 + noise * 0.9).toFixed(1),
        A4: +(23.8 + noise * 1.2).toFixed(1),
        B1: +(21.2 + noise * 0.8).toFixed(1),
        B2: +(22.0 + noise).toFixed(1),
        B3: +(20.4 + noise * 0.7).toFixed(1),
        B4: +(21.6 + noise * 0.9).toFixed(1),
      },
    });
  }
  return points;
}

class TelemetryStore {
  private racks: RackData[] = JSON.parse(JSON.stringify(INITIAL_RACKS));
  private cracs: CRACUnitData[] = JSON.parse(JSON.stringify(INITIAL_CRACS));
  private smokeDetectors: SmokeDetectorData[] = JSON.parse(JSON.stringify(INITIAL_SMOKE_DETECTORS));
  private history: EnvironmentalHistoryPoint[] = generateInitialHistory();
  private alerts: AlertEvent[] = [
    {
      id: 'AL-1001',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      severity: 'info',
      sourceId: 'SYSTEM',
      sourceName: 'Core Telemetry Engine',
      message: 'Sistem Monitoring 3D Three.js berhasil terhubung ke IoT Broker MQTT',
      value: 'Online',
      acknowledged: true,
      resolved: true,
    },
  ];
  private thresholds: ThresholdConfig = { ...INITIAL_THRESHOLDS };
  private webhookConfig: WebhookConfig = { ...INITIAL_WEBHOOK };
  private webhookLogs: WebhookDispatch[] = [];
  private listeners: Set<() => void> = new Set();
  private timer: number | null = null;
  private simulationActiveScenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail' = 'none';

  constructor() {
    this.startStreaming();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getRacks(): RackData[] {
    return this.racks;
  }

  public getRackById(id: RackId): RackData | undefined {
    return this.racks.find((r) => r.id === id);
  }

  public getCRACs(): CRACUnitData[] {
    return this.cracs;
  }

  public getSmokeDetectors(): SmokeDetectorData[] {
    return this.smokeDetectors;
  }

  public getHistory(): EnvironmentalHistoryPoint[] {
    return this.history;
  }

  public getAlerts(): AlertEvent[] {
    return this.alerts;
  }

  public getThresholds(): ThresholdConfig {
    return this.thresholds;
  }

  public getWebhookConfig(): WebhookConfig {
    return this.webhookConfig;
  }

  public getWebhookLogs(): WebhookDispatch[] {
    return this.webhookLogs;
  }

  public getSimulationScenario(): string {
    return this.simulationActiveScenario;
  }

  public setThresholds(newThresholds: Partial<ThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.evaluateStatuses();
    this.notify();
  }

  public setWebhookConfig(newConfig: Partial<WebhookConfig>) {
    this.webhookConfig = { ...this.webhookConfig, ...newConfig };
    this.notify();
  }

  public acknowledgeAlert(id: string) {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      soundManager.playAcknowledge();
      // Check if there are remaining unacknowledged critical alerts to silence alarm
      const hasUnackCritical = this.alerts.some((a) => !a.acknowledged && a.severity === 'critical');
      if (!hasUnackCritical) {
        soundManager.stopAlarm();
      }
      this.notify();
    }
  }

  public resolveAlert(id: string) {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.resolved = true;
      soundManager.playAcknowledge();
      const hasCritical = this.alerts.some((a) => !a.resolved && a.severity === 'critical');
      if (!hasCritical) {
        soundManager.stopAlarm();
      }
      this.notify();
    }
  }

  public clearResolvedAlerts() {
    this.alerts = this.alerts.filter((a) => !a.resolved);
    this.notify();
  }

  /**
   * Start live simulated sensor stream (updates every 2 seconds)
   */
  private startStreaming() {
    if (typeof window === 'undefined') return;
    this.timer = window.setInterval(() => {
      this.tickTelemetry();
    }, 2200);
  }

  private tickTelemetry() {
    // Apply micro-variations
    this.racks.forEach((rack) => {
      // Natural fluctuation
      const dTemp = (Math.random() - 0.49) * 0.15;
      const dHumidity = (Math.random() - 0.49) * 0.2;
      const dSmoke = (Math.random() - 0.49) * 1.5;

      // Check scenario influences
      if (this.simulationActiveScenario === 'overheat-b2' && rack.id === 'B2') {
        rack.temp = +(Math.min(37.5, rack.temp + 0.35)).toFixed(1);
        rack.exhaustTemp = +(rack.temp + 7.8).toFixed(1);
      } else if (this.simulationActiveScenario === 'smoke-a' && (rack.id === 'A1' || rack.id === 'A2')) {
        rack.smokePpm = Math.min(420, Math.round(rack.smokePpm + 18));
        rack.temp = +(Math.min(34.2, rack.temp + 0.25)).toFixed(1);
      } else if (this.simulationActiveScenario === 'crac-fail') {
        rack.temp = +(Math.min(32.8, rack.temp + 0.18)).toFixed(1);
        rack.exhaustTemp = +(rack.temp + 7.2).toFixed(1);
      } else {
        // Return naturally to normal if scenario stopped
        const base = INITIAL_RACKS.find((r) => r.id === rack.id)!;
        rack.temp = +(rack.temp + (base.temp - rack.temp) * 0.1 + dTemp).toFixed(1);
        rack.exhaustTemp = +(rack.temp + 7.0 + dTemp).toFixed(1);
        rack.humidity = +(rack.humidity + (base.humidity - rack.humidity) * 0.08 + dHumidity).toFixed(1);
        rack.smokePpm = Math.max(12, Math.min(60, Math.round(rack.smokePpm + (base.smokePpm - rack.smokePpm) * 0.1 + dSmoke)));
      }
    });

    // Update Smoke Detectors
    this.smokeDetectors.forEach((sd) => {
      if (this.simulationActiveScenario === 'smoke-a' && (sd.id === 'SD-01' || sd.id === 'SD-02')) {
        sd.ppm = Math.min(480, Math.round(sd.ppm + 24));
      } else {
        const base = INITIAL_SMOKE_DETECTORS.find((s) => s.id === sd.id)!;
        sd.ppm = Math.max(10, Math.round(sd.ppm + (base.ppm - sd.ppm) * 0.15 + (Math.random() - 0.5) * 2));
      }
    });

    // Update CRAC units
    this.cracs.forEach((crac) => {
      if (this.simulationActiveScenario === 'crac-fail' && crac.id === 'CRAC-01') {
        crac.status = 'critical';
        crac.supplyTemp = +(Math.min(29.5, crac.supplyTemp + 0.4)).toFixed(1);
        crac.fanSpeedPercent = 100;
        crac.compressorActive = false;
      } else {
        const base = INITIAL_CRACS.find((c) => c.id === crac.id)!;
        crac.status = 'normal';
        crac.supplyTemp = +(crac.supplyTemp + (base.supplyTemp - crac.supplyTemp) * 0.1).toFixed(1);
        crac.compressorActive = true;
      }
    });

    this.evaluateStatuses();
    this.recordHistoryPoint();
    this.notify();
  }

  private evaluateStatuses() {
    let hasCriticalNow = false;

    // Evaluate Racks
    this.racks.forEach((rack) => {
      let status: SensorStatus = 'normal';
      const isSmokeCritical = rack.smokePpm >= this.thresholds.smokeCriticalPpm;
      const isTempCritical = rack.temp >= this.thresholds.tempCritical;
      const isHumidityCritical = rack.humidity <= this.thresholds.humidityCriticalMin || rack.humidity >= this.thresholds.humidityCriticalMax;

      const isSmokeWarning = rack.smokePpm >= this.thresholds.smokeWarningPpm;
      const isTempWarning = rack.temp >= this.thresholds.tempWarning;
      const isHumidityWarning = rack.humidity <= this.thresholds.humidityMin || rack.humidity >= this.thresholds.humidityMax;

      if (isSmokeCritical || isTempCritical || isHumidityCritical) {
        status = 'critical';
        hasCriticalNow = true;
      } else if (isSmokeWarning || isTempWarning || isHumidityWarning) {
        status = 'warning';
      }

      rack.status = status;
      rack.smokeTriggered = isSmokeCritical;

      // Trigger automatic alerts if threshold breached
      if (isTempCritical) {
        this.addAlertIfNew(
          `TEMP_CRIT_${rack.id}`,
          'temperature',
          'critical',
          rack.id,
          rack.name,
          `BAHAYA OVERHEAT: Suhu ${rack.id} mencapai ${rack.temp}°C! Melebihi ambang batas kritis (${this.thresholds.tempCritical}°C)`,
          `${rack.temp} °C`
        );
      } else if (isTempWarning) {
        this.addAlertIfNew(
          `TEMP_WARN_${rack.id}`,
          'temperature',
          'warning',
          rack.id,
          rack.name,
          `Peringatan Suhu: ${rack.id} berada di atas batas normal (${rack.temp}°C)`,
          `${rack.temp} °C`
        );
      }

      if (isSmokeCritical) {
        this.addAlertIfNew(
          `SMOKE_CRIT_${rack.id}`,
          'smoke',
          'critical',
          rack.id,
          rack.name,
          `DARURAT KEBAKARAN: Partikel Asap Terdeteksi di ${rack.id}! (${rack.smokePpm} PPM)`,
          `${rack.smokePpm} PPM`
        );
      }
    });

    // Evaluate Smoke Detectors
    this.smokeDetectors.forEach((sd) => {
      if (sd.ppm >= this.thresholds.smokeCriticalPpm) {
        sd.status = 'critical';
        sd.triggered = true;
        hasCriticalNow = true;
        this.addAlertIfNew(
          `SD_CRIT_${sd.id}`,
          'smoke',
          'critical',
          sd.id,
          sd.name,
          `Sensor Asap Plafon ${sd.name} Memicu ALARM! Kepadatan gas: ${sd.ppm} PPM`,
          `${sd.ppm} PPM`
        );
      } else if (sd.ppm >= this.thresholds.smokeWarningPpm) {
        sd.status = 'warning';
        sd.triggered = false;
      } else {
        sd.status = 'normal';
        sd.triggered = false;
      }
    });

    // Sound control
    if (hasCriticalNow) {
      soundManager.startAlarm();
    } else {
      soundManager.stopAlarm();
    }
  }

  private addAlertIfNew(
    dedupKey: string,
    type: AlertEvent['type'],
    severity: AlertSeverity,
    sourceId: string,
    sourceName: string,
    message: string,
    value: string
  ) {
    // Avoid spamming if alert exists and unresolved within the last 45 seconds
    const existing = this.alerts.find((a) => a.id.startsWith(dedupKey) && !a.resolved);
    if (!existing) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newAlert: AlertEvent = {
        id: `${dedupKey}_${Date.now()}`,
        timestamp: nowStr,
        type,
        severity,
        sourceId,
        sourceName,
        message,
        value,
        acknowledged: false,
        resolved: false,
        dispatchedToWebhook: true,
      };

      this.alerts.unshift(newAlert);
      if (severity === 'critical') {
        soundManager.startAlarm();
      } else if (severity === 'warning') {
        soundManager.playWarningPing();
      }

      // Simulate webhook dispatch (Telegram & WhatsApp)
      this.dispatchWebhookAlert(newAlert);
    }
  }

  private dispatchWebhookAlert(alert: AlertEvent) {
    const timestamp = new Date().toLocaleTimeString();

    if (this.webhookConfig.telegramEnabled) {
      this.webhookLogs.unshift({
        id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        platform: 'telegram',
        destination: this.webhookConfig.telegramChatId,
        timestamp,
        payload: {
          title: `[${alert.severity.toUpperCase()}] ${alert.sourceName}`,
          level: alert.severity,
          location: alert.sourceId,
          details: alert.message,
        },
        status: 'delivered',
      });
    }

    if (this.webhookConfig.whatsappEnabled) {
      this.webhookLogs.unshift({
        id: `WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        platform: 'whatsapp',
        destination: this.webhookConfig.whatsappPhone,
        timestamp,
        payload: {
          title: `🚨 DATACENTER ALERT: ${alert.severity.toUpperCase()}`,
          level: alert.severity,
          location: alert.sourceId,
          details: `${alert.message} | Nilai Sensor: ${alert.value}`,
        },
        status: 'delivered',
      });
    }

    // Keep logs manageable
    if (this.webhookLogs.length > 50) {
      this.webhookLogs = this.webhookLogs.slice(0, 50);
    }
  }

  private recordHistoryPoint() {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let sumTemp = 0;
    let sumHum = 0;
    let maxSmoke = 0;
    const rackTemps: Record<string, number> = {};

    this.racks.forEach((r) => {
      sumTemp += r.temp;
      sumHum += r.humidity;
      if (r.smokePpm > maxSmoke) maxSmoke = r.smokePpm;
      rackTemps[r.id] = r.temp;
    });

    const tempAvg = +(sumTemp / this.racks.length).toFixed(1);
    const humidityAvg = +(sumHum / this.racks.length).toFixed(1);
    const pue = +(1.22 + (tempAvg > 24 ? (tempAvg - 24) * 0.04 : 0)).toFixed(2);

    this.history.push({
      timestamp: now.toISOString(),
      timeFormatted,
      tempAvg,
      humidityAvg,
      smokeMaxPpm: maxSmoke,
      pue,
      rackTemps,
    });

    if (this.history.length > 30) {
      this.history.shift();
    }
  }

  // Simulation controls
  public simulateScenario(scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') {
    this.simulationActiveScenario = scenario;

    if (scenario === 'overheat-b2') {
      const rack = this.racks.find((r) => r.id === 'B2');
      if (rack) {
        rack.temp = 35.8;
        rack.exhaustTemp = 43.6;
      }
    } else if (scenario === 'smoke-a') {
      const rack = this.racks.find((r) => r.id === 'A2');
      if (rack) {
        rack.smokePpm = 340;
        rack.temp = 32.5;
      }
      const sd = this.smokeDetectors.find((s) => s.id === 'SD-01');
      if (sd) {
        sd.ppm = 380;
      }
    } else if (scenario === 'crac-fail') {
      const crac = this.cracs.find((c) => c.id === 'CRAC-01');
      if (crac) {
        crac.status = 'critical';
        crac.supplyTemp = 28.5;
        crac.compressorActive = false;
      }
    } else if (scenario === 'none') {
      // Full reset
      this.racks = JSON.parse(JSON.stringify(INITIAL_RACKS));
      this.cracs = JSON.parse(JSON.stringify(INITIAL_CRACS));
      this.smokeDetectors = JSON.parse(JSON.stringify(INITIAL_SMOKE_DETECTORS));
      soundManager.stopAlarm();
    }

    this.evaluateStatuses();
    this.notify();
  }
}

export const telemetryStore = new TelemetryStore();
