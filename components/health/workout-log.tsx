"use client";

import { useState, useEffect, useMemo } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Dumbbell, Activity, Timer } from "lucide-react";

export function WorkoutLog() {
  const { entries } = useHealthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const workouts = useMemo(() => {
    if (!mounted) return [];
    
    return entries
      .filter((e) => e.workout !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [entries, mounted]);

  if (!mounted) return null;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
        <CardDescription>Your last 10 workout sessions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {workouts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
            <Dumbbell className="w-12 h-12 opacity-20" />
            <p>No workouts recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((entry) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-md">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{entry.workout!.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                  <Timer className="w-3 h-3 mr-1" />
                  {entry.workout!.durationMinutes} min
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
