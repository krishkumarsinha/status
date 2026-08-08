"use client";

import { useEffect, useState } from "react";
import { Activity, Sparkles, ShieldCheck, Zap } from "lucide-react";

const LOADING_MOTTOES = [
  "Initializing your personal health & habit telemetry...",
  "Synchronizing secure cloud memory records...",
  "Preparing daily analytics and reflection insights...",
  "Calibrating your personal wellness dashboard...",
];

export function CreativeLoading({ message }: { message?: string }) {
  const [mottoIndex, setMottoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMottoIndex((prev) => (prev + 1) % LOADING_MOTTOES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden p-6 select-none">
      {/* 1. Ambient Mesh Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse pointer-events-none duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Glassmorphic Central Card */}
      <div className="relative z-10 max-w-sm w-full p-8 rounded-lg bg-card/60 backdrop-blur-2xl border border-border/60 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Animated Glowing Ring & Icon */}
        <div className="relative flex items-center justify-center">
          {/* Outer Spin Ring */}
          <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-amber-600 border-b-amber-500 animate-spin" />
          
          {/* Inner Glow Badge */}
          <div className="absolute w-14 h-14 rounded-lg bg-gradient-to-tr from-primary/20 via-amber-600/20 to-amber-500/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 animate-pulse">
            <Activity className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Self Tracker</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-foreground">
            Personal Dashboard
          </h3>
        </div>

        {/* Dynamic Animated Status Text */}
        <div className="min-h-[40px] flex items-center justify-center">
          <p className="text-xs font-medium text-muted-foreground animate-in fade-in duration-300">
            {message || LOADING_MOTTOES[mottoIndex]}
          </p>
        </div>

        {/* Progress Loading Bar */}
        <div className="w-full space-y-1">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-primary via-amber-600 to-amber-500 rounded-full w-2/3 animate-pulse" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted Cloud Sync
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Zap className="w-3 h-3 text-amber-500" /> Real-Time Telemetry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
