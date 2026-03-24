// app/api/budget-status/route.ts
// Returns current token usage for the past 30 days.
//
// Use this to surface budget consumption in your UI before making LLM calls —
// so users see how close they are to the limit before hitting a 429.

import { GateCtr, GateCtrApiError } from "@gatectr/sdk";
import { NextResponse } from "next/server";

const client = new GateCtr();

export async function GET(): Promise<NextResponse> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const usage = await client.usage({
      from: thirtyDaysAgo.toISOString(),
      to: now.toISOString(),
    });

    return NextResponse.json({
      totalTokens: usage.totalTokens,
      totalRequests: usage.totalRequests,
      totalCostUsd: usage.totalCostUsd,
      savedTokens: usage.savedTokens, // tokens saved by Context Optimizer
    });
  } catch (err: unknown) {
    if (err instanceof GateCtrApiError) {
      return NextResponse.json(
        { error: err.message, requestId: err.requestId },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
