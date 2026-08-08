"use client";

import { useEffect, useState } from "react";
import { getTrackingDate, formatTrackingDate } from "@/lib/date-utils";
import { useMoodStore } from "@/lib/stores/mood-store";
import { MoodScore, EnergyLevel, MoodTag, MOOD_EMOJIS, MOOD_TAGS, TimeSlot, SPECIFIC_EMOTIONS } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ThreeHourSlotPicker } from "./three-hour-slot-picker";
import { SlotCheckinModal } from "./slot-checkin-modal";
import { Sparkles, Clock, Smile, Zap } from "lucide-react";

export function MoodCheckin() {
  const { getTodayEntry, addEntry } = useMoodStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [moodScore, setMoodScore] = useState<MoodScore | undefined>(undefined);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [tags, setTags] = useState<MoodTag[]>([]);
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // 3-Hour Slot Modal State
  const [activeSlot, setActiveSlot] = useState<TimeSlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const todayEntry = getTodayEntry();

  useEffect(() => {
    setIsMounted(true);
    if (todayEntry) {
      setMoodScore(todayEntry.moodScore);
      setEnergyLevel(todayEntry.energyLevel);
      setTags(todayEntry.tags || []);
      setNote(todayEntry.note || "");
    }
  }, [getTodayEntry, todayEntry]);

  const handleTagToggle = (tag: MoodTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!moodScore) return;
    
    addEntry({
      date: getTrackingDate(),
      moodScore,
      energyLevel,
      tags,
      note,
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setActiveSlot(slot);
    setIsSlotModalOpen(true);
  };

  if (!isMounted) {
    return <Card className="w-full h-[500px] animate-pulse bg-muted/50" />;
  }

  const slotLogs = todayEntry?.slotLogs || [];

  return (
    <div className="space-y-6">
      {/* 3-Hour Mood Timeline Section */}
      <Card className="w-full border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> 3-Hour Interval Mood Tracker
              </CardTitle>
              <CardDescription className="mt-0.5">
                Record your specific emotions every 3 hours for {formatTrackingDate(getTrackingDate())}.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
              {slotLogs.length} / 8 Slots Logged
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ThreeHourSlotPicker
            slotLogs={slotLogs}
            onSelectSlot={handleSelectSlot}
          />
        </CardContent>
      </Card>

      {/* Main Daily Overview Check-in Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Smile className="w-5 h-5 text-amber-500" /> Overall Daily Mood & Reflection
          </CardTitle>
          <CardDescription>
            {slotLogs.length > 0
              ? `Overall average mood score calculated from ${slotLogs.length} 3-hour check-ins.`
              : "Set your general daily mood or check in for 3-hour intervals above."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Mood Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium leading-none">
              How are you feeling overall today?
            </label>
            <div className="flex justify-between sm:justify-start sm:gap-4">
              {(Object.entries(MOOD_EMOJIS) as [string, { emoji: string; label: string }][]).map(
                ([scoreStr, { emoji, label }]) => {
                  const score = parseInt(scoreStr) as MoodScore;
                  const isSelected = moodScore === score;
                  return (
                    <button
                      key={scoreStr}
                      onClick={() => setMoodScore(score)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded-md transition-all duration-200",
                        "hover:scale-110 active:scale-95",
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary scale-110"
                          : "opacity-70 hover:opacity-100"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg font-mono text-sm font-extrabold flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground border border-border/60"
                        )}
                      >
                        {score}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* 100% Energy Level Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-current" /> Energy Level Bar
              </label>
              <span className="text-base font-extrabold text-amber-500 font-mono">
                {energyLevel * 20}%
              </span>
            </div>
            
            {/* Visual 100% Energy Progress Bar */}
            <div className="space-y-2">
              <Progress value={energyLevel * 20} className="h-3" />
              <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground pt-1">
                {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => {
                  const pct = level * 20;
                  const isSelected = energyLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`px-2.5 py-1 rounded-lg transition-all border ${
                        isSelected
                          ? "bg-amber-500 text-white border-amber-500 font-extrabold scale-105 shadow-xs"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground border-border/50"
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Tags Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium leading-none">
              What factors are contributing to this?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-sm py-1.5 px-3 transition-colors hover:bg-primary/90",
                      isSelected ? "" : "hover:bg-muted"
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Note */}
          <div className="space-y-4">
            <label className="text-sm font-medium leading-none">
              Daily Notes (Optional)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Reflect on your day, achievements, or events..."
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!moodScore}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isSaved ? "Saved!" : "Save Daily Overview"}
          </Button>
        </CardContent>
      </Card>

      {/* 3-Hour Slot Log Modal */}
      <SlotCheckinModal
        date={getTrackingDate()}
        slot={activeSlot}
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setActiveSlot(null);
        }}
      />
    </div>
  );
}
