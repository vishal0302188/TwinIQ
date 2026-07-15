"use client";

import React, { useState, useEffect } from "react";
import { 
  PlayCircle, RefreshCw, Sparkles, TrendingUp, TrendingDown, 
  AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runBusinessSimulation, SimulationInput, ScenarioResult, initialFinance } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function SimulationLab() {
  const [inputs, setInputs] = useState<SimulationInput>({
    priceChange: 0,
    hireCount: 0,
    inventoryChange: 0,
    marketingBudget: 0,
    openBranch: false,
    increaseSalaries: 0,
    reduceDiscounts: false,
    switchSuppliers: false
  });

  const [results, setResults] = useState<{
    neutral: ScenarioResult;
    optimistic: ScenarioResult;
    worstCase: ScenarioResult;
  } | null>(null);

  const [simulating, setSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<"neutral" | "optimistic" | "worstCase">("neutral");

  useEffect(() => {
    // Run initial base simulation
    setResults(runBusinessSimulation(inputs));
  }, []);

  const handleSimulate = () => {
    setSimulating(true);
    // Mimic computation latency
    setTimeout(() => {
      setResults(runBusinessSimulation(inputs));
      setSimulating(false);
    }, 1000);
  };

  const handleReset = () => {
    const defaults = {
      priceChange: 0,
      hireCount: 0,
      inventoryChange: 0,
      marketingBudget: 0,
      openBranch: false,
      increaseSalaries: 0,
      reduceDiscounts: false,
      switchSuppliers: false
    };
    setInputs(defaults);
    setResults(runBusinessSimulation(defaults));
  };

  const applyScenarioPreset = (preset: string) => {
    let newInputs: SimulationInput;
    if (preset === "chip-shortage") {
      newInputs = {
        priceChange: 15,
        hireCount: 0,
        inventoryChange: -35,
        marketingBudget: -10,
        openBranch: false,
        increaseSalaries: 0,
        reduceDiscounts: true,
        switchSuppliers: true
      };
    } else if (preset === "aggressive-expansion") {
      newInputs = {
        priceChange: 5,
        hireCount: 8,
        inventoryChange: 20,
        marketingBudget: 45,
        openBranch: true,
        increaseSalaries: 15,
        reduceDiscounts: false,
        switchSuppliers: false
      };
    } else if (preset === "recession") {
      newInputs = {
        priceChange: -10,
        hireCount: 0,
        inventoryChange: -15,
        marketingBudget: -30,
        openBranch: false,
        increaseSalaries: 0,
        reduceDiscounts: false,
        switchSuppliers: true
      };
    } else { // streamlining
      newInputs = {
        priceChange: 0,
        hireCount: 2,
        inventoryChange: 10,
        marketingBudget: 15,
        openBranch: false,
        increaseSalaries: 5,
        reduceDiscounts: true,
        switchSuppliers: true
      };
    }
    setInputs(newInputs);
    setResults(runBusinessSimulation(newInputs));
  };

  // Build simulated monthly projection dataset for the line chart
  const getChartData = () => {
    if (!results) return initialFinance;
    
    // Grab multipliers from the selected scenario relative to base
    const scenario = results[activeScenario];
    const baseRevenue = 12400000;
    const revMult = scenario.revenue / baseRevenue;
    const profMult = scenario.profit / 3850000;

    return initialFinance.map((record, idx) => {
      // Scale only future/late months (May, June, and simulated next month July)
      if (idx >= 4) {
        return {
          ...record,
          simRevenue: record.revenue * revMult,
          simProfit: record.profit * profMult
        };
      }
      return {
        ...record,
        simRevenue: record.revenue,
        simProfit: record.profit
      };
    });
  };

  const currentResult = results ? results[activeScenario] : null;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <PlayCircle size={28} className="text-purple-500 animate-pulse" />
            AI Simulation Sandbox Lab
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Toggle business variables to forecast operational risk, cash flow margins, and growth impact.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Values
          </Button>
          <Button size="sm" className="flex items-center gap-1.5" onClick={handleSimulate} disabled={simulating}>
            {simulating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Run AI Simulation
          </Button>
        </div>
      </div>

      {/* Scenario Presets Quick-Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            id: "chip-shortage",
            name: "Global Chip Shortage",
            description: "Inventory drops, supplier pricing spikes, and core margins squeeze.",
            color: "border-red-500/20 text-red-400 bg-red-950/10 hover:bg-red-950/20"
          },
          {
            id: "aggressive-expansion",
            name: "Aggressive Expansion",
            description: "Aggressive hiring, branches opening, and scaling marketing budget.",
            color: "border-purple-500/20 text-purple-400 bg-purple-950/10 hover:bg-purple-950/20"
          },
          {
            id: "recession",
            name: "Recession Freeze",
            description: "Price cutting, hiring freeze, and reducing overhead margins.",
            color: "border-amber-500/20 text-amber-400 bg-amber-950/10 hover:bg-amber-950/20"
          },
          {
            id: "streamlining",
            name: "Streamline Operations",
            description: "Optimized hires, supplier switching, and discount minimization.",
            color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20"
          }
        ].map((preset) => (
          <Card 
            key={preset.id} 
            onClick={() => applyScenarioPreset(preset.id)}
            className={`border cursor-pointer transition-all duration-200 p-4 flex flex-col justify-between hover:scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-2xl ${preset.color}`}
          >
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider">{preset.name}</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">{preset.description}</p>
            </div>
            <span className="text-[9px] font-bold mt-3 block text-right uppercase tracking-widest opacity-85">Apply Preset →</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CONTROL LEVER SLIDERS */}
        <Card className="lg:col-span-4 border-white/5 bg-slate-950/60 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Operational Levers
            </h3>

            {/* Price slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Price Adjustments</span>
                <span className={`${inputs.priceChange > 0 ? "text-emerald-400 font-bold" : inputs.priceChange < 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                  {inputs.priceChange > 0 ? `+${inputs.priceChange}` : inputs.priceChange}%
                </span>
              </div>
              <input 
                type="range" min="-30" max="30" value={inputs.priceChange} 
                onChange={(e) => setInputs({ ...inputs, priceChange: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Hiring slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Hire Employees</span>
                <span className={`${inputs.hireCount > 0 ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                  +{inputs.hireCount} FTEs
                </span>
              </div>
              <input 
                type="range" min="0" max="15" value={inputs.hireCount} 
                onChange={(e) => setInputs({ ...inputs, hireCount: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Marketing budgets */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Marketing Budget expansion</span>
                <span className={`${inputs.marketingBudget > 0 ? "text-emerald-400 font-bold" : inputs.marketingBudget < 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                  {inputs.marketingBudget > 0 ? `+${inputs.marketingBudget}` : inputs.marketingBudget}%
                </span>
              </div>
              <input 
                type="range" min="-30" max="100" value={inputs.marketingBudget} 
                onChange={(e) => setInputs({ ...inputs, marketingBudget: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Salaries increase */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Salary Hikes</span>
                <span className={`${inputs.increaseSalaries > 0 ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                  +{inputs.increaseSalaries}%
                </span>
              </div>
              <input 
                type="range" min="0" max="30" value={inputs.increaseSalaries} 
                onChange={(e) => setInputs({ ...inputs, increaseSalaries: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Inventory modifications */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Inventory Stock Level change</span>
                <span className={`${inputs.inventoryChange > 0 ? "text-emerald-400 font-bold" : inputs.inventoryChange < 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                  {inputs.inventoryChange > 0 ? `+${inputs.inventoryChange}` : inputs.inventoryChange}%
                </span>
              </div>
              <input 
                type="range" min="-40" max="40" value={inputs.inventoryChange} 
                onChange={(e) => setInputs({ ...inputs, inventoryChange: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Reduce Customer Discounts</span>
                <input 
                  type="checkbox" checked={inputs.reduceDiscounts} 
                  onChange={(e) => setInputs({ ...inputs, reduceDiscounts: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-purple-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Switch to local Supplier (cheaper raw cost)</span>
                <input 
                  type="checkbox" checked={inputs.switchSuppliers} 
                  onChange={(e) => setInputs({ ...inputs, switchSuppliers: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-purple-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Open New Warehouse/Branch</span>
                <input 
                  type="checkbox" checked={inputs.openBranch} 
                  onChange={(e) => setInputs({ ...inputs, openBranch: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-purple-600 w-4 h-4"
                />
              </label>
            </div>
          </div>

          <Button className="w-full mt-8" onClick={handleSimulate} disabled={simulating}>
            {simulating ? "Re-calculating..." : "Simulate Sandbox Outputs"}
          </Button>
        </Card>

        {/* RESULTS SCENARIO VIEWER */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs: Optimistic, Expected, Worst */}
          <div className="grid grid-cols-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1.5">
            {[
              { id: "optimistic", label: "Optimistic Case", desc: "Best conditions" },
              { id: "neutral", label: "Neutral (Expected)", desc: "Standard outcome" },
              { id: "worstCase", label: "Worst-Case", desc: "Downside risk margins" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveScenario(tab.id as any)}
                className={`py-2 rounded-lg text-center flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  activeScenario === tab.id 
                    ? "bg-purple-600 text-white shadow-md font-semibold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xs">{tab.label}</span>
                <span className={`text-[9px] mt-0.5 ${activeScenario === tab.id ? "text-purple-200" : "text-slate-500"}`}>{tab.desc}</span>
              </button>
            ))}
          </div>

          {currentResult ? (
            <>
              {/* KPIs Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="default" className="p-4 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Sim Revenue</span>
                    <span className="text-xl font-bold text-white mt-1.5 block">{formatCurrency(currentResult.revenue)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-2">
                    <TrendingUp size={10} /> Impact Simulated
                  </span>
                </Card>

                <Card variant="default" className="p-4 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Sim Margin Profit</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1.5 block">{formatCurrency(currentResult.profit)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-2">
                    <TrendingUp size={10} /> Forecasted Profit
                  </span>
                </Card>

                <Card variant="default" className="p-4 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Retain CSAT</span>
                    <span className="text-xl font-bold text-blue-400 mt-1.5 block">{currentResult.retention.toFixed(1)}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-2">Retention score</span>
                </Card>

                <Card variant={currentResult.riskScore > 50 ? "purple" : "default"} className="p-4 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Overall Risk</span>
                    <span className={`text-xl font-bold mt-1.5 block ${currentResult.riskScore > 50 ? "text-red-400" : "text-white"}`}>
                      {currentResult.riskScore} / 100
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-2">Confidence: {currentResult.confidence}%</span>
                </Card>
              </div>

              {/* Projections Line Chart comparison */}
              <Card className="border-white/5">
                <CardHeader>
                  <CardTitle className="text-md font-bold">Simulated Projection vs. Current Baseline</CardTitle>
                  <CardDescription className="text-xs">Visualizing simulated outcome (dashed line) relative to historic performance trends.</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 100000} L`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12 }}
                        labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                        itemStyle={{ color: "#f8fafc", fontSize: 11 }}
                      />
                      {/* Baseline */}
                      <Line type="monotone" dataKey="revenue" name="Baseline Rev" stroke="#334155" strokeWidth={1.5} dot={false} />
                      {/* Simulation */}
                      <Line type="monotone" dataKey="simRevenue" name="Simulated Rev" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="simProfit" name="Simulated Profit" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* AI Analysis Narrative */}
              <Card className="border-white/5 bg-slate-900/30 p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
                <Sparkles size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white mb-1">TwinIQ Sim Sandbox Narrative</h5>
                  <p>
                    Adjusting variables triggers an expected net revenue change to <strong className="text-white">{formatCurrency(currentResult.revenue)}</strong> with a calculated confidence rating of <strong className="text-white">{currentResult.confidence}%</strong>.
                    {inputs.priceChange > 10 && " Pricing increases above 10% place customer retention under moderate risk."} 
                    {inputs.switchSuppliers && " Switching suppliers lowers procurement risks and returns operational scores back to optimal levels."}
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-xs">
              Waiting for simulation parameters...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
