"use client";

import { useEffect, useState, useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useMoodStore } from "@/lib/stores/mood-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TagChart() {
  const entries = useMoodStore((state) => state.entries);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!entries.length) return [];
    
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);
    
    // Filter entries from last 30 days
    const recentEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= thirtyDaysAgo;
    });
    
    // Count tags
    const tagCounts: Record<string, number> = {};
    
    recentEntries.forEach(entry => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
  }, [entries]);

  if (!isMounted) {
    return <Card className="w-full h-[400px] animate-pulse bg-muted/50" />;
  }

  if (entries.length === 0 || chartData.length === 0) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6 text-center">
        <div className="text-4xl mb-4">🏷️</div>
        <p>No tags used yet.</p>
        <p className="text-sm">Select tags during your mood check-in to see what affects you.</p>
      </Card>
    );
  }

  // Pre-defined colors for bars to make it colorful
  const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-md">
          <p className="font-medium capitalize mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-bold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Top Mood Tags</CardTitle>
        <CardDescription>Last 30 days frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                hide 
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
