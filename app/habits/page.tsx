"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, ListTodo } from "lucide-react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HabitCard } from "@/components/habits/habit-card";
import { CategoryFilter } from "@/components/habits/category-filter";
import { HabitForm } from "@/components/habits/habit-form";
import { getTrackingDate, formatTrackingDate } from "@/lib/date-utils";

export default function HabitsPage() {
  const [isClient, setIsClient] = useState(false);
  const habits = useHabitStore((state) => state.habits);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadHabits = useHabitStore((state) => state.loadHabits);

  useEffect(() => {
    setIsClient(true);
    loadHabits();
  }, [loadHabits]);

  if (!isClient) return null; // Prevent hydration mismatch

  const filteredHabits = selectedCategory
    ? habits.filter((h) => h.category === selectedCategory)
    : habits;

  const todayStr = formatTrackingDate(getTrackingDate());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Habits</h1>
          <p className="text-muted-foreground mt-1">Today is {todayStr}. Keep up the good work!</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="shadow-sm" />}>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {habits.length > 0 && (
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      )}

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-xl border-dashed bg-muted/10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ListTodo className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No habits yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Start building your routine by adding your first habit. You can track anything from drinking water to learning a new language.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Habit
          </Button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No habits found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  );
}
