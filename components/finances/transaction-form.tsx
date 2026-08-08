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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/category-icons";
import { getTrackingDate } from "@/lib/date-utils";

interface TransactionFormProps {
  onSuccess?: () => void;
  initialDate?: string;
}

export function TransactionForm({ onSuccess, initialDate }: TransactionFormProps) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const currency = useSettingsStore((state) => state.settings.currency || "INR");
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("food");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(initialDate || getTrackingDate());

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
    if (onSuccess) onSuccess();
  };

  const currentCategories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategory("food");
          }}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
            type === "expense"
              ? "bg-destructive text-destructive-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategory("salary");
          }}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
            type === "income"
              ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount & Currency */}
      <div className="space-y-1.5">
        <Label htmlFor="amount" className="text-xs">Amount ({currencySymbol})</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
            {currencySymbol}
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-xs">Category</Label>
        <Select
          value={category}
          onValueChange={(val) => { if (val) setCategory(val); }}
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {currentCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cat, "w-4 h-4 text-muted-foreground")}
                  <span className="capitalize">{cat}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="tx-date" className="text-xs">Date</Label>
        <Input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="e.g. Lunch with team, Freelance invoice"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full mt-2">
        Add {type === "expense" ? "Expense" : "Income"}
      </Button>
    </form>
  );
}
