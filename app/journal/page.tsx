"use client";

import { useState, useEffect } from "react";
import { useJournalStore } from "@/lib/stores/journal-store";
import { JournalEditor } from "@/components/journal/journal-editor";
import { JournalList } from "@/components/journal/journal-list";
import { getTrackingDate } from "@/lib/date-utils";

export default function JournalPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTrackingDate());
  const loadJournal = useJournalStore((state) => state.loadJournal);

  useEffect(() => {
    setMounted(true);
    loadJournal();
  }, [loadJournal]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Journal</h1>
        <p className="text-muted-foreground mt-1">
          Capture your thoughts, reflections, and memories every single day.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JournalEditor selectedDate={selectedDate} />
        </div>
        <div>
          <JournalList selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>
    </div>
  );
}
