import { describe, it, expect } from "vitest";
import { Habit } from "@/types";
import { getTrackingDate, isDateLocked } from "@/lib/date-utils";

function toggleHabitCompletion(
  habit: Habit,
  targetDate: string,
  overrideLock: boolean = false
): Habit {
  if (isDateLocked(targetDate) && !overrideLock) {
    // Locked date: return habit unchanged
    return habit;
  }

  const existingIndex = habit.completions.findIndex((c) => c.date === targetDate);
  let newCompletions = [...habit.completions];

  if (existingIndex >= 0) {
    const currentCount = habit.completions[existingIndex].count;
    if (currentCount >= habit.targetCount) {
      newCompletions = newCompletions.filter((_, i) => i !== existingIndex);
    } else {
      newCompletions[existingIndex].count += 1;
    }
  } else {
    newCompletions.push({ date: targetDate, count: 1 });
  }

  return { ...habit, completions: newCompletions };
}

describe("Daily Habit Refresh & Lock TDD Tests", () => {
  it("should allow completing habit for today's active tracking date", () => {
    const today = getTrackingDate();
    const habit: Habit = {
      id: "habit-1",
      name: "Drink 2L Water",
      category: "health",
      frequency: "daily",
      targetCount: 1,
      createdAt: new Date().toISOString(),
      completions: [],
    };

    const updated = toggleHabitCompletion(habit, today);
    expect(updated.completions.length).toBe(1);
    expect(updated.completions[0].date).toBe(today);
    expect(updated.completions[0].count).toBe(1);
  });

  it("should reject completion toggles for past locked dates", () => {
    const pastLockedDate = "2020-01-01"; // definitely locked past date
    expect(isDateLocked(pastLockedDate)).toBe(true);

    const habit: Habit = {
      id: "habit-1",
      name: "Morning Exercise",
      category: "fitness",
      frequency: "daily",
      targetCount: 1,
      createdAt: new Date().toISOString(),
      completions: [],
    };

    const updated = toggleHabitCompletion(habit, pastLockedDate);
    // Should reject mutation and leave completions empty
    expect(updated.completions.length).toBe(0);
  });
});
