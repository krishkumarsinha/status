"use client";

import { useMemo } from "react";
import { Transaction, CATEGORY_EMOJIS, CURRENCY_SYMBOLS } from "@/types";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#64748b"
];

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const currency = useSettingsStore((state) => state.settings.currency || "INR");
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

  const chartData = useMemo(() => {
    const expenses = transactions.filter((tx) => tx.type === "expense");
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        emoji: CATEGORY_EMOJIS[category] || "📦",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-6 text-center">
        <p className="text-sm text-muted-foreground">No expense data available for breakdown.</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full h-52 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip
                formatter={((value: any) => [
                  `${currencySymbol}${Number(value).toLocaleString()}`,
                  "Amount",
                ]) as never}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground font-medium">Total</span>
            <span className="text-sm font-bold">
              {currencySymbol}{totalExpense.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {chartData.map((item, idx) => {
            const percentage = Math.round((item.value / totalExpense) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="capitalize">{item.emoji} {item.name}</span>
                </div>
                <div className="font-semibold text-muted-foreground">
                  {currencySymbol}{item.value.toLocaleString()} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
