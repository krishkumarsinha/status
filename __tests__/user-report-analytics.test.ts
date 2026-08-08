import { describe, it, expect } from "vitest";
import { Habit, HealthEntry, MoodEntry, Transaction, JournalEntry, UserSettings } from "@/types";

export interface UserDataReport {
  lifeBalanceScore: number;
  habits: {
    totalHabits: number;
    completionRate: number;
    topCategory: string;
  };
  health: {
    avgSleep: number;
    avgWater: number;
    avgSteps: number;
  };
  mood: {
    avgScore: number;
    dominantScoreLabel: string;
    totalSlotLogs: number;
  };
  finances: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    budgetAdherence: number;
  };
  journal: {
    totalEntries: number;
    totalWordCount: number;
  };
  aiInsights: string[];
}

export function generateUserDataReport(
  habits: Habit[],
  healthEntries: HealthEntry[],
  moodEntries: MoodEntry[],
  transactions: Transaction[],
  journalEntries: JournalEntry[],
  settings: UserSettings
): UserDataReport {
  // 1. Habits calculation
  const totalHabits = habits.length;
  let habitCompletionsCount = 0;
  let totalHabitTargets = 0;
  const categoryCounts: Record<string, number> = {};

  habits.forEach((h) => {
    totalHabitTargets += h.targetCount * 30; // 30 day target
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
    h.completions.forEach((c) => {
      habitCompletionsCount += c.count;
    });
  });

  const habitRate = totalHabitTargets > 0 ? Math.min(100, Math.round((habitCompletionsCount / totalHabitTargets) * 100)) : 0;
  
  let topCategory = "None";
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, cnt]) => {
    if (cnt > maxCatCount) {
      maxCatCount = cnt;
      topCategory = cat;
    }
  });

  // 2. Health calculation
  let sleepSum = 0;
  let sleepCount = 0;
  let waterSum = 0;
  let waterCount = 0;
  let stepsSum = 0;
  let stepsCount = 0;

  healthEntries.forEach((e) => {
    if (e.sleepHours !== undefined) {
      sleepSum += e.sleepHours;
      sleepCount++;
    }
    if (e.waterIntake !== undefined) {
      waterSum += e.waterIntake;
      waterCount++;
    }
    if (e.steps !== undefined) {
      stepsSum += e.steps;
      stepsCount++;
    }
  });

  const avgSleep = sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(1)) : 0;
  const avgWater = waterCount > 0 ? Math.round(waterSum / waterCount) : 0;
  const avgSteps = stepsCount > 0 ? Math.round(stepsSum / stepsCount) : 0;

  // 3. Mood calculation
  let moodSum = 0;
  let slotLogsCount = 0;
  moodEntries.forEach((m) => {
    moodSum += m.moodScore;
    if (m.slotLogs) slotLogsCount += m.slotLogs.length;
  });
  const avgMoodScore = moodEntries.length > 0 ? Number((moodSum / moodEntries.length).toFixed(1)) : 0;

  let dominantLabel = "Neutral";
  if (avgMoodScore >= 4.5) dominantLabel = "Amazing";
  else if (avgMoodScore >= 3.5) dominantLabel = "Good";
  else if (avgMoodScore >= 2.5) dominantLabel = "Okay";
  else if (avgMoodScore > 0) dominantLabel = "Low";

  // 4. Finances calculation
  let totalIncome = 0;
  let totalExpenses = 0;
  transactions.forEach((t) => {
    if (t.type === "income") totalIncome += t.amount;
    else if (t.type === "expense") totalExpenses += t.amount;
  });
  const netBalance = totalIncome - totalExpenses;
  const budget = settings.monthlyBudget || 50000;
  const budgetAdherence = budget > 0 ? Math.max(0, Math.round(((budget - totalExpenses) / budget) * 100)) : 100;

  // 5. Journal calculation
  const totalJournalEntries = journalEntries.length;
  let totalWordCount = 0;
  journalEntries.forEach((j) => {
    totalWordCount += j.content.trim().split(/\s+/).filter(Boolean).length;
  });

  // Composite Life Balance Score
  const healthTargetSleep = settings.targetSleepHours || 8;
  const sleepScore = healthTargetSleep > 0 ? Math.min(100, Math.round((avgSleep / healthTargetSleep) * 100)) : 50;
  const moodPercent = avgMoodScore > 0 ? Math.round((avgMoodScore / 5) * 100) : 50;

  const lifeBalanceScore = Math.round(
    habitRate * 0.25 +
    sleepScore * 0.2 +
    moodPercent * 0.25 +
    budgetAdherence * 0.15 +
    (totalJournalEntries > 0 ? 15 : 0)
  );

  // Insights
  const aiInsights: string[] = [];
  if (habitRate >= 70) {
    aiInsights.push("High habit execution rate maintaining strong daily momentum.");
  }
  if (avgSleep >= 7) {
    aiInsights.push("Healthy sleep duration supporting cognitive resilience and mood regulation.");
  }
  if (totalExpenses > totalIncome && totalIncome > 0) {
    aiInsights.push("Expenses exceed current month income. Review top spending categories.");
  }
  if (totalJournalEntries >= 3) {
    aiInsights.push("Consistent reflective journaling promotes emotional self-awareness.");
  }

  return {
    lifeBalanceScore,
    habits: {
      totalHabits,
      completionRate: habitRate,
      topCategory,
    },
    health: {
      avgSleep,
      avgWater,
      avgSteps,
    },
    mood: {
      avgScore: avgMoodScore,
      dominantScoreLabel: dominantLabel,
      totalSlotLogs: slotLogsCount,
    },
    finances: {
      totalIncome,
      totalExpenses,
      netBalance,
      budgetAdherence,
    },
    journal: {
      totalEntries: totalJournalEntries,
      totalWordCount,
    },
    aiInsights,
  };
}

