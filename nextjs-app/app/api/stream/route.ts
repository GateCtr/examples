// app/api/stream/route.ts
// Streaming chat completion via GateCtr using the Vercel AI SDK pattern.
//
// Each chunk is sent as a Server-Sent Event (text/event-stream).
// The client reads the stream incrementally — no waiting for the full response.
//
// GateCtr still applies Budget Firewall and Context Optimizer on streaming requests.

import { GateCtr, GateCtrApiError, GateCtrStreamError } from "@gatectr/sdk";

const client = new GateCtr();

export async function POST(req: Request): Promise<Response> {
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of client.stream({
          model: "gpt-4o",
          messages,
          max_tokens: 512,
        })) {
          // Each chunk.delta is a partial text fragment
          if (chunk.delta) {
            controller.enqueue(encoder.encode(`data: ${chunk.delta}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: unknown) {
        if (err instanceof GateCtrApiError && err.code === "budget_exceeded") {
          controller.enqueue(
            encoder.encode(`data: [ERROR] Budget limit reached\n\n`)
          );
        } else if (err instanceof GateCtrStreamError) {
          controller.enqueue(
            encoder.encode(`data: [ERROR] Stream interrupted\n\n`)
          );
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
