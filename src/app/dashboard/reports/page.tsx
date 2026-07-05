"use client";

import React, { useState } from "react";
import { 
  FileText, Sparkles, Download, RefreshCw, CheckCircle2, 
  Settings, AlertTriangle, Cpu, Terminal
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: "operations" | "finance" | "inventory";
  status: "idle" | "generating" | "ready";
}

export default function ReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    { id: "rep-1", title: "TwinIQ Executive Health Audit", description: "Comprehensive breakdown of business score indicators, warnings, and dependencies.", category: "operations", status: "idle" },
    { id: "rep-2", title: "Quarterly EBITDA & Cash Projections", description: "Detailed financial charts, invoice status updates, and next month forecasts.", category: "finance", status: "idle" },
    { id: "rep-3", title: "Supply Chain & SKU Sourcing Audit", description: "SKU rotation summaries, lead-time tracking, and supplier risk reports.", category: "inventory", status: "idle" }
  ]);

  const [activeReport, setActiveReport] = useState<string | null>(null);

  const handleGenerate = (id: string) => {
    setTemplates((prev) =>
      prev.map((temp) => (temp.id === id ? { ...temp, status: "generating" } : temp))
    );

    setTimeout(() => {
      setTemplates((prev) =>
        prev.map((temp) => (temp.id === id ? { ...temp, status: "ready" } : temp))
      );
      setActiveReport(id);
    }, 2000);
  };

  const handleDownload = (format: "pdf" | "csv") => {
    if (!activeReport) return;
    const target = templates.find(t => t.id === activeReport);
    if (!target) return;

    if (format === "csv") {
      // Simulate simple client CSV download behavior
      const element = document.createElement("a");
      const file = new Blob([`TwinIQ Mock Report export\n\nTitle: ${target.title}\nFormat: CSV\nStatus: Generated successfully\nTimestamp: 2026-07-04`], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${target.title.toLowerCase().replace(/ /g, "_")}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    // Generate real vector PDF with jsPDF to prevent format corruption errors
    try {
      const doc = new jsPDF();
      const isCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true";

      // 1. Sleek corporate slate header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TwinIQ", 15, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("OPERATIONAL DIGITAL TWIN PORTAL SUMMARY", 15, 27);

      // Header details on the right
      doc.setFontSize(9);
      doc.setTextColor(241, 245, 249);
      doc.text("Status: VERIFIED & ACTIVE", 140, 18);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 24);
      doc.text(`Doc Ref: ${target.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, 140, 30);

      // 2. Report Details Header
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(target.title, 15, 60);

      // Section separator line
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 65, 195, 65);

      // 3. Section 1: Summary Narrative
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary & AI Insights", 15, 78);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600

      const summaryText = "We have synthesized real-time operational feeds including financial cash flows, supply margins, and personnel hours. The digital twin logs show a health score index of 87%. Key dependencies are optimal. Churn risk mitigation protocols have been prepared for customers flagging high inactivity. Recommended strategy includes active supplier renegotiation to circumvent upcoming hardware shipment holds.";
      
      const splitText = doc.splitTextToSize(summaryText, 180);
      doc.text(splitText, 15, 86);

      // 4. Section 2: Operational Parameters Table
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text("2. Key System Parameters", 15, 125);

      // Draw table header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 130, 180, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text("Operational Stream", 18, 135);
      doc.text("Dynamic Status Indicator", 95, 135);
      doc.text("Evaluation Grade", 155, 135);

      // Rows
      const rows = [
        { label: "Revenue Ledger Stream", status: isCleared ? "₹0.00 Cr" : "₹1.24 Cr (Target Met)", grade: "OPTIMAL" },
        { label: "EBITDA Net Profit Margin", status: isCleared ? "₹0.0 L" : "₹38.5 L (31% margin)", grade: "OPTIMAL" },
        { label: "Supply Chain & SKU Buffer", status: isCleared ? "All systems optimal" : "3 supply warnings flagged", grade: "MODERATE RISK" },
        { label: "Team Velocity & Output", status: isCleared ? "0.0% productivity index" : "89.2% productivity index", grade: "STABLE" }
      ];

      let y = 144;
      rows.forEach((row, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y - 5, 180, 7, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(row.label, 18, y);
        
        doc.setTextColor(51, 65, 85);
        doc.text(row.status, 95, y);
        
        if (row.grade === "OPTIMAL" || row.grade === "STABLE") {
          doc.setTextColor(16, 185, 129); // green
        } else {
          doc.setTextColor(245, 158, 11); // orange
        }
        doc.setFont("helvetica", "bold");
        doc.text(row.grade, 155, y);
        
        y += 8;
      });

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("This report is a dynamic computer-synthesized ledger generated directly by TwinIQ. Verification tokens active.", 15, 270);

      doc.save(`${target.title.toLowerCase().replace(/ /g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed: ", e);
      alert("Failed to render PDF report: " + e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <FileText size={28} className="text-blue-500" /> AI Executive Reports
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Synthesize beautiful operational summaries from living digital twins. Export datasets immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* REPORT TEMPLATES LIST */}
        <Card className="lg:col-span-8 border-white/5 bg-slate-950/60 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Select Executive Report Template
            </h3>

            <div className="space-y-3.5">
              {templates.map((temp) => (
                <div 
                  key={temp.id}
                  onClick={() => { if (temp.status === "ready") setActiveReport(temp.id); }}
                  className={`p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                    activeReport === temp.id 
                      ? "bg-purple-950/20 border-purple-500/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.05)]"
                      : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded">
                      {temp.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{temp.title}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{temp.description}</p>
                  </div>

                  <div className="shrink-0">
                    {temp.status === "idle" ? (
                      <Button size="sm" className="flex items-center gap-1" onClick={() => handleGenerate(temp.id)}>
                        <Sparkles size={12} /> Synthesize
                      </Button>
                    ) : temp.status === "generating" ? (
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" /> Synthesizing...
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* EXPORT OPTIONS */}
        <Card className="lg:col-span-4 border-white/5 bg-slate-950/60 p-6 flex flex-col justify-between">
          {activeReport ? (
            <>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Active Export</span>
                  <h3 className="text-md font-bold text-white mt-1.5">
                    {templates.find(t => t.id === activeReport)?.title}
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-slate-400 bg-slate-900/40 p-4 border border-slate-800 rounded-xl leading-relaxed">
                  <div className="flex gap-2.5">
                    <Cpu size={16} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">AI Executive Summary Narrative</strong>
                      <p className="text-[11px] text-slate-500 mt-1">
                        We have synthesized real-time operational feeds including financial cash flows, supply margins, and personnel hours. The digital twin logs show a health score index of 87%. Key dependencies are optimal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Document Parameters</h4>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span>Generated Timestamp:</span>
                    <strong className="text-slate-300">Just now</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span>File size (PDF / CSV):</span>
                    <strong className="text-slate-300">140 KB / 24 KB</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6">
                <Button className="w-full flex items-center justify-center gap-1.5" onClick={() => handleDownload("pdf")}>
                  <Download size={14} /> Download Beautiful PDF
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-1.5" onClick={() => handleDownload("csv")}>
                  <Download size={14} /> Download Raw CSV
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <FileText size={32} className="stroke-1 mb-2 animate-pulse" />
              <p>Generate a report template to trigger download controls.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
