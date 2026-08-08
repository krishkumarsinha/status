"use client";

import { useState } from "react";
import { Habit, HabitCategory, HabitFrequency } from "@/types";
import { useHabitStore } from "@/lib/stores/habit-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HabitFormProps {
  habit?: Habit;
  onClose: () => void;
}

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const [name, setName] = useState(habit?.name || "");
  const [category, setCategory] = useState<HabitCategory>(habit?.category || "other");
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || "daily");
  const [targetCount, setTargetCount] = useState(habit?.targetCount.toString() || "1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const count = parseInt(targetCount, 10);
    if (isNaN(count) || count < 1) return;

    const habitData = {
      name: name.trim(),
      category,
      frequency,
      targetCount: count,
    };

    if (habit) {
      updateHabit(habit.id, habitData);
    } else {
      addHabit(habitData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          placeholder="e.g., Drink Water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetCount">Daily Target (e.g., glasses of water)</Label>
        <Input
          id="targetCount"
          type="number"
          min="1"
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{habit ? "Save Changes" : "Add Habit"}</Button>
      </div>
    </form>
  );
}
