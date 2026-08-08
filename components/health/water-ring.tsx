"use client";

import { useState, useEffect } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WaterRing() {
  const { getTodayEntry } = useHealthStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayEntry = getTodayEntry();
  const waterIntake = todayEntry?.waterIntake || 0;
  const isImperial = settings.unitSystem === "imperial";
  
  let currentDisplay = waterIntake;
  let goalDisplay = settings.dailyWaterGoal;

  if (isImperial) {
    currentDisplay = Math.round(waterIntake / 29.5735);
    goalDisplay = Math.round(settings.dailyWaterGoal / 29.5735);
  }

  const percentage = Math.min(100, Math.round((currentDisplay / goalDisplay) * 100)) || 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (mounted) {
      // Animate stroke
      const offset = circumference - (percentage / 100) * circumference;
      setDashOffset(offset);
    }
  }, [mounted, percentage, circumference]);

  if (!mounted) return null;

  const unit = isImperial ? "oz" : "ml";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Water Intake</CardTitle>
        <CardDescription>Today's hydration</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1 py-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#blue-gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold">{percentage}%</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xl font-semibold">
            {currentDisplay} / {goalDisplay} {unit}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
