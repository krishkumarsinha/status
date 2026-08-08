"use client";

import { useMemo } from "react";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Habit, MoodEntry } from "@/types";

interface WeeklyChartProps {
  habits: Habit[];
  moodEntries: MoodEntry[];
}

export function WeeklyChart({ habits, moodEntries }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return last7Days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      
      // Calculate Habit Completion %
      let habitCompletionPercent = 0;
      if (habits.length > 0) {
        let totalTargets = 0;
        let totalCompleted = 0;
        
        habits.forEach(habit => {
          // Simplified: assume all habits are expected daily for this chart
          totalTargets += habit.targetCount;
          const completion = habit.completions.find(c => c.date === dateStr);
          if (completion) {
            totalCompleted += Math.min(completion.count, habit.targetCount);
          }
        });
        
        habitCompletionPercent = totalTargets > 0 ? (totalCompleted / totalTargets) * 100 : 0;
      }

      // Calculate Mood Score (scaled to 100)
      const moodEntry = moodEntries.find(m => m.date === dateStr);
      const moodScoreRaw = moodEntry ? moodEntry.moodScore : null;
      const moodScoreScaled = moodScoreRaw !== null ? (moodScoreRaw / 5) * 100 : null;

      return {
        date: format(date, "EEE"),
        fullDate: dateStr,
        habitCompletion: Math.round(habitCompletionPercent),
        moodScore: moodScoreScaled,
        moodRaw: moodScoreRaw,
      };
    });
  }, [habits, moodEntries]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
        <CardDescription>Habits and mood over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val / 20}`} // Convert 100 back to 5
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold", marginBottom: "4px" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((value: any, name: any) => {
                  if (name === "Habit Completion") return [`${value}%`, name];
                  if (name === "Mood Score") return [`${Number(value) / 20} / 5`, name];
                  return [`${value}`, name ?? ""];
                }) as never}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="habitCompletion" 
                name="Habit Completion"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorHabits)" 
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="moodScore" 
                name="Mood Score"
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 0 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
