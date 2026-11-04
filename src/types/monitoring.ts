export type RackId = 'A1' | 'A2' | 'A3' | 'A4' | 'B1' | 'B2' | 'B3' | 'B4';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type SensorStatus = 'normal' | 'warning' | 'critical';

export interface BladeServer {
  slot: number; // 1 to 10
  uSize: number; // 1U, 2U, 4U
  model: string;
  cpuTemp: number;
  status: SensorStatus;
  loadPercent: number;
}

export interface RackData {
  id: RackId;
  name: string;
  zone: 'Row A (Cold Intake)' | 'Row B (Cold Intake)';
  temp: number; // Inlet Temperature in °C
  exhaustTemp: number; // Exhaust Temperature in °C
  humidity: number; // Relative Humidity in % RH
  smokePpm: number; // Particulate/gas in PPM (0-100 Normal, >120 Warning, >250 Smoke Alarm)
  smokeTriggered: boolean;
  status: SensorStatus;
  powerKw: number;
  fanRpm: number;
  servers: BladeServer[];
  position: [number, number, number]; // [x, y, z] in 3D world
}

export interface CRACUnitData {
  id: 'CRAC-01' | 'CRAC-02';
  name: string;
  status: 'normal' | 'warning' | 'critical';
  setPointTemp: number; // °C
  supplyTemp: number; // °C
  returnTemp: number; // °C
  fanSpeedPercent: number;
  compressorActive: boolean;
  position: [number, number, number];
}

export interface SmokeDetectorData {
  id: string;
  name: string;
  zone: string;
  ppm: number;
  triggered: boolean;
  status: SensorStatus;
  position: [number, number, number];
}

export interface EnvironmentalHistoryPoint {
  timestamp: string;
  timeFormatted: string;
  tempAvg: number;
  humidityAvg: number;
  smokeMaxPpm: number;
  pue: number;
  rackTemps: Record<string, number>;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  type: 'temperature' | 'humidity' | 'smoke' | 'cooling' | 'system';
  severity: AlertSeverity;
  sourceId: string;
  sourceName: string;
  message: string;
  value: string;
  acknowledged: boolean;
  resolved: boolean;
  dispatchedToWebhook?: boolean;
}

export interface ThresholdConfig {
  tempWarning: number; // default: 25°C
  tempCritical: number; // default: 30°C
  tempOptimalMin: number; // default: 18°C
  tempOptimalMax: number; // default: 24°C
  humidityMin: number; // default: 40% RH
  humidityMax: number; // default: 60% RH
  humidityCriticalMin: number; // default: 30% RH
  humidityCriticalMax: number; // default: 70% RH
  smokeWarningPpm: number; // default: 120 PPM
  smokeCriticalPpm: number; // default: 250 PPM
}

export type CameraPreset = 'overview' | 'cold-aisle' | 'hot-aisle' | 'crac-units' | 'smoke-ceiling' | 'top-down';
export type VisualizationMode = 'pbr' | 'thermal' | 'airflow';

export interface WebhookConfig {
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramBotName: string;
  whatsappEnabled: boolean;
  whatsappPhone: string;
}

export interface WebhookDispatch {
  id: string;
  platform: 'telegram' | 'whatsapp';
  destination: string;
  timestamp: string;
  payload: {
    title: string;
    level: AlertSeverity;
    location: string;
    details: string;
  };
  status: 'sent' | 'delivered';
}
