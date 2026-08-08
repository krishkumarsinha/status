"use client";

import { useState, useEffect } from "react";
import { useHealthStore } from "@/lib/stores/health-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { getTrackingDate } from "@/lib/date-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Moon, Droplets, Footprints, Dumbbell } from "lucide-react";
import { Workout } from "@/types";

const WORKOUT_TYPES = [
  "Running",
  "Walking",
  "Cycling",
  "Swimming",
  "Yoga",
  "Strength Training",
  "HIIT",
  "Other",
];

export function HealthForm() {
  const { addEntry, getTodayEntry } = useHealthStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  const [weight, setWeight] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [waterIntake, setWaterIntake] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [workoutType, setWorkoutType] = useState<string>("none");
  const [workoutDuration, setWorkoutDuration] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      if (todayEntry.weight) {
        setWeight(settings.unitSystem === "imperial" ? (todayEntry.weight * 2.20462).toFixed(1) : todayEntry.weight.toString());
      }
      if (todayEntry.sleepHours) setSleepHours(todayEntry.sleepHours.toString());
      if (todayEntry.waterIntake) {
        setWaterIntake(settings.unitSystem === "imperial" ? (todayEntry.waterIntake / 29.5735).toFixed(0) : todayEntry.waterIntake.toString());
      }
      if (todayEntry.steps) setSteps(todayEntry.steps.toString());
      if (todayEntry.workout) {
        setWorkoutType(todayEntry.workout.type);
        setWorkoutDuration(todayEntry.workout.durationMinutes.toString());
      }
    }
  }, [getTodayEntry, settings.unitSystem]);

  if (!mounted) return null;

  const isImperial = settings.unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";
  const waterUnit = isImperial ? "oz" : "ml";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedWeight = weight ? parseFloat(weight) : undefined;
    if (parsedWeight && isImperial) {
      parsedWeight = parsedWeight / 2.20462; // Convert back to kg for storage
    }

    let parsedWater = waterIntake ? parseFloat(waterIntake) : undefined;
    if (parsedWater && isImperial) {
      parsedWater = parsedWater * 29.5735; // Convert back to ml for storage
    }

    let workout: Workout | undefined = undefined;
    if (workoutType !== "none" && workoutDuration) {
      workout = {
        type: workoutType,
        durationMinutes: parseInt(workoutDuration, 10),
      };
    }

    addEntry({
      date: getTrackingDate(),
      weight: parsedWeight,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      waterIntake: parsedWater,
      steps: steps ? parseInt(steps, 10) : undefined,
      workout,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Today's Health</CardTitle>
        <CardDescription>Track your daily health metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                Weight ({weightUnit})
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder={`e.g. ${isImperial ? "150" : "70"}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sleep" className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                Sleep (hours)
              </Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g. 7.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water" className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                Water ({waterUnit})
              </Label>
              <Input
                id="water"
                type="number"
                step="1"
                placeholder={`e.g. ${isImperial ? "64" : "2000"}`}
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps" className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-muted-foreground" />
                Steps
              </Label>
              <Input
                id="steps"
                type="number"
                step="1"
                placeholder="e.g. 10000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
              Workout (Optional)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout-type" className="text-xs">Type</Label>
                <Select value={workoutType} onValueChange={(val) => { if (val) setWorkoutType(val); }}>
                  <SelectTrigger id="workout-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-duration" className="text-xs">Duration (minutes)</Label>
                <Input
                  id="workout-duration"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 45"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  disabled={workoutType === "none"}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">Save Health Log</Button>
        </form>
      </CardContent>
    </Card>
  );
}
