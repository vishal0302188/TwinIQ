"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "blue" | "green" | "purple" | "default";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        variant === "green" && "glass-card-green",
        variant === "purple" && "glass-card-purple",
        className
      )}
      {...props}
    >
      {/* Decorative gradient corners */}
      <div 
        className={cn(
          "absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px] opacity-10 transition-opacity duration-500 pointer-events-none",
          variant === "blue" && "bg-blue-500",
          variant === "green" && "bg-emerald-500",
          variant === "purple" && "bg-purple-500",
          variant === "default" && "bg-blue-600"
        )}
      />
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-400", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}
