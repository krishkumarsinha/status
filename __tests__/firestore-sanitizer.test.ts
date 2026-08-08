import { describe, it, expect } from "vitest";

function sanitizeForFirestore(val: unknown): unknown {
  if (val === undefined) return null;
  if (val === null || typeof val !== "object") return val;

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeForFirestore(item)).filter((item) => item !== undefined);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result;
}

describe("Firestore Recursive Sanitizer TDD Tests", () => {
  it("should strip top-level undefined fields", () => {
    const input = { id: "123", note: undefined, score: 5 };
    const output = sanitizeForFirestore(input);
    expect(output).toEqual({ id: "123", score: 5 });
    expect(Object.prototype.hasOwnProperty.call(output, "note")).toBe(false);
  });

  it("should recursively strip nested undefined fields inside arrays (such as Mood slotLogs)", () => {
    const input = {
      id: "503050c2-add9-491e-a22b-71121bd94820",
      date: "2026-08-09",
      moodScore: 4,
      slotLogs: [
        {
          slotId: "morning",
          moodScore: 4,
          note: undefined, // nested undefined field
        },
      ],
    };

    const output = sanitizeForFirestore(input);
    expect(output).toEqual({
      id: "503050c2-add9-491e-a22b-71121bd94820",
      date: "2026-08-09",
      moodScore: 4,
      slotLogs: [
        {
          slotId: "morning",
          moodScore: 4,
        },
      ],
    });
  });

  it("should handle deeply nested maps and primitive arrays without altering valid data", () => {
    const input = {
      tags: ["happy", "productive"],
      reminders: {
        habitsReminder: true,
        time: undefined,
      },
    };

    const output = sanitizeForFirestore(input);
    expect(output).toEqual({
      tags: ["happy", "productive"],
      reminders: {
        habitsReminder: true,
      },
    });
  });
});
