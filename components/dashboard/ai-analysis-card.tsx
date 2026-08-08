"use client";

import { useState } from "react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { requestAIAnalysisFromAPI, AIAnalysisResult } from "@/lib/ai/ai-service";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Bot, 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Send, 
  Zap, 
  RefreshCw,
  Compass,
  ListChecks
} from "lucide-react";

export function AIAnalysisCard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const habits = useHabitStore((state) => state.habits);
  const healthEntries = useHealthStore((state) => state.entries);
  const moodEntries = useMoodStore((state) => state.entries);
  const transactions = useFinanceStore((state) => state.transactions);
  const journalEntries = useJournalStore((state) => state.entries);
  const settings = useSettingsStore((state) => state.settings);

  const runAIScan = async (overridePrompt?: string) => {
    setIsAnalyzing(true);
    const promptToUse = overridePrompt !== undefined ? overridePrompt : customPrompt;

    try {
      const result = await requestAIAnalysisFromAPI({
        habits,
        healthEntries,
        moodEntries,
        transactions,
        journalEntries,
        settings,
        userPrompt: promptToUse || undefined,
      });

      setAiResult(result);
    } catch (err) {
      console.error("[AI Card Error]:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickChip = (chipText: string) => {
    setCustomPrompt(chipText);
    runAIScan(chipText);
  };

  return (
    <Card className="border-border/60 shadow-xs overflow-hidden transition-all bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered Intelligence
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-1.5 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> Personal AI Data Analyst & Coach
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Ask questions and get AI recommendations synthesized across all your tracking data.
            </CardDescription>
          </div>

          <Button
            onClick={() => runAIScan()}
            disabled={isAnalyzing}
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Data...
              </>
            ) : (
              <>
                <Brain className="w-3.5 h-3.5" /> {aiResult ? "Re-Run AI Scan" : "Generate AI Deep Scan"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Custom AI Prompt Input & Quick Chips */}
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAIScan();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Ask AI anything (e.g. How to optimize my sleep and mood correlation?)"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" disabled={isAnalyzing} className="gap-1 text-xs shrink-0">
              <Send className="w-3.5 h-3.5" /> Ask AI
            </Button>
          </form>

          {/* Quick Prompt Recommendation Chips */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">Suggested Scans:</span>
            <button
              type="button"
              onClick={() => handleQuickChip("Analyze Sleep vs Mood Correlation")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border/50 font-medium"
            >
              😴 Sleep vs Mood
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Audit Financial Expenses vs Income")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border/50 font-medium"
            >
              💳 Financial Audit
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Suggest top micro-habit for this week")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border/50 font-medium"
            >
              🎯 Micro-Habit Recommendation
            </button>
          </div>
        </div>

        {/* AI Analysis Results View */}
        {aiResult ? (
          <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in duration-300">
            <Tabs value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val); }}>
              <TabsList className="w-full justify-start overflow-x-auto text-xs">
                <TabsTrigger value="summary" className="gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Executive Summary
                </TabsTrigger>
                <TabsTrigger value="correlations" className="gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Hidden Links
                </TabsTrigger>
                <TabsTrigger value="plan" className="gap-1.5 text-xs">
                  <ListChecks className="w-3.5 h-3.5 text-emerald-500" /> Action Plan
                </TabsTrigger>
                <TabsTrigger value="forecast" className="gap-1.5 text-xs">
                  <Compass className="w-3.5 h-3.5 text-blue-500" /> 7-Day Forecast
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Executive Summary */}
              <TabsContent value="summary" className="pt-3 space-y-4">
                <div className="p-4 rounded-md bg-card border border-border/60 space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Synthesized Evaluation
                  </h4>
                  <p className="text-xs leading-relaxed text-foreground font-medium">
                    {aiResult.overallExecutiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Strengths */}
                  <div className="p-3.5 rounded-md bg-emerald-500/5 border border-emerald-500/10 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Key Accomplishments
                    </span>
                    <ul className="space-y-1">
                      {aiResult.keyStrengths.map((s, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Focus Areas */}
                  <div className="p-3.5 rounded-md bg-amber-500/5 border border-amber-500/10 space-y-1.5">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Critical Focus Areas
                    </span>
                    <ul className="space-y-1">
                      {aiResult.criticalFocusAreas.map((f, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Hidden Correlations */}
              <TabsContent value="correlations" className="pt-3 space-y-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Cross-Domain Behavioral Patterns
                  </h4>
                  {aiResult.crossDomainCorrelations.map((c, i) => (
                    <div key={i} className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-foreground flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3: Action Plan */}
              <TabsContent value="plan" className="pt-3 space-y-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-500" /> Tailored Daily Action Plan
                  </h4>
                  {aiResult.personalizedActionPlan.map((step, i) => (
                    <div key={i} className="p-3 rounded-md bg-card border border-border/60 text-xs flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {i + 1}
                      </div>
                      <span className="font-medium text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 4: Forecast */}
              <TabsContent value="forecast" className="pt-3 space-y-2">
                <div className="p-4 rounded-md bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-500" /> 7-Day Predictive Trend Outlook
                  </h4>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {aiResult.forecast7Day}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-6 text-center space-y-3 rounded-md bg-card/60 border border-dashed border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold">Ready for AI Data Scan</h4>
              <p className="text-xs text-muted-foreground">
                Click "Generate AI Deep Scan" or select a suggested topic to synthesize multi-domain insights and personal recommendations.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
