import * as THREE from 'three';

/**
 * Procedural Canvas Textures
 * Zero external image dependencies. 100% generated in memory with high-DPI canvas.
 */

export function createFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark slate tile background
  ctx.fillStyle = '#181b22';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle interior tile shading
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 320);
  grad.addColorStop(0, '#222733');
  grad.addColorStop(1, '#15181f');
  ctx.fillStyle = grad;
  ctx.fillRect(8, 8, 496, 496);

  // Raised floor tile bevel border
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 504);

  // Corner screw / lifter suction hole marks
  ctx.fillStyle = '#0f1117';
  const corners = [[24, 24], [488, 24], [24, 488], [488, 488]];
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a4454';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPerforatedVentTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 256, 256);

  // Perforated hole grid
  ctx.fillStyle = '#080a0e';
  const radius = 4;
  const gap = 14;
  for (let x = gap; x < 256; x += gap) {
    for (let y = gap; y < 256; y += gap) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cyan cold-aisle air intake accent border
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 252);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createServerGrillTexture(): THREE.CanvasTexture {
  return createEnterpriseStorageServerTexture();
}

/**
 * High-Fidelity 24-Bay Hot-Swap Storage Server Chassis Front Texture
 * Modeled directly from enterprise 4U rackmount server reference (4 cols x 6 rows = 24 bays).
 */
