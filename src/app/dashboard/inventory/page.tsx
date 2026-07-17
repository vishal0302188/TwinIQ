"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, Plus, ShieldAlert, CheckCircle, RefreshCw, 
  ArrowUpRight, AlertCircle, ShoppingCart, Truck, X, Trash2, Edit2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialInventory, InventoryItem, getMockData } from "@/lib/mockData";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getBusinessTerms } from "@/lib/utils";

export default function InventoryPage() {
  const terms = getBusinessTerms();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Add SKU Modal form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSKUName, setNewSKUName] = useState("");
  const [newSKUStock, setNewSKUStock] = useState(100);
  const [newSKUBuffer, setNewSKUBuffer] = useState(20);
  const [newSKUDemand, setNewSKUDemand] = useState(15);
  const [newSKUSupplier, setNewSKUSupplier] = useState("");
  const [newSKURisk, setNewSKURisk] = useState<"low" | "medium" | "high">("low");
  const [submittingSKU, setSubmittingSKU] = useState(false);

  // Edit SKU states
  const [isEditing, setIsEditing] = useState(false);
  const [editSKUName, setEditSKUName] = useState("");
  const [editSKUStock, setEditSKUStock] = useState(100);
  const [editSKUBuffer, setEditSKUBuffer] = useState(20);
  const [editSKUDemand, setEditSKUDemand] = useState(15);
  const [editSKUSupplier, setEditSKUSupplier] = useState("");
  const [editSKURisk, setEditSKURisk] = useState<"low" | "medium" | "high">("low");
  const [updatingSKU, setUpdatingSKU] = useState(false);
  const [deletingSKU, setDeletingSKU] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "inventory"));
          if (!querySnapshot.empty) {
            const data: InventoryItem[] = [];
            querySnapshot.forEach((docSnap) => {
              data.push(docSnap.data() as InventoryItem);
            });
            setInventory(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Firestore inventory load error, using local fallback:", err);
      }
      if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
        setInventory([]);
      } else {
        const activeTemplate = typeof window !== "undefined" ? localStorage.getItem("twiniq_business_template") || "saas" : "saas";
        const { inventory: mockInventory } = getMockData(activeTemplate);
        setInventory(mockInventory);
      }
      setLoading(false);
    }
    loadInventory();
  }, []);

  // Sync editing fields when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setEditSKUName(selectedItem.name);
      setEditSKUStock(selectedItem.stock);
      setEditSKUBuffer(selectedItem.minStock);
      setEditSKUDemand(selectedItem.demandForecast);
      setEditSKUSupplier(selectedItem.supplier);
      setEditSKURisk(selectedItem.supplierRisk);
      setIsEditing(false);
    }
  }, [selectedItem]);

  const handleReorder = async (itemId: string) => {
    setReordered(itemId);
    try {
      const target = inventory.find((i) => i.id === itemId);
      if (target) {
        const newStock = target.stock + target.reorderQuantity;
        
        const nextStatus = newStock > target.minStock ? "In Stock" : newStock === 0 ? "Out of Stock" : "Low Stock";
        if (db) {
          await updateDoc(doc(db, "inventory", itemId), {
            stock: newStock,
            status: nextStatus
          });
        }

        const updatedItem = { ...target, stock: newStock, status: nextStatus as any };

        setInventory((prev) =>
          prev.map((item) => item.id === itemId ? updatedItem : item)
        );
        
        setSelectedItem((prev) => prev && prev.id === itemId ? updatedItem : prev);
      }
    } catch (err) {
      console.error("Failed to write inventory update to Firestore:", err);
    }
    setReordered(null);
  };

  const handleAddSKU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSKUName || !newSKUSupplier) return;
    setSubmittingSKU(true);

    const generatedId = `item-${Date.now()}`;
    const newItem: InventoryItem = {
      id: generatedId,
      name: newSKUName,
      stock: Number(newSKUStock),
      minStock: Number(newSKUBuffer),
      demandForecast: Number(newSKUDemand),
      supplier: newSKUSupplier,
      supplierRisk: newSKURisk,
      status: Number(newSKUStock) === 0 ? "Out of Stock" : Number(newSKUStock) > Number(newSKUBuffer) ? "In Stock" : "Low Stock",
      reorderQuantity: Math.ceil(Number(newSKUBuffer) * 1.5)
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("twiniq_clear_fallback");
      }
      if (db) {
        await setDoc(doc(db, "inventory", generatedId), newItem);
      }
      setInventory(prev => [newItem, ...prev]);
      setNewSKUName("");
      setNewSKUSupplier("");
      setNewSKUStock(100);
      setNewSKUBuffer(20);
      setNewSKUDemand(15);
      setNewSKURisk("low");
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to write new SKU to Firestore:", err);
      alert("Failed to save SKU to cloud database: " + err);
    } finally {
      setSubmittingSKU(false);
    }
  };

  const handleUpdateSKU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setUpdatingSKU(true);

    const updatedItem: InventoryItem = {
      ...selectedItem,
      name: editSKUName,
      stock: Number(editSKUStock),
      minStock: Number(editSKUBuffer),
      demandForecast: Number(editSKUDemand),
      supplier: editSKUSupplier,
      supplierRisk: editSKURisk,
      status: Number(editSKUStock) === 0 ? "Out of Stock" : Number(editSKUStock) > Number(editSKUBuffer) ? "In Stock" : "Low Stock"
    };

    try {
      if (db) {
        await setDoc(doc(db, "inventory", selectedItem.id), updatedItem);
      }
      setInventory(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item));
      setSelectedItem(updatedItem);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update SKU:", err);
      alert("Failed to update SKU: " + err);
    } finally {
      setUpdatingSKU(false);
    }
  };

  const handleDeleteSKU = async () => {
    if (!selectedItem) return;
    if (!confirm(`Are you sure you want to delete ${selectedItem.name}?`)) return;
    setDeletingSKU(true);

    try {
      if (db) {
        await deleteDoc(doc(db, "inventory", selectedItem.id));
      }
      setInventory(prev => prev.filter(item => item.id !== selectedItem.id));
      setSelectedItem(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to delete SKU:", err);
      alert("Failed to delete SKU: " + err);
    } finally {
      setDeletingSKU(false);
    }
  };

  const lowStockCount = inventory.filter(item => item.status !== "In Stock").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Database size={28} className="text-blue-500" /> {terms.inventoryLbl} & Supply Chains
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track {terms.inventoryLbl.toLowerCase()} levels, forecast upcoming demand spikes, and manage supplier risk metrics.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={14} /> Add {terms.inventoryLbl} Feed
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p>Loading operational twin inventory SKUs...</p>
        </div>
      ) : (
        <>
          {/* TOP ALERTS SECTION */}
          {lowStockCount > 0 && (
            <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <div className="flex gap-2.5 text-amber-300">
                <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Supply Risks Flagged ({lowStockCount} items)</strong>
                  <p className="text-slate-400 mt-0.5">
                    Certain hardware SKUs are running below safety buffer margins. Predictive models recommend ordering today.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* INVENTORY DATA TABLE */}
            <Card className="lg:col-span-8 border-white/5 bg-slate-950/60 p-6 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="pb-3 pr-2">SKU Item</th>
                    <th className="pb-3 text-center">Stock</th>
                    <th className="pb-3 text-center">Buffer</th>
                    <th className="pb-3 text-center">Demand Forecast</th>
                    <th className="pb-3">Supplier Source</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventory.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-slate-900/35 transition-colors cursor-pointer ${
                        selectedItem?.id === item.id ? "bg-slate-900/60" : ""
                      }`}
                    >
                      <td className="py-3 font-semibold text-white pr-2">{item.name}</td>
                      <td className="py-3 text-center font-bold text-slate-200">{item.stock}</td>
                      <td className="py-3 text-center text-slate-500">{item.minStock}</td>
                      <td className="py-3 text-center text-emerald-400 font-semibold">+{item.demandForecast}%</td>
                      <td className="py-3 text-slate-400">{item.supplier}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === "In Stock" 
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/20" 
                            : item.status === "Low Stock"
                            ? "bg-amber-950/60 text-amber-400 border-amber-900/20"
                            : "bg-red-950/60 text-red-400 border-red-900/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* DETAILED ACTION PANEL */}
            <Card className="lg:col-span-4 border-white/5 bg-slate-950/60 p-6 flex flex-col justify-between">
              {selectedItem ? (
                isEditing ? (
                  /* EDIT SKU FORM VIEW */
                  <form onSubmit={handleUpdateSKU} className="space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Edit SKU details</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)} 
                        className="text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">SKU Item Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editSKUName} 
                        onChange={(e) => setEditSKUName(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Stock Count</label>
                        <input 
                          type="number" 
                          required 
                          value={editSKUStock} 
                          onChange={(e) => setEditSKUStock(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Buffer Threshold</label>
                        <input 
                          type="number" 
                          required 
                          value={editSKUBuffer} 
                          onChange={(e) => setEditSKUBuffer(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Supplier Source</label>
                      <input 
                        type="text" 
                        required 
                        value={editSKUSupplier} 
                        onChange={(e) => setEditSKUSupplier(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Supplier Risk</label>
                        <select 
                          value={editSKURisk} 
                          onChange={(e) => setEditSKURisk(e.target.value as any)} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Demand forecast (%)</label>
                        <input 
                          type="number" 
                          required 
                          value={editSKUDemand} 
                          onChange={(e) => setEditSKUDemand(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 justify-center" 
                        disabled={updatingSKU}
                      >
                        {updatingSKU ? <RefreshCw className="animate-spin" size={12} /> : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-red-900/30 text-red-400 hover:bg-red-950/20"
                        onClick={handleDeleteSKU}
                        disabled={deletingSKU}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* STATIC SKU AUDIT VIEW */
                  <>
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">SKU Analytics</span>
                          <h3 className="text-md font-bold text-white mt-1.5">{selectedItem.name}</h3>
                        </div>
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800/40 cursor-pointer"
                          title="Edit SKU"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                        <div>
                          <span className="text-slate-500 block">Stock / Buffer</span>
                          <strong className="text-white mt-1 block">{selectedItem.stock} / {selectedItem.minStock}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Demand Growth</span>
                          <strong className="text-emerald-400 mt-1 block">+{selectedItem.demandForecast}%</strong>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Truck size={12} /> Sourcing & Risk details
                        </h4>
                        
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between border-b border-slate-900 pb-2">
                            <span className="text-slate-500">Primary Supplier:</span>
                            <strong className="text-slate-300">{selectedItem.supplier}</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-2">
                            <span className="text-slate-500">Supplier SLA Risk:</span>
                            <span className={`font-semibold uppercase ${
                              selectedItem.supplierRisk === "high" ? "text-red-400" : selectedItem.supplierRisk === "medium" ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {selectedItem.supplierRisk}
                            </span>
                          </div>
                          {selectedItem.expiryDate && (
                            <div className="flex justify-between border-b border-slate-900 pb-2">
                              <span className="text-slate-500">Warranty Expiry:</span>
                              <strong className="text-red-400">{selectedItem.expiryDate}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedItem.status !== "In Stock" && (
                        <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-xl text-[11px] leading-relaxed text-amber-300">
                          <strong>Auto-recommendation:</strong> Place a reorder payload of {selectedItem.reorderQuantity} units today to satisfy predicted {selectedItem.demandForecast}% increase in seasonal demand.
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      <Button 
                        className="w-full flex items-center justify-center gap-1.5"
                        onClick={() => handleReorder(selectedItem.id)}
                        disabled={reordered === selectedItem.id}
                      >
                        {reordered === selectedItem.id ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> restock payload sent...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} /> Reorder {selectedItem.reorderQuantity} Units
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Database size={32} className="stroke-1 mb-2 animate-pulse" />
                  <p>Select an inventory line item to audit sourcing structures.</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ADD SKU OVERLAY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Database size={16} className="text-blue-500" /> Add New SKU Feed
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSKU} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">SKU Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nvidia RTX 5090 GPU Node"
                  value={newSKUName}
                  onChange={(e) => setNewSKUName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Stock Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newSKUStock}
                    onChange={(e) => setNewSKUStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Safety Buffer</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newSKUBuffer}
                    onChange={(e) => setNewSKUBuffer(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Supplier Risk</label>
                  <select
                    value={newSKURisk}
                    onChange={(e) => setNewSKURisk(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Demand growth (%)</label>
                  <input
                    type="number"
                    required
                    value={newSKUDemand}
                    onChange={(e) => setNewSKUDemand(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Supplier Source</label>
                <input
                  type="text"
                  required
                  placeholder=" Taiwanese Semiconductors"
                  value={newSKUSupplier}
                  onChange={(e) => setNewSKUSupplier(e.target.value)}
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
                  disabled={submittingSKU}
                >
                  {submittingSKU ? <RefreshCw className="animate-spin" size={14} /> : "Save SKU Feed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
