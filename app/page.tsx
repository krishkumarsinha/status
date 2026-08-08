"use client";

import { useEffect, useState, useMemo } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { 
  CheckCircle2, 
  Droplet, 
  Moon, 
  Smile,
  SmilePlus,
  Sparkles
} from "lucide-react";
import Link from "next/link";

import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { MOOD_EMOJIS } from "@/types";

import { LiveClockCard } from "@/components/dashboard/live-clock-card";
import { DailyAnalyticsReport } from "@/components/dashboard/daily-analytics-report";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StreakSpotlight } from "@/components/dashboard/streak-spotlight";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getTrackingDate } from "@/lib/date-utils";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  
  const habits = useHabitStore((state) => state.habits);
  const healthEntries = useHealthStore((state) => state.entries);
  const getTodayHealth = useHealthStore((state) => state.getTodayEntry);
  const moodEntries = useMoodStore((state) => state.entries);
  const getTodayMood = useMoodStore((state) => state.getTodayEntry);
  const settings = useSettingsStore((state) => state.settings);

  const loadHabits = useHabitStore((state) => state.loadHabits);
  const loadHealth = useHealthStore((state) => state.loadHealth);
  const loadMood = useMoodStore((state) => state.loadMood);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    setMounted(true);
    loadHabits();
    loadHealth();
    loadMood();
    loadSettings();
  }, [loadHabits, loadHealth, loadMood, loadSettings]);

  const todayStr = getTrackingDate();

  const { greeting, formattedDate } = useMemo(() => {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    return {
      greeting,
      formattedDate: format(new Date(), "EEEE, MMMM do"),
    };
  }, []);

  const stats = useMemo(() => {
    let totalHabitTargets = 0;
    let completedHabits = 0;
    
    habits.forEach(habit => {
      totalHabitTargets += habit.targetCount;
      const todayCompletion = habit.completions.find(c => c.date === todayStr);
      if (todayCompletion) {
        completedHabits += Math.min(todayCompletion.count, habit.targetCount);
      }
    });

    const habitProgress = totalHabitTargets > 0 ? Math.round((completedHabits / totalHabitTargets) * 100) : 0;

    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    }).map(d => format(d, "yyyy-MM-dd"));

    let totalSleep = 0;
    let sleepDays = 0;
    let totalWater = 0;
    let waterDays = 0;

    last7Days.forEach(date => {
      const entry = healthEntries.find(e => e.date === date);
      if (entry) {
        if (entry.sleepHours !== undefined) {
          totalSleep += entry.sleepHours;
          sleepDays++;
        }
        if (entry.waterIntake !== undefined) {
          totalWater += entry.waterIntake;
          waterDays++;
        }
      }
    });

    const avgSleep = sleepDays > 0 ? (totalSleep / sleepDays).toFixed(1) : 0;
    
    const isImperial = settings.unitSystem === "imperial";
    const avgWaterMl = waterDays > 0 ? (totalWater / waterDays) : 0;
    
    let avgWaterStr = "0";
    let waterUnit = "ml";
    
    if (isImperial) {
      avgWaterStr = (avgWaterMl * 0.033814).toFixed(0);
      waterUnit = "oz";
    } else {
      if (avgWaterMl > 1000) {
        avgWaterStr = (avgWaterMl / 1000).toFixed(1);
        waterUnit = "L";
      } else {
        avgWaterStr = Math.round(avgWaterMl).toString();
      }
    }

    return {
      habits: {
        completed: completedHabits,
        total: totalHabitTargets,
        progress: habitProgress,
      },
      sleep: {
        avg: avgSleep,
      },
      water: {
        avg: avgWaterStr,
        unit: waterUnit,
      }
    };
  }, [habits, healthEntries, todayStr, settings.unitSystem]);

  const todayMood = getTodayMood();

  if (!mounted) {
    return <div className="p-8 space-y-6 animate-pulse opacity-50">
      <div className="h-10 w-64 bg-muted rounded"></div>
      <div className="h-6 w-48 bg-muted rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
      </div>
      <div className="h-96 bg-muted rounded-xl"></div>
    </div>;
  }

  const isNewUser = habits.length === 0 && healthEntries.length === 0 && moodEntries.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Live Real-Time Digital Clock & Date */}
      <LiveClockCard />

      {/* Welcome banner for new users */}
      {isNewUser ? (
        <Card className="border-dashed border-2 bg-card/50">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <SmilePlus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to your Self Tracker</h2>
            <p className="text-muted-foreground max-w-md text-sm">
              Start building better habits, tracking your mood, and monitoring your health to see your progress over time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/habits" className={cn(buttonVariants())}>Add First Habit</Link>
              <Link href="/settings" className={cn(buttonVariants({ variant: 'outline' }))}>Configure Settings</Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 2. Automated Daily Analyzed Report */}
          <DailyAnalyticsReport />

          {/* 3. Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Habit Progress Card */}
            <Card className="hover:shadow-xs transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Habits Today</p>
                    <div className="text-2xl font-extrabold mt-1">
                      {stats.habits.completed} / {stats.habits.total}
                    </div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <Progress value={stats.habits.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {stats.habits.progress}% completed
                </p>
              </CardContent>
            </Card>

            {/* Mood Card */}
            <Card className="hover:shadow-xs transition-shadow">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                {todayMood ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Smile className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Mood</p>
                      <p className="text-lg font-extrabold">{MOOD_EMOJIS[todayMood.moodScore].label}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center justify-center h-full space-y-2 py-1">
                    <p className="text-xs text-muted-foreground font-medium">How are you feeling?</p>
                    <Link href="/mood" className={cn(buttonVariants({ variant: 'secondary', size: 'xs' }))}>Log Mood</Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sleep Stats */}
            <StatsCard
              title="Sleep Avg (7d)"
              value={`${stats.sleep.avg} hrs`}
              subtitle={`Target: ${settings.targetSleepHours || 8} hrs`}
              icon={Moon}
            />

            {/* Water Stats */}
            <StatsCard
              title="Water Avg (7d)"
              value={`${stats.water.avg} ${stats.water.unit}`}
              subtitle={`Target: ${settings.dailyWaterGoal || 2500} ml`}
              icon={Droplet}
            />
          </div>

          {/* 4. Charts and Spotlight Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <WeeklyChart habits={habits} moodEntries={moodEntries} />
            </div>
            <div>
              <StreakSpotlight habits={habits} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
