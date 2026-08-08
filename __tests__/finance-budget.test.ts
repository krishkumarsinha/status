import { describe, it, expect } from "vitest";
import { UserSettings } from "@/types";

function updateMonthlyBudget(
  currentSettings: UserSettings,
  newMonthlyBudget: number
): UserSettings {
  if (isNaN(newMonthlyBudget) || newMonthlyBudget <= 0) return currentSettings;
  return {
    ...currentSettings,
    monthlyBudget: newMonthlyBudget,
  };
}

describe("Editable Monthly Budget TDD Tests", () => {
  it("should update monthly budget and recalculate spent percentage", () => {
    const initialSettings: UserSettings = {
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

    const totalExpenses = 25000;
    const initialPercent = Math.round((totalExpenses / initialSettings.monthlyBudget) * 100);
    expect(initialPercent).toBe(50);

    // Update monthly budget to 100,000
    const updatedSettings = updateMonthlyBudget(initialSettings, 100000);
    expect(updatedSettings.monthlyBudget).toBe(100000);

    const updatedPercent = Math.round((totalExpenses / updatedSettings.monthlyBudget) * 100);
    expect(updatedPercent).toBe(25);
  });

  it("should allow entering custom values like 2000 without step restrictions", () => {
    const initialSettings: UserSettings = {
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

    const updatedSettings = updateMonthlyBudget(initialSettings, 2000);
    expect(updatedSettings.monthlyBudget).toBe(2000);
  });
});
