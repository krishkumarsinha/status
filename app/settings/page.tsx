"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { UnitSystem, WeekStartDay } from "@/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, [loadSettings]);

  if (!mounted) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6 opacity-50 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const isImperial = settings.unitSystem === "imperial";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your tracking preferences and daily goals.</p>
      </div>

      <div className="space-y-6">
        {/* Units & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Units & Preferences</CardTitle>
            <CardDescription>Customize how data is displayed to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Unit System</Label>
                <p className="text-sm text-muted-foreground">
                  Use imperial (lbs, oz) instead of metric (kg, ml).
                </p>
              </div>
              <Select 
                value={settings.unitSystem} 
                onValueChange={(val) => { if (val) updateSettings({ unitSystem: val as UnitSystem }); }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, ml)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Week Start Day</Label>
                <p className="text-sm text-muted-foreground">
                  Which day should your calendars start on.
                </p>
              </div>
              <Select 
                value={settings.weekStartDay} 
                onValueChange={(val) => { if (val) updateSettings({ weekStartDay: val as WeekStartDay }); }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Goals</CardTitle>
            <CardDescription>Set your personal targets for health tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid gap-2">
              <Label htmlFor="water-goal">
                Daily Water Goal ({isImperial ? "oz" : "ml"})
              </Label>
              <div className="flex gap-4">
                <Input 
                  id="water-goal" 
                  type="number"
                  min="0"
                  value={
                    isImperial 
                      ? Math.round(settings.dailyWaterGoal * 0.033814) // ml to oz 
                      : settings.dailyWaterGoal
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isNaN(val)) return;
                    
                    const newMl = isImperial ? Math.round(val / 0.033814) : val;
                    updateSettings({ dailyWaterGoal: newMl });
                  }}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: {isImperial ? "64-100 oz" : "2000-3000 ml"}
              </p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="steps-goal">Daily Steps Goal</Label>
              <Input 
                id="steps-goal" 
                type="number"
                min="0"
                step="500"
                value={settings.dailyStepsGoal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) updateSettings({ dailyStepsGoal: val });
                }}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 8,000 - 10,000 steps
              </p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="sleep-goal">Target Sleep (Hours)</Label>
              <Input 
                id="sleep-goal" 
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={settings.targetSleepHours}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) updateSettings({ targetSleepHours: val });
                }}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 7-9 hours for adults
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
