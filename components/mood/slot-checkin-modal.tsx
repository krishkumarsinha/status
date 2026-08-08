"use client";

import { useState, useEffect } from "react";
import { TimeSlot, SlotMoodLog, MoodScore, EnergyLevel, SPECIFIC_EMOTIONS, SpecificEmotion, MOOD_EMOJIS } from "@/types";
import { useMoodStore } from "@/lib/stores/mood-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmotionPicker } from "./emotion-picker";
import { Clock, Sparkles, Zap } from "lucide-react";

interface SlotCheckinModalProps {
  date: string;
  slot: TimeSlot | null;
  isOpen: boolean;
  onClose: () => void;
  isLocked?: boolean;
}

export function SlotCheckinModal({
  date,
  slot,
  isOpen,
  onClose,
  isLocked = false,
}: SlotCheckinModalProps) {
  const addSlotLog = useMoodStore((state) => state.addSlotLog);
  const getEntryByDate = useMoodStore((state) => state.getEntryByDate);

  const existingEntry = getEntryByDate(date);
  const existingSlotLog = slot
    ? existingEntry?.slotLogs?.find((l) => l.slotId === slot.id)
    : null;

  const [moodScore, setMoodScore] = useState<MoodScore>(3);
  const [primaryEmotionId, setPrimaryEmotionId] = useState<string>("calm");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (existingSlotLog) {
      setMoodScore(existingSlotLog.moodScore);
      setPrimaryEmotionId(existingSlotLog.primaryEmotionId);
      setEnergyLevel(existingSlotLog.energyLevel);
      setNote(existingSlotLog.note || "");
    } else {
      setMoodScore(3);
      setPrimaryEmotionId("calm");
      setEnergyLevel(3);
      setNote("");
    }
  }, [existingSlotLog, slot]);

  if (!slot) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    addSlotLog(date, {
      slotId: slot.id,
      moodScore,
      primaryEmotionId,
      energyLevel,
      note: note.trim() || undefined,
      loggedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            3-Hour Mood Log • {slot.label}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 pt-2">
          {/* Mood Intensity Score (1-5) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Overall Feeling Intensity
            </Label>
            <div className="flex justify-between items-center bg-muted/40 p-2 rounded-2xl">
              {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                const isSelected = moodScore === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => !isLocked && setMoodScore(score)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full font-mono text-xs font-extrabold flex items-center justify-center transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                      {score}
                    </div>
                    <span className="text-[10px] font-bold">{MOOD_EMOJIS[score].label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Human Emotion Spectrum Picker */}
          <EmotionPicker
            selectedEmotionId={primaryEmotionId}
            onSelectEmotion={(emotion) => !isLocked && setPrimaryEmotionId(emotion.id)}
          />

          {/* 100% Energy Level Bar */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy Level Bar
              </Label>
              <span className="text-xs font-extrabold text-amber-500 font-mono">{energyLevel * 20}%</span>
            </div>
            <Progress value={energyLevel * 20} className="h-2.5" />
            <div className="flex justify-between items-center text-[10px] font-bold">
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setEnergyLevel(level)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    energyLevel === level
                      ? "bg-amber-500 text-white font-extrabold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level * 20}%
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Note (What caused this feeling?)
            </Label>
            <Input
              placeholder="e.g. Completed a hard task, Had coffee with a friend, Long meeting"
              value={note}
              disabled={isLocked}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs"
            />
          </div>

          <Button type="submit" disabled={isLocked} className="w-full gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Save 3-Hour Slot Log
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
