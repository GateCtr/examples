// examples/02-complete.ts
// Demonstrates client.complete() — text completion with full GateCtr metadata.

import { GateCtr } from "@gatectr/sdk";

const client = new GateCtr(); // reads GATECTR_API_KEY from env

const response = await client.complete({
  model: "gpt-4o",
  messages: [
    { role: "user", content: "Explain what a middleware gateway does in one sentence." },
  ],
  max_tokens: 100,   // cap output tokens
  temperature: 0.7,  // 0 = deterministic, 1 = creative
});

// The completion text from the model
console.log("Text:", response.choices[0]?.text);

// GateCtr metadata — present on every response
const meta = response.gatectr;
console.log("GateCtr metadata:", {
  requestId: meta.requestId,   // unique ID for this request — use for support tickets
  latencyMs: meta.latencyMs,   // end-to-end latency measured by GateCtr
  overage: meta.overage,       // true if this request exceeded your budget cap
  modelUsed: meta.modelUsed,   // actual model that processed the request (may differ if routed)
  tokensSaved: meta.tokensSaved, // tokens saved by Context Optimizer (0 if optimize: false)
});
