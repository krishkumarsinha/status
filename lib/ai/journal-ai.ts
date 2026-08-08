export interface SentenceCompletionOption {
  text: string;
  category: "completion" | "reflection" | "gratitude";
}

export function predictNextWords(text: string): string {
  if (!text || !text.trim()) return "Today I felt";
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const words = lower.split(/\s+/);
  const lastWord = words[words.length - 1] || "";
  const lastTwo = words.slice(-2).join(" ");

  if (lastTwo === "i am" || lastWord === "feeling") return "calm and focused";
  if (lastTwo === "today i" || lastWord === "accomplished") return "all my targets";
  if (lastWord === "grateful" || lastWord === "for") return "the positive progress";
  if (lastWord === "my" || lastWord === "daily") return "routine and habits";
  if (lastWord === "learned" || lastWord === "that") return "consistency is key";
  if (lastWord === "working" || lastWord === "on") return "personal goals";
  if (lastWord === "proud" || lastWord === "of") return "my recent progress";

  return "and moving forward";
}

export function correctGrammarAndPolish(text: string): { correctedText: string; fixesCount: number } {
  if (!text) return { correctedText: "", fixesCount: 0 };

  let fixes = 0;
  let result = text;

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
    ive: "I've",
    id: "I'd",
  };

  Object.entries(typoMap).forEach(([typo, fix]) => {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    if (regex.test(result)) {
      result = result.replace(regex, fix);
      fixes++;
    }
  });

  // Capitalize first letter of text
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
  const lower = trimmed.toLowerCase();

  if (lower.includes("grateful") || lower.includes("thank")) {
    return [
      { text: `${prefix}the supportive people around me and the opportunity to make meaningful progress.`, category: "gratitude" },
      { text: `${prefix}having the energy and focus to accomplish what mattered most today.`, category: "gratitude" },
      { text: `${prefix}simple peaceful moments throughout my daily routine.`, category: "gratitude" },
    ];
  }

  if (lower.includes("feel") || lower.includes("felt")) {
    return [
      { text: `${prefix}balanced and proud of the effort I put into my daily tasks.`, category: "reflection" },
      { text: `${prefix}energized to build on today's positive momentum tomorrow.`, category: "reflection" },
      { text: `${prefix}at peace after taking time to reflect and unwind.`, category: "reflection" },
    ];
  }

  if (lower.includes("learned") || lower.includes("realized")) {
    return [
      { text: `${prefix}that small consistent actions create the biggest long-term impact.`, category: "reflection" },
      { text: `${prefix}the importance of maintaining boundaries and focusing on core priorities.`, category: "reflection" },
    ];
  }

  return [
    { text: `${prefix}which helped me stay focused and aligned with my core priorities.`, category: "completion" },
    { text: `${prefix}giving me a clear sense of achievement and peace of mind.`, category: "completion" },
    { text: `${prefix}and I am excited to continue building on this consistency tomorrow.`, category: "completion" },
  ];
}

export const WRITING_SPARKS = [
  { label: "🌟 Gratitude Spark", text: "Today I am thankful for " },
  { label: "🧘 Mindful Reflection", text: "Right now my mind feels " },
  { label: "🚀 Daily Milestone", text: "One key achievement I unlocked today was " },
  { label: "💡 Fresh Perspective", text: "A valuable insight I gained today is " },
];
