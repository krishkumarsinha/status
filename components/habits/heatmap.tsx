"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { isDateLocked } from "@/lib/date-utils";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapProps {
  habit: Habit;
}

export function Heatmap({ habit }: HeatmapProps) {
  const days = 90;
  
  const dateMap = useMemo(() => {
    const map = new Map<string, number>();
    habit.completions.forEach((c) => {
      map.set(c.date, c.count);
    });
    return map;
  }, [habit.completions]);

  const grid = useMemo(() => {
    const today = startOfDay(new Date());
    const daysArray = Array.from({ length: days }).map((_, i) => {
      const date = subDays(today, days - 1 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dateMap.get(dateStr) || 0;
      const locked = isDateLocked(dateStr);
      return { date, dateStr, count, locked };
    });

    // Group into weeks (columns)
    const weeks: typeof daysArray[] = [];
    let currentWeek: typeof daysArray = [];
    
    daysArray.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === daysArray.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [days, dateMap]);

  const getColorClass = (count: number, target: number) => {
    if (count === 0) return "bg-muted hover:bg-muted/80";
    if (count >= target) return "bg-primary";
    return "bg-primary/40"; // partial
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-max flex gap-1 items-end">
        <TooltipProvider delay={100}>
          {grid.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day) => (
                <Tooltip key={day.dateStr}>
                  <TooltipTrigger
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors cursor-pointer block relative",
                      getColorClass(day.count, habit.targetCount)
                    )}
                  >
                  </TooltipTrigger>
                  <TooltipContent className="text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      {format(day.date, "MMM d, yyyy")}
                      {day.locked && <Lock className="w-3 h-3 text-amber-500 inline" />}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Completions: {day.count} / {habit.targetCount}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {day.locked ? "Locked past date (read-only history)" : "Active tracking date (refreshes daily)"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
