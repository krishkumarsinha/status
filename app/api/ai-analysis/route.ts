import { NextRequest, NextResponse } from "next/server";
import { synthesizeAIAnalysis } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habits, healthEntries, moodEntries, transactions, journalEntries, settings, userPrompt } = body;

    const analysis = synthesizeAIAnalysis(
      habits || [],
      healthEntries || [],
      moodEntries || [],
      transactions || [],
      journalEntries || [],
      settings || {},
      userPrompt
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[API AI Analysis Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate AI data analysis" },
      { status: 500 }
    );
  }
}
