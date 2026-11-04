import React from 'react';

export interface GaugeZone {
  from: number;
  to: number;
  color: string;
  label?: string;
}

interface RadialGaugeProps {
  value: number;
  min: number;
  max: number;
  title: string;
  unit: string;
  subtitle?: string;
  status: 'normal' | 'warning' | 'critical';
  zones?: GaugeZone[];
  ticksCount?: number;
  decimals?: number;
  size?: number;
  icon?: React.ReactNode;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  min,
  max,
  title,
  unit,
  subtitle,
  status,
  zones = [],
  ticksCount = 5,
  decimals = 1,
  size = 220,
  icon,
}) => {
  // Clamped value
  const clamped = Math.max(min, Math.min(max, value));

  // Geometry configuration
  // Sweep angle: 240 degrees (from -120° to +120°)
  const startAngle = -120;
  const endAngle = 120;
  const totalAngle = endAngle - startAngle; // 240°

  // Value to angle conversion
  const ratio = (clamped - min) / (max - min);
  const needleAngle = startAngle + ratio * totalAngle;

  // SVG coordinates setup
  const center = 110;
  const radius = 80;
  const trackWidth = 10;

  // Helper to polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    // 0 deg is at top (12 o'clock), positive is clockwise
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Helper to generate SVG arc path
  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Default zones if not provided
  const activeZones: GaugeZone[] =
    zones.length > 0
      ? zones
      : [
          { from: min, to: min + (max - min) * 0.6, color: '#10b981' }, // green
          { from: min + (max - min) * 0.6, to: min + (max - min) * 0.85, color: '#f59e0b' }, // amber
          { from: min + (max - min) * 0.85, to: max, color: '#ef4444' }, // red
        ];

  // Tick marks
  const ticks = [];
  for (let i = 0; i < ticksCount; i++) {
    const tRatio = i / (ticksCount - 1);
    const tVal = min + tRatio * (max - min);
    const tAngle = startAngle + tRatio * totalAngle;
    const p1 = polarToCartesian(center, center, radius - trackWidth / 2 - 2, tAngle);
    const p2 = polarToCartesian(center, center, radius - trackWidth / 2 - 8, tAngle);
    const pLabel = polarToCartesian(center, center, radius - trackWidth / 2 - 18, tAngle);

    ticks.push({
      value: tVal,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      labelX: pLabel.x,
      labelY: pLabel.y,
    });
  }

  // Status colors
  const statusBorderColor =
    status === 'critical'
      ? 'border-red-500/40 bg-red-950/20'
      : status === 'warning'
      ? 'border-amber-500/40 bg-amber-950/20'
      : 'border-slate-800 bg-[#121824]';

  const statusBadge =
    status === 'critical'
      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
      : status === 'warning'
      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

  return (
    <div
      className={`rounded-2xl border p-4 shadow-lg flex flex-col items-center justify-between transition-all ${statusBorderColor}`}
      style={{ width: size, minWidth: size }}
    >
      {/* Card Header */}
      <div className="w-full flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="font-bold text-xs text-white tracking-wide">{title}</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${statusBadge}`}>
          {status}
        </span>
      </div>

      {/* SVG Gauge Visualizer */}
      <div className="relative flex items-center justify-center my-1">
        <svg
          viewBox="0 0 220 200"
          className="w-48 h-44 overflow-visible"
          role="img"
          aria-label={`${title}: ${value} ${unit}`}
        >
          {/* Outer Bezel Decorative Arc */}
          <path
            d={describeArc(center, center, radius + 8, startAngle, endAngle)}
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Background Track Arc */}
          <path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            stroke="#161f30"
            strokeWidth={trackWidth}
            strokeLinecap="round"
          />

          {/* Color Segments (Safe / Warning / Critical) */}
          {activeZones.map((zone, idx) => {
            const zStartRatio = Math.max(0, Math.min(1, (zone.from - min) / (max - min)));
            const zEndRatio = Math.max(0, Math.min(1, (zone.to - min) / (max - min)));
            const zStartAngle = startAngle + zStartRatio * totalAngle;
            const zEndAngle = startAngle + zEndRatio * totalAngle;

            if (zEndAngle - zStartAngle < 0.5) return null;

            return (
              <path
                key={idx}
                d={describeArc(center, center, radius, zStartAngle, zEndAngle)}
                fill="none"
                stroke={zone.color}
                strokeWidth={trackWidth}
                strokeLinecap="butt"
                opacity={0.85}
              />
            );
          })}

          {/* Scale Tick Marks & Labels */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={t.labelX}
                y={t.labelY + 3}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {Math.round(t.value)}
              </text>
            </g>
          ))}

          {/* Pivot Center Point and Bezel Base */}
          <circle cx={center} cy={center} r="14" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          <circle cx={center} cy={center} r="6" fill="#38bdf8" />

          {/* Needle Pointer with Smooth Rotation */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${center}px ${center}px`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Needle Body */}
            <path
              d={`M ${center - 3.5} ${center} L ${center} ${center - radius + 6} L ${center + 3.5} ${center} Z`}
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth="0.8"
            />
            {/* Center accent needle pin */}
            <circle cx={center} cy={center} r="3" fill="#ffffff" />
          </g>
        </svg>

        {/* Digital Value Display (Placed right below pivot) */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
              {value.toFixed(decimals)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
          </div>
          {subtitle && <span className="text-[10px] text-slate-400 font-medium text-center">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
