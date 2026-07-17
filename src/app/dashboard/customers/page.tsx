"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, ShieldAlert, CheckCircle, ArrowUpRight,
  ShoppingBag, Calendar, Activity, Star, RefreshCw, X, Trash2, Edit2,
  FileText, Plus, Send, CreditCard
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialCustomers, Customer, getMockData } from "@/lib/mockData";
import { formatCurrency, getBusinessTerms } from "@/lib/utils";
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

const initialInvoices: Invoice[] = [
  { id: "inv-2041", client: "Microsoft India", amount: 1500000, status: "Paid", date: "2026-06-15", phone: "9876543210" },
  { id: "inv-2042", client: "Tata Consultancy Services", amount: 4200000, status: "Overdue", date: "2026-05-18", phone: "9123456780" },
  { id: "inv-2043", client: "Reliance Industries", amount: 1200000, status: "Paid", date: "2026-06-01", phone: "9988776655" },
  { id: "inv-2044", client: "Google Cloud", amount: 800000, status: "Pending", date: "2026-06-25", phone: "8877665544" }
];

export default function CustomersPage() {
  const terms = getBusinessTerms();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Customer Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustLtv, setNewCustLtv] = useState(15000);
  const [newCustChurn, setNewCustChurn] = useState(12);
  const [newCustFavs, setNewCustFavs] = useState("Micro-Controllers, Chips");
  const [submittingCust, setSubmittingCust] = useState(false);

  // Edit Customer states
  const [isEditing, setIsEditing] = useState(false);
  const [editCustName, setEditCustName] = useState("");
  const [editCustEmail, setEditCustEmail] = useState("");
  const [editCustLtv, setEditCustLtv] = useState(15000);
  const [editCustChurn, setEditCustChurn] = useState(12);
  const [editCustFavs, setEditCustFavs] = useState("");
  const [updatingCust, setUpdatingCust] = useState(false);
  const [deletingCust, setDeletingCust] = useState(false);

  // Client Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Add Invoice Modal states
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newInvAmount, setNewInvAmount] = useState(75000);
  const [newInvStatus, setNewInvStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [newInvDate, setNewInvDate] = useState("");
  const [newInvPhone, setNewInvPhone] = useState("");
  const [newInvPaymentMethod, setNewInvPaymentMethod] = useState<"online" | "cash">("online");
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Customer success outreach simulated chat overlay
  const [isOutreachChatOpen, setIsOutreachChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "cs" | "client"; text: string }[]>([]);
  const [chatting, setChatting] = useState(false);
  const [chatComplete, setChatComplete] = useState(false);
  const [outreachInput, setOutreachInput] = useState("");

  useEffect(() => {
    async function loadData() {
      let dbLoadedInvoices = false;
      try {
        if (db) {
          const isCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true";
          const isInvsCleared = typeof window !== "undefined" && localStorage.getItem("twiniq_invoices_cleared") === "true";

          const invSnapshot = await getDocs(collection(db, "invoices"));
          if (!invSnapshot.empty) {
            const invData: Invoice[] = [];
            invSnapshot.forEach((docSnap) => {
              invData.push(docSnap.data() as Invoice);
            });
            setInvoices(invData);
            dbLoadedInvoices = true;
            if (typeof window !== "undefined") {
              localStorage.setItem("twiniq_mock_invoices", JSON.stringify(invData));
            }
          } else {
            const initialList = (isCleared || isInvsCleared) ? [] : initialInvoices;
            setInvoices(initialList);
            dbLoadedInvoices = true;
            if (typeof window !== "undefined") {
              localStorage.setItem("twiniq_mock_invoices", JSON.stringify(initialList));
            }
          }
        }
      } catch (err) {
        console.error("Firestore invoices fetch error:", err);
      }

      // Local storage fallback for invoices
      if (!dbLoadedInvoices && typeof window !== "undefined") {
        const isCleared = localStorage.getItem("twiniq_clear_fallback") === "true";
        const isInvsCleared = localStorage.getItem("twiniq_invoices_cleared") === "true";
        if (isCleared || isInvsCleared) {
          setInvoices([]);
        } else {
          const cachedInv = localStorage.getItem("twiniq_mock_invoices");
          if (cachedInv) {
            setInvoices(JSON.parse(cachedInv));
          } else if (!db) {
            setInvoices(initialInvoices);
          }
        }
      }

      // 2. Load Customers
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "customers"));
          if (!querySnapshot.empty) {
            const data: Customer[] = [];
            querySnapshot.forEach((docSnap) => {
              data.push(docSnap.data() as Customer);
            });
            setCustomers(data);
            setSelectedCust(data[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Firestore fetch error, using local fallback:", err);
      }
      if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
        setCustomers([]);
        setSelectedCust(null);
      } else {
        const activeTemplate = typeof window !== "undefined" ? localStorage.getItem("twiniq_business_template") || "saas" : "saas";
        const { customers: mockCustomers } = getMockData(activeTemplate);
        setCustomers(mockCustomers);
        setSelectedCust(mockCustomers[0] || null);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Sync edit states when selectedCust changes
  useEffect(() => {
    if (selectedCust) {
      setEditCustName(selectedCust.name);
      setEditCustEmail(selectedCust.email);
      setEditCustLtv(selectedCust.ltv);
      setEditCustChurn(selectedCust.churnRisk);
      setEditCustFavs(selectedCust.favProducts.join(", "));
      setIsEditing(false);
    }
  }, [selectedCust]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;
    setSubmittingCust(true);

    const generatedId = `cust-${Date.now()}`;
    const initials = newCustName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    
    const newCustomer: Customer = {
      id: generatedId,
      name: newCustName,
      email: newCustEmail,
      ltv: Number(newCustLtv),
      churnRisk: Number(newCustChurn),
      avatar: initials || "C",
      favProducts: newCustFavs.split(",").map(item => item.trim()),
      purchaseHistory: [
        { item: newCustFavs.split(",")[0].trim() || "Initial Order", amount: Math.floor(Number(newCustLtv) * 0.4), date: "Today" }
      ],
      timeline: [
        { date: "Today", event: "Account synthesized inside TwinIQ platform configuration" }
      ]
    };

    try {
      if (db) {
        await setDoc(doc(db, "customers", generatedId), newCustomer);
      }
      setCustomers(prev => [newCustomer, ...prev]);
      setSelectedCust(newCustomer);
      setNewCustName("");
      setNewCustEmail("");
      setNewCustLtv(15000);
      setNewCustChurn(12);
      setNewCustFavs("Micro-Controllers, Chips");
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to write new customer:", err);
      alert("Failed to save customer to Cloud Firestore: " + err);
    } finally {
      setSubmittingCust(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    setUpdatingCust(true);

    const updatedCustomer: Customer = {
      ...selectedCust,
      name: editCustName,
      email: editCustEmail,
      ltv: Number(editCustLtv),
      churnRisk: Number(editCustChurn),
      favProducts: editCustFavs.split(",").map(item => item.trim()),
      avatar: editCustName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || selectedCust.avatar
    };

    try {
      if (db) {
        await setDoc(doc(db, "customers", selectedCust.id), updatedCustomer);
      }
      setCustomers(prev => prev.map(cust => cust.id === selectedCust.id ? updatedCustomer : cust));
      setSelectedCust(updatedCustomer);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update customer:", err);
      alert("Failed to update customer profile: " + err);
    } finally {
      setUpdatingCust(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCust) return;
    if (!confirm(`Are you sure you want to delete ${selectedCust.name}?`)) return;
    setDeletingCust(true);

    try {
      if (db) {
        await deleteDoc(doc(db, "customers", selectedCust.id));
      }
      setCustomers(prev => prev.filter(cust => cust.id !== selectedCust.id));
      setSelectedCust(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer: " + err);
    } finally {
      setDeletingCust(false);
    }
  };

  // Add Client Invoice
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    setSubmittingInvoice(true);

    const generatedId = `inv-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCash = newInvPaymentMethod === "cash";
    const finalStatus = isCash ? "Paid" : newInvStatus;
    const clientPhone = newInvPhone || "9876543210";
    
    const newInvoice: Invoice = {
      id: generatedId,
      client: selectedCust.name,
      amount: Number(newInvAmount),
      status: finalStatus,
      date: newInvDate,
      phone: clientPhone,
      paymentMethod: newInvPaymentMethod
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("twiniq_clear_fallback");
        localStorage.removeItem("twiniq_invoices_cleared");
      }
      if (db) {
        await setDoc(doc(db, "invoices", generatedId), newInvoice);
        if (finalStatus === "Paid") {
          const finSnap = await getDocs(collection(db, "finance"));
          if (!finSnap.empty) {
            const latestDoc = finSnap.docs[finSnap.docs.length - 1];
            const latestData = latestDoc.data();
            await setDoc(doc(db, "finance", latestDoc.id), {
              ...latestData,
              revenue: Number(latestData.revenue || 0) + newInvoice.amount,
              profit: Number(latestData.profit || 0) + Math.round(newInvoice.amount * 0.31)
            });
          }
        }
      }
      const updatedList = [newInvoice, ...invoices];
      setInvoices(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem("twiniq_mock_invoices", JSON.stringify(updatedList));
      }
      
      setNewInvAmount(75000);
      setNewInvStatus("Pending");
      setNewInvDate("");
      setNewInvPhone("");
      setNewInvPaymentMethod("online");
      setIsAddInvoiceOpen(false);
      
      alert(`Invoice ${generatedId} created successfully for ${selectedCust.name}!`);
      if (finalStatus === "Paid") {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Failed to save new invoice:", err);
      alert("Failed to save invoice: " + err.message);
    } finally {
      setSubmittingInvoice(false);
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
          const finSnap = await getDocs(collection(db, "finance"));
          if (!finSnap.empty) {
            const latestDoc = finSnap.docs[finSnap.docs.length - 1];
            const latestData = latestDoc.data();
            await setDoc(doc(db, "finance", latestDoc.id), {
              ...latestData,
              revenue: Math.max(0, Number(latestData.revenue || 0) - invoiceItem.amount),
              profit: Math.max(0, Number(latestData.profit || 0) - Math.round(invoiceItem.amount * 0.31))
            });
          }
        }
      }
      
      const updatedList = invoices.filter(inv => inv.id !== invoiceItem.id);
      setInvoices(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem("twiniq_mock_invoices", JSON.stringify(updatedList));
      }
      
      alert("Invoice deleted successfully.");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete invoice:", err);
      alert("Failed to delete invoice from database:\n" + (err.message || err));
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

  // Trigger Gemini-powered CS Outreach Chat
  const handleTriggerOutreach = async (cust: Customer) => {
    setIsOutreachChatOpen(true);
    setChatComplete(false);
    setChatting(true);
    setOutreachInput("");
    setChatMessages([
      { sender: "cs", text: `Establishing secure connection with ${cust.name} operations dashboard...` }
    ]);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: cust.name, messages: [] })
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { sender: "client", text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "client", text: "Hi, we have been having configuration latencies. Can you help us?" }]);
      }
    } catch (err) {
      console.error("Outreach start failed:", err);
      setChatMessages(prev => [...prev, { sender: "client", text: "Connection failed. Please configure GEMINI_API_KEY." }]);
    } finally {
      setChatting(false);
    }
  };

  const handleSendOutreachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachInput.trim() || chatting || !selectedCust) return;

    const userMsg = outreachInput.trim();
    setOutreachInput("");
    const updatedMessages = [...chatMessages, { sender: "cs" as const, text: userMsg }];
    setChatMessages(updatedMessages);
    setChatting(true);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: selectedCust.name, messages: updatedMessages })
      });
      const data = await res.json();
      if (data.reply) {
        const clientReply = data.reply;
        setChatMessages(prev => [...prev, { sender: "client", text: clientReply }]);
        
        const lowerReply = clientReply.toLowerCase();
        if (
          lowerReply.includes("solved") || 
          lowerReply.includes("thank you") || 
          lowerReply.includes("continue") || 
          lowerReply.includes("retained")
        ) {
          setChatComplete(true);
        }
      }
    } catch (err) {
      console.error("Outreach message send failed:", err);
    } finally {
      setChatting(false);
    }
  };

  const handleCompleteOutreach = async () => {
    if (!selectedCust) return;
    try {
      const updatedCustomer = {
        ...selectedCust,
        churnRisk: 12,
        timeline: [
          { date: "Today", event: "Automated Customer Success outreach completed: Retained account." },
          ...selectedCust.timeline
        ]
      };
      
      if (db) {
        await setDoc(doc(db, "customers", selectedCust.id), updatedCustomer);
      } else {
        // Fallback local list sync
        setCustomers(prev => prev.map(c => c.id === selectedCust.id ? updatedCustomer : c));
      }
      setSelectedCust(updatedCustomer);
      setIsOutreachChatOpen(false);
      alert("Customer retained successfully! Churn risk lowered to 12%.");
    } catch (err) {
      console.error("Outreach complete save error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users size={28} className="text-blue-500" /> {terms.clientPlur} & Churn Analytics
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Analyze LTV metrics, churn probability indices, and historical purchase records for your {terms.clientPlur.toLowerCase()}.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={14} /> Add {terms.clientSing} Feed
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px] items-center justify-center text-center">
          <div className="lg:col-span-3 text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <p className="text-xs">Loading operational twin customer feeds...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CUSTOMERS LIST PANEL */}
          <Card className="lg:col-span-5 border-white/5 bg-slate-950/60 p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
              Active {terms.clientPlur} Feed ({customers.length})
            </h3>
            
            <div className="space-y-2 overflow-y-auto max-h-[500px]">
              {customers.map((cust) => {
                const active = selectedCust?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCust(cust)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                      active
                        ? "bg-blue-600/10 border-blue-500/40 text-white"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-blue-400">
                        {cust.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{cust.name}</h4>
                        <span className="text-[10px] text-slate-500">{cust.email}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{formatCurrency(cust.ltv)} LTV</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                        cust.churnRisk > 70 
                          ? "bg-red-950/60 text-red-400 border border-red-900/20" 
                          : cust.churnRisk > 30 
                          ? "bg-amber-950/60 text-amber-400 border-amber-900/20"
                          : "bg-emerald-950/60 text-emerald-400 border-emerald-900/20"
                      }`}>
                        {cust.churnRisk}% Churn
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CUSTOMER DETAILED CARD */}
          <Card className="lg:col-span-7 border-white/5 bg-slate-950/60 flex flex-col justify-between">
            {selectedCust ? (
              isEditing ? (
                /* EDIT CUSTOMER VIEW */
                <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Edit Customer Profile</span>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editCustName} 
                      onChange={(e) => setEditCustName(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={editCustEmail} 
                      onChange={(e) => setEditCustEmail(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Lifetime Value (₹)</label>
                      <input 
                        type="number" 
                        required 
                        value={editCustLtv} 
                        onChange={(e) => setEditCustLtv(Number(e.target.value))} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Churn Risk (%)</label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        max="100" 
                        value={editCustChurn} 
                        onChange={(e) => setEditCustChurn(Number(e.target.value))} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400">Fav Products (Comma-separated)</label>
                    <input 
                      type="text" 
                      required 
                      value={editCustFavs} 
                      onChange={(e) => setEditCustFavs(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 justify-center" 
                      disabled={updatingCust}
                    >
                      {updatingCust ? <RefreshCw className="animate-spin" size={12} /> : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-red-900/30 text-red-400 hover:bg-red-950/20"
                      onClick={handleDeleteCustomer}
                      disabled={deletingCust}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </form>
              ) : (
                /* STATIC CUSTOMER AUDIT VIEW */
                <>
                  <div>
                    {/* Header profile */}
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-lg text-white">
                          {selectedCust.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{selectedCust.name}</h3>
                            <button 
                              onClick={() => setIsEditing(true)} 
                              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800/40 cursor-pointer"
                              title="Edit Profile"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">{selectedCust.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl min-w-[100px] text-center">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">LTV</span>
                          <span className="text-sm font-bold text-white">{formatCurrency(selectedCust.ltv)}</span>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl min-w-[100px] text-center">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">Churn risk</span>
                          <span className={`text-sm font-bold block ${selectedCust.churnRisk > 70 ? "text-red-400" : "text-emerald-400"}`}>
                            {selectedCust.churnRisk}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left column: Favorite products + Purchase History */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <ShoppingBag size={12} /> Favorite Products
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCust.favProducts.map((p, i) => (
                              <span key={i} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <ShoppingBag size={12} /> Purchase History
                          </h4>
                          <div className="space-y-2">
                            {selectedCust.purchaseHistory.map((h, i) => (
                              <div key={i} className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex justify-between text-xs">
                                <div>
                                  <span className="font-semibold text-white block">{h.item}</span>
                                  <span className="text-[10px] text-slate-500">{h.date}</span>
                                </div>
                                <span className="font-bold text-white self-center">{formatCurrency(h.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: Activity Timeline */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={12} /> Account Timeline
                        </h4>
                        
                        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                          {selectedCust.timeline.map((t, i) => (
                            <div key={i} className="relative pl-4 border-l border-slate-800 pb-2 last:pb-0">
                              <span className={`absolute left-[-3.5px] top-1.5 w-1.5 h-1.5 rounded-full ${
                                selectedCust.churnRisk > 70 && i === 0 ? "bg-red-500" : "bg-blue-500"
                              }`} />
                              <span className="text-[9px] text-slate-500 font-semibold block">{t.date}</span>
                              <span className="text-xs text-slate-300 leading-normal mt-0.5 block">{t.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INVOICES SECTION */}
                  <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-blue-500" /> Inbound Invoices
                      </h4>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setNewInvPhone("9876543210");
                          setIsAddInvoiceOpen(true);
                        }}
                        className="text-[10px] px-2.5 py-1 flex items-center gap-1 h-auto rounded-xl cursor-pointer"
                      >
                        <Plus size={10} /> Create Invoice
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {invoices.filter(inv => inv.client.toLowerCase() === selectedCust.name.toLowerCase()).length === 0 ? (
                        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl text-center text-slate-500 text-[10px] font-medium">
                          No invoices generated for this client yet.
                        </div>
                      ) : (
                        invoices
                          .filter(inv => inv.client.toLowerCase() === selectedCust.name.toLowerCase())
                          .map((inv) => (
                            <div key={inv.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs group relative hover:border-slate-700/80 transition-all duration-200">
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 font-mono">{inv.id}</span>
                                <div className="font-bold text-white mt-0.5">{inv.client}</div>
                                <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-1">
                                  <Calendar size={10} /> Due: {inv.date}
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <div className="font-bold text-slate-200">{formatCurrency(inv.amount)}</div>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold mt-1 inline-block border uppercase tracking-wider ${
                                    inv.status === "Paid"
                                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/20"
                                      : inv.status === "Overdue"
                                      ? "bg-red-950/60 text-red-400 border-red-900/20"
                                      : "bg-amber-950/60 text-amber-400 border-amber-900/20"
                                  }`}>
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="flex gap-1 items-center">
                                  {inv.status !== "Paid" && (
                                    <button
                                      onClick={() => triggerWhatsAppShare(inv)}
                                      className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 cursor-pointer flex items-center gap-1"
                                      title="Share via WhatsApp"
                                    >
                                      <Send size={11} /> <span className="text-[8px] font-bold">Share</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteInvoice(inv)}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 cursor-pointer"
                                    title="Delete Invoice"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Action Recommendation footer */}
                  <div className="p-6 border-t border-white/5 bg-slate-900/20 text-xs">
                    {selectedCust.churnRisk > 70 ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2 text-red-300 leading-normal">
                          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />
                          <div>
                            <strong>Churn Probability Flag (High Risk)</strong>
                            <p className="text-[10px] text-red-400/80 mt-0.5">Customer active sessions fell by 82% recently. Auto-triggered recommendations loaded.</p>
                          </div>
                        </div>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="shrink-0"
                          onClick={() => handleTriggerOutreach(selectedCust)}
                        >
                          Trigger CS Outreach
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400" /> Account Health: Safe</span>
                        <span>Last session active: Today</span>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Users size={32} className="mb-2" />
                <p>Select a customer to display parameters.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ADD CUSTOMER OVERLAY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <UserPlus size={16} className="text-blue-500" /> Add Customer Feed
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@kumartech.in"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">LTV (Lifetime Value in ₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newCustLtv}
                    onChange={(e) => setNewCustLtv(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Churn Probability Risk (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newCustChurn}
                    onChange={(e) => setNewCustChurn(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Preferred Products (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Server Hardware, Fiber Switch"
                  value={newCustFavs}
                  onChange={(e) => setNewCustFavs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
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
                  disabled={submittingCust}
                >
                  {submittingCust ? <RefreshCw className="animate-spin" size={14} /> : "Save Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD INVOICE OVERLAY MODAL */}
      {isAddInvoiceOpen && selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText size={16} className="text-blue-500" /> Create Client Invoice
              </h3>
              <button 
                onClick={() => setIsAddInvoiceOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Customer</label>
                <input
                  type="text"
                  disabled
                  value={selectedCust.name}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Invoice Value (₹)</label>
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
                  <label className="text-xs font-semibold text-slate-400">Payment Route</label>
                  <select
                    value={newInvPaymentMethod}
                    onChange={(e) => setNewInvPaymentMethod(e.target.value as "online" | "cash")}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="online">💳 Online UPI/Bank</option>
                    <option value="cash">💵 Cash Settlement</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvDate}
                    onChange={(e) => setNewInvDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {newInvPaymentMethod === "online" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Billing Status</label>
                    <select
                      value={newInvStatus}
                      onChange={(e) => setNewInvStatus(e.target.value as "Paid" | "Pending" | "Overdue")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Pending">Pending Approval</option>
                      <option value="Paid">Mark as Paid</option>
                      <option value="Overdue">Overdue Breach</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Client WhatsApp Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={newInvPhone}
                      onChange={(e) => setNewInvPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3.5 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddInvoiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingInvoice}
                >
                  {submittingInvoice ? <RefreshCw className="animate-spin" size={14} /> : "Create Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATED WHATSAPP OUTREACH CHAT OVERLAY */}
      {isOutreachChatOpen && selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp h-[500px]">
            {/* Header */}
            <div className="bg-slate-900 border-b border-white/5 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {selectedCust.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedCust.name}</h3>
                  <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Support Outreach
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOutreachChatOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
                disabled={chatting}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 flex flex-col">
              {chatMessages.map((msg, index) => {
                const isCS = msg.sender === "cs";
                return (
                  <div 
                    key={index}
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-normal ${
                      isCS 
                        ? "bg-blue-600/10 text-blue-300 border border-blue-500/20 self-start" 
                        : "bg-slate-900 text-slate-200 border border-slate-800 self-end"
                    }`}
                  >
                    {msg.text}
                  </div>
                );
              })}
              {chatting && (
                <div className="bg-blue-600/10 text-blue-300 border border-blue-500/10 rounded-2xl p-3 text-[10px] self-start animate-pulse flex items-center gap-1.5">
                  <RefreshCw className="animate-spin" size={10} /> Customer representative is typing...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-white/5 flex flex-col gap-2">
              {chatComplete ? (
                <div className="space-y-2 animate-scaleUp">
                  <div className="text-[10px] text-emerald-400 font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Client Retained Successfully!
                  </div>
                  <Button 
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    onClick={handleCompleteOutreach}
                  >
                    Commit Retain Actions
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSendOutreachMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={outreachInput}
                    disabled={chatting}
                    onChange={(e) => setOutreachInput(e.target.value)}
                    placeholder="Type support response or solution..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <Button 
                    type="submit"
                    disabled={chatting || !outreachInput.trim()}
                    className="text-xs px-4 py-2 cursor-pointer font-bold"
                  >
                    Send
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
