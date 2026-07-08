"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
  phone?: string;
}

const mockInvoices: Record<string, Invoice> = {
  "inv-2041": { id: "inv-2041", client: "MalhotraTech Corp", amount: 150000, status: "Paid", date: "2026-06-15" },
  "inv-2042": { id: "inv-2042", client: "Stellar Brands", amount: 420000, status: "Overdue", date: "2026-05-18" },
  "inv-2043": { id: "inv-2043", client: "Apex Ventures", amount: 120000, status: "Paid", date: "2026-06-01" },
  "inv-2044": { id: "inv-2044", client: "Nimbus Education", amount: 80000, status: "Pending", date: "2026-06-25" }
};

function PaymentForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payId, setPayId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        if (db) {
          const docSnap = await getDoc(doc(db, "invoices", id));
          if (docSnap.exists()) {
            setInvoice(docSnap.data() as Invoice);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Firestore read error, checking local mock data:", err);
      }
      
      // Fallback to mock data or localStorage
      const cached = typeof window !== "undefined" ? localStorage.getItem(`twiniq_mock_inv_${id}`) : null;
      if (cached) {
        setInvoice(JSON.parse(cached));
      } else if (mockInvoices[id]) {
        setInvoice(mockInvoices[id]);
      } else {
        setErrorMsg("Invoice ID not found. Verify the payment link URL.");
      }
      setLoading(false);
    }
    loadInvoice();
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerPayment = async () => {
    if (!invoice) return;
    setPaying(true);

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    // Set this flag to false when you want to enable the live Razorpay Gateway
    const FORCE_SANDBOX = true;

    // Simulated sandbox payment mode fallback
    if (FORCE_SANDBOX || !key || key === "rzp_test_5g2g8s5g88s2g8" || key.includes("test")) {
      const confirmSim = window.confirm(
        `[TwinIQ Sandbox Test Mode]\n\nDo you want to simulate a successful payment of ${formatCurrency(invoice.amount)} for Invoice ${invoice.id}?`
      );
      if (confirmSim) {
        try {
          const updatedInvoice: Invoice = { ...invoice, status: "Paid" };
          
          if (db) {
            await setDoc(doc(db, "invoices", invoice.id), updatedInvoice);
            // Optionally update revenue metrics inside database
            const finSnap = await getDocs(collection(db, "finance"));
            if (!finSnap.empty) {
              const latestDoc = finSnap.docs[finSnap.docs.length - 1];
              const latestData = latestDoc.data();
              await setDoc(doc(db, "finance", latestDoc.id), {
                ...latestData,
                revenue: Number(latestData.revenue || 0) + invoice.amount,
                profit: Number(latestData.profit || 0) + Math.round(invoice.amount * 0.31)
              });
            }
          } else if (typeof window !== "undefined") {
            localStorage.setItem(`twiniq_mock_inv_${invoice.id}`, JSON.stringify(updatedInvoice));
          }

          setInvoice(updatedInvoice);
          const generatedId = `pay_sim_${Math.random().toString(36).substring(2, 9)}`;
          setPayId(generatedId);
          setPaymentSuccess(true);
        } catch (err) {
          console.error("Payment update failed:", err);
        } finally {
          setPaying(false);
        }
      } else {
        setPaying(false);
      }
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay SDK. Check your internet connection.");
      setPaying(false);
      return;
    }

    const options = {
      key: key,
      amount: invoice.amount * 100, // in paise
      currency: "INR",
      name: "TwinIQ Platform",
      description: `Invoice checkout ${invoice.id}`,
      handler: async function (response: any) {
        try {
          const updatedInvoice: Invoice = { ...invoice, status: "Paid" };
          
          if (db) {
            await setDoc(doc(db, "invoices", invoice.id), updatedInvoice);
            const finSnap = await getDocs(collection(db, "finance"));
            if (!finSnap.empty) {
              const latestDoc = finSnap.docs[finSnap.docs.length - 1];
              const latestData = latestDoc.data();
              await setDoc(doc(db, "finance", latestDoc.id), {
                ...latestData,
                revenue: Number(latestData.revenue || 0) + invoice.amount,
                profit: Number(latestData.profit || 0) + Math.round(invoice.amount * 0.31)
              });
            }
          }

          setInvoice(updatedInvoice);
          setPayId(response.razorpay_payment_id);
          setPaymentSuccess(true);
        } catch (err) {
          console.error("Database update error post-payment:", err);
        } finally {
          setPaying(false);
        }
      },
      prefill: {
        name: invoice.client,
        email: "accounts@" + invoice.client.toLowerCase().replace(/ /g, "") + ".com"
      },
      theme: {
        color: "#3b82f6"
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", () => {
      setPaying(false);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 text-xs gap-3">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
        <p>Loading invoice details...</p>
      </div>
    );
  }

  if (errorMsg || !invoice) {
    return (
      <div className="text-center p-8 bg-slate-900/30 border border-slate-800 rounded-3xl max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-950/50 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-md font-bold text-white uppercase tracking-wider">Invalid Payment Link</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{errorMsg || "We could not find the specified invoice record."}</p>
      </div>
    );
  }

  return (
    <Card className="max-w-md w-full mx-auto border-white/5 bg-slate-950/60 p-6 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md">
      {paymentSuccess ? (
        <div className="text-center space-y-5 animate-scaleUp py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">Payment Settled</h2>
            <p className="text-xs text-slate-400 mt-1">Invoice {invoice.id} cleared successfully</p>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-left text-xs space-y-2 font-medium">
            <div className="flex justify-between"><span className="text-slate-500">Client Name</span><span className="text-white">{invoice.client}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount Paid</span><span className="text-emerald-400 font-bold">{formatCurrency(invoice.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Transaction ID</span><span className="text-slate-300 font-mono text-[10px]">{payId}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-emerald-400 uppercase font-bold text-[9px] tracking-wider">Paid</span></div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 leading-normal flex items-center justify-center gap-1.5 border-t border-slate-800">
            <ShieldCheck size={12} className="text-blue-400 animate-pulse" /> Secured by TwinIQ & Razorpay
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-md shadow-[0_0_15px_rgba(99,102,241,0.4)] mx-auto mb-3">
              Ω
            </div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">TwinIQ Operations Invoice</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Secure payment billing settlement portal</p>
          </div>

          {/* Body details */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between"><span className="text-slate-500">Invoice ID</span><span className="text-white font-mono">{invoice.id}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Client Name</span><span className="text-slate-200">{invoice.client}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Due Date</span><span className="text-slate-300">{invoice.date}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Status</span>
              {invoice.status === "Paid" ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-950/60 text-emerald-400 border-emerald-900/20 uppercase tracking-wide">Paid</span>
              ) : invoice.status === "Overdue" ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-red-950/60 text-red-400 border-red-900/20 uppercase tracking-wide">Overdue</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-950/60 text-amber-400 border-amber-900/20 uppercase tracking-wide">Pending</span>
              )}
            </div>
          </div>

          {/* Amount Due Big Banner */}
          <div className="p-6 bg-blue-950/10 border border-blue-500/10 rounded-2xl text-center space-y-1 animate-pulse">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Amount Due</span>
            <div className="text-3xl font-black text-white">{formatCurrency(invoice.amount)}</div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {invoice.status === "Paid" ? (
              <Button disabled className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> Invoice Already Settled
              </Button>
            ) : (
              <Button
                onClick={triggerPayment}
                disabled={paying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all duration-200"
              >
                {paying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Authorizing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={14} /> Settle Invoice via Razorpay
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="pt-2 text-[9px] text-slate-600 leading-normal flex items-center justify-center gap-1.5 border-t border-slate-900">
            <ShieldCheck size={11} className="text-blue-500" /> Secure 256-bit encryption. All interactions audited.
          </div>
        </div>
      )}
    </Card>
  );
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <p>Initializing secure payment channel...</p>
        </div>
      }>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
