"use client";

import { useState } from "react";
import { SavingsGoal, CURRENCY_SYMBOLS } from "@/types";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBank, Plus, TrendingUp, Trash2, Calendar, Target, Sparkles, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

export function SavingsTab() {
  const savingsGoals = useFinanceStore((state) => state.savingsGoals || []);
  const addSavingsGoal = useFinanceStore((state) => state.addSavingsGoal);
  const deleteSavingsGoal = useFinanceStore((state) => state.deleteSavingsGoal);
  const depositToSavings = useFinanceStore((state) => state.depositToSavings);
  const withdrawFromSavings = useFinanceStore((state) => state.withdrawFromSavings);

  const currency = useSettingsStore((state) => state.settings.currency || "INR");
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("Emergency Fund");

  // State for quick deposit modal
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(currentAmount) || 0;

    if (!name.trim() || isNaN(target) || target <= 0) return;

    addSavingsGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: initial,
      category,
      targetDate: targetDate || undefined,
    });

    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate("");
    setIsAddOpen(false);
  };

  const handleTransactionOnGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (depositType === "deposit") {
      depositToSavings(selectedGoalId, amt);
    } else {
      withdrawFromSavings(selectedGoalId, amt);
    }

    setDepositAmount("");
    setSelectedGoalId(null);
  };

  const totalSaved = savingsGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Saved</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {currencySymbol}{totalSaved.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <PiggyBank className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Target</p>
              <h3 className="text-2xl font-extrabold mt-1">
                {currencySymbol}{totalTarget.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Goal Progress</p>
              <span className="text-sm font-extrabold text-primary">{overallPercentage}%</span>
            </div>
            <Progress value={overallPercentage} className="h-2 mt-2" />
            <p className="text-[11px] text-muted-foreground mt-2">
              {savingsGoals.length} active savings goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Savings Goals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set targets for emergencies, investments, travel, or big purchases.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button size="sm" className="shadow-xs gap-1.5" />}>
            <Plus className="w-4 h-4" /> Add Savings Goal
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="goal-name" className="text-xs">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g. Emergency Fund, New Laptop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="target-amount" className="text-xs">Target Amount ({currencySymbol})</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="current-amount" className="text-xs">Already Saved ({currencySymbol})</Label>
                  <Input
                    id="current-amount"
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-category" className="text-xs">Category</Label>
                  <Input
                    id="goal-category"
                    placeholder="e.g. Vacation, Investment"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target-date" className="text-xs">Target Date (Optional)</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Create Savings Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Savings Goals Cards Grid */}
      {savingsGoals.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl">
            🐷
          </div>
          <h3 className="font-bold text-lg">No Savings Goals Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Create your first savings goal to track your emergency fund, vacation, or big milestone purchases.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <Card key={goal.id} className="flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        {goal.name}
                        {isCompleted && <Sparkles className="w-4 h-4 text-amber-500 fill-current" />}
                      </CardTitle>
                      {goal.category && (
                        <Badge variant="secondary" className="text-[10px] mt-1 font-medium">
                          {goal.category}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteSavingsGoal(goal.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={isCompleted ? "text-emerald-600 font-bold" : "text-foreground"}>
                        {percentage}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Saved</span>
                      <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                        {currencySymbol}{goal.currentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[10px]">Target</span>
                      <span className="font-bold text-sm">
                        {currencySymbol}{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" /> Target Date:{" "}
                      {format(parseISO(goal.targetDate), "MMM d, yyyy")}
                    </div>
                  )}

                  {/* Deposit / Withdraw Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                      size="xs"
                      variant="outline"
                      className="flex-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setDepositType("deposit");
                      }}
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Deposit
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      className="flex-1 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setDepositType("withdraw");
                      }}
                    >
                      <ArrowDownLeft className="w-3 h-3 mr-1" /> Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deposit / Withdraw Dialog Modal */}
      <Dialog open={!!selectedGoalId} onOpenChange={(open) => !open && setSelectedGoalId(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {depositType === "deposit" ? "Add Savings Deposit" : "Withdraw from Savings"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionOnGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount ({currencySymbol})</Label>
              <Input
                type="number"
                placeholder="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className={`w-full ${
                depositType === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              Confirm {depositType === "deposit" ? "Deposit" : "Withdrawal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
