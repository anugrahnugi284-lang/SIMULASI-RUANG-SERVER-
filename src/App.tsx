import React, { useState, useEffect } from 'react';
import { telemetryStore } from './services/telemetryStore';
import {
  RackData,
  CRACUnitData,
  SmokeDetectorData,
  EnvironmentalHistoryPoint,
  AlertEvent,
  ThresholdConfig,
  WebhookConfig,
  WebhookDispatch,
  CameraPreset,
  VisualizationMode,
  RackId,
} from './types/monitoring';

// Components
import { TopHeader } from './components/HUD/TopHeader';
import { AlertBanner } from './components/HUD/AlertBanner';
import { BottomControlDock } from './components/HUD/BottomControlDock';
import { RackDetailModal } from './components/HUD/RackDetailModal';
import { DeviceDetailModal } from './components/HUD/DeviceDetailModal';
import { ThresholdSettingsModal } from './components/HUD/ThresholdSettingsModal';
import { WebhookModal } from './components/HUD/WebhookModal';
import { IncidentDrillModal } from './components/SimulationModal/IncidentDrillModal';
import { ThreeViewer } from './components/ThreeCanvas/ThreeViewer';
import { GaugeDashboard } from './components/Gauges/GaugeDashboard';
import { TelemetryCharts } from './components/Analytics/TelemetryCharts';
import { EventLogView } from './components/EventLog/EventLogView';
import { PRDViewer } from './components/PRDViewer/PRDViewer';
import { soundManager } from './services/soundEffects';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'3d' | 'gauges' | 'analytics' | 'logs' | 'prd'>('3d');

  // Telemetry state synced from telemetryStore
  const [racks, setRacks] = useState<RackData[]>(telemetryStore.getRacks());
  const [cracs, setCracs] = useState<CRACUnitData[]>(telemetryStore.getCRACs());
  const [smokeDetectors, setSmokeDetectors] = useState<SmokeDetectorData[]>(telemetryStore.getSmokeDetectors());
  const [history, setHistory] = useState<EnvironmentalHistoryPoint[]>(telemetryStore.getHistory());
  const [alerts, setAlerts] = useState<AlertEvent[]>(telemetryStore.getAlerts());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(telemetryStore.getThresholds());
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(telemetryStore.getWebhookConfig());
  const [webhookLogs, setWebhookLogs] = useState<WebhookDispatch[]>(telemetryStore.getWebhookLogs());
  const [simulationScenario, setSimulationScenario] = useState<string>(telemetryStore.getSimulationScenario());

  // 3D Controls
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('pbr');

  // Selected object inspection
  const [selectedRackId, setSelectedRackId] = useState<RackId | null>(null);
  const [selectedCracId, setSelectedCracId] = useState<string | null>(null);
  const [selectedSmokeId, setSelectedSmokeId] = useState<string | null>(null);

  // Modal dialogs
  const [isThresholdsOpen, setIsThresholdsOpen] = useState<boolean>(false);
  const [isWebhooksOpen, setIsWebhooksOpen] = useState<boolean>(false);
  const [isDrillsOpen, setIsDrillsOpen] = useState<boolean>(false);

  // Subscribe to real-time store updates
  useEffect(() => {
    const unsubscribe = telemetryStore.subscribe(() => {
      setRacks([...telemetryStore.getRacks()]);
      setCracs([...telemetryStore.getCRACs()]);
      setSmokeDetectors([...telemetryStore.getSmokeDetectors()]);
      setHistory([...telemetryStore.getHistory()]);
      setAlerts([...telemetryStore.getAlerts()]);
      setThresholds({ ...telemetryStore.getThresholds() });
      setWebhookConfig({ ...telemetryStore.getWebhookConfig() });
      setWebhookLogs([...telemetryStore.getWebhookLogs()]);
      setSimulationScenario(telemetryStore.getSimulationScenario());
    });
    return unsubscribe;
  }, []);

  // Alert handlers
  const handleAcknowledge = (id: string) => {
    telemetryStore.acknowledgeAlert(id);
  };

  const handleResolve = (id: string) => {
    telemetryStore.resolveAlert(id);
  };

  const handleClearResolved = () => {
    telemetryStore.clearResolvedAlerts();
  };

  // Simulation handler
  const handleSimulateScenario = (scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') => {
    telemetryStore.simulateScenario(scenario);
  };

  // Test webhook send
  const handleSendTestWebhook = () => {
    const alert: AlertEvent = {
      id: `TEST-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      severity: 'warning',
      sourceId: 'NOC-TEST',
      sourceName: 'Simulasi Saluran Peringatan',
      message: 'Uji konektivitas webhook Telegram & WhatsApp Gateway berhasil!',
      value: 'Online',
      acknowledged: true,
      resolved: false,
      dispatchedToWebhook: true,
    };
    telemetryStore['dispatchWebhookAlert'](alert);
    setWebhookLogs([...telemetryStore.getWebhookLogs()]);
  };

  const selectedRack = selectedRackId ? racks.find((r) => r.id === selectedRackId) || null : null;
  const selectedCrac = selectedCracId ? cracs.find((c) => c.id === selectedCracId) || null : null;
  const selectedSmoke = selectedSmokeId ? smokeDetectors.find((s) => s.id === selectedSmokeId) || null : null;

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0b0e14] text-slate-100 font-sans">
      {/* 1. Top Navigation & Telemetry Header */}
      <TopHeader
        racks={racks}
        cracs={cracs}
        smokeDetectors={smokeDetectors}
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenThresholds={() => {
          soundManager.playClick();
          setIsThresholdsOpen(true);
        }}
        onOpenWebhooks={() => {
          soundManager.playClick();
          setIsWebhooksOpen(true);
        }}
        onOpenDrills={() => {
          soundManager.playClick();
          setIsDrillsOpen(true);
        }}
      />

      {/* 2. Real-time Emergency Alert Banner (Visible when active alarms exist) */}
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        onSelectRack={(rackId) => {
          setSelectedRackId(rackId as RackId);
          setActiveTab('3d');
        }}
      />

      {/* 3. Main Viewport Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Tab 1: 3D Three.js Spatial Digital Twin */}
        <div className={`w-full h-full ${activeTab === '3d' ? 'block' : 'hidden'}`}>
          <ThreeViewer
            racks={racks}
            cracs={cracs}
            smokeDetectors={smokeDetectors}
            cameraPreset={cameraPreset}
            visualizationMode={visualizationMode}
            selectedRackId={selectedRackId}
            onSelectRack={(id) => {
              soundManager.playClick();
              setSelectedRackId(id);
            }}
            onSelectCRAC={(id) => {
              soundManager.playClick();
              setSelectedCracId(id);
            }}
            onSelectSmoke={(id) => {
              soundManager.playClick();
              setSelectedSmokeId(id);
            }}
          />

          {/* Unified Collapsible Bottom Dock (Zero Viewport Occlusion) */}
          <BottomControlDock
            cameraPreset={cameraPreset}
            setCameraPreset={setCameraPreset}
            visualizationMode={visualizationMode}
            setVisualizationMode={setVisualizationMode}
            simulationScenario={simulationScenario}
            onSimulateScenario={handleSimulateScenario}
          />
        </div>

        {/* Tab 2: Radial Gauge Telemetry Dashboard */}
        {activeTab === 'gauges' && (
          <div className="w-full h-full">
            <GaugeDashboard
              racks={racks}
              cracs={cracs}
              smokeDetectors={smokeDetectors}
              thresholds={thresholds}
              onSelectRack3D={(rackId) => {
                setSelectedRackId(rackId);
                setActiveTab('3d');
              }}
              onOpenThresholds={() => {
                soundManager.playClick();
                setIsThresholdsOpen(true);
              }}
              onSimulateScenario={handleSimulateScenario}
              simulationScenario={simulationScenario}
            />
          </div>
        )}

        {/* Tab 3: Analytics & Time-series Trends */}
        {activeTab === 'analytics' && (
          <div className="w-full h-full">
            <TelemetryCharts history={history} racks={racks} thresholds={thresholds} />
          </div>
        )}

        {/* Tab 3: Event Log Audit Trail */}
        {activeTab === 'logs' && (
          <div className="w-full h-full">
            <EventLogView
              alerts={alerts}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onClearResolved={handleClearResolved}
              onSelectRack={(id) => {
                setSelectedRackId(id as RackId);
                setActiveTab('3d');
              }}
            />
          </div>
        )}

        {/* Tab 4: Comprehensive PRD Document Viewer Hub */}
        {activeTab === 'prd' && (
          <div className="w-full h-full">
            <PRDViewer />
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <RackDetailModal rack={selectedRack} onClose={() => setSelectedRackId(null)} />

      <DeviceDetailModal
        crac={selectedCrac}
        smoke={selectedSmoke}
        onClose={() => {
          setSelectedCracId(null);
          setSelectedSmokeId(null);
        }}
      />

      <ThresholdSettingsModal
        thresholds={thresholds}
        isOpen={isThresholdsOpen}
        onClose={() => setIsThresholdsOpen(false)}
        onSave={(newTh) => telemetryStore.setThresholds(newTh)}
      />

      <WebhookModal
        config={webhookConfig}
        logs={webhookLogs}
        isOpen={isWebhooksOpen}
        onClose={() => setIsWebhooksOpen(false)}
        onUpdateConfig={(cfg) => telemetryStore.setWebhookConfig(cfg)}
        onSendTestDispatch={handleSendTestWebhook}
      />

      <IncidentDrillModal
        isOpen={isDrillsOpen}
        onClose={() => setIsDrillsOpen(false)}
        activeScenario={simulationScenario}
        onSelectScenario={handleSimulateScenario}
        onSendTestWebhook={handleSendTestWebhook}
      />
    </div>
  );
}
