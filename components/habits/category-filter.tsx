"use client";

import { Badge } from "@/components/ui/badge";
import { HabitCategory } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

const categories: { value: HabitCategory | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "health", label: "Health" },
  { value: "productivity", label: "Productivity" },
  { value: "learning", label: "Learning" },
  { value: "fitness", label: "Fitness" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => (
        <Badge
          key={cat.label}
          variant={selected === cat.value ? "default" : "secondary"}
          className={cn(
            "cursor-pointer px-3 py-1 text-sm transition-all hover:scale-105",
            selected === cat.value ? "shadow-sm" : "hover:bg-secondary/80"
          )}
          onClick={() => onSelect(cat.value)}
        >
          {cat.label}
        </Badge>
      ))}
    </div>
  );
}
