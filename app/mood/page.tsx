"use client";

import { useEffect } from "react";
import { useMoodStore } from "@/lib/stores/mood-store";
import { MoodCheckin } from "@/components/mood/mood-checkin";
import { MoodChart } from "@/components/mood/mood-chart";
import { TagChart } from "@/components/mood/tag-chart";

export default function MoodPage() {
  const loadMood = useMoodStore((state) => state.loadMood);

  useEffect(() => {
    loadMood();
  }, [loadMood]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mood</h1>
        <p className="text-muted-foreground mt-1">How are you feeling today?</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Top: Check-in Card */}
        <section>
          <MoodCheckin />
        </section>

        {/* Bottom: Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MoodChart />
          <TagChart />
        </section>
      </div>
    </div>
  );
}
