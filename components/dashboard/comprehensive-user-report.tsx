"use client";

import { useMemo, useState } from "react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { generateUserDataReport } from "@/lib/analytics-report";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Heart, 
  Smile, 
  Wallet, 
  BookOpen, 
  AlertCircle, 
  Lightbulb, 
  Printer, 
  Zap,
  Activity,
  Award,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function ComprehensiveUserReport() {
  const [isExpanded, setIsExpanded] = useState(true);

  const habits = useHabitStore((state) => state.habits);
  const healthEntries = useHealthStore((state) => state.entries);
  const moodEntries = useMoodStore((state) => state.entries);
  const transactions = useFinanceStore((state) => state.transactions);
  const journalEntries = useJournalStore((state) => state.entries);
  const settings = useSettingsStore((state) => state.settings);

  const report = useMemo(() => {
    return generateUserDataReport(
      habits,
      healthEntries,
      moodEntries,
      transactions,
      journalEntries,
      settings
    );
  }, [habits, healthEntries, moodEntries, transactions, journalEntries, settings]);

  const handlePrint = () => {
    window.print();
  };

  let statusBadgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  let statusLabel = "Thriving Balance";
  if (report.lifeBalanceScore < 40) {
    statusBadgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
    statusLabel = "Active Foundation";
  } else if (report.lifeBalanceScore < 75) {
    statusBadgeColor = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    statusLabel = "Balanced Momentum";
  }

  return (
    <Card className="border-border/60 shadow-xs overflow-hidden transition-all print:border-none print:shadow-none">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                Full Data Intelligence
              </Badge>
              <Badge variant="outline" className={`text-xs font-bold py-0.5 px-2.5 ${statusBadgeColor}`}>
                {statusLabel}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-1.5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Executive User Data Analysis Report
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Comprehensive report synthesized from your Habits, Health, Mood, Finance, and Journal records.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Report
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6 space-y-8">
          {/* Executive Score Spotlight */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 via-card to-muted/40 border border-primary/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Overall Life Balance Score
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-foreground">{report.lifeBalanceScore}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/ 100 Index</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-md bg-card border border-border/50 text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Habit Rate</span>
                  <span className="font-extrabold text-indigo-500">{report.habits.completionRate}%</span>
                </div>
                <div className="p-2.5 rounded-md bg-card border border-border/50 text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Avg Sleep</span>
                  <span className="font-extrabold text-emerald-500">{report.health.avgSleep} hrs</span>
                </div>
                <div className="p-2.5 rounded-md bg-card border border-border/50 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Mood Rating</span>
                  <span className="font-extrabold text-amber-500">{report.mood.dominantScoreLabel}</span>
                </div>
              </div>
            </div>

            <Progress value={report.lifeBalanceScore} className="h-2.5" />
          </div>

          {/* 5-Domain Deep Analysis Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> Domain Performance Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Habits Analytics Card */}
              <div className="p-4 rounded-md bg-card border border-border/60 space-y-3 hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-500">
                    <Target className="w-4 h-4" /> Habits Analytics
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{report.habits.totalHabits} Active</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold">{report.habits.completionRate}%</div>
                  <p className="text-[11px] text-muted-foreground">30-day Target Execution Rate</p>
                </div>
                <div className="pt-2 border-t border-border/40 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total Completions:</span>
                    <span className="font-semibold text-foreground">{report.habits.totalCompletions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Category:</span>
                    <span className="font-semibold text-foreground capitalize">{report.habits.topCategory}</span>
                  </div>
                </div>
              </div>

              {/* 2. Health & Wellness Card */}
              <div className="p-4 rounded-md bg-card border border-border/60 space-y-3 hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-500">
                    <Heart className="w-4 h-4" /> Health & Wellness
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{report.health.totalLoggedDays} Days Logged</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {report.health.avgSleep} <span className="text-sm font-normal text-muted-foreground">hrs sleep avg</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Target: {settings.targetSleepHours || 8} hrs</p>
                </div>
                <div className="pt-2 border-t border-border/40 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Avg Daily Water:</span>
                    <span className="font-semibold text-foreground">{report.health.avgWater} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Daily Steps:</span>
                    <span className="font-semibold text-foreground">{report.health.avgSteps.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3. Mood & Emotional State Card */}
              <div className="p-4 rounded-md bg-card border border-border/60 space-y-3 hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                    <Smile className="w-4 h-4" /> Mood Stability
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{report.mood.totalMoodEntries} Logs</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    {report.mood.avgScore} <span className="text-sm font-normal text-muted-foreground">/ 5 Rating</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Dominant Feeling: {report.mood.dominantScoreLabel}</p>
                </div>
                <div className="pt-2 border-t border-border/40 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Interval Check-ins:</span>
                    <span className="font-semibold text-foreground">{report.mood.totalSlotLogs} slots</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stability Index:</span>
                    <span className="font-semibold text-foreground">
                      {report.mood.avgScore >= 3.5 ? "High" : report.mood.avgScore > 0 ? "Moderate" : "Pending Data"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Financial Health Card */}
              <div className="p-4 rounded-md bg-card border border-border/60 space-y-3 hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-blue-500">
                    <Wallet className="w-4 h-4" /> Financial Summary
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{report.finances.currencySymbol}</Badge>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-extrabold ${report.finances.netBalance >= 0 ? "text-foreground" : "text-destructive"}`}>
                    {report.finances.currencySymbol}{report.finances.netBalance.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Monthly Net Savings</p>
                </div>
                <div className="pt-2 border-t border-border/40 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Income / Expenses:</span>
                    <span className="font-semibold text-foreground">
                      +{report.finances.currencySymbol}{report.finances.totalIncome.toLocaleString()} / -{report.finances.currencySymbol}{report.finances.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Adherence:</span>
                    <span className="font-semibold text-foreground">{report.finances.budgetAdherence}%</span>
                  </div>
                </div>
              </div>

              {/* 5. Journal Reflections Card */}
              <div className="p-4 rounded-md bg-card border border-border/60 space-y-3 hover:shadow-xs transition-shadow lg:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-purple-500">
                    <BookOpen className="w-4 h-4" /> Mindful Reflections & Memory Book
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{report.journal.totalEntries} Memories</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                      {report.journal.totalWordCount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">words</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Total Journal Volume</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-extrabold text-foreground">
                      {report.journal.bookmarkedCount} <span className="text-sm font-normal text-muted-foreground">bookmarked</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Saved Favorite Reflections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Key Insights & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            {/* Key Positive Insights */}
            <div className="p-4 rounded-md bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Synthesized Strengths & Success Patterns
              </h4>
              {report.aiInsights.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Keep logging data to unlock positive pattern insights.</p>
              ) : (
                <ul className="space-y-1.5">
                  {report.aiInsights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Targeted Recommendations */}
            <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/10 space-y-2">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Actionable Recommendations
              </h4>
              {report.recommendations.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All tracking metrics are performing at target!</p>
              ) : (
                <ul className="space-y-1.5">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
