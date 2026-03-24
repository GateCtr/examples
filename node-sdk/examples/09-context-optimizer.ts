// examples/09-context-optimizer.ts
// Demonstrates the Context Optimizer — compares tokensSaved with optimize on vs off.
//
// Context Optimizer is a GateCtr Pro feature.
// It compresses your prompts before sending them to the LLM — same output, ~40% fewer tokens.
// You pay your LLM provider for fewer tokens. GateCtr measures the savings.

import { GateCtr } from "@gatectr/sdk";

const prompt = `
You are a helpful assistant. The user has a question about software architecture.
Please provide a detailed, thoughtful, and comprehensive answer.
Consider all relevant trade-offs, best practices, and real-world constraints.

User question: What are the main differences between REST and GraphQL APIs?
`;

// Call 1: Context Optimizer enabled — GateCtr compresses the prompt
const clientOptimized = new GateCtr({ optimize: true });
const withOptimizer = await clientOptimized.complete({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 200,
});

// Call 2: Context Optimizer disabled — prompt sent as-is
const clientRaw = new GateCtr({ optimize: false });
const withoutOptimizer = await clientRaw.complete({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 200,
});

const saved = withOptimizer.gatectr.tokensSaved;
const baseline = withoutOptimizer.usage.prompt_tokens;
const pct = baseline > 0 ? ((saved / baseline) * 100).toFixed(1) : "n/a";

console.log("--- Context Optimizer comparison ---");
console.log(`With optimizer:    tokensSaved = ${String(saved)}`);
console.log(`Without optimizer: tokensSaved = ${String(withoutOptimizer.gatectr.tokensSaved)}`);
console.log(`Prompt tokens (baseline): ${String(baseline)}`);
console.log(`Savings: ${String(saved)} tokens (${pct}%)`);
