"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, User, Shield, AlertTriangle, Key, 
  Database, RefreshCw, CheckCircle2, Save, Terminal,
  Link2, CloudLightning, FileSpreadsheet, Upload, CheckCircle, Play, Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "integrations" | "csv" | "firebase">("profile");

  // Profile configuration states
  const [profileName, setProfileName] = useState("Vishal Surishetty");
  const [profileEmail, setProfileEmail] = useState("vishal@twiniq.ai");
  const [alertThreshold, setAlertThreshold] = useState(75);
  const [businessTemplate, setBusinessTemplate] = useState("saas");
  const [customIndustry, setCustomIndustry] = useState("Custom Business");
  const [customClientSing, setCustomClientSing] = useState("Client");
  const [customClientPlur, setCustomClientPlur] = useState("Clients");
  const [customInventoryLbl, setCustomInventoryLbl] = useState("Asset / Item");
  const [customStaffLbl, setCustomStaffLbl] = useState("Staff / Personnel");
  const [isSaved, setIsSaved] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // CSV Import states
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedRecords, setUploadedRecords] = useState<number | null>(null);

  // Firebase integration parameters
  const [envKeys, setEnvKeys] = useState({
    apiKey: "Not Configured",
    authDomain: "Not Configured",
    projectId: "Not Configured",
    storageBucket: "Not Configured",
    messagingSenderId: "Not Configured",
    appId: "Not Configured"
  });

  const [connectingFirebase, setConnectingFirebase] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Integrations states
  const [integrations, setIntegrations] = useState([
    { id: "razorpay", name: "Razorpay", category: "Finance", desc: "Automate sync of customer invoices, UPI payments, net banking, and gross margins.", connected: false },
    { id: "hubspot", name: "HubSpot", category: "CRM", desc: "Sync client pipeline activity, account velocity logs, and predictive churn triggers.", connected: false },
    { id: "shopify", name: "Shopify Store", category: "Inventory", desc: "Synchronize catalog SKUs, live warehouse inventories, and automated restocking queues.", connected: false }
  ]);
  const [connectingInt, setConnectingInt] = useState<string | null>(null);

  // Fetch loaded environment variables and local settings on mount
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "Not Configured";
    const proj = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not Configured";
    const app = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "Not Configured";

    setEnvKeys({
      apiKey: api,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not Configured",
      projectId: proj,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "Not Configured",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "Not Configured",
      appId: app
    });

    if (api !== "Not Configured" && proj !== "Not Configured") {
      setFirebaseConnected(true);
    }

    if (typeof window !== "undefined") {
      setBusinessTemplate(localStorage.getItem("twiniq_business_template") || "saas");
      setCustomIndustry(localStorage.getItem("twiniq_custom_industry") || "Custom Business");
      setCustomClientSing(localStorage.getItem("twiniq_custom_client_sing") || "Client");
      setCustomClientPlur(localStorage.getItem("twiniq_custom_client_plur") || "Clients");
      setCustomInventoryLbl(localStorage.getItem("twiniq_custom_inventory_lbl") || "Asset / Item");
      setCustomStaffLbl(localStorage.getItem("twiniq_custom_staff_lbl") || "Staff / Personnel");
      
      // Load email address dynamically from Firebase or localStorage session
      const activeSessionEmail = auth?.currentUser?.email || localStorage.getItem("twiniq_user_session") || "operator@twiniq.ai";
      setProfileEmail(activeSessionEmail);

      const activeSessionName = auth?.currentUser?.displayName || localStorage.getItem("twiniq_user_name");
      if (activeSessionName) {
        setProfileName(activeSessionName);
      } else {
        const usernamePrefix = activeSessionEmail.split("@")[0];
        setProfileName(usernamePrefix.charAt(0).toUpperCase() + usernamePrefix.slice(1));
      }
    }
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("twiniq_business_template", businessTemplate);
    localStorage.setItem("twiniq_custom_industry", customIndustry);
    localStorage.setItem("twiniq_custom_client_sing", customClientSing);
    localStorage.setItem("twiniq_custom_client_plur", customClientPlur);
    localStorage.setItem("twiniq_custom_inventory_lbl", customInventoryLbl);
    localStorage.setItem("twiniq_custom_staff_lbl", customStaffLbl);
    
    // Save custom email and operator name attributes
    localStorage.setItem("twiniq_user_name", profileName);
    localStorage.setItem("twiniq_user_session", profileEmail);

    // Remove cleared state flag since the user is resetting parameters/industry templates
    localStorage.removeItem("twiniq_clear_fallback");
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      window.location.reload();
    }, 1200);
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account?\n\nThis will permanently delete your authentication record and clear all of your local configuration settings. This action is irreversible."
    );
    if (!confirmation) return;

    // Prompt for password verification
    const passwordInput = window.prompt("For security verification, please enter your password to confirm account deletion:");
    if (passwordInput === null) return; // User cancelled the prompt
    if (!passwordInput.trim()) {
      alert("Password cannot be empty. Account deletion aborted.");
      return;
    }

    setDeletingAccount(true);
    try {
      // 1. Clear database/credentials (delete from Firebase Authentication)
      const { auth } = await import("@/lib/firebase");
      const { deleteUser, EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");

      if (auth && auth.currentUser && auth.currentUser.email) {
        // Reauthenticate the user with their password before deleting
        const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordInput);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await deleteUser(auth.currentUser);
      }

      // 2. Remove all localStorage settings/credentials
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      alert("Account deleted successfully. Returning to the authentication portal.");
      window.location.href = "/auth";
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      let errorMsg = err.message || err;
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errorMsg = "Incorrect password verification. Account deletion aborted.";
      } else if (err.code === "auth/requires-recent-login") {
        errorMsg = "For security, you must have logged in recently to delete your account. Please log out, sign back in, and try deleting your account again.";
      }
      alert("Account Deletion Failed:\n" + errorMsg);
      setDeletingAccount(false);
    }
  };

  const handleConnectFirebase = () => {
    setConnectingFirebase(true);
    setTimeout(() => {
      setConnectingFirebase(false);
      setFirebaseConnected(true);
    }, 1200);
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const { getMockData } = await import("@/lib/mockData");

      if (!db) {
        throw new Error("Firebase app not initialized. Please verify your environment keys.");
      }

      // Restore fallbacks if hidden
      localStorage.removeItem("twiniq_clear_fallback");

      const activeTemplate = localStorage.getItem("twiniq_business_template") || "saas";
      const { customers, inventory, finance, employees } = getMockData(activeTemplate);

      // Write mock tables to Cloud Firestore
      for (const item of customers) {
        await setDoc(doc(db, "customers", item.id), item);
      }
      for (const item of inventory) {
        await setDoc(doc(db, "inventory", item.id), item);
      }
      for (const item of finance) {
        await setDoc(doc(db, "finance", item.month), item);
      }
      for (const item of employees) {
        await setDoc(doc(db, "employees", item.id), item);
      }

      setSeeded(true);
    } catch (err: any) {
      console.error("Firestore Seeding failed:", err);
      alert(
        "Seeding Failed!\n\nReason: " + 
        (err.message || err) + 
        "\n\nActions Required:\n1. Open your Firebase Console.\n2. Navigate to Build > Firestore Database and click 'Create Database'.\n3. Set rules to 'Test Mode' so write permissions are allowed client-side."
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to clear all data? This will delete all records from Firestore and clear local fallback lists.")) return;
    setClearing(true);
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, deleteDoc, getDocs, collection } = await import("firebase/firestore");

      if (db) {
        // Clear customers
        const custSnap = await getDocs(collection(db, "customers"));
        for (const d of custSnap.docs) {
          await deleteDoc(doc(db, "customers", d.id));
        }

        // Clear inventory
        const invSnap = await getDocs(collection(db, "inventory"));
        for (const d of invSnap.docs) {
          await deleteDoc(doc(db, "inventory", d.id));
        }

        // Clear finance
        const finSnap = await getDocs(collection(db, "finance"));
        for (const d of finSnap.docs) {
          await deleteDoc(doc(db, "finance", d.id));
        }

        // Clear employees
        const empSnap = await getDocs(collection(db, "employees"));
        for (const d of empSnap.docs) {
          await deleteDoc(doc(db, "employees", d.id));
        }

        // Clear invoices
        const invoiceSnap = await getDocs(collection(db, "invoices"));
        for (const d of invoiceSnap.docs) {
          await deleteDoc(doc(db, "invoices", d.id));
        }
      }

      // Suppress mock data loading locally
      localStorage.setItem("twiniq_clear_fallback", "true");
      setSeeded(false);
      alert("All twin database collections and local caches cleared successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to clear data:", err);
      alert("Failed to clear database data: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleToggleIntegration = (id: string) => {
    setConnectingInt(id);
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(item => item.id === id ? { ...item, connected: !item.connected } : item)
      );
      setConnectingInt(null);
    }, 1000);
  };

  const processCSVFile = (file: File | null) => {
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== "");
      // Count rows excluding header
      const rowCount = Math.max(0, lines.length - 1);
      
      setTimeout(() => {
        setUploading(false);
        setUploadedRecords(rowCount);
      }, 1200);
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processCSVFile(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings size={28} className="text-blue-500" /> Platform Configurations
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Add operational details, configure active alert thresholds, or bind API integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Navigation Sidebar */}
        <Card className="border-white/5 bg-slate-950/60 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "profile" 
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <User size={14} /> Profile Parameters
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "integrations" 
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <CloudLightning size={14} /> Integrations Hub
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "csv" 
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <FileSpreadsheet size={14} /> CSV Imports
          </button>
          <button
            onClick={() => setActiveTab("firebase")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "firebase" 
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <Database size={14} /> Firebase Integration
          </button>
        </Card>

        {/* Tab Views Panel */}
        <div className="md:col-span-2">
          {/* TAB 1: PROFILE PARAMETERS */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fadeIn">
              <Card className="border-white/5 bg-slate-950/60 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Profile Parameters
                </h3>
                <p className="text-slate-400 text-xs mt-2">
                  Manage standard profile variables and twin warning configurations.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Operator Username</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Business Industry Template</label>
                  <select
                    value={businessTemplate}
                    onChange={(e) => setBusinessTemplate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="saas">Enterprise Software & IT (SaaS)</option>
                    <option value="retail">E-Commerce & Online Store (Shopify)</option>
                    <option value="restaurant">Food Delivery & Restaurant (Swiggy, Zomato, Dine-In)</option>
                    <option value="custom">Custom / Other Business Schema</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Loads appropriate inventory, staff, and transaction models suited to your type of business.</p>
                </div>

                {businessTemplate === "custom" && (
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 animate-scaleUp text-xs">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Configure Custom Business Labels</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Custom Industry Category</label>
                        <input
                          type="text"
                          required
                          value={customIndustry}
                          onChange={(e) => setCustomIndustry(e.target.value)}
                          placeholder="e.g. Consulting, Fitness Gym, Logistics"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Staff Member Term</label>
                        <input
                          type="text"
                          required
                          value={customStaffLbl}
                          onChange={(e) => setCustomStaffLbl(e.target.value)}
                          placeholder="e.g. Consultant, Trainer, Partner"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Client Singular Term</label>
                        <input
                          type="text"
                          required
                          value={customClientSing}
                          onChange={(e) => setCustomClientSing(e.target.value)}
                          placeholder="e.g. Client, Patient, Guest"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Client Plural Term</label>
                        <input
                          type="text"
                          required
                          value={customClientPlur}
                          onChange={(e) => setCustomClientPlur(e.target.value)}
                          placeholder="e.g. Members, Patients"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Staff / Employee Term</label>
                        <input
                          type="text"
                          required
                          value={customStaffLbl}
                          onChange={(e) => setCustomStaffLbl(e.target.value)}
                          placeholder="e.g. Trainer, Doctor"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400">Inventory Item / Resource Term</label>
                        <input
                          type="text"
                          required
                          value={customInventoryLbl}
                          onChange={(e) => setCustomInventoryLbl(e.target.value)}
                          placeholder="e.g. Asset, Equipment, Room"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                  <div className="space-y-3.5 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Operational Warning Thresholds
                    </h3>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-400">Flag alerts when health falls below:</span>
                        <strong className="text-white">{alertThreshold}%</strong>
                      </div>
                      <input
                        type="range" min="50" max="95" value={alertThreshold}
                        onChange={(e) => setAlertThreshold(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    {isSaved ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={14} /> Profile settings saved! Loading template...
                      </span>
                    ) : <span />}
                    
                    <Button type="submit" size="sm" className="flex items-center gap-1.5">
                      <Save size={14} /> Save Configuration
                    </Button>
                  </div>
                </form>
              </Card>

              {/* DANGER ZONE - ACCOUNT DELETION */}
              <Card className="border-red-500/20 bg-red-950/5 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" /> Danger Zone
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Permanently delete your user credentials from the database and wipe all localized telemetry metrics, configurations, and session parameters.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    {deletingAccount ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} /> Delete Account & Wipe Credentials
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: INTEGRATIONS HUB */}
          {activeTab === "integrations" && (
            <Card className="border-white/5 bg-slate-950/60 p-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                  <CloudLightning size={16} className="text-blue-400" /> One-Click API Integrations
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Enter your business details automatically. Connect your operational feeds immediately via API pipelines.
                </p>
              </div>

              <div className="space-y-3.5">
                {integrations.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex justify-between items-center gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-white">{item.name}</strong>
                        <span className="text-[9px] uppercase tracking-wider bg-slate-950 text-slate-500 px-2 py-0.5 rounded font-bold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed pr-2">{item.desc}</p>
                    </div>

                    <div className="shrink-0">
                      <Button
                        size="sm"
                        variant={item.connected ? "outline" : "primary"}
                        disabled={connectingInt === item.id}
                        onClick={() => handleToggleIntegration(item.id)}
                      >
                        {connectingInt === item.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : item.connected ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Syncing</span>
                        ) : (
                          "Connect API"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: CSV IMPORT */}
          {activeTab === "csv" && (
            <Card className="border-white/5 bg-slate-950/60 p-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-blue-400" /> CSV Historical Imports
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Upload spreadsheets containing historical ledgers of sales, inventories, or staffing schedules to initialize the twin model parameters.
                </p>
              </div>

              {uploadedRecords !== null ? (
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Import Complete</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">
                      TwinIQ's neural engine has successfully mapped and synthesized **{uploadedRecords}** transactions from the file.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setUploadedRecords(null)}>
                    Upload Another File
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                    dragging 
                      ? "border-blue-500 bg-blue-950/20" 
                      : "border-slate-800 hover:border-slate-700 bg-slate-900/30"
                  }`}
                >
                  <Upload size={32} className={`text-slate-500 ${uploading ? "animate-bounce" : ""}`} />
                  <div>
                    <strong className="text-xs text-slate-200 block">Drag & Drop CSV Ledger Sheets</strong>
                    <span className="text-[10px] text-slate-500 mt-1 block">Supports export models from Shopify, Quickbooks, Stripe</span>
                  </div>
                  <label className="relative cursor-pointer">
                    <span className="bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white px-4 py-2 rounded-full shadow transition-all duration-200">
                      Browse Files
                    </span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        processCSVFile(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: DATABASE SETUP BINDER (FIREBASE) */}
          {activeTab === "firebase" && (
            <Card className="border-white/5 bg-slate-950/60 p-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                  <Database size={16} className="text-blue-400" /> Database Integration (Firebase)
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  By default, TwinIQ is connected to a local memory cache feed to allow instant exploration. Connect your live production Firebase Web App to store actual telemetry models.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal size={14} className="text-blue-400" /> Loaded Env Variables
                  </h5>
                  <div className="text-[10px] font-mono space-y-1 text-slate-400">
                    <div>NEXT_PUBLIC_FIREBASE_API_KEY: <span className={envKeys.apiKey !== "Not Configured" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{envKeys.apiKey.substring(0, 10)}...</span></div>
                    <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID: <span className={envKeys.projectId !== "Not Configured" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{envKeys.projectId}</span></div>
                    <div>NEXT_PUBLIC_FIREBASE_APP_ID: <span className={envKeys.appId !== "Not Configured" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{envKeys.appId.substring(0, 16)}...</span></div>
                    <div className="pt-1.5 border-t border-slate-900 mt-1">NEXT_PUBLIC_RAZORPAY_KEY_ID: <span className={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>{process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "Configured" : "Not Configured (Demo Mode)"}</span></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${firebaseConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className="text-slate-400 font-medium">
                      {firebaseConnected ? "Bound to Firebase App Instance" : "Running on TwinIQ Mock Cache"}
                    </span>
                  </div>

                  {!firebaseConnected && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleConnectFirebase}
                      disabled={connectingFirebase}
                    >
                      {connectingFirebase ? (
                        <>
                          <RefreshCw size={12} className="animate-spin mr-1.5" /> Connecting...
                        </>
                      ) : "Verify Connection"}
                    </Button>
                  )}
                </div>

                {/* ADVANCED SEED / CLEAR OPTIONS */}
                {firebaseConnected && (
                  <div className="pt-4 border-t border-slate-900 space-y-4">
                    <div className="p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[11px] leading-relaxed text-blue-300">
                      <strong>Optional Database Controls:</strong> Populate default mock sets to experiment, or clear all database data to start your actual workspace with a clean slate.
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {seeded ? (
                        <div className="flex-1 p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2 justify-center">
                          <CheckCircle2 size={16} /> Firestore seeded successfully!
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={handleSeedDatabase}
                          disabled={seeding || clearing}
                        >
                          {seeding ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" /> Seeding collections...
                            </>
                          ) : (
                            <>
                              <Play size={14} /> Seed Mock Datasets
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2 border-red-900/30 text-red-400 hover:bg-red-950/20"
                        onClick={handleClearDatabase}
                        disabled={seeding || clearing}
                      >
                        {clearing ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Clearing all data...
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} /> Clear All TwinIQ Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
