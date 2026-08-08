"use client";

import { TIME_SLOTS, TimeSlot, SlotMoodLog, SPECIFIC_EMOTIONS, MOOD_EMOJIS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, CheckCircle2, Smile } from "lucide-react";

interface ThreeHourSlotPickerProps {
  slotLogs?: SlotMoodLog[];
  activeSlotId?: string;
  onSelectSlot: (slot: TimeSlot) => void;
}

/**
 * Finds which 3-hour slot matches the current time in IST
 */
export function getCurrentISTSlotId(): string {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utcTime + 5.5 * 60 * 60 * 1000);
  const hour = istDate.getUTCHours();

  const current = TIME_SLOTS.find((s) => {
    if (s.startHour < s.endHour) {
      return hour >= s.startHour && hour < s.endHour;
    }
    // Overnight slot e.g. 21:00-00:00 or 00:00-03:00
    return hour >= s.startHour || hour < s.endHour;
  });

  return current?.id || "09:00-12:00";
}

export function ThreeHourSlotPicker({
  slotLogs = [],
  activeSlotId,
  onSelectSlot,
}: ThreeHourSlotPickerProps) {
  const currentISTSlotId = getCurrentISTSlotId();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold tracking-tight">3-Hour Mood Timeline</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          8 Intervals per 24 Hours
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TIME_SLOTS.map((slot) => {
          const log = slotLogs.find((l) => l.slotId === slot.id);
          const isCurrentSlot = slot.id === currentISTSlotId;
          const isSelected = slot.id === activeSlotId;

          const emotionObj = log
            ? SPECIFIC_EMOTIONS.find((e) => e.id === log.primaryEmotionId)
            : null;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-24 relative group ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                  : isCurrentSlot
                  ? "border-amber-500/60 bg-amber-500/5 shadow-xs"
                  : log
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                  : "border-border/60 hover:border-border bg-card hover:bg-muted/40"
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground tracking-tight">
                  {slot.shortLabel}
                </span>
                {isCurrentSlot && (
                  <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-none font-bold">
                    Now
                  </Badge>
                )}
              </div>

              {/* Slot Body: Emotion / Status */}
              <div className="my-auto flex items-center gap-2">
                {log ? (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Smile className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-none truncate">
                        {emotionObj?.name || MOOD_EMOJIS[log.moodScore].label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Energy: {log.energyLevel * 20}%
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-medium">Log Mood</span>
                  </div>
                )}
              </div>

              {/* Status Badge at bottom */}
              <div className="flex items-center justify-end">
                {log && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
