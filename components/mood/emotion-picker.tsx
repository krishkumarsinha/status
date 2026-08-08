"use client";

import { SPECIFIC_EMOTIONS, SpecificEmotion } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface EmotionPickerProps {
  selectedEmotionId?: string;
  onSelectEmotion: (emotion: SpecificEmotion) => void;
  secondaryEmotionIds?: string[];
  onToggleSecondaryEmotion?: (emotionId: string) => void;
}

const CATEGORY_TITLES: Record<SpecificEmotion["category"], { title: string; color: string }> = {
  positive: { title: "Joyful & Positive", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  peaceful: { title: "Calm & Peaceful", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  "high-energy": { title: "Focused & Motivated", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  anxious: { title: "Anxious & Stressed", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  low: { title: "Low & Exhausted", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  angry: { title: "Frustrated & Irritated", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

export function EmotionPicker({
  selectedEmotionId,
  onSelectEmotion,
  secondaryEmotionIds = [],
  onToggleSecondaryEmotion,
}: EmotionPickerProps) {
  const categories: SpecificEmotion["category"][] = [
    "positive",
    "peaceful",
    "high-energy",
    "anxious",
    "low",
    "angry",
  ];

  return (
    <div className="space-y-4">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Select Primary Specific Emotion
      </Label>

      <div className="space-y-3">
        {categories.map((cat) => {
          const emotions = SPECIFIC_EMOTIONS.filter((e) => e.category === cat);
          const meta = CATEGORY_TITLES[cat];

          return (
            <div key={cat} className="space-y-1.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${meta.color}`}>
                {meta.title}
              </span>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {emotions.map((emotion) => {
                  const isPrimary = selectedEmotionId === emotion.id;
                  const isSecondary = secondaryEmotionIds.includes(emotion.id);

                  return (
                    <button
                      key={emotion.id}
                      type="button"
                      onClick={() => onSelectEmotion(emotion)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isPrimary
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : isSecondary
                          ? "bg-primary/20 border border-primary text-primary"
                          : "bg-muted/60 hover:bg-muted text-foreground border border-border/50 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      <span>{emotion.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
