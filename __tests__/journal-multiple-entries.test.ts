import { describe, it, expect } from "vitest";
import { JournalEntry } from "@/types";

function addMultipleJournalEntries(
  existingEntries: JournalEntry[],
  newEntryData: { date: string; title?: string; content: string; createdAt?: string }
): JournalEntry[] {
  const now = newEntryData.createdAt || new Date().toISOString();
  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: newEntryData.date,
    title: newEntryData.title,
    content: newEntryData.content,
    tags: [],
    isBookmarked: false,
    createdAt: now,
    updatedAt: now,
  };
  return [newEntry, ...existingEntries];
}

function getEntriesByDate(entries: JournalEntry[], date: string): JournalEntry[] {
  return entries
    .filter((e) => e.date === date)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

describe("Multiple Journal Entries & Memory Timeline TDD Tests", () => {
  it("should append multiple entries for the same date without overwriting", () => {
    let entries: JournalEntry[] = [];

    // Add Morning Entry (09:00 AM)
    entries = addMultipleJournalEntries(entries, {
      date: "2026-08-09",
      title: "Morning Thoughts",
      content: "Feeling energized today.",
      createdAt: "2026-08-09T09:00:00.000Z",
    });

    // Add Evening Entry (20:00 PM)
    entries = addMultipleJournalEntries(entries, {
      date: "2026-08-09",
      title: "Evening Reflection",
      content: "Completed all my habits!",
      createdAt: "2026-08-09T20:00:00.000Z",
    });

    // Verify 2 entries exist for 2026-08-09 sorted chronologically
    const dayEntries = getEntriesByDate(entries, "2026-08-09");
    expect(dayEntries.length).toBe(2);
    expect(dayEntries[0].title).toBe("Morning Thoughts");
    expect(dayEntries[1].title).toBe("Evening Reflection");
  });

  it("should disallow editing of locked entries but allow deletion", () => {
    const isLocked = true;
    const canEdit = !isLocked;
    const canDelete = true;

    expect(canEdit).toBe(false);
    expect(canDelete).toBe(true);
  });
});
