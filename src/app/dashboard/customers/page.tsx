"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, ShieldAlert, CheckCircle, ArrowUpRight,
  ShoppingBag, Calendar, Activity, Star, RefreshCw, X, Trash2, Edit2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialCustomers, Customer, getMockData } from "@/lib/mockData";
import { formatCurrency, getBusinessTerms } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

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

  useEffect(() => {
    async function loadCustomers() {
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
    loadCustomers();
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
                        <Button variant="danger" size="sm" className="shrink-0">
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
    </div>
  );
}
