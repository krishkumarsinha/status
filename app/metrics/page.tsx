"use client";

import { useState, useEffect } from "react";
import { format, subDays, addDays, parseISO } from "date-fns";

import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useSettingsStore } from "@/lib/stores/settings-store";

import { MOOD_EMOJIS, MoodScore, EnergyLevel, CURRENCY_SYMBOLS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Target, 
  Heart, 
  Smile, 
  Wallet, 
  BookOpen,
  Plus,
  Flame,
  Scale,
  Moon,
  Droplets,
  Footprints,
  Sparkles,
  Lock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getTrackingDate, isDateLocked } from "@/lib/date-utils";

export default function DailyMetricsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTrackingDate());

  // Store hooks
  const habits = useHabitStore((state) => state.habits);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const getStreak = useHabitStore((state) => state.getStreak);

  const healthEntries = useHealthStore((state) => state.entries);
  const addHealthEntry = useHealthStore((state) => state.addEntry);

  const moodEntries = useMoodStore((state) => state.entries);
  const addMoodEntry = useMoodStore((state) => state.addEntry);

  const transactions = useFinanceStore((state) => state.transactions);
  const journalEntries = useJournalStore((state) => state.entries);
  const settings = useSettingsStore((state) => state.settings);

  const currencySymbol = CURRENCY_SYMBOLS[settings.currency || "INR"] || "₹";

  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [steps, setSteps] = useState("");

  const loadHabits = useHabitStore((state) => state.loadHabits);
  const loadHealth = useHealthStore((state) => state.loadHealth);
  const loadMood = useMoodStore((state) => state.loadMood);
  const loadFinances = useFinanceStore((state) => state.loadFinances);
  const loadJournal = useJournalStore((state) => state.loadJournal);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    setMounted(true);
    loadHabits();
    loadHealth();
    loadMood();
    loadFinances();
    loadJournal();
    loadSettings();
  }, [loadHabits, loadHealth, loadMood, loadFinances, loadJournal, loadSettings]);

  useEffect(() => {
    const entry = healthEntries.find((e) => e.date === selectedDate);
    setWeight(entry?.weight?.toString() || "");
    setSleep(entry?.sleepHours?.toString() || "");
    setWater(entry?.waterIntake?.toString() || "");
    setSteps(entry?.steps?.toString() || "");
  }, [selectedDate, healthEntries]);

  if (!mounted) return null;

  // Selected date parsed
  const currentTrackingDate = getTrackingDate();
  const dateObj = parseISO(selectedDate);
  const isToday = selectedDate === currentTrackingDate;
  const isLocked = isDateLocked(selectedDate, currentTrackingDate);

  const changeDate = (days: number) => {
    const next = days > 0 ? addDays(dateObj, days) : subDays(dateObj, Math.abs(days));
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  // 1. Habits for selected date
  const habitsCompletedCount = habits.filter((h) =>
    h.completions.some((c) => c.date === selectedDate && c.count >= h.targetCount)
  ).length;

  // 2. Health entry for selected date
  const currentHealth = healthEntries.find((e) => e.date === selectedDate);

  const saveHealthMetric = () => {
    addHealthEntry({
      date: selectedDate,
      weight: weight ? parseFloat(weight) : undefined,
      sleepHours: sleep ? parseFloat(sleep) : undefined,
      waterIntake: water ? parseInt(water) : undefined,
      steps: steps ? parseInt(steps) : undefined,
    });
  };

  // 3. Mood for selected date
  const currentMood = moodEntries.find((e) => e.date === selectedDate);

  const saveMoodMetric = (score: MoodScore) => {
    addMoodEntry({
      date: selectedDate,
      moodScore: score,
      energyLevel: currentMood?.energyLevel || 3,
      tags: currentMood?.tags || [],
      note: currentMood?.note,
    });
  };

  // 4. Transactions for selected date
  const dayTransactions = transactions.filter((tx) => tx.date === selectedDate);
  const dayExpenseTotal = dayTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 5. Journal entry for selected date
  const currentJournal = journalEntries.find((e) => e.date === selectedDate);

  // Daily Completion Calculation
  const domainsLogged = [
    habits.length > 0 && habitsCompletedCount > 0,
    !!currentHealth && (currentHealth.weight || currentHealth.sleepHours || currentHealth.waterIntake || currentHealth.steps),
    !!currentMood,
    dayTransactions.length > 0,
    !!currentJournal,
  ].filter(Boolean).length;

  const totalPossibleDomains = 5;
  const completionPercentage = Math.round((domainsLogged / totalPossibleDomains) * 100);

  return (
    <div className="space-y-6">
      {/* Top Controls & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daily Metrics</h1>
            {isToday && (
              <Badge variant="default" className="text-xs">
                Active Day
              </Badge>
            )}
            {isLocked && (
              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 font-semibold">
                <Lock className="w-3 h-3" /> Locked Entry (Read Only)
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(dateObj, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="h-9 text-xs w-[140px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => changeDate(1)} disabled={isToday}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Daily Progress Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {completionPercentage}%
            </div>
            <div>
              <h3 className="font-semibold text-base">Daily Check-in Completion</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {domainsLogged} of {totalPossibleDomains} tracking domains logged for this day
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Grid of Domain Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. HABITS SNAPSHOT */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Target className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">Habits ({habitsCompletedCount}/{habits.length})</CardTitle>
            </div>
            <Link href="/habits" className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}>
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 pt-0">
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No habits added yet.</p>
            ) : (
              habits.map((habit) => {
                const isCompleted = habit.completions.some(
                  (c) => c.date === selectedDate && c.count >= habit.targetCount
                );
                const streak = getStreak(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleCompletion(habit.id, selectedDate)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isCompleted ? "bg-primary text-primary-foreground" : "border border-border"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </span>
                    </div>
                    {streak > 0 && (
                      <span className="text-xs font-semibold text-orange-500 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" /> {streak}d
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* 2. MOOD & ENERGY SNAPSHOT */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Smile className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">Mood Log</CardTitle>
            </div>
            <Link href="/mood" className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}>
              Detailed Log
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-4 pt-0">
            <p className="text-xs text-muted-foreground">Select mood score for this day:</p>
            <div className="flex items-center justify-around">
              {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                const isSelected = currentMood?.moodScore === score;
                return (
                  <button
                    key={score}
                    onClick={() => saveMoodMetric(score)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-amber-500/15 ring-2 ring-amber-500 scale-110"
                        : "hover:bg-muted/80 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {score}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {MOOD_EMOJIS[score].label}
                    </span>
                  </button>
                );
              })}
            </div>
            {currentMood && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-xs flex items-center justify-between">
                <span>Energy Level: <strong>{currentMood.energyLevel * 20}%</strong></span>
                {currentMood.tags.length > 0 && (
                  <span className="text-muted-foreground">{currentMood.tags.join(", ")}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. HEALTH METRICS QUICK FORM */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Heart className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">Health Stats</CardTitle>
            </div>
            <Button size="xs" variant="outline" onClick={saveHealthMetric}>
              Save Health
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                  <Scale className="w-3 h-3 text-blue-500" /> Weight (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                  <Moon className="w-3 h-3 text-indigo-500" /> Sleep (hrs)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 7.5"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                  <Droplets className="w-3 h-3 text-cyan-500" /> Water (ml)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                  <Footprints className="w-3 h-3 text-emerald-500" /> Steps
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. FINANCES & JOURNAL SNAPSHOT */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Wallet className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">Finances & Journal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Finance Row */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Daily Expenses</p>
                <p className="text-lg font-bold text-destructive mt-0.5">
                  -{currencySymbol}{dayExpenseTotal.toLocaleString()}
                </p>
              </div>
              <Link href="/finances" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Log Expense
              </Link>
            </div>

            {/* Journal Row */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Daily Reflection</p>
                <p className="text-xs font-semibold text-foreground mt-1 line-clamp-1">
                  {currentJournal?.title || (currentJournal ? "Entry Recorded" : "No entry written yet")}
                </p>
              </div>
              <Link href="/journal" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                <BookOpen className="w-3.5 h-3.5 mr-1" /> {currentJournal ? "Edit Journal" : "Write Entry"}
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
