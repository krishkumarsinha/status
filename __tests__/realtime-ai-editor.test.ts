import { describe, it, expect } from "vitest";

export function predictNextWords(text: string): string {
  if (!text) return "Today I felt";
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Look at last few words
  const words = lower.split(/\s+/);
  const lastWord = words[words.length - 1] || "";
  const lastTwo = words.slice(-2).join(" ");

  if (lastTwo === "i am" || lastWord === "feeling") return "calm and focused";
  if (lastTwo === "today i" || lastWord === "accomplished") return "all my targets";
  if (lastWord === "grateful" || lastWord === "for") return "the positive progress";
  if (lastWord === "my" || lastWord === "daily") return "routine and habits";
  if (lastWord === "learned" || lastWord === "that") return "consistency is key";

  return "and moving forward";
}

export function correctGrammarAndPolish(text: string): { correctedText: string; fixesCount: number } {
  if (!text) return { correctedText: "", fixesCount: 0 };

  let fixes = 0;
  let result = text;

  // 1. Capitalize first letter of sentences and standalone 'i'
  const original = result;

  // Capitalize standalone 'i'
  result = result.replace(/\bi\b/g, () => {
    fixes++;
    return "I";
  });

  // Fix common typos
  const typoMap: Record<string, string> = {
    teh: "the",
    receive: "receive",
    habbit: "habit",
    habbits: "habits",
    dont: "don't",
    cant: "can't",
    wont: "won't",
    im: "I'm",
  };

  Object.entries(typoMap).forEach(([typo, fix]) => {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    if (regex.test(result)) {
      result = result.replace(regex, fix);
      fixes++;
    }
  });

  // Ensure starting sentence capital letter
  if (result.length > 0 && result[0] !== result[0].toUpperCase()) {
    result = result[0].toUpperCase() + result.slice(1);
    fixes++;
  }

  // Ensure trailing period if sentence completed without punctuation
  if (result.length > 5 && !/[.!?]$/.test(result)) {
    result += ".";
    fixes++;
  }

  return { correctedText: result, fixesCount: fixes };
}

describe("Real-time AI Next-Words & Grammar Polisher TDD Tests", () => {
  it("should predict next couple of words based on active context", () => {
    const next1 = predictNextWords("Today I am feeling");
    expect(next1).toBe("calm and focused");

    const next2 = predictNextWords("I am grateful for");
    expect(next2).toBe("the positive progress");
  });

  it("should correct common grammar, capitalization, and typos", () => {
    const { correctedText, fixesCount } = correctGrammarAndPolish("i am feeling good today teh habbit was done");
    expect(correctedText).toContain("I am");
    expect(correctedText).toContain("the");
    expect(correctedText).toContain("habit");
    expect(fixesCount).toBeGreaterThan(0);
  });
});
