"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, Flame, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Habit } from "@/types";
import { useHabitStore } from "@/lib/stores/habit-store";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HabitForm } from "./habit-form";
import { Heatmap } from "./heatmap";
import { getTrackingDate } from "@/lib/date-utils";

const categoryColors: Record<string, string> = {
  health: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  productivity: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  learning: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  fitness: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  mindfulness: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  social: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  other: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const getStreak = useHabitStore((state) => state.getStreak);

  const todayStr = getTrackingDate();
  const todayCompletion = habit.completions.find((c) => c.date === todayStr);
  const countToday = todayCompletion?.count || 0;
  const isCompleted = countToday >= habit.targetCount;
  const streak = getStreak(habit.id);
  const progressPercent = Math.min(100, Math.round((countToday / habit.targetCount) * 100));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompletion(habit.id, todayStr);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habit.id);
    }
  };

  return (
    <>
      <Card 
        className="p-5 flex flex-col gap-4 overflow-hidden relative group transition-all duration-300 hover:shadow-md border-border/50 bg-card cursor-pointer"
        onClick={() => setShowHeatmap(!showHeatmap)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("capitalize px-2 py-0.5 text-xs font-medium", categoryColors[habit.category] || categoryColors.other)}
              >
                {habit.category}
              </Badge>
              {streak > 0 && (
                <div className="flex items-center text-xs font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md" title="Current streak">
                  <Flame className="w-3 h-3 mr-1" />
                  {streak}
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-none tracking-tight mt-2 text-foreground">
              {habit.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={handleToggle}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground scale-110 shadow-sm"
                  : "border-muted-foreground/30 hover:border-primary/50 bg-transparent text-transparent hover:bg-primary/5"
              )}
            >
              <Check className={cn("h-5 w-5 transition-transform duration-300", isCompleted ? "scale-100" : "scale-0")} strokeWidth={3} />
            </button>
          </div>
        </div>

        {habit.targetCount > 1 && (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Progress</span>
              <span>{countToday} / {habit.targetCount}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {showHeatmap && (
          <div className="pt-2 border-t mt-1" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Activity (Last 90 days)</p>
            <Heatmap habit={habit} />
          </div>
        )}
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <HabitForm habit={habit} onClose={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
