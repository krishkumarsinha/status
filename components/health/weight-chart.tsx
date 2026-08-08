"use client";

import { useState, useEffect, useMemo } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";

export function WeightChart() {
  const { getEntriesByRange } = useHealthStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<30 | 90 | 365>(30);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!mounted) return [];
    
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const entries = getEntriesByRange(startDate, endDate)
      .filter((e) => e.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isImperial = settings.unitSystem === "imperial";

    return entries.map((entry) => {
      let weight = entry.weight!;
      if (isImperial) {
        weight = weight * 2.20462;
      }
      
      return {
        date: format(parseISO(entry.date), "MMM d"),
        weight: parseFloat(weight.toFixed(1)),
        fullDate: entry.date,
      };
    });
  }, [mounted, days, getEntriesByRange, settings.unitSystem]);

  if (!mounted) return null;

  const isImperial = settings.unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Your weight over time</CardDescription>
        </div>
        <div className="flex space-x-1">
          <Button
            variant={days === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(30)}
            className="h-7 text-xs"
          >
            30d
          </Button>
          <Button
            variant={days === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(90)}
            className="h-7 text-xs"
          >
            90d
          </Button>
          <Button
            variant={days === 365 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(365)}
            className="h-7 text-xs"
          >
            1y
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No weight data recorded in this period.
          </div>
        ) : (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  dy={10}
                />
                <YAxis 
                  domain={["auto", "auto"]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  dx={-10}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {payload[0].payload.fullDate}
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value} {weightUnit}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary, #3b82f6)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  activeDot={{ r: 6, fill: "var(--color-primary, #3b82f6)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
