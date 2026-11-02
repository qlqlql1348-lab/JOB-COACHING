import React, { useState } from 'react';
import { SkillItem } from '../types/job';

interface RadarChartProps {
  skills: SkillItem[];
  userScores: Record<string, number>;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  skills,
  userScores,
  size = 420,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState<{
    skill: SkillItem;
    current: number;
    required: number;
    x: number;
    y: number;
  } | null>(null);

  if (!skills || skills.length < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        분석할 역량 항목이 충분하지 않습니다 (최소 3개 이상 필요).
      </div>
    );
  }

  const center = size / 2;
  const radius = size / 2 - 58;
  const totalAxes = skills.length;
  const angleStep = (Math.PI * 2) / totalAxes;
  const maxScore = 5.0;

  // Concentric polygon levels (1 to 5)
  const levels = [1, 2, 3, 4, 5];

  // Helper to get coordinates
  const getCoordinates = (value: number, index: number, max: number = maxScore) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points string for Benchmark
  const benchmarkPoints = skills
    .map((skill, i) => {
      const { x, y } = getCoordinates(skill.benchmarkLevel, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Polygon points string for User
  const userPoints = skills
    .map((skill, i) => {
      const userVal = Math.min(5, Math.max(0.5, userScores[skill.id] ?? 1.0));
      const { x, y } = getCoordinates(userVal, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-sm max-w-full h-auto"
      >
        <defs>
          {/* User Polygon Gradient (Vibrant Emerald) */}
          <linearGradient id="userGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
          </linearGradient>

          {/* Benchmark Polygon Gradient (Vibrant Indigo) */}
          <linearGradient id="benchmarkGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.08" />
          </linearGradient>

          <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Polygons */}
        {levels.map((level) => {
          const points = skills
            .map((_, i) => {
              const { x, y } = getCoordinates(level, i);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={`level-${level}`}
              points={points}
              fill={level % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}
              stroke="#CBD5E1"
              strokeWidth={level === 5 ? '1.5' : '1'}
              strokeDasharray={level % 2 === 0 ? '3 3' : 'none'}
              opacity={0.9}
            />
          );
        })}

        {/* Axis Lines from center */}
        {skills.map((_, i) => {
          const { x, y } = getCoordinates(maxScore, i);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* Benchmark Area (Target) */}
        <polygon
          points={benchmarkPoints}
          fill="url(#benchmarkGradientLight)"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* User Area (Current) */}
        <polygon
          points={userPoints}
          fill="url(#userGradientLight)"
          stroke="#059669"
          strokeWidth="2.5"
          filter="url(#glowLight)"
        />

        {/* User Data Points (Circles) */}
        {skills.map((skill, i) => {
          const current = userScores[skill.id] ?? 1.0;
          const required = skill.benchmarkLevel;
          const { x, y } = getCoordinates(current, i);
          const isLacking = current < required;

          return (
            <g
              key={`user-dot-${skill.id}`}
              className="cursor-pointer transition-transform duration-200 hover:scale-125"
              onMouseEnter={() => setHoveredSkill({ skill, current, required, x, y })}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={isLacking ? '#D97706' : '#059669'}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            </g>
          );
        })}

        {/* Benchmark Target Points (Hollow Dots) */}
        {skills.map((skill, i) => {
          const { x, y } = getCoordinates(skill.benchmarkLevel, i);
          return (
            <circle
              key={`target-dot-${skill.id}`}
              cx={x}
              cy={y}
              r="4"
              fill="#4F46E5"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels at outer perimeter */}
        {skills.map((skill, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 30;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          const current = userScores[skill.id] ?? 1.0;
          const diff = skill.benchmarkLevel - current;
          const isLacking = diff > 0.5;

          return (
            <g key={`label-${skill.id}`}>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] font-bold tracking-tight transition-colors duration-200 ${
                  isLacking ? 'fill-amber-700' : 'fill-slate-800'
                }`}
              >
                {skill.name.length > 9 ? `${skill.name.slice(0, 8)}…` : skill.name}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-mono font-semibold"
              >
                {current.toFixed(1)} / {skill.benchmarkLevel.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip Popup */}
      {hoveredSkill && (
        <div
          className="absolute z-30 pointer-events-none bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs backdrop-blur-md transition-all duration-150"
          style={{
            left: `${Math.min(size - 140, Math.max(10, hoveredSkill.x - 70))}px`,
            top: `${Math.max(10, hoveredSkill.y - 80)}px`,
          }}
        >
          <div className="font-bold text-slate-900 mb-1 flex items-center justify-between gap-2">
            <span>{hoveredSkill.skill.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hoveredSkill.current >= hoveredSkill.required
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {hoveredSkill.current >= hoveredSkill.required
                ? '목표 충족'
                : `갭 -${(hoveredSkill.required - hoveredSkill.current).toFixed(1)}`}
            </span>
          </div>
          <div className="text-slate-600 flex justify-between gap-4 font-mono text-[11px]">
            <span>현재 보유: <strong className="text-emerald-700 font-bold">{hoveredSkill.current.toFixed(1)}점</strong></span>
            <span>요구 기준: <strong className="text-indigo-700 font-bold">{hoveredSkill.required.toFixed(1)}점</strong></span>
          </div>
          <div className="text-slate-500 text-[10px] mt-1 line-clamp-2">
            {hoveredSkill.skill.description}
          </div>
        </div>
      )}

      {/* Legend Indicator */}
      <div className="mt-4 flex items-center gap-6 text-xs text-slate-700 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-indigo-500 rounded-sm border border-indigo-400 inline-block border-dashed"></span>
          <span className="font-medium">희망 직무 요구 역량 (기준선)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-2 bg-emerald-600 rounded-sm inline-block shadow-sm"></span>
          <span className="font-bold text-emerald-700">내 현재 보유 역량</span>
        </div>
      </div>
    </div>
  );
};
