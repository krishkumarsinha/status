"use client";

import { useEffect, useState, useMemo } from "react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend
} from "recharts";
import { useMoodStore } from "@/lib/stores/mood-store";
import { MOOD_EMOJIS, MoodEntry } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MoodChart() {
  const entries = useMoodStore((state) => state.entries);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!entries.length) return [];
    
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29); // 30 days total
    
    const data = [];
    
    // Generate an entry for every day in the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const entryForDay = entries.find(e => e.date === dateStr);
      
      data.push({
        date: dateStr,
        displayDate: format(date, "MMM d"),
        moodScore: entryForDay?.moodScore || null,
        energyLevel: entryForDay?.energyLevel || null,
      });
    }
    
    return data;
  }, [entries]);

  if (!isMounted) {
    return <Card className="w-full h-[400px] animate-pulse bg-muted/50" />;
  }

  if (entries.length === 0) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6 text-center">
        <div className="text-4xl mb-4">📈</div>
        <p>No mood data yet.</p>
        <p className="text-sm">Check in today to start seeing your trends!</p>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moodScore = payload[0]?.value;
      const energyLevel = payload[1]?.value;
      const emoji = moodScore ? MOOD_EMOJIS[moodScore as keyof typeof MOOD_EMOJIS]?.emoji : "";
      const moodLabel = moodScore ? MOOD_EMOJIS[moodScore as keyof typeof MOOD_EMOJIS]?.label : "";
      
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {moodScore && (
            <p className="text-sm text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              Mood: {moodLabel} ({moodScore}/5)
            </p>
          )}
          {energyLevel && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
              Energy: {energyLevel}/5
            </p>
          )}
          {!moodScore && !energyLevel && <p className="text-sm text-muted-foreground">No data</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Mood & Energy Trends</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                minTickGap={20}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              
              <Area 
                type="monotone" 
                dataKey="moodScore" 
                name="Mood"
                stroke="var(--color-primary, #3b82f6)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMood)" 
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="energyLevel" 
                name="Energy"
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
