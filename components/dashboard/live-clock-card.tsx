"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Globe } from "lucide-react";

export function LiveClockCard() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <Card className="h-32 animate-pulse bg-muted/40 border-border/50" />
    );
  }

  const timeString = format(time, "hh:mm:ss");
  const ampm = format(time, "a");
  const dayName = format(time, "EEEE");
  const dateFormatted = format(time, "MMMM d, yyyy");

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-border/60 shadow-xs">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Time & Live Indicator */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live System Clock
              </span>
              <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Globe className="w-2.5 h-2.5" /> IST (UTC +5:30)
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-foreground">
                {timeString}
              </span>
              <span className="text-xl font-bold font-mono text-primary">
                {ampm}
              </span>
            </div>
          </div>

          {/* Date & Day */}
          <div className="sm:text-right space-y-1 sm:border-l sm:border-border/50 sm:pl-6">
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Today's Tracking Day
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-foreground">
              {dayName}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {dateFormatted}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
