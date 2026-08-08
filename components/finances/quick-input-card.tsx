"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { 
  TransactionType, 
  ExpenseCategory, 
  IncomeCategory, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  CATEGORY_EMOJIS,
  CURRENCY_SYMBOLS
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, PlusCircle } from "lucide-react";
import { getTrackingDate } from "@/lib/date-utils";
import { getCategoryIcon } from "@/lib/category-icons";

export function QuickInputCard() {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const currency = useSettingsStore((state) => state.settings.currency || "INR");
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("food");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(getTrackingDate());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    addTransaction({
      type,
      amount: parsedAmount,
      category: category as ExpenseCategory | IncomeCategory,
      description: description.trim() || undefined,
      date,
    });

    setAmount("");
    setDescription("");
    setSuccessMsg(`Added ${type === "income" ? "Income" : "Expense"}: ${currencySymbol}${parsedAmount}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const currentCategories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Card className="h-full border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-primary" /> Quick Entry
          </CardTitle>

          {/* Inline Type Switcher */}
          <div className="flex bg-muted p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("food");
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                type === "expense"
                  ? "bg-destructive text-destructive-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingDown className="w-3 h-3" /> Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("salary");
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Income
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Amount ({currencySymbol})</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 h-8 text-xs"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => { if (val) setCategory(val); }}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(cat, "w-3.5 h-3.5 text-muted-foreground")}
                        <span className="capitalize">{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Description (Optional)</Label>
              <Input
                placeholder="e.g. Dinner, Bonus"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            className={`w-full h-8 text-xs font-semibold ${
              type === "income" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
            }`}
          >
            {type === "income" ? "+ Add Income" : "- Add Expense"}
          </Button>

          {successMsg && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 text-center animate-in fade-in">
              ✓ {successMsg}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
