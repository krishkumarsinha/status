"use client";

import { useState } from "react";
import { Transaction, CATEGORY_EMOJIS, CURRENCY_SYMBOLS } from "@/types";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, ArrowUpRight, ArrowDownRight, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { isDateLocked } from "@/lib/date-utils";

import { getCategoryIcon } from "@/lib/category-icons";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const currency = useSettingsStore((state) => state.settings.currency || "INR");
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesSearch =
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="flex bg-muted p-0.5 rounded-lg text-xs">
              {(["all", "expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded-md capitalize font-medium transition-all ${
                    filterType === t
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto max-h-[420px] pt-0 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No transactions recorded yet.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/50 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                    tx.type === "income"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {getCategoryIcon(tx.category, "w-4 h-4")}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm capitalize">{tx.category}</span>
                    {tx.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">
                        • {tx.description}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {format(parseISO(tx.date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`font-semibold text-sm flex items-center justify-end ${
                      tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {currencySymbol}
                    {tx.amount.toLocaleString()}
                  </span>
                </div>
                {isDateLocked(tx.date) ? (
                  <span title="Locked Entry (Past Date)" className="p-1 text-muted-foreground/60">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => deleteTransaction(tx.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
