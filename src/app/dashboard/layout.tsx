"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Network, PlayCircle, MessageSquare, Users, Database,
  DollarSign, Activity, FileText, Settings, Sparkles, Menu, Bell, Search,
  Power, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, X, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialEvents, BusinessEvent } from "@/lib/mockData";
import { getBusinessTerms } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";

const searchItems = [
  // Navigation
  { label: "Dashboard Hub", category: "App Route", url: "/dashboard", desc: "Main business twin KPIs & health indicators" },
  { label: "Digital Twin Topology Map", category: "App Route", url: "/dashboard/digital-twin", desc: "Interactive node dependency graph map" },
  { label: "Simulation Lab", category: "App Route", url: "/dashboard/simulation", desc: "Run price & marketing scenarios" },
  { label: "AI Copilot Console", category: "App Route", url: "/dashboard/copilot", desc: "Ask queries to TwinIQ predictive engine" },
  { label: "Customers & Churn Analytics", category: "App Route", url: "/dashboard/customers", desc: "CRM retention logs & success outreach" },
  { label: "SKU Inventory & Assets", category: "App Route", url: "/dashboard/inventory", desc: "Monitor virtual API & compute resources" },
  { label: "Finance & Runway Ledger", category: "App Route", url: "/dashboard/finance", desc: "Cash runway metrics, bills & receivables" },
  { label: "Sales Log Override", category: "App Route", url: "/dashboard/sales", desc: "Log offline revenue & upload CSV logs" },
  { label: "Staff Members", category: "App Route", url: "/dashboard/employees", desc: "Employee velocity & productivity logs" },
  { label: "Reports & Logs", category: "App Route", url: "/dashboard/reports", desc: "Audit logs, system events & reports export" },
  { label: "Settings", category: "App Route", url: "/dashboard/settings", desc: "Seed or clear Firestore mock datasets" },
  
  // System Nodes
  { label: "DB Cluster Node", category: "Twin Index", url: "/dashboard/digital-twin?highlight=business", desc: "Digital twin core database engine" },
  { label: "API Gateway Endpoint Node", category: "Twin Index", url: "/dashboard/digital-twin?highlight=customers", desc: "API gateway connector interface" },
  { label: "Middleware Sync Connector Node", category: "Twin Index", url: "/dashboard/digital-twin?highlight=operations", desc: "Middleware operational synchronization node" },
  { label: "CDN Edge Caching Node", category: "Twin Index", url: "/dashboard/digital-twin?highlight=marketing", desc: "CDN edge content delivery optimizer" },
  { label: "Auth Service Validator Node", category: "Twin Index", url: "/dashboard/digital-twin?highlight=inventory", desc: "Identity & access validation controller" },
  { label: "Payment Processing Node Gateway", category: "Twin Index", url: "/dashboard/digital-twin?highlight=finance", desc: "RazorpayX and stripe payment checkout gateway" },

  // Customers
  { label: "Acme Corp (AI Tier)", category: "Client Profile", url: "/dashboard/customers", desc: "Customer Account: Churn risk 14%" },
  { label: "Stripe India (Beta Tech)", category: "Client Profile", url: "/dashboard/customers", desc: "Customer Account: Churn risk 82%" },
  { label: "Y-Combinator Cohort Partners", category: "Client Profile", url: "/dashboard/customers", desc: "Customer Account: Churn risk 5%" },
  { label: "Zeta Payments (Scale Tier)", category: "Client Profile", url: "/dashboard/customers", desc: "Customer Account: Churn risk 78%" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<BusinessEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const [timeStr, setTimeStr] = useState("11:47 AM");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarTerms, setSidebarTerms] = useState({
    clientPlur: "Customers",
    inventoryLbl: "Inventory",
    staffLbl: "Employees"
  });
  
  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setAlerts(initialEvents);
    
    // Compute current time immediately on mount
    const updateTime = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const amp = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      setTimeStr(`${h}:${m} ${amp}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle clicking outside the global search box dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync sidebar terminology with the selected template schema
  useEffect(() => {
    const t = getBusinessTerms();
    const rawInv = t.inventoryLbl || "Inventory";
    const cleanInv = rawInv.split(" / ")[0].split(" ")[0]; // e.g. "SKU", "Kitchen"
    
    const rawStaff = t.staffLbl || "Employees";
    const cleanStaff = rawStaff.split(" / ")[0].split(" ")[0]; // e.g. "Chef", "Trainer"
    const pluralStaff = cleanStaff.endsWith("s") || cleanStaff.toLowerCase().includes("personnel") || cleanStaff.toLowerCase().includes("staff")
      ? cleanStaff 
      : cleanStaff + "s";

    setSidebarTerms({
      clientPlur: t.clientPlur || "Customers",
      inventoryLbl: cleanInv.charAt(0).toUpperCase() + cleanInv.slice(1),
      staffLbl: pluralStaff.charAt(0).toUpperCase() + pluralStaff.slice(1)
    });
  }, [pathname]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          // Redirect only if Firebase is actively configured in environments
          if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            router.push("/auth");
          }
        }
      });
      return () => unsubscribe();
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push("/auth");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/auth");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Digital Twin", path: "/dashboard/digital-twin", icon: Network, highlight: true },
    { name: "Simulation Lab", path: "/dashboard/simulation", icon: PlayCircle },
    { name: "AI Copilot", path: "/dashboard/copilot", icon: MessageSquare },
    { name: sidebarTerms.clientPlur, path: "/dashboard/customers", icon: Users },
    { name: sidebarTerms.inventoryLbl, path: "/dashboard/inventory", icon: Database },
    { name: "Finance", path: "/dashboard/finance", icon: DollarSign },
    { name: "Sales Log", path: "/dashboard/sales", icon: TrendingUp },
    { name: sidebarTerms.staffLbl, path: "/dashboard/employees", icon: Activity },
    { name: "Reports", path: "/dashboard/reports", icon: FileText },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  // Helper values for dynamic user display
  const userDisplayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "John Doe";
  const userInitials = userDisplayName.substring(0, 2).toUpperCase();

  return (
    <div className="h-screen w-screen bg-navy-950 text-slate-100 flex overflow-hidden">
      {/* SIDEBAR - DESKTOP ONLY */}
      <aside 
        className={`glass-panel border-r border-white/5 hidden md:flex flex-col justify-between transition-all duration-300 relative z-30 h-full ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div>
          {/* Logo Brand area */}
          <div className={`h-16 flex items-center border-b border-white/5 relative ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}>
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden shrink-0">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                Ω
              </span>
              {!collapsed && (
                <span className="font-bold tracking-tight text-white animate-fadeIn">
                  Twin<span className="text-blue-500">IQ</span>
                </span>
              )}
            </Link>
            
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className={`text-slate-400 hover:text-white rounded-full bg-slate-950 border border-white/10 flex items-center justify-center hover:bg-slate-900 transition-all shadow-md z-50 cursor-pointer hidden md:flex ${
                collapsed 
                  ? "absolute -right-3 top-5 w-6 h-6" 
                  : "w-6 h-6 p-0"
              }`}
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-4 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-none">
            {navItems.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-blue-400" : "text-slate-400"} />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between animate-fadeIn">
                        {item.name}
                        {item.highlight && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-[9px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                            Core
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile / Logout bottom panel */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="text-left animate-fadeIn">
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">{userDisplayName}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {currentUser ? "Twin Operator" : "Apex Founder"}
                  </div>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <button 
                onClick={handleLogout} 
                className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 cursor-pointer"
                title="Log Out"
              >
                <Power size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col justify-between p-4 h-full relative z-50 animate-[slideIn_0.2s_ease-out]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg">
                    Ω
                  </span>
                  <span className="font-bold tracking-tight text-white">
                    Twin<span className="text-blue-500">IQ</span>
                  </span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)} 
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 mt-6">
                {navItems.map((item) => {
                  const active = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                      <span
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                  {userInitials}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{userDisplayName}</div>
                </div>
              </div>
              <button 
                onClick={() => { setMobileOpen(false); handleLogout(); }} 
                className="text-slate-500 hover:text-red-400 p-1.5"
              >
                <Power size={14} />
              </button>
            </div>
          </aside>
          
          <div className="flex-1 cursor-pointer" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* VIEWPORT CONTROLLER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* TOP BAR */}
        <header className="glass-navbar h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-20">
          {/* Left search */}
          <div className="relative w-64 max-w-sm hidden md:block" ref={searchRef}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Twin model indexes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/50 border border-slate-800/80 rounded-full focus:outline-none focus:border-blue-500 text-xs text-slate-200"
            />

            {/* Dropdown results overlay */}
            {showResults && searchQuery.trim().length > 0 && (() => {
              const query = searchQuery.toLowerCase();
              const filtered = searchItems.filter(item => 
                item.label.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.desc.toLowerCase().includes(query)
              );
              return (
                <div className="absolute left-0 mt-2.5 w-80 glass-panel border border-white/10 rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 text-xs max-h-96 overflow-y-auto animate-fadeIn">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
                    Matching Indicators ({filtered.length})
                  </div>
                  {filtered.length === 0 ? (
                    <div className="text-slate-500 text-center py-4">No model index matches.</div>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            router.push(item.url);
                            setSearchQuery("");
                            setShowResults(false);
                          }}
                          className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                        >
                          <div>
                            <div className="font-bold text-white text-xs text-left">{item.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 text-left">{item.desc}</div>
                          </div>
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/20 shrink-0 ml-2">
                            {item.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/40 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">Ω</span>
            <span className="text-sm font-bold text-white">TwinIQ</span>
          </div>

          {/* Right operational indicators */}
          <div className="flex items-center gap-6">
            {/* Simulation Clock indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Sim Sandbox Time: <strong className="text-white">{timeStr}</strong></span>
            </div>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/40 relative cursor-pointer"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              </button>

              {/* Notification Popup drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Alerts</h4>
                    <button className="text-slate-500 hover:text-white text-xs" onClick={() => setNotificationsOpen(false)}>
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-3.5 max-h-60 overflow-y-auto">
                    {alerts.map((item) => (
                      <div key={item.id} className="flex gap-2.5 text-xs">
                        <div className="mt-0.5">
                          {item.severity === "error" ? (
                            <AlertTriangle size={14} className="text-red-400" />
                          ) : item.severity === "warning" ? (
                            <AlertTriangle size={14} className="text-amber-400" />
                          ) : (
                            <CheckCircle2 size={14} className="text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white flex justify-between">
                            <span>{item.title}</span>
                            <span className="text-[9px] text-slate-500 font-normal">{item.time}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Copilot Trigger button */}
            <Link href="/dashboard/copilot">
              <Button size="sm" className="flex items-center gap-1.5">
                <Sparkles size={14} /> AI Copilot
              </Button>
            </Link>
          </div>
        </header>

        {/* PAGE BODY CONTENT */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
