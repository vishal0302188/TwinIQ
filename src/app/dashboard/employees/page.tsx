"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Activity, Star, Calendar, Award, 
  Sparkles, CheckCircle2, UserPlus, Heart, RefreshCw, X, Trash2, Edit2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialEmployees, Employee, getMockData } from "@/lib/mockData";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getBusinessTerms } from "@/lib/utils";

export default function EmployeesPage() {
  const terms = getBusinessTerms();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Employee Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("Engineering");
  const [newEmpPerf, setNewEmpPerf] = useState(85);
  const [newEmpAttend, setNewEmpAttend] = useState(95);
  const [newEmpProd, setNewEmpProd] = useState(88);
  const [submittingEmp, setSubmittingEmp] = useState(false);

  // Edit Employee states
  const [isEditing, setIsEditing] = useState(false);
  const [editEmpName, setEditEmpName] = useState("");
  const [editEmpRole, setEditEmpRole] = useState("");
  const [editEmpDept, setEditEmpDept] = useState("Engineering");
  const [editEmpPerf, setEditEmpPerf] = useState(85);
  const [editEmpAttend, setEditEmpAttend] = useState(95);
  const [editEmpProd, setEditEmpProd] = useState(88);
  const [updatingEmp, setUpdatingEmp] = useState(false);
  const [deletingEmp, setDeletingEmp] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "employees"));
          if (!querySnapshot.empty) {
            const data: Employee[] = [];
            querySnapshot.forEach((docSnap) => {
              data.push(docSnap.data() as Employee);
            });
            setEmployees(data);
            setSelectedEmp(data[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Firestore employees load error, using local fallback:", err);
      }
      if (typeof window !== "undefined" && localStorage.getItem("twiniq_clear_fallback") === "true") {
        setEmployees([]);
        setSelectedEmp(null);
      } else {
        const activeTemplate = typeof window !== "undefined" ? localStorage.getItem("twiniq_business_template") || "saas" : "saas";
        const { employees: mockEmployees } = getMockData(activeTemplate);
        setEmployees(mockEmployees);
        setSelectedEmp(mockEmployees[0] || null);
      }
      setLoading(false);
    }
    loadEmployees();
  }, []);

  // Sync edits when selectedEmp updates
  useEffect(() => {
    if (selectedEmp) {
      setEditEmpName(selectedEmp.name);
      setEditEmpRole(selectedEmp.role);
      setEditEmpDept(selectedEmp.department);
      setEditEmpPerf(selectedEmp.performance);
      setEditEmpAttend(selectedEmp.attendance);
      setEditEmpProd(selectedEmp.productivity);
      setIsEditing(false);
    }
  }, [selectedEmp]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpRole) return;
    setSubmittingEmp(true);

    const generatedId = `emp-${Date.now()}`;
    const initials = newEmpName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

    const newEmployee: Employee = {
      id: generatedId,
      name: newEmpName,
      role: newEmpRole,
      department: newEmpDept,
      performance: Number(newEmpPerf),
      attendance: Number(newEmpAttend),
      productivity: Number(newEmpProd),
      avatar: initials || "E"
    };

    try {
      if (db) {
        await setDoc(doc(db, "employees", generatedId), newEmployee);
      }
      setEmployees(prev => [newEmployee, ...prev]);
      setSelectedEmp(newEmployee);
      setNewEmpName("");
      setNewEmpRole("");
      setNewEmpDept("Engineering");
      setNewEmpPerf(85);
      setNewEmpAttend(95);
      setNewEmpProd(88);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to write new employee:", err);
      alert("Failed to save employee to Cloud Firestore: " + err);
    } finally {
      setSubmittingEmp(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setUpdatingEmp(true);

    const updatedEmployee: Employee = {
      ...selectedEmp,
      name: editEmpName,
      role: editEmpRole,
      department: editEmpDept,
      performance: Number(editEmpPerf),
      attendance: Number(editEmpAttend),
      productivity: Number(editEmpProd),
      avatar: editEmpName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || selectedEmp.avatar
    };

    try {
      if (db) {
        await setDoc(doc(db, "employees", selectedEmp.id), updatedEmployee);
      }
      setEmployees(prev => prev.map(emp => emp.id === selectedEmp.id ? updatedEmployee : emp));
      setSelectedEmp(updatedEmployee);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update employee:", err);
      alert("Failed to update team member: " + err);
    } finally {
      setUpdatingEmp(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmp) return;
    if (!confirm(`Are you sure you want to delete ${selectedEmp.name}?`)) return;
    setDeletingEmp(true);

    try {
      if (db) {
        await deleteDoc(doc(db, "employees", selectedEmp.id));
      }
      setEmployees(prev => prev.filter(emp => emp.id !== selectedEmp.id));
      setSelectedEmp(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert("Failed to remove employee: " + err);
    } finally {
      setDeletingEmp(false);
    }
  };

  const avgPerformance = employees.reduce((sum, e) => sum + e.performance, 0) / (employees.length || 1);
  const avgAttendance = employees.reduce((sum, e) => sum + e.attendance, 0) / (employees.length || 1);
  const avgProductivity = employees.reduce((sum, e) => sum + e.productivity, 0) / (employees.length || 1);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity size={28} className="text-blue-500" /> {terms.staffLbl} Roster & Productivity
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track {terms.staffLbl.toLowerCase()} performance evaluations, average attendance metrics, and department configurations.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={14} /> Add {terms.staffLbl}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p>Loading operational twin employees roster...</p>
        </div>
      ) : (
        <>
          {/* TOP SUMMARY METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[100px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Headcount</span>
                <span className="text-2xl font-extrabold text-white mt-1.5 block">{employees.length} FTEs</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Synced across departments</span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[100px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Avg Performance</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">{avgPerformance.toFixed(1)} / 100</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <Award size={12} /> Target standard satisfied
              </span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[100px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Attendance Index</span>
                <span className="text-2xl font-extrabold text-blue-400 mt-1.5 block">{avgAttendance.toFixed(1)}%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Average rolling monthly</span>
            </Card>

            <Card className="border-white/5 p-4 flex flex-col justify-between min-h-[100px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Staff Productivity</span>
                <span className="text-2xl font-extrabold text-white mt-1.5 block">{avgProductivity.toFixed(1)}%</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <Sparkles size={12} /> +3.1% velocity increase
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* TEAM MEMBERS LIST CARD */}
            <Card className="lg:col-span-5 border-white/5 bg-slate-950/60 p-4 flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                Team Members Feed ({employees.length})
              </h3>

              <div className="space-y-2 overflow-y-auto max-h-[480px]">
                {employees.map((emp) => {
                  const active = selectedEmp?.id === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmp(emp)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                        active
                          ? "bg-blue-600/10 border-blue-500/40 text-white"
                          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-purple-400">
                          {emp.avatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{emp.name}</h4>
                          <span className="text-[10px] text-slate-500">{emp.role}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-200">{emp.department}</div>
                        <span className="text-[9px] text-emerald-400 font-semibold mt-1 inline-block">
                          {emp.performance}% Perf.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* DETAILED STATS CARD */}
            <Card className="lg:col-span-7 border-white/5 bg-slate-950/60 p-6 flex flex-col justify-between">
              {selectedEmp ? (
                isEditing ? (
                  /* EDIT TEAM MEMBER FORM VIEW */
                  <form onSubmit={handleUpdateEmployee} className="space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-purple-500">Edit Member details</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)} 
                        className="text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Employee Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editEmpName} 
                        onChange={(e) => setEditEmpName(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Role Designation</label>
                      <input 
                        type="text" 
                        required 
                        value={editEmpRole} 
                        onChange={(e) => setEditEmpRole(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Department</label>
                      <select 
                        value={editEmpDept} 
                        onChange={(e) => setEditEmpDept(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-semibold text-slate-400">Performance (0-100)</label>
                        <input 
                          type="number" 
                          required 
                          value={editEmpPerf} 
                          onChange={(e) => setEditEmpPerf(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-semibold text-slate-400">Attendance %</label>
                        <input 
                          type="number" 
                          required 
                          value={editEmpAttend} 
                          onChange={(e) => setEditEmpAttend(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-semibold text-slate-400">Productivity %</label>
                        <input 
                          type="number" 
                          required 
                          value={editEmpProd} 
                          onChange={(e) => setEditEmpProd(Number(e.target.value))} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 justify-center" 
                        disabled={updatingEmp}
                      >
                        {updatingEmp ? <RefreshCw className="animate-spin" size={12} /> : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-red-900/30 text-red-400 hover:bg-red-950/20"
                        onClick={handleDeleteEmployee}
                        disabled={deletingEmp}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* STATIC TEAM MEMBER AUDIT VIEW */
                  <>
                    <div className="space-y-8">
                      {/* Header Profile */}
                      <div className="flex items-center justify-between border-b border-slate-900 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center font-extrabold text-lg text-white">
                            {selectedEmp.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white">{selectedEmp.name}</h3>
                              <button 
                                onClick={() => setIsEditing(true)} 
                                className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800/40 cursor-pointer"
                                title="Edit Profile"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                            <p className="text-xs text-slate-400">{selectedEmp.role} — <strong className="text-slate-300">{selectedEmp.department}</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* Audit Gauges / stats sliders */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-400 flex items-center gap-1"><Award size={14} className="text-purple-400" /> Performance Rating</span>
                            <strong className="text-white">{selectedEmp.performance} / 100</strong>
                          </div>
                          {/* Visual bar */}
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedEmp.performance}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-400 flex items-center gap-1"><Calendar size={14} className="text-blue-400" /> Attendance Metric</span>
                            <strong className="text-white">{selectedEmp.attendance}%</strong>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedEmp.attendance}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-400 flex items-center gap-1"><Activity size={14} className="text-emerald-400" /> Task Productivity Velocity</span>
                            <strong className="text-white">{selectedEmp.productivity}%</strong>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedEmp.productivity}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automated AI assessment details */}
                    <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-400">
                      <Heart size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">AI Team Sentiment Insight</strong>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {selectedEmp.name} demonstrates a performance rating of {selectedEmp.performance}% with a velocity index of {selectedEmp.productivity}%. Their attendance logs are solid. Recommended: Eligible for senior engineering review.
                        </p>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Users size={32} className="stroke-1 mb-2 animate-pulse" />
                  <p>Select a staff member to view individual profiles.</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ADD EMPLOYEE OVERLAY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <UserPlus size={16} className="text-blue-500" /> Add Team Member
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Job Role Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Department</label>
                <select
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Perf Score (0-100)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newEmpPerf}
                    onChange={(e) => setNewEmpPerf(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Attendance %</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newEmpAttend}
                    onChange={(e) => setNewEmpAttend(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Productivity %</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newEmpProd}
                    onChange={(e) => setNewEmpProd(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
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
                  disabled={submittingEmp}
                >
                  {submittingEmp ? <RefreshCw className="animate-spin" size={14} /> : "Save Team Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
