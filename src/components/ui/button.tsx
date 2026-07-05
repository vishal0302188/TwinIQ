"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  glowing?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  glowing = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 active:scale-95 cursor-pointer relative",
        
        // Sizes
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-base",

        // Variants
        variant === "primary" && "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] border border-white/10",
        variant === "secondary" && "bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-slate-700/60",
        variant === "outline" && "bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-900/40",
        variant === "ghost" && "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/40",
        variant === "danger" && "bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/50 hover:text-red-200",

        glowing && variant === "primary" && "glow-border-blue animate-pulse-slow",
        className
      )}
      {...props}
    >
      {/* Glow highlight for primary buttons */}
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
