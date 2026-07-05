"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ChevronLeft, RefreshCw, KeyRound, Globe, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from "firebase/auth";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const hasSignup = searchParams.get("signup") === "true" || 
                      (typeof window !== "undefined" && window.location.search.includes("signup=true"));
    if (hasSignup) {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isSignUp && password !== confirmPassword) {
      alert("Authentication Failed:\nPasswords do not match. Please confirm your password again.");
      return;
    }

    setLoading(true);

    try {
      if (auth) {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        localStorage.setItem("twiniq_user_session", email);
        router.push("/dashboard");
      } else {
        // Fallback to mock session if Firebase is not initialized
        localStorage.setItem("twiniq_user_session", email);
        setTimeout(() => {
          setLoading(false);
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let displayMsg = err.message || err;
      
      if (err.code === "auth/weak-password") {
        displayMsg = "Weak Password: Firebase requires the password to be at least 6 characters long.";
      } else if (err.code === "auth/email-already-in-use") {
        displayMsg = "Email Already In Use: This email is already registered. Please use the Login tab.";
      } else if (err.code === "auth/invalid-credential") {
        displayMsg = "Invalid Credentials: The password is incorrect, or this account does not exist.\n\nNote: If you previously signed up via Google, please click 'Continue with Google' to sign in, or click 'Forgot password?' to assign a custom password for manual logins.";
      } else if (err.code === "auth/invalid-email") {
        displayMsg = "Invalid Email: The email format is incorrect.";
      } else if (err.code === "auth/operation-not-allowed") {
        displayMsg = "Operation Not Allowed: Email/Password sign-in has not been enabled in your Firebase console.";
      }

      alert("Authentication Failed:\n" + displayMsg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push("/dashboard");
      } else {
        // Fallback
        setTimeout(() => {
          setLoading(false);
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      alert("Google Authentication Failed: " + (err.message || err));
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, forgotEmail);
        setForgotSent(true);
      } else {
        setTimeout(() => {
          setForgotSent(true);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Forgot password reset failed:", err);
      alert("Password Reset Failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 grid-mesh text-slate-100 flex flex-col items-center justify-center p-6 relative">
      {/* Decorative Blur Background nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Back button */}
      <Link href="/" className="absolute top-8 left-8 text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
        <ChevronLeft size={16} /> Back Home
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            Ω
          </div>
          <span className="text-2xl font-bold tracking-tight text-white mt-2">
            Twin<span className="text-blue-500">IQ</span>
          </span>
          <p className="text-xs text-slate-400">Silicon Valley Enterprise Digital Twin Engine</p>
        </div>

        {forgotPassword ? (
          <Card className="border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <KeyRound className="text-purple-400" /> Reset Password
              </CardTitle>
              <CardDescription>Enter your email and we'll send you a virtual reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              {forgotSent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                    ✓
                  </div>
                  <h4 className="text-md font-bold text-white mb-2">Check Your Inbox</h4>
                  <p className="text-sm text-slate-400 mb-6">We sent a mock reset link to {forgotEmail}.</p>
                  <Button variant="secondary" className="w-full" onClick={() => { setForgotPassword(false); setForgotSent(false); }}>
                    Return to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-sm text-white"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : "Send Reset Link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPassword(false)}
                    className="text-xs text-slate-400 hover:text-white block text-center mx-auto mt-4 transition-colors"
                  >
                    Back to login
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <CardHeader className="text-center">
              <div className="grid grid-cols-2 bg-slate-900/60 border border-slate-800/80 rounded-full p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    !isSignUp ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isSignUp ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <CardTitle className="text-xl font-bold">
                {isSignUp ? "Begin Your Digital Twin" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUp ? "Instantiate a replica model for your business." : "Connect to your operational twin dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-semibold text-slate-300">Company Name</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Malhotra Logistics"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin mr-2" />
                  ) : isSignUp ? (
                    "Instantiate Twin"
                  ) : (
                    "Enter Portal"
                  )}
                </Button>

                <div className="relative my-6 flex items-center justify-center">
                  <span className="absolute inset-x-0 h-px bg-slate-800" />
                  <span className="relative z-10 px-3 bg-navy-950 text-slate-500 text-xs font-semibold">OR</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-400">
        <RefreshCw size={24} className="animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
