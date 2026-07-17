"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, FileText, ArrowUpRight, ArrowDownRight, 
  Wallet, RefreshCw, Calendar, CheckCircle2, AlertTriangle, X, Plus, Trash2, Edit2, CreditCard, Send
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
  phone?: string;
  paymentMethod?: "online" | "cash";
}

interface Payout {
  id: string;
  vendor: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  dueDate: string;
  category: string;
  bankAccount: string;
}

const initialInvoices: Invoice[] = [
  { id: "inv-2041", client: "Acme Corp (AI Tier)", amount: 1500000, status: "Paid", date: "2026-06-15", phone: "9876543210" },
  { id: "inv-2042", client: "Stripe India (Beta Tech)", amount: 4200000, status: "Overdue", date: "2026-05-18", phone: "9123456780" },
  { id: "inv-2043", client: "Y-Combinator Cohort Partners", amount: 1200000, status: "Paid", date: "2026-06-01", phone: "9988776655" },
  { id: "inv-2044", client: "Zeta Payments (Scale Tier)", amount: 800000, status: "Pending", date: "2026-06-25", phone: "8877665544" }
];

const initialPayouts: Payout[] = [
  { id: "pay-101", vendor: "Amazon Web Services", amount: 120000, status: "Pending", dueDate: "2026-07-15", category: "Cloud Infrastructure", bankAccount: "HDFC A/C 9876" },
  { id: "pay-102", vendor: "OpenAI API Engine", amount: 480000, status: "Overdue", dueDate: "2026-07-02", category: "Cloud Infrastructure", bankAccount: "SBI A/C 5543" },
  { id: "pay-103", vendor: "Vercel Enterprise", amount: 35000, status: "Paid", dueDate: "2026-06-28", category: "Cloud Infrastructure", bankAccount: "ICICI A/C 2211" }
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"receivables" | "payables">("receivables");
  
  const [finRecords, setFinRecords] = useState<FinanceRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Inbound Invoice Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newInvClient, setNewInvClient] = useState("");
  const [newInvAmount, setNewInvAmount] = useState(75000);
  const [newInvStatus, setNewInvStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [newInvDate, setNewInvDate] = useState("");
  const [newInvPhone, setNewInvPhone] = useState("");
  const [newInvPaymentMethod, setNewInvPaymentMethod] = useState<"online" | "cash">("online");
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Edit Invoice states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editInvClient, setEditInvClient] = useState("");
  const [editInvAmount, setEditInvAmount] = useState(75000);
  const [editInvStatus, setEditInvStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [editInvDate, setEditInvDate] = useState("");
  const [editInvPhone, setEditInvPhone] = useState("");
  const [editInvPaymentMethod, setEditInvPaymentMethod] = useState<"online" | "cash">("online");
  const [updatingInvoice, setUpdatingInvoice] = useState(false);

  // Outbound Payout Modal states
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [newPayVendor, setNewPayVendor] = useState("");
  const [newPayAmount, setNewPayAmount] = useState(45000);
  const [newPayCategory, setNewPayCategory] = useState("Operating Supplies");
  const [newPayBankAccount, setNewPayBankAccount] = useState("");
  const [newPayDueDate, setNewPayDueDate] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Simulated Payout Modal states
  const [isPayoutConfirmOpen, setIsPayoutConfirmOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [processingPayout, setProcessingPayout] = useState(false);

  useEffect(() => {
    async function loadFinance() {
      try {
        if (db) {
          const isCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true";
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
            setFinRecords(isCleared ? [] : initialFinance);
          }
          const isClearedFlag = typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true";
          const isInvsCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_invoices_cleared") === "true";
          const isBillsCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_bills_cleared") === "true";

          // Load Receivables (Client Invoices)
          const invSnapshot = await getDocs(collection(db, "invoices"));
          if (!invSnapshot.empty) {
            const invData: Invoice[] = [];
            invSnapshot.forEach((docSnap) => {
              invData.push(docSnap.data() as Invoice);
            });
            setInvoices(invData);
          } else {
            setInvoices((isClearedFlag || isInvsCleared) ? [] : initialInvoices);
          }

          // Load Payables (Supplier Payouts)
          const paySnapshot = await getDocs(collection(db, "payouts"));
          if (!paySnapshot.empty) {
            const payData: Payout[] = [];
            paySnapshot.forEach((docSnap) => {
              payData.push(docSnap.data() as Payout);
            });
            setPayouts(payData);
          } else {
            setPayouts((isClearedFlag || isBillsCleared) ? [] : initialPayouts);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Firestore finance load error, using local fallback:", err);
      }
      
      // Local fallbacks
      if (typeof window !== "undefined") {
        const isCleared = localStorage.getItem("twiniq_clear_fallback") === "true";
        const isInvsCleared = localStorage.getItem("twiniq_invoices_cleared") === "true";
        const isBillsCleared = localStorage.getItem("twiniq_bills_cleared") === "true";

        if (isCleared || isInvsCleared) {
          setInvoices([]);
        } else {
          const cachedInv = localStorage.getItem("twiniq_mock_invoices");
          setInvoices(cachedInv ? JSON.parse(cachedInv) : initialInvoices);
        }

        if (isCleared || isBillsCleared) {
          setPayouts([]);
        } else {
          const cachedPay = localStorage.getItem("twiniq_mock_payouts");
          setPayouts(cachedPay ? JSON.parse(cachedPay) : initialPayouts);
        }

        if (isCleared) {
          setFinRecords([]);
        } else {
          const cachedFin = localStorage.getItem("twiniq_mock_finance");
          setFinRecords(cachedFin ? JSON.parse(cachedFin) : initialFinance);
        }
      } else {
        setInvoices(initialInvoices);
        setPayouts(initialPayouts);
        setFinRecords(initialFinance);
      }
      setLoading(false);
    }
    loadFinance();
  }, []);

  // Save changes helper
  const syncLocalCache = (newInvoices: Invoice[], newPayouts: Payout[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("twiniq_mock_invoices", JSON.stringify(newInvoices));
      localStorage.setItem("twiniq_mock_payouts", JSON.stringify(newPayouts));
    }
  };

  const getLatestFinanceDoc = async () => {
    if (!db) return null;
    const finSnap = await getDocs(collection(db, "finance"));
    let latestDoc;
    let latestData;
    if (finSnap.empty) {
      for (const item of initialFinance) {
        await setDoc(doc(db, "finance", item.month), item);
      }
      const refetched = await getDocs(collection(db, "finance"));
      const sortedDocs = [...refetched.docs];
      const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      sortedDocs.sort((a, b) => monthsOrder.indexOf(a.id) - monthsOrder.indexOf(b.id));
      latestDoc = sortedDocs[sortedDocs.length - 1];
      latestData = latestDoc.data();
    } else {
      const sortedDocs = [...finSnap.docs];
      const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      sortedDocs.sort((a, b) => monthsOrder.indexOf(a.id) - monthsOrder.indexOf(b.id));
      latestDoc = sortedDocs[sortedDocs.length - 1];
      latestData = latestDoc.data();
    }
    return { id: latestDoc.id, data: latestData };
  };

  // Add Client Invoice
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient || !newInvDate) return;
    setSubmittingInvoice(true);

    const generatedId = `inv-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCash = newInvPaymentMethod === "cash";
    const finalStatus = isCash ? "Paid" : newInvStatus;
    const newInvoice: Invoice = {
      id: generatedId,
      client: newInvClient,
      amount: Number(newInvAmount),
      status: finalStatus,
      date: newInvDate,
      phone: newInvPhone || "9876543210",
      paymentMethod: newInvPaymentMethod
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("twiniq_clear_fallback");
      }
      if (db) {
        await setDoc(doc(db, "invoices", generatedId), newInvoice);
        if (finalStatus === "Paid") {
          const res = await getLatestFinanceDoc();
          if (res) {
            await setDoc(doc(db, "finance", res.id), {
              ...res.data,
              revenue: Number(res.data.revenue || 0) + newInvoice.amount,
              profit: Number(res.data.profit || 0) + Math.round(newInvoice.amount * 0.31)
            });
          }
        }
      }
      const updatedList = [newInvoice, ...invoices];
      setInvoices(updatedList);
      syncLocalCache(updatedList, payouts);
      
      setNewInvClient("");
      setNewInvAmount(75000);
      setNewInvStatus("Pending");
      setNewInvDate("");
      setNewInvPhone("");
      setNewInvPaymentMethod("online");
      setIsAddModalOpen(false);
      
      if (finalStatus === "Paid") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to save new invoice:", err);
      alert("Failed to save invoice: " + err);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Edit/Update Client Invoice
  const handleOpenEdit = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setEditInvClient(inv.client);
    setEditInvAmount(inv.amount);
    setEditInvStatus(inv.status);
    setEditInvDate(inv.date);
    setEditInvPhone(inv.phone || "");
    setEditInvPaymentMethod(inv.paymentMethod || "online");
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setUpdatingInvoice(true);

    const isCash = editInvPaymentMethod === "cash";
    const finalStatus = isCash ? "Paid" : editInvStatus;
    const updatedInvoice: Invoice = {
      id: selectedInvoice.id,
      client: editInvClient,
      amount: Number(editInvAmount),
      status: finalStatus,
      date: editInvDate,
      phone: editInvPhone || "9876543210",
      paymentMethod: editInvPaymentMethod
    };

    try {
      if (db) {
        await setDoc(doc(db, "invoices", selectedInvoice.id), updatedInvoice);
        // If status changed to Paid, credit the amount
        if (finalStatus === "Paid" && selectedInvoice.status !== "Paid") {
          const res = await getLatestFinanceDoc();
          if (res) {
            await setDoc(doc(db, "finance", res.id), {
              ...res.data,
              revenue: Number(res.data.revenue || 0) + updatedInvoice.amount,
              profit: Number(res.data.profit || 0) + Math.round(updatedInvoice.amount * 0.31)
            });
          }
        }
      }
      const updatedList = invoices.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv);
      setInvoices(updatedList);
      syncLocalCache(updatedList, payouts);
      
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
      
      if (finalStatus === "Paid" && selectedInvoice.status !== "Paid") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to update invoice:", err);
      alert("Failed to update invoice details: " + err);
    } finally {
      setUpdatingInvoice(false);
    }
  };

  // Delete Client Invoice
  const handleDeleteInvoice = async (invoiceItem: Invoice) => {
    if (!confirm(`Are you sure you want to delete Invoice ${invoiceItem.id}?`)) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "invoices", invoiceItem.id));
        
        // If the invoice was paid, deduct it from finance stats
        if (invoiceItem.status === "Paid") {
          const res = await getLatestFinanceDoc();
          if (res) {
            await setDoc(doc(db, "finance", res.id), {
              ...res.data,
              revenue: Math.max(0, Number(res.data.revenue || 0) - invoiceItem.amount),
              profit: Math.max(0, Number(res.data.profit || 0) - Math.round(invoiceItem.amount * 0.31))
            });
          }
        }
      }
      
      const updatedList = invoices.filter(inv => inv.id !== invoiceItem.id);
      setInvoices(updatedList);
      syncLocalCache(updatedList, payouts);
      
      alert("Invoice deleted successfully.");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete invoice:", err);
      alert("Failed to delete invoice from database:\n" + (err.message || err));
    }
  };

  // Delete all client invoices
  const handleDeleteAllInvoices = async () => {
    if (!confirm("WARNING: Are you sure you want to delete ALL invoices from the database? This cannot be undone.")) return;
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, "invoices"));
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, "invoices", docSnap.id));
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("twiniq_mock_invoices", "[]");
        localStorage.setItem("twiniq_invoices_cleared", "true");
      }
      setInvoices([]);
      alert("All client invoices deleted successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete all invoices:", err);
      alert("Failed to delete invoices from database:\n" + (err.message || err));
    }
  };

  // Share to WhatsApp generator
  const triggerWhatsAppShare = (inv: Invoice) => {
    if (typeof window === "undefined") return;
    const clientPhone = inv.phone || "9876543210";
    const paymentUrl = `${window.location.origin}/pay?id=${inv.id}`;
    const cleanText = `Dear ${inv.client}, your invoice ${inv.id} for ${formatCurrency(inv.amount)} from TwinIQ Platform is pending. Please review details and pay securely here: ${paymentUrl}`;
    
    // Create WhatsApp Web/Mobile redirect URL
    const waUrl = `https://api.whatsapp.com/send?phone=${clientPhone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(cleanText)}`;
    window.open(waUrl, "_blank");
  };

  // Add Supplier Payout
  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayVendor || !newPayDueDate || !newPayBankAccount) return;
    setSubmittingPayout(true);

    const generatedId = `pay-${Math.floor(100 + Math.random() * 900)}`;
    const newPayout: Payout = {
      id: generatedId,
      vendor: newPayVendor,
      amount: Number(newPayAmount),
      status: "Pending",
      dueDate: newPayDueDate,
      category: newPayCategory,
      bankAccount: newPayBankAccount
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("twiniq_clear_fallback");
      }
      if (db) {
        await setDoc(doc(db, "payouts", generatedId), newPayout);
      }
      const updatedList = [newPayout, ...payouts];
      setPayouts(updatedList);
      syncLocalCache(invoices, updatedList);

      setNewPayVendor("");
      setNewPayAmount(45000);
      setNewPayCategory("Operating Supplies");
      setNewPayBankAccount("");
      setNewPayDueDate("");
      setIsAddPayoutOpen(false);
    } catch (err) {
      console.error("Failed to log supplier bill:", err);
      alert("Failed to save supplier bill: " + err);
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Delete Supplier Payout
  const handleDeletePayout = async (payoutItem: Payout) => {
    if (!confirm(`Are you sure you want to delete Bill ${payoutItem.id}?`)) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "payouts", payoutItem.id));
        
        // If the bill was paid, reverse the expenses deduction from finance stats
        if (payoutItem.status === "Paid") {
          const res = await getLatestFinanceDoc();
          if (res) {
            await setDoc(doc(db, "finance", res.id), {
              ...res.data,
              expenses: Math.max(0, Number(res.data.expenses || 0) - payoutItem.amount),
              profit: Number(res.data.profit || 0) + payoutItem.amount
            });
          }
        }
      }
      
      const updatedList = payouts.filter(p => p.id !== payoutItem.id);
      setPayouts(updatedList);
      syncLocalCache(invoices, updatedList);
      
      alert("Supplier bill record deleted successfully.");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete bill:", err);
      alert("Failed to delete bill from database:\n" + (err.message || err));
    }
  };

  // Delete all supplier bills
  const handleDeleteAllPayouts = async () => {
    if (!confirm("WARNING: Are you sure you want to delete ALL supplier bills from the database? This cannot be undone.")) return;
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, "payouts"));
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, "payouts", docSnap.id));
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("twiniq_mock_payouts", "[]");
        localStorage.setItem("twiniq_bills_cleared", "true");
      }
      setPayouts([]);
      alert("All supplier bills deleted successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete all bills:", err);
      alert("Failed to delete bills from database:\n" + (err.message || err));
    }
  };

  // Open simulated Payout confirmation
  const handleOpenPayout = (p: Payout) => {
    setSelectedPayout(p);
    setIsPayoutConfirmOpen(true);
  };

  const handleExecutePayout = async () => {
    if (!selectedPayout) return;
    setProcessingPayout(true);
    
    // Simulate API bank transfer delays
    setTimeout(async () => {
      try {
        const updatedPayout: Payout = { ...selectedPayout, status: "Paid" };
        
        if (db) {
          await setDoc(doc(db, "payouts", selectedPayout.id), updatedPayout);
          // Recalculate expenditures & profit metrics inside dashboard collections
          const res = await getLatestFinanceDoc();
          if (res) {
            await setDoc(doc(db, "finance", res.id), {
              ...res.data,
              expenses: Number(res.data.expenses || 0) + selectedPayout.amount,
              profit: Number(res.data.profit || 0) - selectedPayout.amount
            });
          }
        }

        const updatedList = payouts.map(p => p.id === selectedPayout.id ? updatedPayout : p);
        setPayouts(updatedList);
        syncLocalCache(invoices, updatedList);

        alert(`IMPS Direct Bank Transfer Complete!\n\nVendor: ${selectedPayout.vendor}\nAmount: ${formatCurrency(selectedPayout.amount)}\nStatus: Settled`);
        setIsPayoutConfirmOpen(false);
        setSelectedPayout(null);
        window.location.reload(); // Refresh page metrics
      } catch (err) {
        console.error("Payout update failed:", err);
      } finally {
        setProcessingPayout(false);
      }
    }, 1500);
  };

  // Aggregated totals
  const currentFin = finRecords.length > 0 ? finRecords[finRecords.length - 1] : { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 };
  const outstandingReceivables = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingPayables = payouts
    .filter(p => p.status !== "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  // Burn Rate & Runway Computations
  const totalReserves = currentFin.cashFlow || 5210000;
  // Calculate average monthly outbound payouts (from payouts list status)
  const monthlyBurn = payouts.reduce((sum, p) => sum + p.amount, 0) / 2 + 180000; // Average of payouts + base employee salary estimate
  // Calculate average monthly paid client revenue
  const monthlyInflow = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const netBurnRate = monthlyBurn - monthlyInflow;
  const runwayMonths = netBurnRate > 0 ? (totalReserves / netBurnRate) : 999;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <DollarSign size={28} className="text-blue-500" /> Financial Intelligence Ledger
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track net revenue, outgoing accounts payables, client invoices, and supplier payments.
          </p>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p>Loading operational twin financial streams...</p>
        </div>
      ) : (
        <>
          {/* TOP CARDS METRICS BAR */}
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
                <span className="text-[10px] text-rose-500 block uppercase font-bold tracking-wider">Outstanding Payables</span>
                <span className="text-2xl font-extrabold text-rose-400 mt-1.5 block">{formatCurrency(outstandingPayables)}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-2">
                Receivables: {formatCurrency(outstandingReceivables)}
              </span>
            </Card>
          </div>

          {/* CASH RUNWAY & TREASURY INTELLIGENCE DECK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <Card className="md:col-span-3 border-white/5 bg-slate-950/60 p-5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 max-w-lg w-full">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Cash Runway & Burn Rate Diagnostics</span>
                <h4 className="text-md font-bold text-white">Operational Run-Time Analysis</h4>
                <p className="text-slate-400 text-xs leading-normal">
                  Our digital twin computes monthly OpEx (supplier bills + salary estimates) against incoming invoice collections to forecast your operational runway.
                </p>
                <div className="flex gap-4 pt-2 text-xs">
                  <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl text-center min-w-[120px]">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Monthly Burn</span>
                    <span className="text-sm font-bold text-rose-400">{formatCurrency(monthlyBurn)}</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl text-center min-w-[120px]">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Monthly Inflow</span>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(monthlyInflow)}</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl text-center min-w-[120px]">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Net Burn Rate</span>
                    <span className={`text-sm font-bold ${netBurnRate > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {netBurnRate > 0 ? `+${formatCurrency(netBurnRate)}` : formatCurrency(netBurnRate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 w-full md:max-w-xs flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-2">Runway Forecast</span>
                {netBurnRate <= 0 ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl mx-auto shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      ∞
                    </div>
                    <span className="text-xs font-bold text-emerald-400 block">Self-Sustaining Operations</span>
                    <p className="text-[10px] text-slate-500">Your revenues are currently covering all operational outflows.</p>
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">
                      {runwayMonths.toFixed(1)} <span className="text-xs font-sans text-slate-400">Months</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                      <div 
                        className={`h-1.5 rounded-full ${runwayMonths > 12 ? "bg-emerald-500" : runwayMonths > 6 ? "bg-amber-500" : "bg-red-500 animate-pulse"}`} 
                        style={{ width: `${Math.min(100, (runwayMonths / 24) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                      {runwayMonths > 12 ? "Safe Capital reserves" : runwayMonths > 6 ? "Watchful Capital Buffer" : "Critical Burn Buffer (Action Needed)"}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* MAIN SPACE split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MONTHLY PROFITABILITY TRENDS */}
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

            {/* OUTBOUND SUPPLIER PAYOUTS (PAYABLES) */}
            <Card className="lg:col-span-5 border-white/5 flex flex-col justify-between animate-fadeIn">
              <div>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-md font-bold">Outbound Supplier Bills</CardTitle>
                    <CardDescription className="text-xs">Incoming invoices due to vendors.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {payouts.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1 text-[10px] px-2.5 py-1 border-red-900/30 text-red-400 hover:bg-red-950/20 h-auto rounded-xl cursor-pointer" 
                        onClick={handleDeleteAllPayouts}
                      >
                        Clear Bills
                      </Button>
                    )}
                    <Button size="sm" variant="danger" className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/20 h-auto rounded-xl cursor-pointer" onClick={() => setIsAddPayoutOpen(true)}>
                      <Plus size={12} /> Log Bill
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {payouts.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs group relative hover:border-slate-700/80 transition-all duration-200">
                      <div>
                        <span className="text-[10px] font-bold text-rose-500/70">{p.id}</span>
                        <h5 className="font-bold text-white mt-0.5">{p.vendor}</h5>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          {p.category}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold text-slate-200">{formatCurrency(p.amount)}</div>
                          {p.status === "Paid" ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 inline-block border bg-emerald-950/60 text-emerald-400 border-emerald-900/20 uppercase tracking-wider">
                              Settled
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenPayout(p)}
                              className="px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1.5 flex items-center gap-1 border bg-red-950/60 text-red-400 border-red-900/20 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer"
                              title="Authorize IMPS Bank Transfer Payout"
                            >
                              <CreditCard size={10} /> Pay Bill
                            </button>
                          )}
                        </div>

                        {/* Delete on hover */}
                        <div className="flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleDeletePayout(p)} 
                            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 cursor-pointer"
                            title="Delete Supplier Bill"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </div>
              <div className="p-3 bg-slate-900/20 text-slate-500 text-[10px] text-center border-t border-slate-900">
                Supplier payouts debit from bank accounts, updating expenditures and profitability indexes.
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ADD CLIENT INVOICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-blue-500" /> Create Client Invoice
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client / Company Name</label>
                <input
                  type="text" required placeholder="e.g. Reliance Tech Solutions"
                  value={newInvClient} onChange={(e) => setNewInvClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client Contact Phone (for WhatsApp Share)</label>
                <input
                  type="text" placeholder="e.g. 9876543210"
                  value={newInvPhone} onChange={(e) => setNewInvPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Billing Amount (in ₹)</label>
                <input
                  type="number" required min="0"
                  value={newInvAmount} onChange={(e) => setNewInvAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Payment Method</label>
                <select
                  value={newInvPaymentMethod}
                  onChange={(e) => {
                    const val = e.target.value as "online" | "cash";
                    setNewInvPaymentMethod(val);
                    if (val === "cash") {
                      setNewInvStatus("Paid");
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="online">Online Checkout Link (Razorpay)</option>
                  <option value="cash">Cash / Offline Settlement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date" required
                    value={newInvDate} onChange={(e) => setNewInvDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Billing Status</label>
                  <select
                    value={newInvStatus} onChange={(e) => setNewInvStatus(e.target.value as any)}
                    disabled={newInvPaymentMethod === "cash"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingInvoice}>
                  {submittingInvoice ? <RefreshCw className="animate-spin" size={14} /> : "Save Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT INVOICE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-purple-500" /> Edit Invoice Billing
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedInvoice(null); }} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client Name</label>
                <input
                  type="text" required
                  value={editInvClient} onChange={(e) => setEditInvClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Client Contact Phone</label>
                <input
                  type="text"
                  value={editInvPhone} onChange={(e) => setEditInvPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Billing Amount (in ₹)</label>
                <input
                  type="number" required min="0"
                  value={editInvAmount} onChange={(e) => setEditInvAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Payment Method</label>
                <select
                  value={editInvPaymentMethod}
                  onChange={(e) => {
                    const val = e.target.value as "online" | "cash";
                    setEditInvPaymentMethod(val);
                    if (val === "cash") {
                      setEditInvStatus("Paid");
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="online">Online Checkout Link (Razorpay)</option>
                  <option value="cash">Cash / Offline Settlement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date" required
                    value={editInvDate} onChange={(e) => setEditInvDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Billing Status</label>
                  <select
                    value={editInvStatus} onChange={(e) => setEditInvStatus(e.target.value as any)}
                    disabled={editInvPaymentMethod === "cash"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedInvoice(null); }}>Cancel</Button>
                <Button type="submit" disabled={updatingInvoice}>
                  {updatingInvoice ? <RefreshCw className="animate-spin" size={14} /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG SUPPLIER BILL MODAL */}
      {isAddPayoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-red-500" /> Log Outgoing Supplier Bill
              </h3>
              <button onClick={() => setIsAddPayoutOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddPayout} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Supplier / Vendor Name</label>
                <input
                  type="text" required placeholder="e.g. AWS Cloud, Intel Foundry, City Landlord"
                  value={newPayVendor} onChange={(e) => setNewPayVendor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Bill Category</label>
                  <select
                    value={newPayCategory} onChange={(e) => setNewPayCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Hardware Materials">Hardware Materials</option>
                    <option value="Logistics & Freight">Logistics & Freight</option>
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="Operating Supplies">Operating Supplies</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Supplier Bank Details</label>
                  <input
                    type="text" required placeholder="e.g. HDFC A/C 4531"
                    value={newPayBankAccount} onChange={(e) => setNewPayBankAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Amount (in ₹)</label>
                  <input
                    type="number" required min="0"
                    value={newPayAmount} onChange={(e) => setNewPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date" required
                    value={newPayDueDate} onChange={(e) => setNewPayDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button type="button" variant="outline" onClick={() => setIsAddPayoutOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingPayout}>
                  {submittingPayout ? <RefreshCw className="animate-spin" size={14} /> : "Log Bill"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAYX DIRECT BANK TRANSFER CONFIRMATION MODAL */}
      {isPayoutConfirmOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-950 border border-red-500/20 rounded-3xl p-6 space-y-5 shadow-[0_8px_32px_rgba(239,68,68,0.15)] animate-scaleUp">
            
            {/* Header */}
            <div className="text-center border-b border-white/5 pb-3 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 text-red-400 border border-red-500/20 flex items-center justify-center font-extrabold text-md mx-auto mb-2">
                1
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">RazorpayX Payout</h3>
              <p className="text-[10px] text-slate-500">Corporate Bank Transfer (Staging Simulator)</p>
            </div>

            {/* Transfer details */}
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-2xl text-xs space-y-2.5 font-semibold">
              <div className="flex justify-between"><span className="text-slate-500">Beneficiary</span><span className="text-white">{selectedPayout.vendor}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-slate-300">{selectedPayout.category}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bank Destination</span><span className="text-slate-300 font-mono">{selectedPayout.bankAccount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payout Amount</span><span className="text-red-400 font-bold">{formatCurrency(selectedPayout.amount)}</span></div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsPayoutConfirmOpen(false); setSelectedPayout(null); }}
                disabled={processingPayout}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExecutePayout}
                disabled={processingPayout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {processingPayout ? (
                  <>
                    <RefreshCw className="animate-spin mr-1" size={12} /> Transferring...
                  </>
                ) : (
                  "Confirm IMPS"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
