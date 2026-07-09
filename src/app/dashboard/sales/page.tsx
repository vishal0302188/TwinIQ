"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, FileText, Calendar, DollarSign, Wallet, 
  Trash2, Edit2, Plus, RefreshCw, X, AlertTriangle, CheckCircle2, Search, Sliders
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

interface Sale {
  id: string;
  customer: string;
  item: string;
  amount: number;
  channel: "Razorpay" | "Cash" | "Bank Transfer" | "Check";
  date: string;
  status: "Success" | "Pending" | "Failed";
}

const initialSales: Sale[] = [
  { id: "sale-801", customer: "MalhotraTech Corp", item: "Enterprise Core Module", amount: 150000, channel: "Razorpay", date: "2026-07-05", status: "Success" },
  { id: "sale-802", customer: "Stellar Brands", item: "E-Commerce Integration API", amount: 420000, channel: "Bank Transfer", date: "2026-07-04", status: "Success" },
  { id: "sale-803", customer: "Apex Ventures", item: "Consulting Support Retainer", amount: 75000, channel: "Cash", date: "2026-07-01", status: "Success" }
];

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add Sale states
  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState(50000);
  const [channel, setChannel] = useState<"Razorpay" | "Cash" | "Bank Transfer" | "Check">("Cash");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"Success" | "Pending" | "Failed">("Success");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSales() {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "sales"));
          const data: Sale[] = [];
          if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
              data.push(docSnap.data() as Sale);
            });
          }
          
          // Merge local storage imports
          if (typeof window !== "undefined") {
            const cached = localStorage.getItem("twiniq_mock_sales");
            if (cached) {
              const cachedList = JSON.parse(cached) as Sale[];
              cachedList.forEach(c => {
                if (!data.some(d => d.id === c.id)) {
                  data.push(c);
                }
              });
            }
          }
          
          setSales(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Firestore sales load error, checking local storage:", err);
      }

      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("twiniq_mock_sales");
        setSales(cached ? JSON.parse(cached) : initialSales);
      } else {
        setSales(initialSales);
      }
      setLoading(false);
    }
    loadSales();
  }, []);

  const syncCache = (updated: Sale[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("twiniq_mock_sales", JSON.stringify(updated));
    }
  };

  // Log sale record manually
  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !item || !date) return;
    setSubmitting(true);

    if (typeof window !== "undefined") {
      localStorage.removeItem("twiniq_clear_fallback");
    }

    const generatedId = `sale-${Math.floor(800 + Math.random() * 200)}`;
    const newSale: Sale = {
      id: generatedId,
      customer,
      item,
      amount: Number(amount),
      channel,
      date,
      status
    };

    try {
      if (db) {
        await setDoc(doc(db, "sales", generatedId), newSale);
        
        // If it's a successful sale, credit the cash directly to monthly net revenue
        if (status === "Success") {
          const finSnap = await getDocs(collection(db, "finance"));
          if (!finSnap.empty) {
            const latestDoc = finSnap.docs[finSnap.docs.length - 1];
            const latestData = latestDoc.data();
            await setDoc(doc(db, "finance", latestDoc.id), {
              ...latestData,
              revenue: Number(latestData.revenue || 0) + newSale.amount,
              profit: Number(latestData.profit || 0) + Math.round(newSale.amount * 0.31)
            });
          }
        }
      }
      
      const updatedList = [newSale, ...sales];
      setSales(updatedList);
      syncCache(updatedList);

      setCustomer("");
      setItem("");
      setAmount(50000);
      setChannel("Cash");
      setDate("");
      setStatus("Success");
      
      if (status === "Success") {
        alert("Sales transaction logged! Cash credited to finance charts.");
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to log sale:", err);
      alert("Failed to log sale: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete sale record
  const handleDeleteSale = async (saleItem: Sale) => {
    if (!confirm("Are you sure you want to delete this sale record?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "sales", saleItem.id));
        
        // Deduct from finance stats if it was a successful sale
        if (saleItem.status === "Success") {
          const finSnap = await getDocs(collection(db, "finance"));
          if (!finSnap.empty) {
            const latestDoc = finSnap.docs[finSnap.docs.length - 1];
            const latestData = latestDoc.data();
            await setDoc(doc(db, "finance", latestDoc.id), {
              ...latestData,
              revenue: Math.max(0, Number(latestData.revenue || 0) - saleItem.amount),
              profit: Math.max(0, Number(latestData.profit || 0) - Math.round(saleItem.amount * 0.31))
            });
          }
        }
      }

      // Cleanup local cache if present
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("twiniq_mock_sales");
        if (cached) {
          const cachedList = JSON.parse(cached) as Sale[];
          const updatedCached = cachedList.filter(s => s.id !== saleItem.id);
          localStorage.setItem("twiniq_mock_sales", JSON.stringify(updatedCached));
        }
      }

      const updatedList = sales.filter(s => s.id !== saleItem.id);
      setSales(updatedList);
      syncCache(updatedList);

      alert("Sales record deleted successfully.");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete sale:", err);
      alert("Failed to delete sale from database:\n" + (err.message || err));
    }
  };

  // Delete all sales logs
  const handleDeleteAllSales = async () => {
    if (!confirm("WARNING: Are you sure you want to delete ALL sales logs from the database? This cannot be undone.")) return;
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, "sales"));
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, "sales", docSnap.id));
        }
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("twiniq_mock_sales");
      }
      setSales([]);
      alert("All sales log overrides deleted successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete all sales logs:", err);
      alert("Failed to delete sales logs from database:\n" + (err.message || err));
    }
  };

  // Filters
  const filteredSales = sales.filter(s => 
    s.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalesValue = sales
    .filter(s => s.status === "Success")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <TrendingUp size={28} className="text-blue-500 animate-pulse" /> Manual Sales Override Ledger
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Override synchronization failures or log offline transactions. Updates cash flows and net margins dynamically.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p>Loading transaction journals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: MANUAL LOG FORM */}
          <Card className="lg:col-span-4 border-white/5 bg-slate-950/60 shadow-lg flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-md font-bold flex items-center gap-1.5">
                <Sliders size={16} className="text-blue-500" /> Log Transaction
              </CardTitle>
              <CardDescription className="text-xs">Submit sales details directly to the database.</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleAddSale} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Customer / Client Name</label>
                  <input
                    type="text" required placeholder="e.g. Reliance Tech Corp"
                    value={customer} onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Item / Service Sold</label>
                  <input
                    type="text" required placeholder="e.g. Core SaaS Licensing"
                    value={item} onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Amount (₹)</label>
                    <input
                      type="number" required min="0"
                      value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Sale Date</label>
                    <input
                      type="date" required
                      value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Payment Channel</label>
                    <select
                      value={channel} onChange={(e) => setChannel(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Razorpay">💳 Razorpay</option>
                      <option value="Bank Transfer">🏛️ Bank Transfer</option>
                      <option value="Check">📝 Check</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Transaction Status</label>
                    <select
                      value={status} onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Success">Success</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl">
                  {submitting ? <RefreshCw className="animate-spin mr-1" size={14} /> : "Log Sale Record"}
                </Button>
              </form>
            </CardContent>
            <div className="p-4 bg-slate-900/20 text-slate-500 text-[10px] text-center border-t border-slate-900 font-medium">
              Overridden transactions automatically increment cumulative cash flows.
            </div>
          </Card>

          {/* RIGHT COLUMN: SALES JOURNAL LIST */}
          <Card className="lg:col-span-8 border-white/5 bg-slate-950/60 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/5">
              <div>
                <CardTitle className="text-md font-bold">Transaction Journal</CardTitle>
                <CardDescription className="text-xs">Audited list of manual overrides and sales logs.</CardDescription>
              </div>
              <div className="flex items-center gap-3 max-w-md w-full justify-end">
                {sales.length > 0 && (
                  <Button
                    onClick={handleDeleteAllSales}
                    variant="outline"
                    className="border-red-900/30 text-red-400 hover:bg-red-950/20 text-[10px] px-3 py-1.5 h-auto rounded-xl shrink-0 cursor-pointer"
                  >
                    Clear All Logs
                  </Button>
                )}
                <div className="relative max-w-xs w-full">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text" placeholder="Search customer, item..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-full pl-8 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-semibold">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Sale ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Item / Service</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No sales transaction logs found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((s) => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-slate-900/20 text-slate-300">
                          <td className="py-3 px-3 font-mono font-bold text-slate-500">{s.id}</td>
                          <td className="py-3 px-3 text-white">{s.customer}</td>
                          <td className="py-3 px-3 text-slate-400">{s.item}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/5">
                              {s.channel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-200">{formatCurrency(s.amount)}</td>
                          <td className="py-3 px-3">
                            {s.status === "Success" ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-950/60 text-emerald-400 border-emerald-900/20">Success</span>
                            ) : s.status === "Pending" ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-950/60 text-amber-400 border-amber-900/20">Pending</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-red-950/60 text-red-400 border-red-900/20">Failed</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button 
                              onClick={() => handleDeleteSale(s)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
