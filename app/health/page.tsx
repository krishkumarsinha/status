"use client";

import { useEffect } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { HealthForm } from "@/components/health/health-form";
import { WeightChart } from "@/components/health/weight-chart";
import { SleepChart } from "@/components/health/sleep-chart";
import { WaterRing } from "@/components/health/water-ring";
import { WorkoutLog } from "@/components/health/workout-log";
import { FoldText } from "@/components/ui/fold-text";

export default function HealthPage() {
  const loadHealth = useHealthStore((state) => state.loadHealth);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight"><FoldText text="Health Dashboard" splitBy="char" trigger="mount" fontSize="inherit" fontWeight={700} /></h1>
        <p className="text-muted-foreground">
          Track your weight, sleep, hydration, and workouts.
        </p>
      </div>

      <section>
        <HealthForm />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeightChart />
        <SleepChart />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WaterRing />
        <WorkoutLog />
      </section>
    </div>
  );
}
