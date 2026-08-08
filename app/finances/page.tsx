"use client";

import { useState, useEffect } from "react";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { CURRENCY_SYMBOLS } from "@/types";
import { QuickInputCard } from "@/components/finances/quick-input-card";
import { TransactionList } from "@/components/finances/transaction-list";
import { ExpenseChart } from "@/components/finances/expense-chart";
import { SavingsTab } from "@/components/finances/savings-tab";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FoldText } from "@/components/ui/fold-text";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank, Receipt, Pencil, Check } from "lucide-react";
import { format } from "date-fns";

export default function FinancesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState<string>("");

  const transactions = useFinanceStore((state) => state.transactions);
  const getMonthlySummary = useFinanceStore((state) => state.getMonthlySummary);
  
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency || "INR"] || "₹";

  const loadFinances = useFinanceStore((state) => state.loadFinances);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    setMounted(true);
    loadFinances();
    loadSettings();
  }, [loadFinances, loadSettings]);

  if (!mounted) return null;

  const currentMonthSummary = getMonthlySummary(new Date());
  const monthlyBudget = settings.monthlyBudget || 50000;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(newBudgetInput);
    if (!isNaN(parsed) && parsed > 0) {
      await updateSettings({ monthlyBudget: parsed });
      setIsBudgetOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><FoldText text="Finances" splitBy="char" trigger="mount" fontSize="inherit" fontWeight={700} /></h1>
          <p className="text-muted-foreground mt-1">
            Manage your income, expenses, monthly budget, and savings targets.
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <Tabs value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val); }}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <Receipt className="w-3.5 h-3.5" /> Overview & Transactions
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-1.5 text-xs">
              <PiggyBank className="w-3.5 h-3.5" /> Savings Goals
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Income */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Income</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{currencySymbol}{currentMonthSummary.totalIncome.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(), "MMMM yyyy")}</p>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expenses</span>
                  <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-destructive">
                  -{currencySymbol}{currentMonthSummary.totalExpenses.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(), "MMMM yyyy")}</p>
              </CardContent>
            </Card>

            {/* Net Savings */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Balance</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold ${
                  currentMonthSummary.netBalance >= 0 ? "text-foreground" : "text-destructive"
                }`}>
                  {currentMonthSummary.netBalance >= 0 ? "" : "-"}
                  {currencySymbol}{Math.abs(currentMonthSummary.netBalance).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Income minus Expenses</p>
              </CardContent>
            </Card>

            {/* Editable Monthly Budget Card (Clean Amount Only) */}
            <Card className="hover:shadow-sm transition-shadow relative">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Budget</span>
                  <div className="flex items-center gap-1">
                    <Dialog open={isBudgetOpen} onOpenChange={(open) => {
                      setIsBudgetOpen(open);
                      if (open) setNewBudgetInput(monthlyBudget.toString());
                    }}>
                      <DialogTrigger render={
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      } />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Monthly Budget Limit</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="budget-input">Target Monthly Limit ({currencySymbol})</Label>
                            <Input
                              id="budget-input"
                              type="number"
                              min="1"
                              step="any"
                              value={newBudgetInput}
                              onChange={(e) => setNewBudgetInput(e.target.value)}
                              placeholder="50000"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsBudgetOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="gap-1.5">
                              <Check className="w-4 h-4" /> Save Budget
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {currencySymbol}{monthlyBudget.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {format(new Date(), "MMMM yyyy")} Target Limit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Input Section + Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <QuickInputCard />
            </div>
            <div className="lg:col-span-2">
              <ExpenseChart transactions={transactions} />
            </div>
          </div>

          {/* Full Transaction History */}
          <div>
            <TransactionList transactions={transactions} />
          </div>
        </div>
      ) : (
        /* Savings Tab */
        <SavingsTab />
      )}
    </div>
  );
}
