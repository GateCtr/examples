// examples/08-per-request-options.ts
// Demonstrates per-request gatectr options that override client-level defaults.

import { GateCtr } from "@gatectr/sdk";

// Client defaults: optimize enabled, route disabled
const client = new GateCtr({ optimize: true, route: false });

// --- Request 1: override optimize OFF for this specific call ---
// Use case: you're sending a short, already-minimal prompt where compression adds no value.
const r1 = await client.complete({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Say hi." }],
  gatectr: {
    optimize: false, // disable Context Optimizer for this request only
    route: false,    // keep routing off (same as client default)
  },
});
console.log("Request 1 (optimize: false) — tokensSaved:", r1.gatectr.tokensSaved); // 0

// --- Request 2: override route ON for this specific call ---
// Use case: this is a complex prompt where you want GateCtr to pick the best model.
const r2 = await client.complete({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Summarize the history of the Roman Empire in 3 sentences." }],
  gatectr: {
    optimize: true,  // keep optimization on (same as client default)
    route: true,     // enable Model Router for this request — GateCtr picks the optimal model
    // budgetId: "proj_abc123" — optionally scope this request to a specific budget
  },
});
console.log("Request 2 (route: true) — modelUsed:", r2.gatectr.modelUsed);
console.log("Request 2 (route: true) — tokensSaved:", r2.gatectr.tokensSaved);
