// examples/11-model-router.ts
// Demonstrates the Model Router — GateCtr auto-selects the optimal LLM per request.
//
// Model Router is a GateCtr Pro feature.
// It scores each request by semantic complexity, then picks the model with the best
// cost + latency profile for that complexity level.
// Simple requests → cheaper model. Complex requests → capable model.
// You pass a model as a hint; GateCtr may route to a different one.

import { GateCtr } from "@gatectr/sdk";

// Enable Model Router at the client level — applies to all requests by default
const client = new GateCtr({ route: true });

// --- Request 1: routing enabled (client default) ---
// GateCtr scores this prompt and picks the optimal model
const r1 = await client.chat({
  model: "gpt-4o", // hint — GateCtr may route to a different model
  messages: [
    { role: "user", content: "What is 2 + 2?" }, // simple → likely routed to a cheaper model
  ],
  max_tokens: 20,
});

// modelUsed shows which model actually processed the request
console.log("Request 1 (route: true)");
console.log("  modelUsed:", r1.gatectr.modelUsed); // may differ from "gpt-4o"
console.log("  reply:    ", r1.choices[0]?.message.content);

// --- Request 2: override routing OFF for this specific call ---
// Use case: you need a specific model for compliance, testing, or reproducibility.
const r2 = await client.chat({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Explain quantum entanglement in simple terms." }],
  max_tokens: 100,
  gatectr: {
    route: false, // disable Model Router for this request — use exactly "gpt-4o"
  },
});

console.log("\nRequest 2 (route: false override)");
console.log("  modelUsed:", r2.gatectr.modelUsed); // will be "gpt-4o" as requested
console.log("  reply:    ", r2.choices[0]?.message.content);
