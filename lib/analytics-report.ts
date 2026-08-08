import { Habit, HealthEntry, MoodEntry, Transaction, JournalEntry, UserSettings, CURRENCY_SYMBOLS } from "@/types";

export interface UserDataReport {
  lifeBalanceScore: number;
  habits: {
    totalHabits: number;
    completionRate: number;
    topCategory: string;
    totalCompletions: number;
  };
  health: {
    avgSleep: number;
    avgWater: number;
    avgSteps: number;
    totalLoggedDays: number;
  };
  mood: {
    avgScore: number;
    dominantScoreLabel: string;
    totalSlotLogs: number;
    totalMoodEntries: number;
  };
  finances: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    budgetAdherence: number;
    currencySymbol: string;
  };
  journal: {
    totalEntries: number;
    totalWordCount: number;
    bookmarkedCount: number;
  };
  aiInsights: string[];
  recommendations: string[];
}

export function generateUserDataReport(
  habits: Habit[],
  healthEntries: HealthEntry[],
  moodEntries: MoodEntry[],
  transactions: Transaction[],
  journalEntries: JournalEntry[],
  settings: UserSettings
): UserDataReport {
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency || "INR"] || "₹";

  // 1. Habits calculation
  const totalHabits = habits.length;
  let totalCompletions = 0;
  let totalTargetSum = 0;
  const categoryCounts: Record<string, number> = {};

  habits.forEach((h) => {
    totalTargetSum += h.targetCount * 30; // 30 day target benchmark
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
    h.completions.forEach((c) => {
      totalCompletions += c.count;
    });
  });

  const completionRate = totalTargetSum > 0 ? Math.min(100, Math.round((totalCompletions / totalTargetSum) * 100)) : 0;
  
  let topCategory = "General";
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
    if (e.sleepHours !== undefined && e.sleepHours > 0) {
      sleepSum += e.sleepHours;
      sleepCount++;
    }
    if (e.waterIntake !== undefined && e.waterIntake > 0) {
      waterSum += e.waterIntake;
      waterCount++;
    }
    if (e.steps !== undefined && e.steps > 0) {
      stepsSum += e.steps;
      stepsCount++;
    }
  });

  const avgSleep = sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(1)) : 0;
  const avgWater = waterCount > 0 ? Math.round(waterSum / waterCount) : 0;
  const avgSteps = stepsCount > 0 ? Math.round(stepsSum / stepsCount) : 0;
  const totalLoggedDays = Math.max(sleepCount, waterCount, stepsCount);

  // 3. Mood calculation
  let moodSum = 0;
  let slotLogsCount = 0;
  moodEntries.forEach((m) => {
    moodSum += m.moodScore;
    if (m.slotLogs) slotLogsCount += m.slotLogs.length;
  });
  const avgMoodScore = moodEntries.length > 0 ? Number((moodSum / moodEntries.length).toFixed(1)) : 0;

  let dominantScoreLabel = "Neutral";
  if (avgMoodScore >= 4.5) dominantScoreLabel = "Amazing";
  else if (avgMoodScore >= 3.5) dominantScoreLabel = "Good";
  else if (avgMoodScore >= 2.5) dominantScoreLabel = "Okay";
  else if (avgMoodScore > 0) dominantScoreLabel = "Low";

  // 4. Finances calculation
  let totalIncome = 0;
  let totalExpenses = 0;
  transactions.forEach((t) => {
    if (t.type === "income") totalIncome += t.amount;
    else if (t.type === "expense") totalExpenses += t.amount;
  });
  const netBalance = totalIncome - totalExpenses;
  const monthlyBudget = settings.monthlyBudget || 50000;
  const budgetAdherence = monthlyBudget > 0 ? Math.max(0, Math.round(((monthlyBudget - totalExpenses) / monthlyBudget) * 100)) : 100;

  // 5. Journal calculation
  const totalJournalEntries = journalEntries.length;
  let totalWordCount = 0;
  let bookmarkedCount = 0;
  journalEntries.forEach((j) => {
    totalWordCount += j.content.trim().split(/\s+/).filter(Boolean).length;
    if (j.isBookmarked) bookmarkedCount++;
  });

  // Composite Life Balance Score (0-100)
  const targetSleep = settings.targetSleepHours || 8;
  const sleepScore = targetSleep > 0 ? Math.min(100, Math.round((avgSleep / targetSleep) * 100)) : 50;
  const moodScorePercent = avgMoodScore > 0 ? Math.round((avgMoodScore / 5) * 100) : 50;

  const lifeBalanceScore = Math.min(100, Math.round(
    (totalHabits > 0 ? completionRate * 0.25 : 20) +
    (sleepCount > 0 ? sleepScore * 0.2 : 20) +
    (moodEntries.length > 0 ? moodScorePercent * 0.25 : 20) +
    (transactions.length > 0 ? budgetAdherence * 0.15 : 15) +
    (totalJournalEntries > 0 ? 15 : 5)
  ));

  // Synthesize Actionable Insights & AI Recommendations
  const aiInsights: string[] = [];
  const recommendations: string[] = [];

  if (completionRate >= 75) {
    aiInsights.push(`Strong habit consistency (${completionRate}% execution) in '${topCategory}' category.`);
  } else if (totalHabits > 0) {
    recommendations.push(`Increase daily habit completions (currently at ${completionRate}%).`);
  }

  if (avgSleep >= targetSleep) {
    aiInsights.push(`Optimal sleep duration (avg ${avgSleep}h vs target ${targetSleep}h) promotes cognitive focus.`);
  } else if (avgSleep > 0) {
    recommendations.push(`Average sleep (${avgSleep}h) is below target (${targetSleep}h). Consider setting a regular bedtime.`);
  }

  if (avgMoodScore >= 3.5) {
    aiInsights.push(`Positive emotional stability recorded across ${moodEntries.length} mood logs (${dominantScoreLabel} rating).`);
  }

  if (totalExpenses > totalIncome && totalIncome > 0) {
    recommendations.push(`Current monthly expenses exceed total income by ${currencySymbol}${(totalExpenses - totalIncome).toLocaleString()}.`);
  } else if (netBalance > 0) {
    aiInsights.push(`Positive net financial savings of ${currencySymbol}${netBalance.toLocaleString()} accrued.`);
  }

  if (totalJournalEntries >= 3) {
    aiInsights.push(`Reflective journal habits active with ${totalJournalEntries} entries logged (${totalWordCount} words).`);
  } else {
    recommendations.push("Write regular reflections in your Journal to build emotional self-awareness.");
  }

  return {
    lifeBalanceScore,
    habits: {
      totalHabits,
      completionRate,
      topCategory,
      totalCompletions,
    },
    health: {
      avgSleep,
      avgWater,
      avgSteps,
      totalLoggedDays,
    },
    mood: {
      avgScore: avgMoodScore,
      dominantScoreLabel,
      totalSlotLogs: slotLogsCount,
      totalMoodEntries: moodEntries.length,
    },
    finances: {
      totalIncome,
      totalExpenses,
      netBalance,
      budgetAdherence,
      currencySymbol,
    },
    journal: {
      totalEntries: totalJournalEntries,
      totalWordCount,
      bookmarkedCount,
    },
    aiInsights,
    recommendations,
  };
}
