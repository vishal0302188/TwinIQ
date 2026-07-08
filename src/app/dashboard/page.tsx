"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, TrendingDown, Sparkles, ArrowRight, ShieldAlert, 
  HelpCircle, RefreshCw, AlertCircle, PlayCircle, Star, CheckCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Gauge from "@/components/ui/gauge";
import { 
  initialKPIs, initialEvents, mockIntelligence, initialFinance, 
  initialCustomers, initialEmployees, initialInventory,
  KPI, BusinessEvent, Customer, Employee, InventoryItem, FinanceRecord, getMockData
} from "@/lib/mockData";
import { formatCurrency, getBusinessTerms } from "@/lib/utils";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MainDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [businessHealth, setBusinessHealth] = useState(87);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [intelligence, setIntelligence] = useState<typeof mockIntelligence>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const isCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true";
      const activeTemplate = typeof window !== "undefined" ? localStorage.getItem("twiniq_business_template") || "saas" : "saas";
      const { customers: mockCustomers, inventory: mockInventory, employees: mockEmployees, finance: mockFinance } = getMockData(activeTemplate);

      let dbFinance = isCleared ? [] : mockFinance;
      let dbInventory = isCleared ? [] : mockInventory;
      let dbCustomers = isCleared ? [] : mockCustomers;
      let dbEmployees = isCleared ? [] : mockEmployees;

      if (db) {
        // Fetch Finance from Firestore
        try {
          const finSnap = await getDocs(collection(db, "finance"));
          if (!finSnap.empty) {
            const data: FinanceRecord[] = [];
            finSnap.forEach((doc) => data.push(doc.data() as FinanceRecord));
            const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
            data.sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
            dbFinance = data;
          }
        } catch (e) {
          console.error("Firestore finance load error on dashboard:", e);
        }

        // Fetch Inventory from Firestore
        try {
          const invSnap = await getDocs(collection(db, "inventory"));
          if (!invSnap.empty) {
            const data: InventoryItem[] = [];
            invSnap.forEach((doc) => data.push(doc.data() as InventoryItem));
            dbInventory = data;
          }
        } catch (e) {
          console.error("Firestore inventory load error on dashboard:", e);
        }

        // Fetch Customers from Firestore
        try {
          const custSnap = await getDocs(collection(db, "customers"));
          if (!custSnap.empty) {
            const data: Customer[] = [];
            custSnap.forEach((doc) => data.push(doc.data() as Customer));
            dbCustomers = data;
          }
        } catch (e) {
          console.error("Firestore customers load error on dashboard:", e);
        }

        // Fetch Employees from Firestore
        try {
          const empSnap = await getDocs(collection(db, "employees"));
          if (!empSnap.empty) {
            const data: Employee[] = [];
            empSnap.forEach((doc) => data.push(doc.data() as Employee));
            dbEmployees = data;
          }
        } catch (e) {
          console.error("Firestore employees load error on dashboard:", e);
        }
      }
      
      // Add local storage extra revenue if present
      const extraRev = typeof window !== "undefined" ? Number(localStorage.getItem("twiniq_extra_revenue") || 0) : 0;
      if (extraRev > 0 && dbFinance.length > 0) {
        const lastIdx = dbFinance.length - 1;
        dbFinance[lastIdx] = {
          ...dbFinance[lastIdx],
          revenue: dbFinance[lastIdx].revenue + extraRev,
          profit: dbFinance[lastIdx].profit + Math.round(extraRev * 0.31)
        };
      }

      setFinanceRecords(dbFinance);

      // Current month details
      const currentFin = dbFinance[dbFinance.length - 1] || { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 };
      
      // Calculate dynamic inventory health
      const lowStockCount = dbInventory.filter(item => item.status !== "In Stock").length;
      const invHealthVal = dbInventory.length > 0 ? Math.round(100 - (lowStockCount / dbInventory.length) * 100) : 100;

      // Calculate dynamic customer satisfaction
      const avgChurn = dbCustomers.length > 0 ? dbCustomers.reduce((sum, c) => sum + c.churnRisk, 0) / dbCustomers.length : 0;
      const custSatVal = dbCustomers.length > 0 ? (100 - (avgChurn * 0.4)).toFixed(1) : "100.0";

      // Calculate dynamic employee metrics
      const avgProd = dbEmployees.length > 0 ? dbEmployees.reduce((sum, e) => sum + e.productivity, 0) / dbEmployees.length : 0;

      const terms = getBusinessTerms();
      const updatedKpis: KPI[] = [
        { 
          name: "Revenue", 
          value: formatCurrency(currentFin.revenue), 
          score: 92, 
          change: "+14.2% vs last month", 
          isPositive: true 
        },
        { 
          name: "Profit", 
          value: formatCurrency(currentFin.profit), 
          score: 87, 
          change: "+8.4% vs last month", 
          isPositive: true 
        },
        { 
          name: "Cash Flow", 
          value: formatCurrency(currentFin.cashFlow), 
          score: 90, 
          change: "+11.5% vs last month", 
          isPositive: true 
        },
        { 
          name: `${terms.inventoryLbl} Health`, 
          value: `${invHealthVal}%`, 
          score: invHealthVal, 
          change: lowStockCount > 0 ? `-${(lowStockCount * 2.1).toFixed(1)}% low stock risk` : "Optimal safety margins", 
          isPositive: lowStockCount === 0 
        },
        { 
          name: `${terms.clientSing} Satisfaction`, 
          value: `${custSatVal}%`, 
          score: Math.round(Number(custSatVal)), 
          change: "+0.8% support rating", 
          isPositive: true 
        },
        { 
          name: `${terms.staffLbl} Productivity`, 
          value: `${avgProd.toFixed(1)}%`, 
          score: Math.round(avgProd), 
          change: "+3.1% milestone completions", 
          isPositive: true 
        }
      ];

      setKpis(updatedKpis);

      // Dynamically calculate average Business Health Score
      const healthScore = Math.round(updatedKpis.reduce((sum, k) => sum + k.score, 0) / 6);
      setBusinessHealth(healthScore);

      setEvents(initialEvents);
      setIntelligence(mockIntelligence);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard computation error, using local mock data fallback:", err);
      // Fallback
      setKpis(initialKPIs);
      setFinanceRecords(initialFinance);
      setEvents(initialEvents);
      setIntelligence(mockIntelligence);
      setBusinessHealth(87);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerSync = async () => {
    setLoading(true);
    await loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Title area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Business Twin Intelligence</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time status replica synced for <span className="text-emerald-400 font-medium">{getBusinessTerms().industry}</span></p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/simulation">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlayCircle size={14} /> Run Simulation
            </Button>
          </Link>
          <Button size="sm" className="flex items-center gap-1" onClick={triggerSync}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* TOP SECTION: Health score + Primary KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Health score Gauge card */}
            <Card className="lg:col-span-4 flex flex-col items-center justify-center py-8 border-white/10 relative overflow-hidden bg-slate-950/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <Gauge score={businessHealth} size={190} />
              
              {(() => {
                const status = businessHealth >= 85 ? {
                  label: "High Efficiency Standard",
                  color: "text-emerald-400",
                  icon: <CheckCircle size={12} />,
                  desc: `Ops systems are running smoothly. ${kpis.find(k => k.name.includes("Health"))?.score !== 100 ? "1 supply constraint detected." : "All systems optimized."}`
                } : businessHealth >= 70 ? {
                  label: "Warning: Marginal Performance",
                  color: "text-amber-400",
                  icon: <AlertCircle size={12} />,
                  desc: "Minor bottlenecks or low-stock warning indicators detected. Under active twin simulation."
                } : {
                  label: "Critical System Alert",
                  color: "text-red-500",
                  icon: <ShieldAlert size={12} className="animate-pulse" />,
                  desc: "Severe operational failures or pipeline constraints detected. Action recommended immediately."
                };

                return (
                  <div className="mt-6 text-center max-w-[240px]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Twin Health Status</h4>
                    <p className={`text-xs ${status.color} font-semibold mt-1 flex items-center justify-center gap-1`}>
                      {status.icon} {status.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {status.desc}
                    </p>
                  </div>
                );
              })()}
            </Card>

            {/* KPI Cards Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {kpis.slice(0, 6).map((kpi, idx) => (
                <Card 
                  key={idx} 
                  className="hover:scale-[1.03] transition-all border-white/5 flex flex-col justify-between"
                  variant={kpi.score < 80 ? "purple" : "default"}
                >
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                      <span>{kpi.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900/40 px-2 py-0.5 rounded">
                        Score: {kpi.score}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-3 glow-text-blue">{kpi.value}</div>
                  </div>
                  
                  <div className={`text-[11px] font-semibold mt-4 flex items-center gap-1 ${
                    kpi.isPositive ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {kpi.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.change}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI INTELLIGENCE: Today's Intelligence Cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-purple-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white tracking-tight">Today's Intelligence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {intelligence.map((intel) => (
                <div 
                  key={intel.id}
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    intel.type === "danger" 
                      ? "bg-red-950/20 border-red-900/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                      : intel.type === "warning"
                      ? "bg-amber-950/20 border-amber-900/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                      : "bg-emerald-950/20 border-emerald-900/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                  }`}
                >
                  {/* Visual Left highlight */}
                  <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                    intel.type === "danger" ? "bg-red-500" : intel.type === "warning" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <p className="text-xs leading-relaxed pl-2 font-medium">{intel.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN GRAPH + FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cash flow Chart area */}
            <Card className="lg:col-span-8 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cash Flow Trend & Projections</CardTitle>
                  <CardDescription>Visualizing Net Revenue vs operational expenses over the last 6 months.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="chartExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      tickFormatter={(val) => `₹${val / 100000} L`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12 }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: 11 }}
                      itemStyle={{ color: "#f8fafc", fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#chartRevenue)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#chartExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event logs timeline */}
            <Card className="lg:col-span-4 border-white/5 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>Digital Twin Timeline</CardTitle>
                <CardDescription>Live operational events registered by the twin engine.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 max-h-[270px] overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div key={ev.id} className="relative pl-5 border-l border-slate-800 pb-2 last:pb-0">
                    {/* Small timeline pointer dot */}
                    <span className={`absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full ${
                      ev.severity === "error" ? "bg-red-500" : ev.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
                      <span className="uppercase tracking-wider">{ev.category}</span>
                      <span>{ev.time}</span>
                    </div>
                    
                    <h5 className="text-xs font-bold text-slate-200">{ev.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ev.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* LOWER SECTION: RISKS AND AI RECOMMENDATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming risks */}
            <Card className="border-white/5">
              <CardHeader className="flex flex-row items-center gap-2">
                <ShieldAlert className="text-red-400 shrink-0" size={20} />
                <div>
                  <CardTitle>Upcoming Operational Risks</CardTitle>
                  <CardDescription>AI predictions showing moderate to high impact threats.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {[
                  { title: "Supplier Sourcing Bottleneck", impact: "High Risk", text: "Matrix Semi HK shipping delays threaten Product Alpha production volume for next month." },
                  { title: "Client Churn Signal", impact: "Medium Risk", text: "Stellar Brands shows a session latency drop and no logins in 14 days. Value at risk: ₹8.2 L LTV." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <strong className="text-white">{item.title}</strong>
                      <span className="text-[9px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded font-bold">{item.impact}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="border-white/5">
              <CardHeader className="flex flex-row items-center gap-2">
                <Sparkles className="text-purple-400 shrink-0" size={20} />
                <div>
                  <CardTitle>Actionable Recommendations</CardTitle>
                  <CardDescription>Automated operational strategies generated by our twin neural net.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {[
                  { action: "Trigger Reorder", link: "/dashboard/inventory", text: "Place procurement reorder for Fiber Optic Interface Switches from Delhi Opto-Hardware (25 units)." },
                  { action: "Initiate Customer Outreach", link: "/dashboard/customers", text: "Send customer success outreach pack to Ananya Sharma (Stellar Brands) to mitigate churn risk." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.text}</p>
                    <Link href={item.link} className="self-end text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      {item.action} <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
