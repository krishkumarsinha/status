"use client";

import { useState, useEffect, useMemo } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { format, subDays, parseISO, eachDayOfInterval } from "date-fns";

export function SleepChart() {
  const { getEntriesByRange } = useHealthStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!mounted) return [];
    
    const endDate = new Date();
    const startDate = subDays(endDate, 13); // Last 14 days
    
    const entries = getEntriesByRange(startDate, endDate);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const entry = entries.find((e) => e.date === dateStr);
      
      return {
        date: format(day, "EEE"),
        fullDate: dateStr,
        sleepHours: entry?.sleepHours || 0,
      };
    });
  }, [mounted, getEntriesByRange]);

  if (!mounted) return null;

  const targetSleep = settings.targetSleepHours;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sleep Duration</CardTitle>
        <CardDescription>Last 14 days vs {targetSleep}h target</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                dy={10}
              />
              <YAxis 
                domain={[0, Math.max(12, ...data.map(d => d.sleepHours))]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0].payload.fullDate}
                          </span>
                          <span className="font-bold">
                            {val > 0 ? `${val} hours` : "No data"}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={targetSleep} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
              <Bar dataKey="sleepHours" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.sleepHours >= targetSleep ? "#10b981" : "#f59e0b"} // Emerald for good, Amber for below
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
