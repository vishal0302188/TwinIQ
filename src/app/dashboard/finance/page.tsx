"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, FileText, ArrowUpRight, ArrowDownRight, 
  Wallet, RefreshCw, Calendar, CheckCircle2, AlertTriangle, X, Plus, Trash2, Edit2, CreditCard
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialFinance, FinanceRecord } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
}

const initialInvoices: Invoice[] = [
  { id: "inv-2041", client: "MalhotraTech Corp", amount: 150000, status: "Paid", date: "2026-06-15" },
  { id: "inv-2042", client: "Stellar Brands", amount: 420000, status: "Overdue", date: "2026-05-18" },
  { id: "inv-2043", client: "Apex Ventures", amount: 120000, status: "Paid", date: "2026-06-01" },
  { id: "inv-2044", client: "Nimbus Education", amount: 80000, status: "Pending", date: "2026-06-25" }
];

export default function FinancePage() {
  const [finRecords, setFinRecords] = useState<FinanceRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Invoice Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newInvClient, setNewInvClient] = useState("");
  const [newInvAmount, setNewInvAmount] = useState(75000);
  const [newInvStatus, setNewInvStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [newInvDate, setNewInvDate] = useState("");
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Edit Invoice states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editInvClient, setEditInvClient] = useState("");
  const [editInvAmount, setEditInvAmount] = useState(75000);
  const [editInvStatus, setEditInvStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [editInvDate, setEditInvDate] = useState("");
  const [updatingInvoice, setUpdatingInvoice] = useState(false);

  // Razorpay payment integration
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (inv: Invoice) => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Fallback if no real Razorpay Key ID is configured in environment
    if (!key || key === "rzp_test_5g2g8s5g88s2g8" || key.includes("test")) {
      const confirmSim = window.confirm(
        `[TwinIQ Sandbox Test Mode]\n\nNo live Razorpay Key ID was detected in your Vercel environment.\n\nDo you want to simulate a successful payment of ${formatCurrency(inv.amount)} for Invoice ${inv.id}?`
      );
      if (confirmSim) {
        try {
          const updatedInvoice: Invoice = { ...inv, status: "Paid" };
          
          if (db) {
            await setDoc(doc(db, "invoices", inv.id), updatedInvoice);
            // Update revenue in finance collection as well
            const finSnap = await getDocs(collection(db, "finance"));
            if (!finSnap.empty) {
              const latestDoc = finSnap.docs[finSnap.docs.length - 1];
              const latestData = latestDoc.data();
              await setDoc(doc(db, "finance", latestDoc.id), {
                ...latestData,
                revenue: Number(latestData.revenue || 0) + inv.amount,
                profit: Number(latestData.profit || 0) + Math.round(inv.amount * 0.31)
              });
            }
          }

          setInvoices(prev => prev.map(item => item.id === inv.id ? updatedInvoice : item));
          alert(`Simulated Payment Successful!\nPayment ID: pay_sim_${Math.random().toString(36).substring(2, 9)}`);
          window.location.reload(); // Refresh to recalculate dashboard metrics
        } catch (err) {
          console.error("Error updating invoice during simulated payment:", err);
        }
      }
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK. Check your internet connection.");
      return;
    }

    const options = {
      key: key,
      amount: inv.amount * 100, // in paise
      currency: "INR",
      name: "TwinIQ Platform",
      description: `Payment for Invoice ${inv.id}`,
      handler: async function (response: any) {
        try {
          const updatedInvoice: Invoice = { ...inv, status: "Paid" };
          
          if (db) {
            await setDoc(doc(db, "invoices", inv.id), updatedInvoice);
            // Update revenue in finance collection as well
            const finSnap = await getDocs(collection(db, "finance"));
            if (!finSnap.empty) {
              const latestDoc = finSnap.docs[finSnap.docs.length - 1];
              const latestData = latestDoc.data();
              await setDoc(doc(db, "finance", latestDoc.id), {
                ...latestData,
                revenue: Number(latestData.revenue || 0) + inv.amount,
                profit: Number(latestData.profit || 0) + Math.round(inv.amount * 0.31) // Keep EBITDA margin
              });
            }
          }

          setInvoices(prev => prev.map(item => item.id === inv.id ? updatedInvoice : item));
          alert(`Payment Successful!\nRazorpay Payment ID: ${response.razorpay_payment_id}`);
          window.location.reload(); // Refresh to recalculate dashboard metrics
        } catch (err) {
          console.error("Error updating invoice after payment:", err);
        }
      },
      prefill: {
        name: inv.client,
        email: "accounts@" + inv.client.toLowerCase().replace(/ /g, "") + ".com"
      },
      theme: {
        color: "#3b82f6"
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    async function loadFinance() {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "finance"));
          if (!querySnapshot.empty) {
            const data: FinanceRecord[] = [];
            querySnapshot.forEach((docSnap) => {
              data.push(docSnap.data() as FinanceRecord);
            });
            const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
            data.sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
            setFinRecords(data);
          } else {
            if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
              setFinRecords([]);
            } else {
              setFinRecords(initialFinance);
            }
          }

          const invSnapshot = await getDocs(collection(db, "invoices"));
          if (!invSnapshot.empty) {
            const invData: Invoice[] = [];
            invSnapshot.forEach((docSnap) => {
              invData.push(docSnap.data() as Invoice);
            });
            setInvoices(invData);
            setLoading(false);
            return;
          } else {
            if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
              setInvoices([]);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Firestore finance load error, using local fallback:", err);
      }
      if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
        setFinRecords([]);
        setInvoices([]);
      } else {
        setFinRecords(initialFinance);
        setInvoices(initialInvoices);
      }
      setLoading(false);
    }
    loadFinance();
  }, []);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient || !newInvDate) return;
    setSubmittingInvoice(true);

    const generatedId = `inv-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: Invoice = {
      id: generatedId,
      client: newInvClient,
      amount: Number(newInvAmount),
      status: newInvStatus,
      date: newInvDate
    };

    try {
      if (db) {
        await setDoc(doc(db, "invoices", generatedId), newInvoice);
      }
      setInvoices(prev => [newInvoice, ...prev]);
      setNewInvClient("");
      setNewInvAmount(75000);
      setNewInvStatus("Pending");
      setNewInvDate("");
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to save new invoice:", err);
      alert("Failed to save invoice to Firestore: " + err);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleOpenEdit = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setEditInvClient(inv.client);
    setEditInvAmount(inv.amount);
    setEditInvStatus(inv.status);
    setEditInvDate(inv.date);
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setUpdatingInvoice(true);

    const updatedInvoice: Invoice = {
      id: selectedInvoice.id,
      client: editInvClient,
      amount: Number(editInvAmount),
      status: editInvStatus,
      date: editInvDate
    };

    try {
      if (db) {
        await setDoc(doc(db, "invoices", selectedInvoice.id), updatedInvoice);
      }
      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error("Failed to update invoice:", err);
      alert("Failed to update invoice details: " + err);
    } finally {
      setUpdatingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "invoices", id));
      }
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      alert("Failed to delete invoice: " + err);
    }
  };

  // Totals for top metrics
  const currentFin = finRecords.length > 0 ? finRecords[finRecords.length - 1] : { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 };
  const outstandingAmount = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <DollarSign size={28} className="text-blue-500" /> Financial Intelligence Ledger
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track revenue margins, operational expenditures, accounts receivables, and billing cycles.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddModalOpen(true)}>
          <FileText size={14} /> New Invoice Billing
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p>Loading operational twin financial streams...</p>
        </div>
      ) : (
        <>
          {/* CORE FINANCIAL MINI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Net revenue (June)</span>
                <span className="text-2xl font-extrabold text-white mt-1.5 block">{formatCurrency(currentFin.revenue)}</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-2">
                <ArrowUpRight size={12} /> +14.2% YoY growth
              </span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Gross Expenditures</span>
                <span className="text-2xl font-extrabold text-white mt-1.5 block">{formatCurrency(currentFin.expenses)}</span>
              </div>
              <span className="text-[10px] text-red-400 flex items-center gap-1 font-semibold mt-2">
                <ArrowDownRight size={12} /> +6.1% operational cost
              </span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">EBITDA Net Margin</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">{formatCurrency(currentFin.profit)}</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-2">
                <ArrowUpRight size={12} /> 31.0% Profit Margin
              </span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Outstanding Receivables</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1.5 block">{formatCurrency(outstandingAmount)}</span>
              </div>
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold mt-2">
                <AlertTriangle size={12} /> {invoices.filter(inv => inv.status !== "Paid").length} Invoices pending
              </span>
            </Card>
          </div>

          {/* TREND GRAPH + INVOICES LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* EBITDA Bar Chart */}
            <Card className="lg:col-span-7 border-white/5">
              <CardHeader>
                <CardTitle className="text-md font-bold">Monthly Profitability Streams</CardTitle>
                <CardDescription className="text-xs">Visualizing cumulative revenue vs EBITDA margins.</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finRecords} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 100000} L`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12 }}
                      labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                      itemStyle={{ color: "#f8fafc", fontSize: 11 }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="EBITDA Margin" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Invoice Feed Table */}
            <Card className="lg:col-span-5 border-white/5 flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-bold">Invoices & Billing Feeds</CardTitle>
                  <CardDescription className="text-xs">Live status tracking for outbound accounts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs group relative hover:border-slate-700/80 transition-all duration-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">{inv.id}</span>
                        <h5 className="font-bold text-white mt-0.5">{inv.client}</h5>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar size={10} /> Due: {inv.date}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold text-slate-200">{formatCurrency(inv.amount)}</div>
                          {inv.status === "Paid" ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 inline-block border bg-emerald-950/60 text-emerald-400 border-emerald-900/20">
                              {inv.status}
                            </span>
                          ) : inv.status === "Overdue" ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 inline-block border bg-red-950/60 text-red-400 border-red-900/20">
                              {inv.status}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 inline-block border bg-amber-950/60 text-amber-400 border-amber-900/20">
                              {inv.status}
                            </span>
                          )}
                        </div>

                        {/* Inline actions revealed on hover */}
                        <div className="flex gap-1 items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleOpenEdit(inv)} 
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/40 cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteInvoice(inv.id)} 
                            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </div>

              <div className="p-4 border-t border-white/5">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-1 text-xs" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={14} /> Create Invoice Billing
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ADD INVOICE OVERLAY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-blue-500" /> New Invoice Billing
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Tech Solutions"
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Billing Amount (in ₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newInvAmount}
                  onChange={(e) => setNewInvAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvDate}
                    onChange={(e) => setNewInvDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Billing Status</label>
                  <select
                    value={newInvStatus}
                    onChange={(e) => setNewInvStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingInvoice}
                >
                  {submittingInvoice ? <RefreshCw className="animate-spin" size={14} /> : "Save Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE OVERLAY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-purple-500" /> Edit Invoice Billing
              </h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setSelectedInvoice(null); }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client / Company Name</label>
                <input
                  type="text"
                  required
                  value={editInvClient}
                  onChange={(e) => setEditInvClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Billing Amount (in ₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editInvAmount}
                  onChange={(e) => setEditInvAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editInvDate}
                    onChange={(e) => setEditInvDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Billing Status</label>
                  <select
                    value={editInvStatus}
                    onChange={(e) => setEditInvStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsEditModalOpen(false); setSelectedInvoice(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatingInvoice}
                >
                  {updatingInvoice ? <RefreshCw className="animate-spin" size={14} /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
