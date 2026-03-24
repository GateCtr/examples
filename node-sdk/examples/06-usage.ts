// examples/06-usage.ts
// Demonstrates client.usage() with date-range filtering and full breakdown.

import { GateCtr } from "@gatectr/sdk";

const client = new GateCtr();

// Date format: YYYY-MM-DD — both from and to are inclusive
const from = "2025-03-01";
const to = "2025-03-31";

const usage = await client.usage({ from, to });

console.log(`Usage from ${from} to ${to}\n`);

// Total tokens consumed across all projects in the period
console.log("totalTokens:   ", usage.totalTokens.toLocaleString());

// Total number of API requests made
console.log("totalRequests: ", usage.totalRequests.toLocaleString());

// Total cost in USD billed to your LLM providers (not GateCtr — you pay providers directly)
console.log("totalCostUsd:  $", usage.totalCostUsd.toFixed(4));

// Tokens saved by the Context Optimizer during this period
console.log("savedTokens:   ", usage.savedTokens.toLocaleString());

// Per-project breakdown
console.log("\nBy project:");
for (const project of usage.byProject) {
  console.log(`  ${project.projectId ?? "default"}`);
  console.log(`    tokens:   ${project.totalTokens.toLocaleString()}`);
  console.log(`    requests: ${project.totalRequests.toLocaleString()}`);
  console.log(`    cost:    $${project.totalCostUsd.toFixed(4)}`);
}
