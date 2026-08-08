import { describe, it, expect } from "vitest";

export interface SentenceCompletionOption {
  text: string;
  category: "completion" | "reflection" | "gratitude";
}

export function generateSentenceCompletions(currentContent: string): SentenceCompletionOption[] {
  const trimmed = currentContent.trim();
  
  if (!trimmed) {
    return [
      { text: "Today I am deeply grateful for the small wins and moments of clarity.", category: "gratitude" },
      { text: "I spent time reflecting on my personal growth and daily achievements.", category: "reflection" },
      { text: "One important goal I focused on today was staying present and calm.", category: "completion" },
    ];
  }

  const lastChar = trimmed.slice(-1);
  const prefix = (lastChar === "." || lastChar === "!" || lastChar === "?") ? " " : " ";

  if (trimmed.toLowerCase().includes("grateful") || trimmed.toLowerCase().includes("thank")) {
    return [
      { text: `${prefix}the supportive people around me and the opportunity to make meaningful progress.`, category: "gratitude" },
      { text: `${prefix}having the energy and focus to accomplish what mattered most today.`, category: "gratitude" },
    ];
  }

  if (trimmed.toLowerCase().includes("feel") || trimmed.toLowerCase().includes("felt")) {
    return [
      { text: `${prefix}balanced and proud of the effort I put into my daily routine.`, category: "reflection" },
      { text: `${prefix}energized to build on today's momentum tomorrow.`, category: "reflection" },
    ];
  }

  return [
    { text: `${prefix}which helped me stay focused and aligned with my core priorities.`, category: "completion" },
    { text: `${prefix}giving me a clear sense of achievement and peace of mind.`, category: "completion" },
    { text: `${prefix}and I am excited to continue building on this consistency.`, category: "completion" },
  ];
}

describe("Journal AI Assistant TDD Tests", () => {
  it("should generate starting prompts for empty journal text", () => {
    const suggestions = generateSentenceCompletions("");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].text).toContain("grateful");
  });

  it("should provide relevant sentence continuations for active text", () => {
    const suggestions = generateSentenceCompletions("Today I felt");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].text).toContain("balanced");
  });

  it("should provide gratitude completions when text contains gratitude keywords", () => {
    const suggestions = generateSentenceCompletions("I am grateful for");
    expect(suggestions[0].category).toBe("gratitude");
  });
});
