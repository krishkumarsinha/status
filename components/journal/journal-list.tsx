"use client";

import { useState } from "react";
import { JournalEntry, MOOD_EMOJIS } from "@/types";
import { useJournalStore } from "@/lib/stores/journal-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, Trash2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

interface JournalListProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export function JournalList({ onSelectDate, selectedDate }: JournalListProps) {
  const entries = useJournalStore((state) => state.entries);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const toggleBookmark = useJournalStore((state) => state.toggleBookmark);

  const [search, setSearch] = useState("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesBookmark = !onlyBookmarked || e.isBookmarked;
    return matchesSearch && matchesBookmark;
  });

  return (
    <Card className="h-full flex flex-col shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold mb-2">Past Journal Entries</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button
            variant={onlyBookmarked ? "default" : "outline"}
            size="sm"
            className="h-8 px-2.5"
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[550px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {onlyBookmarked ? "No bookmarked journal entries." : "No journal entries found."}
          </div>
        ) : (
          filtered.map((entry) => {
            const isSelected = entry.date === selectedDate;
            return (
              <div
                key={entry.id}
                onClick={() => onSelectDate(entry.date)}
                className={`p-3.5 rounded-md border transition-all cursor-pointer group ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/60 hover:border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </span>
                    {entry.mood && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono font-bold text-primary border-primary/30">
                        {entry.mood}/5
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-amber-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(entry.id);
                      }}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          entry.isBookmarked ? "text-amber-500 fill-current" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {entry.title && (
                  <h4 className="font-semibold text-sm line-clamp-1 mb-1 text-foreground">
                    {entry.title}
                  </h4>
                )}

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {entry.content}
                </p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
