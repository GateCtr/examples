// express-proxy/index.ts
// Drop-in proxy for existing OpenAI calls.
//
// Point your app at http://localhost:3001/v1 instead of https://api.openai.com/v1
// and GateCtr handles the rest — Budget Firewall, Context Optimizer, Model Router.
//
// Zero code changes required in your existing app.
// Your OpenAI API key is replaced by your GATECTR_API_KEY.

import express, { type Request, type Response } from "express";
import { GateCtr, GateCtrApiError } from "@gatectr/sdk";

const app = express();
app.use(express.json());

const client = new GateCtr();
const PORT = process.env["PORT"] ?? "3001";

// ── POST /v1/chat/completions ─────────────────────────────────────────────────
// Mirrors the OpenAI chat completions endpoint shape.
// Existing apps using openai SDK can point baseURL here with no other changes.
app.post("/v1/chat/completions", async (req: Request, res: Response) => {
  const { model, messages, max_tokens, temperature, stream } = req.body as {
    model?: string;
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
  };

  // Streaming path — forward chunks as SSE
  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      for await (const chunk of client.stream({
        model: model ?? "gpt-4o",
        messages,
        ...(max_tokens !== undefined && { max_tokens }),
      })) {
        if (chunk.delta) {
          // OpenAI-compatible SSE format
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: chunk.delta } }] })}\n\n`
          );
        }
      }
      res.write("data: [DONE]\n\n");
    } catch (err: unknown) {
      if (err instanceof GateCtrApiError && err.code === "budget_exceeded") {
        res.write(`data: ${JSON.stringify({ error: "budget_exceeded" })}\n\n`);
      }
    } finally {
      res.end();
    }
    return;
  }

  // Standard (non-streaming) path
  try {
    const response = await client.chat({
      model: model ?? "gpt-4o",
      messages,
      ...(max_tokens !== undefined && { max_tokens }),
      ...(temperature !== undefined && { temperature }),
    });

    // Return OpenAI-compatible response shape so existing code needs zero changes
    res.json({
      id: response.gatectr.requestId,
      object: "chat.completion",
      model: response.gatectr.modelUsed ?? model ?? "gpt-4o",
      choices: response.choices,
      usage: response.usage,
      // GateCtr extras — available but won't break existing parsers
      gatectr: response.gatectr,
    });
  } catch (err: unknown) {
    if (err instanceof GateCtrApiError && err.code === "budget_exceeded") {
      res.status(429).json({
        error: {
          message: "Budget limit reached. Adjust your limit in the GateCtr dashboard.",
          type: "budget_exceeded",
          code: err.code,
        },
      });
      return;
    }

    if (err instanceof GateCtrApiError) {
      res.status(err.status).json({
        error: { message: err.message, code: err.code },
      });
      return;
    }

    res.status(500).json({ error: { message: "Unexpected error" } });
  }
});

// ── POST /v1/completions ──────────────────────────────────────────────────────
// Legacy completions endpoint (text-davinci-003 style).
app.post("/v1/completions", async (req: Request, res: Response) => {
  const { model, prompt, max_tokens, temperature } = req.body as {
    model?: string;
    prompt: string;
    max_tokens?: number;
    temperature?: number;
  };

  try {
    const response = await client.complete({
      model: model ?? "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      ...(max_tokens !== undefined && { max_tokens }),
      ...(temperature !== undefined && { temperature }),
    });

    res.json({
      id: response.gatectr.requestId,
      object: "text_completion",
      model: response.gatectr.modelUsed ?? model ?? "gpt-4o",
      choices: response.choices,
      usage: response.usage,
      gatectr: response.gatectr,
    });
  } catch (err: unknown) {
    if (err instanceof GateCtrApiError) {
      res.status(err.status).json({ error: { message: err.message, code: err.code } });
      return;
    }
    res.status(500).json({ error: { message: "Unexpected error" } });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", proxy: "gatectr" });
});

app.listen(PORT, () => {
  console.log(`GateCtr proxy running on http://localhost:${PORT}`);
  console.log(`  POST /v1/chat/completions  — drop-in for OpenAI chat`);
  console.log(`  POST /v1/completions       — drop-in for OpenAI complete`);
  console.log(`  GET  /health               — health check`);
});
