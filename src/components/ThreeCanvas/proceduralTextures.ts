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
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Matte chassis
  ctx.fillStyle = '#11141a';
  ctx.fillRect(0, 0, 256, 512);

  // Server rack honeycomb / slotted vent rows
  ctx.fillStyle = '#05070a';
  for (let y = 10; y < 500; y += 12) {
    for (let x = 12; x < 244; x += 18) {
      ctx.fillRect(x, y, 10, 4);
    }
  }

  // Subtle server mounting ear screws
  ctx.fillStyle = '#64748b';
  for (let y = 30; y < 500; y += 70) {
    ctx.beginPath();
    ctx.arc(6, y, 2.5, 0, Math.PI * 2);
    ctx.arc(250, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
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
