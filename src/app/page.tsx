"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Check, Play, Star, Brain, Sparkles, Network, Cpu, LineChart, Database, Zap, RefreshCw, X, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Testimonials data
const testimonials = [
  {
    name: "Vikram Mehta",
    role: "CEO, Stellar Logistics",
    content: "TwinIQ felt like science fiction when we first deployed it. Now, we simulate pricing shifts before launching, saving us lakhs in inventory mistakes.",
    rating: 5,
    avatar: "VM"
  },
  {
    name: "Rachel Chen",
    role: "VP of Operations, ScaleAI",
    content: "The Digital Twin map updated in real time during a supplier bottleneck and suggested an alternate shipper. The prediction was 94% accurate.",
    rating: 5,
    avatar: "RC"
  },
  {
    name: "Pooja Hegde",
    role: "Director of Finance, Apex Retail",
    content: "We connected our ERP, inventory, and Stripe feeds. Within 3 days, TwinIQ's AI forecast alert prevented a major cash flow deficit.",
    rating: 5,
    avatar: "PH"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoPrice, setDemoPrice] = useState(10);
  const [demoMarketing, setDemoMarketing] = useState(20);
  const [demoHires, setDemoHires] = useState(2);
  const [demoResult, setDemoResult] = useState({ revenue: 120, profit: 34, retention: 94 });

  // Background Interactive Network Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.5,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      ctx.fillStyle = "rgba(168, 85, 247, 0.3)";

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 140) {
            ctx.lineWidth = (1 - dist / 140) * 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Update mini demo results dynamically
  useEffect(() => {
    // Basic calculation for interactive widget
    const newRev = 120 * (1 + (demoMarketing * 0.25 - (demoPrice - 10) * 0.2) / 100);
    const newProfit = 34 * (1 + ((demoPrice - 10) * 0.8 + demoMarketing * 0.1 - demoHires * 3) / 100);
    const newRetention = Math.min(100, Math.max(30, 94 * (1 - ((demoPrice - 10) * 0.5 - demoMarketing * 0.05) / 100)));
    setDemoResult({
      revenue: parseFloat(newRev.toFixed(1)),
      profit: parseFloat(newProfit.toFixed(1)),
      retention: parseFloat(newRetention.toFixed(1))
    });
  }, [demoPrice, demoMarketing, demoHires]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-navy-950 grid-mesh text-slate-100 min-h-screen">
      {/* Navigation Header */}
      <header className="glass-navbar sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              Ω
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Twin<span className="text-blue-500">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors cursor-pointer">How it Works</button>
            <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection("interactive-demo")} className="hover:text-white transition-colors cursor-pointer">Live Demo</button>
            <button onClick={() => scrollToSection("testimonials")} className="hover:text-white transition-colors cursor-pointer">Reviews</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-navy-950 z-40 p-6 flex flex-col gap-6 border-t border-white/5">
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("how-it-works"); }} className="text-left text-lg text-slate-300">How it works</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("features"); }} className="text-left text-lg text-slate-300">Features</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("interactive-demo"); }} className="text-left text-lg text-slate-300">Interactive Demo</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("testimonials"); }} className="text-left text-lg text-slate-300">Testimonials</button>
          <div className="flex flex-col gap-4 mt-6">
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        
        {/* Radial highlight in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-800/40 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400 mb-6 glow-border-blue">
            <Sparkles size={14} className="animate-pulse" />
            Introducing TwinIQ Platform 2.0
          </div>
          
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
            Your Business Has <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">a Digital Twin.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-300 max-w-2xl font-light mb-10 leading-relaxed">
            See your business in real time. <br className="md:hidden" /> Predict tomorrow before it happens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" glowing>
                Login <ArrowRight size={16} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => scrollToSection("interactive-demo")}>
              <Play size={16} className="fill-current" /> Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-3">Workflow</h2>
          <p className="text-3xl md:text-5xl font-bold text-white tracking-tight">How TwinIQ Synthesizes Value</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", icon: Database, title: "Connect Feeds", desc: "Integrate sales CRM, Stripe, Shopify, employee hours, and inventory hubs in seconds." },
            { step: "02", icon: Network, title: "Generate Twin", desc: "Our neural engine charts dependencies, tracing operational stress across components." },
            { step: "03", icon: Cpu, title: "Simulate Decisions", desc: "Stress test changes (e.g. price shifts, supplier swaps) in a virtual sandbox risk-free." },
            { step: "04", icon: Brain, title: "Predict & Grow", desc: "Act on predictive alerts, churn mitigation charts, and automated executive intelligence." }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-navy-900/30 border border-white/5 flex flex-col gap-4">
              <div className="absolute top-4 right-6 text-5xl font-black text-white/5 tracking-tighter">{item.step}</div>
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 flex items-center justify-center text-blue-400">
                <item.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest text-purple-500 font-bold mb-3">Features</h2>
          <p className="text-3xl md:text-5xl font-bold text-white tracking-tight">Living Virtual Intelligence</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card variant="blue" className="hover:scale-[1.02]">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 flex items-center justify-center text-blue-400 mb-3">
                <Network size={20} />
              </div>
              <CardTitle>Business Dependency Map</CardTitle>
              <CardDescription>Visual network nodes pulsing with real-time health data across Operations, Sales, and Staff.</CardDescription>
            </CardHeader>
          </Card>

          <Card variant="purple" className="hover:scale-[1.02]">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-purple-950/60 flex items-center justify-center text-purple-400 mb-3">
                <Brain size={20} />
              </div>
              <CardTitle>AI Simulation Lab</CardTitle>
              <CardDescription>Input custom levers (e.g. increase pricing, open a branch) to forecast revenue, cash flow, and risk scores.</CardDescription>
            </CardHeader>
          </Card>

          <Card variant="green" className="hover:scale-[1.02]">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 flex items-center justify-center text-emerald-400 mb-3">
                <LineChart size={20} />
              </div>
              <CardTitle>Autonomous Forecast Engine</CardTitle>
              <CardDescription>Predict next month's EBITDA, customer churn flags, and inventory stockouts before they disrupt growth.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Interactive Demo Sandbox Widget */}
      <section id="interactive-demo" className="py-24 border-t border-white/5 relative z-10 bg-navy-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">Interactive Sandbox</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Predict Tomorrow Risk-Free.
              </h3>
              <p className="text-slate-300 font-light mb-8 leading-relaxed">
                Drag the sliders on the right to simulate price adjustments, marketing spend boosts, or employee additions. TwinIQ's AI core automatically processes stress impacts and displays predictions.
              </p>
              
              <Link href="/auth">
                <ButtonGlowing />
              </Link>
            </div>

            <div className="lg:col-span-7 glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-sm font-semibold text-slate-200">TwinIQ Core Sandbox Engine</span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <RefreshCw size={12} className="animate-spin" /> Simulating...
                </span>
              </div>

              {/* Slider Inputs */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Price Adjustments</span>
                    <span className="font-semibold text-white">{demoPrice}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" value={demoPrice} onChange={(e) => setDemoPrice(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Marketing Budget Expansion</span>
                    <span className="font-semibold text-white">+{demoMarketing}%</span>
                  </div>
                  <input 
                    type="range" min="-10" max="100" value={demoMarketing} onChange={(e) => setDemoMarketing(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Additional Staff Hires</span>
                    <span className="font-semibold text-white">+{demoHires} FTEs</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" value={demoHires} onChange={(e) => setDemoHires(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Simulation Result Output Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 block mb-1">EBITDA Proj.</span>
                  <span className="text-xl font-bold text-white">₹{demoResult.revenue.toFixed(1)} L</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Profit Marg.</span>
                  <span className="text-xl font-bold text-emerald-400">₹{demoResult.profit.toFixed(1)} L</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Retention</span>
                  <span className="text-xl font-bold text-blue-400">{demoResult.retention}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-3">Testimonials</h2>
          <p className="text-3xl md:text-5xl font-bold text-white tracking-tight">Validated by Founders</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 italic text-sm leading-relaxed mb-6">"{t.content}"</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-sm font-bold flex items-center justify-center text-blue-400">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10 bg-navy-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">Ω</span>
            <span className="text-sm font-bold text-white">TwinIQ © 2026</span>
          </div>
          <p className="text-xs text-slate-500">Built to power modern digital operational replicas. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-400 font-medium">
            <button className="hover:text-white">Privacy Policy</button>
            <button className="hover:text-white">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Glowing action button for visual punch
function ButtonGlowing() {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300" />
      <button className="relative px-6 py-3 bg-slate-900 border border-white/10 hover:border-white/20 text-white rounded-full text-sm font-bold flex items-center gap-2 transition duration-300 cursor-pointer">
        Enter AI Replica <ArrowRight size={16} />
      </button>
    </div>
  );
}
