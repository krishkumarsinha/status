"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit } from "@/types";
import { Flame, Trophy } from "lucide-react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useMemo } from "react";

interface StreakSpotlightProps {
  habits: Habit[];
}

export function StreakSpotlight({ habits }: StreakSpotlightProps) {
  const getStreak = useHabitStore((state) => state.getStreak);

  const bestStreak = useMemo((): { habit: Habit; streak: number } | null => {
    if (!habits.length) return null;

    let maxStreak = 0;
    let bestHabit: Habit | null = null;

    habits.forEach((habit) => {
      const streak = getStreak(habit.id);
      if (streak >= maxStreak) {
        maxStreak = streak;
        bestHabit = habit;
      }
    });

    if (maxStreak === 0 || !bestHabit) return null;

    return { habit: bestHabit as Habit, streak: maxStreak };
  }, [habits, getStreak]);

  if (!bestStreak) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Trophy className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg text-muted-foreground mb-2">No active streaks</h3>
        <p className="text-sm text-muted-foreground">Complete a habit today to start your streak!</p>
      </Card>
    );
  }

  const { habit, streak } = bestStreak;
  
  let message = "Keep it up!";
  if (streak > 30) message = "Unstoppable!";
  else if (streak > 14) message = "Incredible momentum!";
  else if (streak > 7) message = "You're on fire!";
  else if (streak > 3) message = "Great start!";

  return (
    <Card className="h-full overflow-hidden relative group bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/40 dark:to-rose-950/40 border-orange-200 dark:border-orange-900/50">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <Flame className="w-4 h-4" />
          Longest Streak
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-baseline justify-center gap-2 mb-2 relative">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 animate-pulse-slow">
              {streak}
            </span>
            <Flame className="w-8 h-8 text-orange-500 fill-current animate-bounce-slow" />
          </div>
          
          <h3 className="text-xl font-bold text-center mt-2">{habit.name}</h3>
          <span className="text-xs uppercase tracking-wider font-semibold text-orange-600/70 dark:text-orange-400/70 mt-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
            {habit.category}
          </span>
          
          <p className="text-sm text-center text-muted-foreground mt-4 font-medium">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
