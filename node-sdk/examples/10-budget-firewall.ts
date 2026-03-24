// examples/10-budget-firewall.ts
// Demonstrates the Budget Firewall — catching budget_exceeded errors gracefully.
//
// Budget Firewall is available on all plans including Free.
// Set hard token/cost caps per project in your GateCtr dashboard.
// When a request would exceed the cap, GateCtr blocks it and returns a 429.
// No surprise invoices. You control the ceiling.

import { GateCtr, GateCtrApiError } from "@gatectr/sdk";

const client = new GateCtr();

async function askWithFallback(question: string): Promise<string> {
  try {
    const response = await client.complete({
      model: "gpt-4o",
      messages: [{ role: "user", content: question }],
      max_tokens: 200,
    });
    return response.choices[0]?.text ?? "";
  } catch (err) {
    if (err instanceof GateCtrApiError) {
      if (err.code === "budget_exceeded" || err.code === "rate_limit_exceeded") {
        // Budget Firewall triggered — request blocked before reaching the LLM provider
        console.warn("Budget cap reached.");
        console.warn("  status:    ", err.status);     // 429
        console.warn("  code:      ", err.code);       // "budget_exceeded"
        console.warn("  requestId: ", err.requestId);  // for support / audit trail

        // Graceful fallback — return a safe default instead of crashing
        return "Service temporarily unavailable. Please try again later.";
      }
    }
    throw err; // re-throw unexpected errors
  }
}

const answer = await askWithFallback("Summarize the GateCtr platform in one sentence.");
console.log("Answer:", answer);
