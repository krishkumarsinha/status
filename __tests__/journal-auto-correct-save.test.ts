import { describe, it, expect } from "vitest";
import { correctGrammarAndPolish } from "@/lib/ai/journal-ai";

export function prepareAutoCorrectedJournalEntry(title?: string, content: string = ""): {
  title?: string;
  content: string;
  fixesApplied: number;
} {
  const correctedContentObj = correctGrammarAndPolish(content);
  let correctedTitle: string | undefined = undefined;
  let titleFixes = 0;

  if (title && title.trim()) {
    const titleObj = correctGrammarAndPolish(title.trim());
    correctedTitle = titleObj.correctedText;
    titleFixes = titleObj.fixesCount;
  }

  return {
    title: correctedTitle,
    content: correctedContentObj.correctedText,
    fixesApplied: correctedContentObj.fixesCount + titleFixes,
  };
}

describe("Journal Input Auto-Correct TDD Tests", () => {
  it("should automatically correct typos, capitalization, and punctuation prior to saving", () => {
    const rawTitle = "my daily reflection";
    const rawContent = "i am feeling good today teh habbit was done";

    const prepared = prepareAutoCorrectedJournalEntry(rawTitle, rawContent);

    expect(prepared.title).toBe("My daily reflection.");
    expect(prepared.content).toContain("I am");
    expect(prepared.content).toContain("the");
    expect(prepared.content).toContain("habit");
    expect(prepared.fixesApplied).toBeGreaterThan(0);
  });
});
