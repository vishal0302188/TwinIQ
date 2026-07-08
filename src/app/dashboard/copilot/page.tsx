"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, RefreshCw, User, Bot, HelpCircle, ArrowRight,
  TrendingUp, TrendingDown, LayoutGrid, BarChart2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis } from "recharts";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  table?: { headers: string[]; rows: string[][] };
  chartType?: "radar" | "bar";
  chartData?: any[];
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "Why did profits decrease?",
    "What should I focus on today?",
    "Predict next month's revenue.",
    "Which suppliers are risky?",
    "Should I increase prices?",
  ];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "w-1",
        sender: "assistant",
        text: "Greetings, I am your TwinIQ Core Copilot. I have access to your live digital twin. How can I help you analyze, simulate, or resolve operational challenges today?"
      }
    ]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: "assistant",
            text: data.reply
          }
        ]);
        setTyping(false);
        return;
      }
    } catch (err) {
      console.error("Gemini API call failed, falling back to mock:", err);
    }

    // Mock AI responses based on prompt
    setTimeout(() => {
      let aiResponseText = "";
      let table: Message["table"] = undefined;
      let chartType: Message["chartType"] = undefined;
      let chartData: Message["chartData"] = undefined;

      const normText = text.toLowerCase();

      if (normText.includes("profit")) {
        aiResponseText = "Our twin models attribute the profit decrease to procurement disruptions and increased operating costs. Here is the operational impact summary:";
        table = {
          headers: ["Disruption Source", "Risk Margin", "Mitigation recommendation"],
          rows: [
            ["Matrix Semi HK delay", "₹85,000", "Switch to local supplier Matrix HK alternative"],
            ["Fiber Optic Switch stockout", "₹24,000", "Trigger automatic reorder package"],
            ["Logistics SLA slippage", "₹32,000", "Optimize route via third-party courier"]
          ]
        };
        chartType = "bar";
        chartData = [
          { name: "SLA Slippage", value: 32000 },
          { name: "Stockouts", value: 24000 },
          { name: "Matrix Delay", value: 85000 }
        ];
      } else if (normText.includes("focus")) {
        aiResponseText = "Based on the living replica, here are the top 3 items requiring your immediate attention today:\n\n1. **Supplier Risk**: Matrix Semi HK shipment is delayed at customs. Action: Switch to local backup supplier.\n2. **Customer Churn Alert**: Stellar Brands (Ananya Sharma) LTV ₹8.2 L has zero session logins in 14 days. Action: Trigger customer support check-in.\n3. **Low Stock**: Fiber Optic Switch count is at 12 (Min: 20). Action: Approve procurement reorder.";
      } else if (normText.includes("revenue") || normText.includes("predict")) {
        aiResponseText = "Predictive analysis forecasts next month's (July) revenue at **₹1.32 Cr** (+6.5% growth) under normal operational parameters. Sourcing backup inventory elements can raise this prediction to **₹1.38 Cr**.";
        chartType = "radar";
        chartData = [
          { subject: 'Sales Pipeline', A: 92, fullMark: 100 },
          { subject: 'Marketing ROI', A: 85, fullMark: 100 },
          { subject: 'Inventory levels', A: 72, fullMark: 100 },
          { subject: 'Staff Velocity', A: 89, fullMark: 100 },
          { subject: 'Finance reserves', A: 90, fullMark: 100 },
        ];
      } else if (normText.includes("supplier")) {
        aiResponseText = "We are currently tracking **Matrix Semi HK** as **High Risk (45%)** due to shipping bottlenecks, and **SpeedData Suppliers** as **Medium Risk** due to component expiry margins. All other suppliers are operating within standard SLA limits.";
      } else if (normText.includes("decrease") && (normText.includes("price") || normText.includes("pricing"))) {
        aiResponseText = "Simulations show that decreasing prices by **10%** increases customer satisfaction to **97%**, but reduces gross monthly profit by **₹1.8 L** due to lower transaction values.";
      } else if (normText.includes("increase") && (normText.includes("price") || normText.includes("pricing"))) {
        aiResponseText = "Simulations show that increasing prices by **10%** boosts margins by **₹2.4 L** next month, but drags customer retention by **-1.5%**. A pricing increase above **20%** escalates Stellar Brands churn risk to **92%**.";
      } else if (normText.includes("price") || normText.includes("pricing")) {
        aiResponseText = "Pricing adjustments directly alter your twin margins. Increasing prices by **10%** raises revenue by **₹2.4 L** but increases customer churn risk. Decreasing prices by **10%** drops revenue by **₹1.8 L** but optimizes customer satisfaction.";
      } else {
        aiResponseText = `I have received your request: "${text}".
Currently, the digital twin operates at a stability index of 82%. There are active alerts for Matrix chipset shipments. 

If you would like to run specific business parameters or override calculations, please check the Sales Log or navigate to the Simulation Lab to execute pricing simulations.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: "assistant",
          text: aiResponseText,
          table,
          chartType,
          chartData
        }
      ]);
      setTyping(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* SUGGESTED PANEL SIDE */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card className="border-white/5 bg-slate-950/60 p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-400" /> Suggested Queries
            </CardTitle>
            <CardDescription className="text-xs">Ask questions about your digital twin operations.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="w-full text-left text-xs bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 p-3 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
              >
                <span>{prompt}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Live system state widget */}
        <Card className="border-white/5 bg-slate-950/60 p-4 text-xs space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Copilot Connectivity</h4>
          <div className="flex justify-between">
            <span className="text-slate-500">Connected Twin Feeds:</span>
            <span className="text-emerald-400 font-semibold">9 Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Neural NLP Version:</span>
            <span className="text-white font-semibold">v4.1-Replica</span>
          </div>
        </Card>
      </div>

      {/* CHAT DISPLAY PORT */}
      <Card className="flex-1 border-white/5 bg-slate-950/60 flex flex-col justify-between overflow-hidden min-h-[500px]">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[520px]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar Bot */}
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}>
                {/* Text body */}
                <p className="whitespace-pre-line font-medium">{msg.text}</p>

                {/* Inline Tables */}
                {msg.table && (
                  <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-800 text-slate-300 font-bold">
                        <tr>
                          {msg.table.headers.map((h, i) => (
                            <th key={i} className="p-2 border-b border-slate-800">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {msg.table.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 text-slate-400">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Inline Charts */}
                {msg.chartType && msg.chartData && (
                  <div className="mt-4 h-48 bg-slate-950/40 border border-slate-800/80 rounded-xl p-2">
                    {msg.chartType === "radar" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={msg.chartData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                          <Radar name="Twin Metric" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.chartData}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>

              {/* Avatar User */}
              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot size={18} />
              </div>
              <div className="max-w-xs bg-slate-900/60 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} 
            className="flex gap-3 relative"
          >
            <input
              type="text"
              placeholder="Ask the twin models anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-3.5 pr-14 focus:outline-none focus:border-blue-500 text-xs text-white"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || typing}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
