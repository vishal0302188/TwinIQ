"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Mail, Briefcase, Building, ShieldCheck, Database, 
  Settings, Save, CheckCircle2, Award, Clock, HelpCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function ProfilePage() {
  // Personal profile states
  const [profileName, setProfileName] = useState("Vishal Surishetty");
  const [profileEmail, setProfileEmail] = useState("operator@twiniq.ai");
  const [userRole, setUserRole] = useState("Twin Operator");
  
  // Business details states
  const [companyName, setCompanyName] = useState("TwinIQ Inc.");
  const [businessCategory, setBusinessCategory] = useState("saas");
  const [customIndustry, setCustomIndustry] = useState("SaaS / IT Services");

  // Status & loading states
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load configuration from LocalStorage
    if (typeof window !== "undefined") {
      setCompanyName(localStorage.getItem("twiniq_company_name") || "TwinIQ Inc.");
      setBusinessCategory(localStorage.getItem("twiniq_business_template") || "saas");
      setCustomIndustry(localStorage.getItem("twiniq_custom_industry") || "SaaS / IT Services");
      
      const cachedName = localStorage.getItem("twiniq_user_name");
      if (cachedName) setProfileName(cachedName);

      const cachedRole = localStorage.getItem("twiniq_user_role") || "Twin Operator";
      setUserRole(cachedRole);

      const activeEmail = auth?.currentUser?.email || localStorage.getItem("twiniq_user_session") || "operator@twiniq.ai";
      setProfileEmail(activeEmail);
    }

    // 2. Fetch from Firestore if connected to keep synced
    async function fetchCloudProfile() {
      try {
        if (db && auth?.currentUser) {
          const userDocRef = doc(db, "profile", auth.currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name) setProfileName(data.name);
            if (data.role) setUserRole(data.role);
            if (data.companyName) setCompanyName(data.companyName);
            if (data.category) setBusinessCategory(data.category);
            if (data.customIndustry) setCustomIndustry(data.customIndustry);
          }
        }
      } catch (err) {
        console.error("Firestore profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCloudProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Sync to LocalStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("twiniq_user_name", profileName);
        localStorage.setItem("twiniq_user_role", userRole);
        localStorage.setItem("twiniq_company_name", companyName);
        localStorage.setItem("twiniq_business_template", businessCategory);
        localStorage.setItem("twiniq_custom_industry", customIndustry);
      }

      // 2. Sync to Firestore if active
      if (db && auth?.currentUser) {
        await setDoc(doc(db, "profile", auth.currentUser.uid), {
          name: profileName,
          role: userRole,
          companyName: companyName,
          category: businessCategory,
          customIndustry: customIndustry,
          email: profileEmail,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to sync profile: " + err);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "saas": return "SaaS & Enterprise Software";
      case "ecommerce": return "E-Commerce & Retail Marketplace";
      case "restaurant": return "Restaurant, Kitchen & Delivery";
      default: return "Custom Enterprise Template";
    }
  };

  const userInitials = profileName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "OP";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-navy-950 min-h-screen text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3" />
        Synchronizing Operator Identity...
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 bg-navy-950 overflow-y-auto min-h-screen text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <User className="text-indigo-400" size={28} /> Control Room Operator Profile
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure operator credentials, business metadata, and live simulation templates.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card & System stats */}
        <div className="space-y-6">
          <Card className="glass-panel border-white/5 shadow-xl relative overflow-hidden bg-slate-900/30">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
            <CardContent className="pt-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] mx-auto mb-4 border-2 border-white/10">
                {userInitials}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{profileName}</h2>
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mt-1">{userRole}</p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </div>

              <div className="mt-8 border-t border-white/5 pt-6 text-left space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Organization</span>
                  <span className="text-white font-medium">{companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domain Archetype</span>
                  <span className="text-white font-medium">{getCategoryLabel(businessCategory)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Database size={12} className="text-blue-400" /> 
                    {db ? "Cloud Firestore" : "Local Sandbox"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vitals / Permissions Info Card */}
          <Card className="glass-panel border-white/5 shadow-xl bg-slate-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-400" /> Control Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-400">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <Award size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Administrator Levels</p>
                  <p className="text-[10px] mt-0.5">Your profile possesses full write capability inside Firestore telemetry and local sandbox parameters.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-white/5">
                <Clock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Access Logs</p>
                  <p className="text-[10px] mt-0.5">Last login logged from local developer environment today at 09:20 AM.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Edit Form Fields */}
        <div className="lg:col-span-2">
          <Card className="glass-panel border-white/5 shadow-xl bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white tracking-tight">Identity & Business Configuration</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Configure your operator profile and core business templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-6">
                
                {/* Operator Details Section */}
                <div>
                  <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                    Operator Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Operator Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-9 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          required
                          placeholder="e.g. Vishal Surishetty"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input 
                          type="email" 
                          value={profileEmail}
                          disabled
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 px-9 text-sm text-slate-500 cursor-not-allowed"
                          placeholder="e.g. operator@twiniq.ai"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Administrator Title / Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-9 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          required
                          placeholder="e.g. Twin Operator"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Details Section */}
                <div>
                  <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                    Company & Twin Category
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Business Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-9 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          required
                          placeholder="e.g. TwinIQ Inc."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Business Industry Category</label>
                      <select 
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer h-[38px]"
                      >
                        <option value="saas">SaaS / Cloud Software</option>
                        <option value="ecommerce">E-Commerce & Retail</option>
                        <option value="restaurant">Restaurant & Food Delivery</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Industry Segment Descriptor</label>
                      <input 
                        type="text" 
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                        placeholder="e.g. SaaS / IT Services"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Confirmation area */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-6">
                  {savedSuccess ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-fadeIn bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                      <CheckCircle2 size={16} /> Operator configurations synced successfully!
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] flex items-center gap-1.5">
                      <HelpCircle size={12} /> Saving changes will automatically update your Control Room layout and sidebar terminology.
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm py-2 px-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    <Save size={16} /> {saving ? "Syncing..." : "Save Operator Details"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>

    </main>
  );
}
