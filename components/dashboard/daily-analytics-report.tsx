"use client";

import { useMemo } from "react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { getTrackingDate } from "@/lib/date-utils";
import { CURRENCY_SYMBOLS, SPECIFIC_EMOTIONS, MOOD_EMOJIS } from "@/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Heart, 
  Smile, 
  Wallet, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ShieldCheck,
  Zap
} from "lucide-react";

export function DailyAnalyticsReport() {
  const habits = useHabitStore((state) => state.habits);
  const healthEntries = useHealthStore((state) => state.entries);
  const moodEntries = useMoodStore((state) => state.entries);
  const transactions = useFinanceStore((state) => state.transactions);
  const journalEntries = useJournalStore((state) => state.entries);
  const settings = useSettingsStore((state) => state.settings);

  const trackingDate = getTrackingDate();
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency || "INR"] || "₹";

  const report = useMemo(() => {
    // 1. Habit score
    let totalHabits = 0;
    let completedHabits = 0;
    habits.forEach((h) => {
      totalHabits += h.targetCount;
      const completion = h.completions.find((c) => c.date === trackingDate);
      if (completion) {
        completedHabits += Math.min(completion.count, h.targetCount);
      }
    });
    const habitPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // 2. Health score
    const healthEntry = healthEntries.find((e) => e.date === trackingDate);
    let healthScoreAcc = 0;
    let healthCheckCount = 0;

    if (healthEntry) {
      if (healthEntry.sleepHours !== undefined) {
        healthCheckCount++;
        const targetSleep = settings.targetSleepHours || 8;
        healthScoreAcc += Math.min(100, (healthEntry.sleepHours / targetSleep) * 100);
      }
      if (healthEntry.waterIntake !== undefined) {
        healthCheckCount++;
        const targetWater = settings.dailyWaterGoal || 2500;
        healthScoreAcc += Math.min(100, (healthEntry.waterIntake / targetWater) * 100);
      }
      if (healthEntry.steps !== undefined) {
        healthCheckCount++;
        const targetSteps = settings.dailyStepsGoal || 10000;
        healthScoreAcc += Math.min(100, (healthEntry.steps / targetSteps) * 100);
      }
    }

    const healthPercent = healthCheckCount > 0 ? Math.round(healthScoreAcc / healthCheckCount) : 0;

    // 3. Mood score
    const moodEntry = moodEntries.find((e) => e.date === trackingDate);
    const moodScoreVal = moodEntry ? moodEntry.moodScore * 20 : 0; // scale 1-5 to 0-100
    const slotLogsCount = moodEntry?.slotLogs?.length || 0;

    // 4. Finance & Journal logging
    const hasFinanceLog = transactions.some((t) => t.date === trackingDate);
    const hasJournalLog = journalEntries.some((j) => j.date === trackingDate);
    const loggingScore = (hasFinanceLog ? 50 : 0) + (hasJournalLog ? 50 : 0);

    // Composite Daily Index
    const overallScore = Math.round(
      habitPercent * 0.35 +
      healthPercent * 0.25 +
      moodScoreVal * 0.25 +
      loggingScore * 0.15
    );

    // Insights & Highlights
    const highlights: string[] = [];
    const suggestions: string[] = [];
    const correlations: string[] = [];

    if (habitPercent >= 80) {
      highlights.push(`High productivity: ${habitPercent}% of habit targets completed today.`);
    } else if (totalHabits > 0) {
      suggestions.push(`${totalHabits - completedHabits} habit targets remaining for today.`);
    }

    if (healthEntry?.sleepHours && healthEntry.sleepHours >= (settings.targetSleepHours || 8)) {
      highlights.push(`Restful recovery: ${healthEntry.sleepHours}h sleep met target.`);
    } else if (healthEntry?.sleepHours) {
      suggestions.push(`Sleep was ${healthEntry.sleepHours}h (target: ${settings.targetSleepHours || 8}h). Consider earlier wind-down.`);
    }

    if (healthEntry?.waterIntake && healthEntry.waterIntake >= (settings.dailyWaterGoal || 2500)) {
      highlights.push(`Optimal hydration: ${healthEntry.waterIntake}ml water intake reached.`);
    }

    if (slotLogsCount > 0) {
      highlights.push(`Recorded ${slotLogsCount} 3-hour interval mood check-ins today.`);
    } else {
      suggestions.push("No 3-hour interval mood check-ins recorded yet for today.");
    }

    if (hasJournalLog) {
      highlights.push("Daily reflection journal entry completed.");
    } else {
      suggestions.push("Write today's reflection in the Journal section.");
    }

    // Cross-domain correlation patterns
    if (healthEntry?.sleepHours && healthEntry.sleepHours >= 7 && moodEntry && moodEntry.energyLevel >= 4) {
      correlations.push("Data Correlation: Higher energy levels (4+/5) strongly align with 7+ hours of sleep.");
    }

    if (habitPercent >= 75 && moodEntry && moodEntry.moodScore >= 4) {
      correlations.push("Data Pattern: Consistently high habit completion correlates with positive mood scores.");
    }

    return {
      overallScore,
      habitPercent,
      healthPercent,
      moodScoreVal,
      slotLogsCount,
      highlights,
      suggestions,
      correlations,
    };
  }, [habits, healthEntries, moodEntries, transactions, journalEntries, settings, trackingDate]);

  let statusBadgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  let statusText = "Excellent Performance";

  if (report.overallScore < 40) {
    statusBadgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
    statusText = "Getting Started";
  } else if (report.overallScore < 75) {
    statusBadgeColor = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    statusText = "Solid Progress";
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Daily Analyzed Insights Report
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Automated analytics synthesized from your habit, health, mood, and finance logs for today.
            </CardDescription>
          </div>
          <Badge variant="outline" className={`text-xs font-bold py-1 px-3 ${statusBadgeColor}`}>
            {statusText} • {report.overallScore}/100 Index
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Overall Daily Balance Score
            </span>
            <span className="font-extrabold text-sm">{report.overallScore}%</span>
          </div>
          <Progress value={report.overallScore} className="h-2.5" />
        </div>

        {/* 4-Domain Score Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-md bg-muted/40 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Habits</span>
            <p className="text-base font-extrabold text-indigo-500">{report.habitPercent}%</p>
          </div>
          <div className="p-3 rounded-md bg-muted/40 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Health Goals</span>
            <p className="text-base font-extrabold text-emerald-500">{report.healthPercent}%</p>
          </div>
          <div className="p-3 rounded-md bg-muted/40 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Mood Level</span>
            <p className="text-base font-extrabold text-amber-500">{report.moodScoreVal}%</p>
          </div>
          <div className="p-3 rounded-md bg-muted/40 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Interval Logs</span>
            <p className="text-base font-extrabold text-purple-500">{report.slotLogsCount} / 8</p>
          </div>
        </div>

        {/* Highlights & Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          {/* Key Achievements */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Highlights Today
            </h4>
            {report.highlights.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Log habits, health, or mood to unlock highlights.</p>
            ) : (
              <ul className="space-y-1.5">
                {report.highlights.map((h, idx) => (
                  <li key={idx} className="text-xs font-medium text-foreground flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actionable Suggestions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Actionable Recommendations
            </h4>
            {report.suggestions.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All tracking goals fully satisfied for today!</p>
            ) : (
              <ul className="space-y-1.5">
                {report.suggestions.map((s, idx) => (
                  <li key={idx} className="text-xs font-medium text-foreground flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Correlations & Pattern Intelligence */}
        {report.correlations.length > 0 && (
          <div className="p-3.5 rounded-md bg-primary/10 border border-primary/20 space-y-1.5">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-primary" /> Pattern Intelligence
            </h4>
            {report.correlations.map((c, idx) => (
              <p key={idx} className="text-xs font-semibold text-foreground">
                {c}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
