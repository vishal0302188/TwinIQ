"use client";

import React, { useEffect, useState } from "react";

interface GaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export default function Gauge({ score, size = 180, strokeWidth = 14 }: GaugeProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Trigger progress animation on load
    const timer = setTimeout(() => {
      setValue(score);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Determine color theme based on score
  let strokeColor = "url(#gaugeGradientBlue)";
  if (score < 50) strokeColor = "url(#gaugeGradientRed)";
  else if (score < 80) strokeColor = "url(#gaugeGradientYellow)";
  else strokeColor = "url(#gaugeGradientGreen)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-full blur-[24px] opacity-20 transition-all duration-1000"
        style={{
          background: score < 50 
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)"
            : score < 80 
            ? "radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)"
        }}
      />
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gaugeGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gaugeGradientYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="gaugeGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-navy-800/40 fill-none"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      
      {/* Centered Score details */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight text-white glow-text-blue">
          {value}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
          Business Health
        </span>
      </div>
    </div>
  );
}