export function createEnterpriseStorageServerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark Brushed Metal Chassis Bezel Frame
  ctx.fillStyle = '#0c0f14';
  ctx.fillRect(0, 0, 1024, 512);

  // Outer top/bottom brushed silver highlight strip
  ctx.fillStyle = '#c8d1db';
  ctx.fillRect(0, 0, 1024, 8);
  ctx.fillRect(0, 504, 1024, 8);

  // 2. Left Mounting Ear (x: 0 to 68)
  ctx.fillStyle = '#11151d';
  ctx.fillRect(0, 8, 68, 496);

  // Mounting flange screw holes
  ctx.fillStyle = '#1e2430';
  [30, 240, 470].forEach((y) => {
    ctx.beginPath();
    ctx.arc(18, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#384252';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Silver U-Handle on Left Ear
  const leftHandleGrad = ctx.createLinearGradient(32, 120, 52, 120);
  leftHandleGrad.addColorStop(0, '#e2e8f0');
  leftHandleGrad.addColorStop(0.5, '#f8fafc');
  leftHandleGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = leftHandleGrad;
  ctx.beginPath();
  ctx.roundRect(36, 110, 16, 280, 8);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left Control Panel (Power button, LEDs, USB)
  ctx.fillStyle = '#0a0d13';
  ctx.fillRect(20, 310, 28, 120);
  ctx.strokeStyle = '#222938';
  ctx.strokeRect(20, 310, 28, 120);

  // Power Button
  ctx.beginPath();
  ctx.arc(34, 330, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#1e2532';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Status LEDs (Power, Disk, NIC, Error)
  const leds = [
    { y: 352, color: '#10b981' }, // Power green
    { y: 366, color: '#38bdf8' }, // Disk blue
    { y: 380, color: '#38bdf8' }, // NIC blue
    { y: 394, color: '#f59e0b' }, // Warning amber
  ];
  leds.forEach(({ y, color }) => {
    ctx.beginPath();
    ctx.arc(34, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // USB Port
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(28, 408, 12, 6);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(29, 411, 10, 2);

  // 3. Right Mounting Ear (x: 956 to 1024)
  ctx.fillStyle = '#11151d';
  ctx.fillRect(956, 8, 68, 496);

  // Mounting flange screw holes
  [30, 240, 470].forEach((y) => {
    ctx.beginPath();
    ctx.arc(1006, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#384252';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Silver U-Handle on Right Ear
  const rightHandleGrad = ctx.createLinearGradient(972, 120, 992, 120);
  rightHandleGrad.addColorStop(0, '#94a3b8');
  rightHandleGrad.addColorStop(0.5, '#f8fafc');
  rightHandleGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = rightHandleGrad;
  ctx.beginPath();
  ctx.roundRect(972, 110, 16, 280, 8);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right Model Badge "4U-24B SAS"
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(962, 340, 26, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('4U', 975, 354);
  ctx.fillText('24B', 975, 370);

  // 4. Center 24-Bay Hot-Swap Drive Caddy Array (4 columns x 6 rows)
  const startX = 72;
  const startY = 14;
  const bayW = 216;
  const bayH = 78;
  const gapX = 6;
  const gapY = 4;

  let driveNum = 1;

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 6; row++) {
      const bx = startX + col * (bayW + gapX);
      const by = startY + row * (bayH + gapY);

      // Bay bezel container
      ctx.fillStyle = '#151922';
      ctx.fillRect(bx, by, bayW, bayH);
      ctx.strokeStyle = '#273142';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bayW, bayH);

      // Honeycomb vent slots (top area of caddy)
      ctx.fillStyle = '#07090d';
      for (let vx = bx + 6; vx < bx + bayW - 8; vx += 7) {
        ctx.fillRect(vx, by + 4, 3.5, 9);
      }

      // Honeycomb vent slots (bottom area of caddy)
      for (let vx = bx + 6; vx < bx + bayW - 8; vx += 7) {
        ctx.fillRect(vx, by + bayH - 13, 3.5, 9);
      }

      // Center Horizontal Release Latch Handle (Signature ergonomic contour)
      const latchY = by + 18;
      const latchH = 42;
      const latchW = bayW - 12;
      const latchX = bx + 6;

      // Handle base gradient
      const latchGrad = ctx.createLinearGradient(latchX, latchY, latchX, latchY + latchH);
      latchGrad.addColorStop(0, '#283140');
      latchGrad.addColorStop(0.2, '#1a202c');
      latchGrad.addColorStop(0.8, '#141923');
      latchGrad.addColorStop(1, '#0a0d14');
      ctx.fillStyle = latchGrad;
      ctx.beginPath();
      ctx.roundRect(latchX, latchY, latchW, latchH, 5);
      ctx.fill();
      ctx.strokeStyle = '#374357';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Ergonomic center grip indentation
      ctx.fillStyle = '#0c0f16';
      ctx.beginPath();
      ctx.roundRect(latchX + 48, latchY + 8, latchW - 96, latchH - 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#1e2636';
      ctx.stroke();

      // Left Blue Label Tab (With SAS / SATA Drive Number)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(latchX + 5, latchY + 6, 26, latchH - 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAS', latchX + 18, latchY + 18);
      ctx.fillText(`${driveNum}`, latchX + 18, latchY + 31);

      // Right Circular Blue Ring / Activity Light (Signature Hot-Swap Visual)
      const ringX = latchX + latchW - 22;
      const ringY = latchY + latchH / 2;

      // Outer bezel ring
      ctx.beginPath();
      ctx.arc(ringX, ringY, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#0c0f16';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Central LED Indicator dot
      ctx.beginPath();
      ctx.arc(ringX, ringY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7dd3fc';
      ctx.fill();

      // Latch release click lever on the far right
      ctx.fillStyle = '#334155';
      ctx.fillRect(latchX + latchW - 6, latchY + 12, 4, latchH - 24);

      driveNum++;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRackLabelTexture(name: string, temp: number, status: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background badge
  ctx.fillStyle = '#090d14';
  ctx.fillRect(0, 0, 512, 128);

  let statusColor = '#10b981'; // green
  if (status === 'warning') statusColor = '#f59e0b'; // yellow/amber
  if (status === 'critical') statusColor = '#ef4444'; // red

  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 122);

  // Status accent strip
  ctx.fillStyle = statusColor;
  ctx.fillRect(6, 6, 18, 116);

  // Rack ID text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(name, 36, 54);

  // Subtext (Temperature and Status)
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`INLET: ${temp.toFixed(1)}°C`, 36, 98);

  ctx.fillStyle = statusColor;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(status.toUpperCase(), 490, 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSmokeParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(210, 215, 225, 0.8)');
  grad.addColorStop(0.35, 'rgba(170, 175, 190, 0.45)');
  grad.addColorStop(0.7, 'rgba(120, 125, 140, 0.15)');
  grad.addColorStop(1, 'rgba(80, 85, 100, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
