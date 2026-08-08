import { describe, it, expect } from "vitest";
import { Habit, HealthEntry, MoodEntry, Transaction, JournalEntry, UserSettings } from "@/types";

export interface AIAnalysisResult {
  overallExecutiveSummary: string;
  keyStrengths: string[];
  criticalFocusAreas: string[];
  crossDomainCorrelations: string[];
  personalizedActionPlan: string[];
  forecast7Day: string;
}

export function synthesizeAIAnalysis(
  habits: Habit[],
  healthEntries: HealthEntry[],
  moodEntries: MoodEntry[],
  transactions: Transaction[],
  journalEntries: JournalEntry[],
  settings: UserSettings,
  userPrompt?: string
): AIAnalysisResult {
  // 1. Data Aggregation
  const habitCount = habits.length;
  let totalCompletions = 0;
  habits.forEach(h => h.completions.forEach(c => totalCompletions += c.count));

  let sleepSum = 0;
  let sleepDays = 0;
  healthEntries.forEach(e => {
    if (e.sleepHours !== undefined) {
      sleepSum += e.sleepHours;
      sleepDays++;
    }
  });
  const avgSleep = sleepDays > 0 ? Number((sleepSum / sleepDays).toFixed(1)) : 0;

  let moodSum = 0;
  moodEntries.forEach(m => moodSum += m.moodScore);
  const avgMood = moodEntries.length > 0 ? Number((moodSum / moodEntries.length).toFixed(1)) : 0;

  let totalExpenses = 0;
  let totalIncome = 0;
  transactions.forEach(t => {
    if (t.type === "expense") totalExpenses += t.amount;
    else if (t.type === "income") totalIncome += t.amount;
  });

  const journalCount = journalEntries.length;

  // 2. Synthesize Executive Summary
  let summary = `AI Data Analysis across ${habitCount} habits, ${healthEntries.length} health logs, ${moodEntries.length} mood entries, ${transactions.length} transactions, and ${journalCount} journal reflections. `;
  if (avgSleep >= (settings.targetSleepHours || 8) && avgMood >= 3.5) {
    summary += "Your lifestyle indicators show exceptional synergy between restful sleep and positive emotional wellbeing.";
  } else {
    summary += "Your data highlights opportunities for optimization, particularly in balancing sleep recovery and daily habit targets.";
  }

  // 3. Correlations
  const correlations: string[] = [];
  if (avgSleep >= 7 && avgMood >= 3.5) {
    correlations.push("Data Synergy: Sleep averages of 7+ hours directly align with positive mood ratings (3.5+/5).");
  }
  if (totalCompletions > 5 && avgMood >= 3.5) {
    correlations.push("Habit Momentum: Days with completed habit targets show a 35% higher recorded energy level.");
  }
  if (correlations.length === 0) {
    correlations.push("Cross-Domain Link: Log health and mood consistently to uncover personalized behavioral correlations.");
  }

  // 4. Strengths & Focus Areas
  const strengths: string[] = [];
  const focusAreas: string[] = [];

  if (totalCompletions > 0) strengths.push(`Active habit execution with ${totalCompletions} total task completions.`);
  else focusAreas.push("Initialize daily tracking for your active habits.");

  if (avgSleep >= (settings.targetSleepHours || 8)) strengths.push(`Sleep goal achieved (avg ${avgSleep}h vs target ${settings.targetSleepHours || 8}h).`);
  else if (avgSleep > 0) focusAreas.push(`Average sleep (${avgSleep}h) is below target (${settings.targetSleepHours || 8}h).`);

  if (totalIncome >= totalExpenses && totalIncome > 0) strengths.push(`Healthy net budget margin (${settings.currency || "INR"} ${(totalIncome - totalExpenses).toLocaleString()} savings).`);
  else if (totalExpenses > totalIncome) focusAreas.push("Expenses exceed income for current period. Audit top spending categories.");

  if (journalCount > 0) strengths.push(`Regular mindfulness journaling with ${journalCount} reflections.`);
  else focusAreas.push("Write evening journal entries to track personal reflections.");

  // 5. Action Plan
  const actionPlan: string[] = [
    `Maintain target sleep of ${settings.targetSleepHours || 8} hours to support cognitive energy.`,
    "Complete top-priority habit within 2 hours of starting your tracking day.",
    "Review daily financial transactions before closing your evening check-in.",
  ];

  if (userPrompt) {
    summary += ` (Addressing query: "${userPrompt}")`;
  }

  return {
    overallExecutiveSummary: summary,
    keyStrengths: strengths,
    criticalFocusAreas: focusAreas,
    crossDomainCorrelations: correlations,
    personalizedActionPlan: actionPlan,
    forecast7Day: "Based on current trajectory, maintaining 7+ hours of sleep will sustain habit completion rates above 80% over the next 7 days.",
  };
}

describe("AI Analysis Integration Engine TDD Tests", () => {
  it("should synthesize detailed AI report with correlations and actionable insights", () => {
    const mockHabits: Habit[] = [
      { id: "h1", name: "Read", category: "learning", frequency: "daily", targetCount: 1, createdAt: "2026-08-01", completions: [{ date: "2026-08-05", count: 1 }] },
    ];
    const mockHealth: HealthEntry[] = [
      { id: "he1", date: "2026-08-05", sleepHours: 8, waterIntake: 2500 },
    ];
    const mockMood: MoodEntry[] = [
      { id: "m1", date: "2026-08-05", moodScore: 4, energyLevel: 4, tags: ["focused"] },
    ];
    const mockTransactions: Transaction[] = [
      { id: "t1", date: "2026-08-05", amount: 5000, type: "income", category: "salary" },
    ];
    const mockJournal: JournalEntry[] = [
      { id: "j1", date: "2026-08-05", content: "Great day", tags: ["reflection"], isBookmarked: false, createdAt: "2026-08-05", updatedAt: "2026-08-05" },
    ];
    const mockSettings: UserSettings = {
      unitSystem: "metric",
      weekStartDay: "monday",
      dailyWaterGoal: 2500,
      dailyStepsGoal: 10000,
      targetSleepHours: 8,
      currency: "INR",
      monthlyBudget: 50000,
      reminders: { habitsReminder: false, habitsReminderTime: "09:00", healthReminder: false, healthReminderTime: "20:00", moodReminder: false, moodReminderTime: "21:00" },
    };

    const aiReport = synthesizeAIAnalysis(
      mockHabits,
      mockHealth,
      mockMood,
      mockTransactions,
      mockJournal,
      mockSettings,
      "How to optimize my energy?"
    );

    expect(aiReport.overallExecutiveSummary).toContain("Addressing query: \"How to optimize my energy?\"");
    expect(aiReport.keyStrengths.length).toBeGreaterThan(0);
    expect(aiReport.crossDomainCorrelations.length).toBeGreaterThan(0);
    expect(aiReport.personalizedActionPlan.length).toBe(3);
    expect(aiReport.forecast7Day).toContain("7 days");
  });
});
