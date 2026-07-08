"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Activity, Sparkles, X, Database
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialNodes, BusinessNode } from "@/lib/mockData";
import Link from "next/link";

export default function DigitalTwinPage() {
  const [nodes, setNodes] = useState<BusinessNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<BusinessNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    setNodes(initialNodes);
    // Auto-select the central business node on load to populate details
    const central = initialNodes.find(n => n.id === "business");
    if (central) setSelectedNode(central);
  }, []);

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Network size={28} className="text-blue-500 animate-pulse" />
          Living Dependency Replicas
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Interactive virtual maps tracing data dependencies. Pulsing paths show real-time synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* INTERACTIVE SVG MAP VIEW */}
        <Card className="lg:col-span-8 border-white/5 relative overflow-hidden flex flex-col justify-center min-h-[340px] sm:min-h-[500px] bg-slate-950/40 p-4 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]">
          {/* Legend indicator bar */}
          <div className="absolute top-4 left-4 flex gap-4 text-xs font-semibold text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full z-10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Critical</span>
          </div>

          <div className="relative w-full h-[300px] sm:h-[400px] md:aspect-[4/3] max-w-3xl mx-auto">
            {/* Embedded SVG for connections, paths, and grids */}
            <svg 
              viewBox="0 0 800 600" 
              className="absolute inset-0 w-full h-full select-none"
            >
              <defs>
                {/* Glow Filters */}
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowYellow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* Gradients */}
                <radialGradient id="businessGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Central Business background glow area */}
              <circle cx="400" cy="300" r="140" fill="url(#businessGlow)" />

              {/* Connection Paths (Pulse effect using Stroke Dash offsets) */}
              {nodes.map((node) => {
                if (node.id === "business") return null;

                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                
                // Color path depending on status
                let strokeColor = "rgba(59, 130, 246, 0.25)";
                if (node.health === "yellow") strokeColor = "rgba(245, 158, 11, 0.3)";
                if (node.health === "red") strokeColor = "rgba(239, 68, 68, 0.4)";

                return (
                  <g key={`path-${node.id}`}>
                    {/* Underlying static link */}
                    <line
                      x1="400"
                      y1="300"
                      x2={node.x}
                      y2={node.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                      className="transition-all duration-300"
                    />

                    {/* Animated Pulsing dash path */}
                    <line
                      x1="400"
                      y1="300"
                      x2={node.x}
                      y2={node.y}
                      stroke={
                        node.health === "red" 
                          ? "#ef4444" 
                          : node.health === "yellow" 
                          ? "#f59e0b" 
                          : "#3b82f6"
                      }
                      strokeWidth="2"
                      strokeDasharray="10, 15"
                      strokeDashoffset="0"
                      className="animate-[dash_10s_linear_infinite]"
                      style={{
                        strokeDashoffset: node.health === "red" ? -50 : 50,
                        animation: "dash 4s linear infinite"
                      }}
                      opacity={isSelected || isHovered ? 1 : 0.6}
                    />
                  </g>
                );
              })}

              {/* Interactive Node Circles */}
              {nodes.map((node) => {
                const isCentral = node.id === "business";
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;

                let color = "rgba(59, 130, 246, 0.2)";
                let stroke = "#3b82f6";
                let glowFilter = "";

                if (node.health === "yellow") {
                  color = "rgba(245, 158, 11, 0.2)";
                  stroke = "#f59e0b";
                  if (isSelected || isHovered) glowFilter = "url(#glowYellow)";
                } else if (node.health === "red") {
                  color = "rgba(239, 68, 68, 0.2)";
                  stroke = "#ef4444";
                  if (isSelected || isHovered) glowFilter = "url(#glowRed)";
                } else {
                  if (isSelected || isHovered) glowFilter = "url(#glowGreen)";
                }

                const r = isCentral ? 45 : 30;

                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Ripple outer pulse for central business or red alerts */}
                    {(isCentral || node.health === "red") && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r + 10}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="1"
                        className="animate-ping opacity-25"
                        style={{ animationDuration: isCentral ? "3s" : "1.5s" }}
                      />
                    )}

                    {/* Outer glowing border ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill="rgba(15, 23, 42, 0.9)"
                      stroke={stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      filter={glowFilter}
                      className="transition-all duration-300"
                    />

                    {/* Inner color center core */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCentral ? 10 : 6}
                      fill={stroke}
                      className={node.health === "red" ? "animate-pulse" : ""}
                    />

                    {/* Node Text Label (Positioned offset relative to Node center coordinates) */}
                    <text
                      x={node.x}
                      y={node.y + r + 16}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? "#ffffff" : "#94a3b8"}
                      fontSize={isCentral ? "13" : "11"}
                      fontWeight={isSelected || isCentral ? "bold" : "medium"}
                      className="transition-colors duration-300 font-sans tracking-tight"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Pulsing Dash path CSS animation keyframes */}
            <style jsx global>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -100;
                }
              }
            `}</style>
          </div>
        </Card>

        {/* DETAILS INSIGHTS DRAWER PANEL */}
        <Card className="lg:col-span-4 border-white/5 flex flex-col justify-between bg-slate-950/60 shadow-lg relative overflow-hidden">
          {selectedNode ? (
            <>
              <div>
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Node Insights</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      selectedNode.health === "red" 
                        ? "bg-red-950/60 text-red-400 border border-red-900/30" 
                        : selectedNode.health === "yellow" 
                        ? "bg-amber-950/60 text-amber-400 border border-amber-900/30"
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30"
                    }`}>
                      {selectedNode.health === "red" ? <ShieldAlert size={10} /> : selectedNode.health === "yellow" ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                      Score: {selectedNode.score}
                    </span>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-white mt-2 flex items-center gap-2">
                    {selectedNode.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{selectedNode.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics Feed</h5>
                    <div className="space-y-2">
                      {selectedNode.details.map((detail, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-200">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedNode.health === "red" && (
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/50 text-red-300 text-xs leading-relaxed flex gap-2">
                      <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <strong>Critical Issue Detected</strong>
                        <p className="text-[11px] text-red-400/80 mt-1">This node is operating below target SLAs. Action recommended immediately to prevent cascading margin loss.</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.health === "yellow" && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-300 text-xs leading-relaxed flex gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <strong>Performance Bottleneck</strong>
                        <p className="text-[11px] text-amber-400/80 mt-1">Slight lag detected in response time/levels. Under watch by predictive twin models.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Action buttons depending on node type */}
              <div className="p-6 border-t border-white/5">
                {selectedNode.id !== "business" ? (
                  <Link href={
                    selectedNode.id === "suppliers" || selectedNode.id === "inventory" ? "/dashboard/inventory" :
                    selectedNode.id === "sales" || selectedNode.id === "marketing" || selectedNode.id === "customers" ? "/dashboard/customers" :
                    selectedNode.id === "operations" ? "/dashboard/simulation" :
                    `/dashboard/${selectedNode.id}`
                  }>
                    <Button className="w-full flex items-center justify-center gap-1.5">
                      Open {selectedNode.label} Management <ArrowRight size={14} />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-1.5">
                      View Operational Dashboard <Activity size={14} />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Network size={40} className="stroke-1 mb-2 animate-pulse" />
              <p className="text-xs">Click a map node to display predictive insights.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