describe("User Data Report Generator TDD Tests", () => {
  it("should calculate comprehensive report metrics across all 5 domains", () => {
    const mockHabits: Habit[] = [
      {
        id: "h1",
        name: "Read 15 mins",
        category: "learning",
        frequency: "daily",
        targetCount: 1,
        createdAt: "2026-08-01",
        completions: [{ date: "2026-08-05", count: 1 }],
      },
    ];

    const mockHealth: HealthEntry[] = [
      { id: "he1", date: "2026-08-05", sleepHours: 8, waterIntake: 2500, steps: 8500 },
    ];

    const mockMood: MoodEntry[] = [
      { id: "m1", date: "2026-08-05", moodScore: 4, energyLevel: 4, tags: ["focused"] },
    ];

    const mockTransactions: Transaction[] = [
      { id: "t1", date: "2026-08-05", amount: 10000, type: "income", category: "salary" },
      { id: "t2", date: "2026-08-05", amount: 2500, type: "expense", category: "food" },
    ];

    const mockJournal: JournalEntry[] = [
      {
        id: "j1",
        date: "2026-08-05",
        content: "Productive and peaceful day working on self tracker features.",
        tags: ["reflection"],
        isBookmarked: false,
        createdAt: "2026-08-05",
        updatedAt: "2026-08-05",
      },
    ];

    const mockSettings: UserSettings = {
      unitSystem: "metric",
      weekStartDay: "monday",
      dailyWaterGoal: 2500,
      dailyStepsGoal: 10000,
      targetSleepHours: 8,
      currency: "INR",
      monthlyBudget: 50000,
      reminders: {
        habitsReminder: false,
        habitsReminderTime: "09:00",
        healthReminder: false,
        healthReminderTime: "20:00",
        moodReminder: false,
        moodReminderTime: "21:00",
      },
    };

    const report = generateUserDataReport(
      mockHabits,
      mockHealth,
      mockMood,
      mockTransactions,
      mockJournal,
      mockSettings
    );

    expect(report.habits.totalHabits).toBe(1);
    expect(report.habits.topCategory).toBe("learning");
    expect(report.health.avgSleep).toBe(8);
    expect(report.health.avgWater).toBe(2500);
    expect(report.mood.avgScore).toBe(4);
    expect(report.mood.dominantScoreLabel).toBe("Good");
    expect(report.finances.netBalance).toBe(7500);
    expect(report.journal.totalEntries).toBe(1);
    expect(report.journal.totalWordCount).toBe(9);
    expect(report.lifeBalanceScore).toBeGreaterThan(0);
  });
});
