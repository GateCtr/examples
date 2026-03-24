// app/api/chat/route.ts
// Standard (non-streaming) chat completion via GateCtr.
//
// GateCtr sits between Next.js and the LLM provider:
//   Next.js → GateCtr → OpenAI/Anthropic/Mistral
//
// Budget Firewall: if the project budget is exceeded, GateCtr returns 429
// with code "budget_exceeded" — handled below with a clear error response.

import { GateCtr, GateCtrApiError } from "@gatectr/sdk";
import { NextResponse } from "next/server";

const client = new GateCtr();

export async function POST(req: Request): Promise<NextResponse> {
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
  };

  try {
    const response = await client.chat({
      model: "gpt-4o",
      // Context Optimizer compresses the prompt before sending — ~40% fewer tokens.
      // Pro plan feature. Remove or set optimize: false to disable.
      messages,
      max_tokens: 512,
    });

    return NextResponse.json({
      content: response.choices[0]?.message.content ?? "",
      // GateCtr metadata: tokens used, cost, model actually used, savings
      gatectr: response.gatectr,
    });
  } catch (err: unknown) {
    // Budget Firewall: hard cap reached — GateCtr blocks the request
    if (err instanceof GateCtrApiError && err.code === "budget_exceeded") {
      return NextResponse.json(
        {
          error: "Budget limit reached. Adjust your limit in the GateCtr dashboard.",
          code: err.code,
          requestId: err.requestId,
        },
        { status: 429 }
      );
    }

    if (err instanceof GateCtrApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code, requestId: err.requestId },
        { status: err.status }
      );
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
