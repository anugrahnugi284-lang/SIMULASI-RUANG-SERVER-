import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ServerRoomScene } from './ServerRoomScene';
import {
  RackData,
  CRACUnitData,
  SmokeDetectorData,
  CameraPreset,
  VisualizationMode,
  RackId,
} from '../../types/monitoring';

interface ThreeViewerProps {
  racks: RackData[];
  cracs: CRACUnitData[];
  smokeDetectors: SmokeDetectorData[];
  cameraPreset: CameraPreset;
  visualizationMode: VisualizationMode;
  selectedRackId: RackId | null;
  onSelectRack: (id: RackId) => void;
  onSelectCRAC: (id: string) => void;
  onSelectSmoke: (id: string) => void;
}

interface HoverTooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  type: 'rack' | 'crac' | 'smoke';
  temp?: number;
  humidity?: number;
  smokePpm?: number;
  power?: number;
  status: string;
}

const CAMERA_PRESET_TARGETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [0, 9.8, 14.8], target: [0, 1.2, 0] },
  'cold-aisle': { pos: [-6.8, 1.9, 0], target: [4.0, 1.5, 0] },
  'hot-aisle': { pos: [-6.0, 2.2, -4.6], target: [3.5, 1.6, -2.4] },
  'crac-units': { pos: [-9.8, 4.2, 3.8], target: [-7.2, 1.5, 0] },
  'smoke-ceiling': { pos: [0, 1.1, 0.2], target: [0, 4.1, 0] },
  'top-down': { pos: [0, 18.0, 0.01], target: [0, 0, 0] },
};

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  racks,
  cracs,
  smokeDetectors,
  cameraPreset,
  visualizationMode,
  selectedRackId,
  onSelectRack,
  onSelectCRAC,
  onSelectSmoke,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ServerRoomScene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 9.8, 14.8));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));
  const isTransitioningCam = useRef<boolean>(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState<HoverTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    type: 'rack',
    status: 'normal',
  });

  // Reusable raycaster items
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Keep live references for the render loop
  const racksRef = useRef(racks);
  racksRef.current = racks;
  const smokeRef = useRef(smokeDetectors);
  smokeRef.current = smokeDetectors;
  const modeRef = useRef(visualizationMode);
  modeRef.current = visualizationMode;

  // Camera preset change listener
  useEffect(() => {
    const config = CAMERA_PRESET_TARGETS[cameraPreset];
    if (config) {
      targetCamPos.current.set(...config.pos);
      targetCamLook.current.set(...config.target);
      isTransitioningCam.current = true;
    }
  }, [cameraPreset]);

  // Focus on selected rack if changed
  useEffect(() => {
    if (selectedRackId) {
      const rack = racks.find((r) => r.id === selectedRackId);
      if (rack) {
        const [rx, , rz] = rack.position;
        const isRowA = rack.zone.includes('Row A');
        // Position camera in front of rack
        targetCamPos.current.set(rx, 2.2, isRowA ? rz + 2.8 : rz - 2.8);
        targetCamLook.current.set(rx, 1.4, rz);
        isTransitioningCam.current = true;
      }
    }
  }, [selectedRackId, racks]);

  // Mount Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Instantiate scene
    const roomScene = new ServerRoomScene(container);
    sceneRef.current = roomScene;

    // Build Racks
    racks.forEach((rack) => roomScene.createServerRack(rack));
    // Build CRAC Units
    cracs.forEach((crac) => roomScene.createCRACUnit(crac));
    // Build Smoke Detectors
    smokeDetectors.forEach((sd) => roomScene.createSmokeDetector(sd));

    // OrbitControls
    const controls = new OrbitControls(roomScene.camera, roomScene.renderer.domElement);
    controls.enableDamping = !roomScene.isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going underneath floor
    controls.minDistance = 2.0;
    controls.maxDistance = 28.0;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // Interrupt scripted camera transition if user manually interacts
    controls.addEventListener('start', () => {
      isTransitioningCam.current = false;
    });

    // Resize listener
    const handleResize = () => {
      if (!container || !roomScene) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      roomScene.camera.aspect = width / height;
      roomScene.camera.updateProjectionMatrix();
      roomScene.renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Continuous Animation Loop with Software WebGL Guard
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = roomScene.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera transition if active
      if (isTransitioningCam.current && controls) {
        roomScene.camera.position.x = THREE.MathUtils.damp(roomScene.camera.position.x, targetCamPos.current.x, 4.5, delta);
        roomScene.camera.position.y = THREE.MathUtils.damp(roomScene.camera.position.y, targetCamPos.current.y, 4.5, delta);
        roomScene.camera.position.z = THREE.MathUtils.damp(roomScene.camera.position.z, targetCamPos.current.z, 4.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, targetCamLook.current.x, 4.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, targetCamLook.current.y, 4.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, targetCamLook.current.z, 4.5, delta);

        if (
          roomScene.camera.position.distanceTo(targetCamPos.current) < 0.05 &&
          controls.target.distanceTo(targetCamLook.current) < 0.05
        ) {
          isTransitioningCam.current = false;
        }
      }

      controls.update();

      // Update telemetry colors, smoke, and airflow
      roomScene.updateTelemetry(racksRef.current, smokeRef.current, modeRef.current, elapsed);

      // Render
      roomScene.renderer.render(roomScene.scene, roomScene.camera);

      // Paced scheduling
      if (roomScene.isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      roomScene.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Pointer interactions (Hover & Click Raycasting)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const scene = sceneRef.current;
    if (!container || !scene) return;

    const rect = container.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, scene.camera);
    const intersects = raycaster.current.intersectObjects(scene.interactiveObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;

      if (data.type === 'rack') {
        const rack = racks.find((r) => r.id === data.id);
        if (rack) {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            title: rack.name,
            type: 'rack',
            temp: rack.temp,
            humidity: rack.humidity,
            smokePpm: rack.smokePpm,
            power: rack.powerKw,
            status: rack.status,
          });
          container.style.cursor = 'pointer';
          return;
        }
      } else if (data.type === 'crac') {
        const crac = cracs.find((c) => c.id === data.id);
        if (crac) {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            title: crac.name,
            type: 'crac',
            temp: crac.supplyTemp,
            status: crac.status,
          });
          container.style.cursor = 'pointer';
          return;
        }
      } else if (data.type === 'smoke') {
        const sd = smokeDetectors.find((s) => s.id === data.id);
        if (sd) {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            title: sd.name,
            type: 'smoke',
            smokePpm: sd.ppm,
            status: sd.status,
          });
          container.style.cursor = 'pointer';
          return;
        }
      }
    }

    if (tooltip.visible) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      container.style.cursor = 'default';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const scene = sceneRef.current;
    if (!container || !scene) return;

    const rect = container.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, scene.camera);
    const intersects = raycaster.current.intersectObjects(scene.interactiveObjects, false);

    if (intersects.length > 0) {
      const data = intersects[0].object.userData;
      if (data.type === 'rack') {
        onSelectRack(data.id as RackId);
      } else if (data.type === 'crac') {
        onSelectCRAC(data.id);
      } else if (data.type === 'smoke') {
        onSelectSmoke(data.id);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Three.js Isolated Canvas Mount (Zero backdrop-filter directly on canvas) */}
      <div
        ref={mountRef}
        className="w-full h-full bg-[#0b0e14]"
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      />

      {/* Raycast Hover Tooltip (Static, Clean, Zero Pill Distortion) */}
      {tooltip.visible && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2.5 rounded-lg bg-[#0f172a] border border-slate-700 shadow-2xl text-xs text-slate-200 transition-opacity"
          style={{ left: tooltip.x, top: tooltip.y - 10 }}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-slate-800 pb-1">
            <span className="font-semibold text-white tracking-wide">{tooltip.title}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                tooltip.status === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : tooltip.status === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {tooltip.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {tooltip.temp !== undefined && (
              <div>
                <span className="text-slate-400">Suhu: </span>
                <span className="font-mono font-bold text-white">{tooltip.temp.toFixed(1)}°C</span>
              </div>
            )}
            {tooltip.humidity !== undefined && (
              <div>
                <span className="text-slate-400">Kelembaban: </span>
                <span className="font-mono font-bold text-white">{tooltip.humidity.toFixed(1)}% RH</span>
              </div>
            )}
            {tooltip.smokePpm !== undefined && (
              <div>
                <span className="text-slate-400">Asap: </span>
                <span
                  className={`font-mono font-bold ${
                    (tooltip.smokePpm || 0) > 120 ? 'text-red-400' : 'text-slate-200'
                  }`}
                >
                  {tooltip.smokePpm} PPM
                </span>
              </div>
            )}
            {tooltip.power !== undefined && (
              <div>
                <span className="text-slate-400">Daya: </span>
                <span className="font-mono font-bold text-white">{tooltip.power.toFixed(1)} kW</span>
              </div>
            )}
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 italic">Klik untuk inspeksi mendalam</div>
        </div>
      )}
    </div>
  );
};
