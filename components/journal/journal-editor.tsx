"use client";

import { useState } from "react";
import { JournalTag, JOURNAL_TAGS, MoodScore } from "@/types";
import { useJournalStore } from "@/lib/stores/journal-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bookmark, 
  PlusCircle, 
  Sparkles, 
  Lock, 
  Trash2, 
  Clock, 
  BookOpen, 
  CheckCircle2,
  Heart
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { isDateLocked } from "@/lib/date-utils";

interface JournalEditorProps {
  selectedDate: string;
}

export function JournalEditor({ selectedDate }: JournalEditorProps) {
  const addEntry = useJournalStore((state) => state.addEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const toggleBookmark = useJournalStore((state) => state.toggleBookmark);
  const getEntriesByDate = useJournalStore((state) => state.getEntriesByDate);

  const dayEntries = getEntriesByDate(selectedDate);
  const isLocked = isDateLocked(selectedDate);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodScore | undefined>(undefined);
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const toggleTag = (tag: JournalTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood(undefined);
    setTags([]);
    setIsBookmarked(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLocked) return;

    await addEntry({
      date: selectedDate,
      title: title.trim() || undefined,
      content: content.trim(),
      mood,
      tags,
      isBookmarked,
    });

    setSavedSuccess(true);
    resetForm();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteEntry(deleteTargetId, true);
      setDeleteTargetId(null);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Card className="h-full flex flex-col shadow-xs border-border/60">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Journal • {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              {isLocked && <Lock className="w-4 h-4 text-amber-500" />}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLocked
                ? "Locked Memory Book — past completed day (read-only)"
                : `Active tracking day (${dayEntries.length} ${dayEntries.length === 1 ? 'reflection' : 'reflections'} logged so far)`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alert for Saved Entry */}
        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            Reflection saved to memory timeline & inputs refreshed! You can add another reflection below.
          </div>
        )}

        {/* 1. New Entry Input Form (Active Unlocked Day Only) */}
        {!isLocked && (
          <form onSubmit={handleSave} className="p-4 bg-card border border-border/60 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Add New Daily Reflection
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "text-amber-500 hover:text-amber-600 h-7 w-7" : "text-muted-foreground h-7 w-7"}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </Button>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Input
                placeholder="Title of reflection (optional)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>

            {/* Content Area */}
            <div className="space-y-1">
              <textarea
                placeholder="What's on your mind right now? Capture your thoughts, feelings, or gratitude..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full resize-none bg-transparent border-0 text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Mood & Tags Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Associated Mood Score
                </Label>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                    const isSelected = mood === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setMood(isSelected ? undefined : score)}
                        className={`p-1.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-primary/15 ring-2 ring-primary scale-105"
                            : "hover:bg-muted opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground border"
                          }`}
                        >
                          {score}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-1">
                  {JOURNAL_TAGS.slice(0, 6).map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className="capitalize text-[11px] py-0.5 px-2 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
              <Button type="submit" size="sm" disabled={!content.trim()} className="gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Save Reflection
              </Button>
            </div>
          </form>
        )}

        {/* 2. Timeline Memory Feed */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> 
              {isLocked ? "Memory Timeline Book" : "Today's Logged Memories"} ({dayEntries.length})
            </h3>
            {isLocked && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1 text-[11px]">
                <Lock className="w-3 h-3" /> Locked Read-Only
              </Badge>
            )}
          </div>

          {dayEntries.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium">No reflections recorded for this date.</p>
              {!isLocked && (
                <p className="text-xs text-muted-foreground/70">Use the form above to add your first reflection!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {dayEntries.map((entry) => {
                const entryTime = entry.createdAt
                  ? format(parseISO(entry.createdAt), "hh:mm a")
                  : "Logged";

                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-card border border-border/60 space-y-3 shadow-xs hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-primary" /> {entryTime}
                        </Badge>
                        {entry.isBookmarked && (
                          <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
                        )}
                      </div>

                      {/* Delete Option (Permitted for locked memories) */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTargetId(entry.id)}
                        className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {entry.title && (
                      <h4 className="text-base font-bold text-foreground">{entry.title}</h4>
                    )}

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>

                    {(entry.mood || (entry.tags && entry.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                        {entry.mood && (
                          <Badge variant="outline" className="gap-1 font-mono text-[11px] bg-primary/5 text-primary border-primary/20">
                            Mood: {entry.mood}/5
                          </Badge>
                        )}
                        {entry.tags?.map((t) => (
                          <Badge key={t} variant="outline" className="text-[11px] capitalize">
                            #{t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Journal Memory?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              Are you sure you want to delete this journal memory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Memory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
