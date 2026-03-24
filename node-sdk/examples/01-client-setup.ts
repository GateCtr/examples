// examples/01-client-setup.ts
// Demonstrates all GateCtr constructor options and GateCtrConfigError.

import { GateCtr, GateCtrConfigError } from "@gatectr/sdk";

// --- Option 1: reads GATECTR_API_KEY from environment (recommended) ---
const client = new GateCtr();
console.log("Client created from env:", client);

// --- Option 2: all constructor options explicitly ---
const clientFull = new GateCtr({
  // apiKey: omitted here — falls back to GATECTR_API_KEY env var automatically

  // baseUrl: GateCtr API endpoint. Default: "https://api.gatectr.com/v1"
  baseUrl: "https://api.gatectr.com/v1",

  // timeout: request timeout in milliseconds. Default: 30000
  timeout: 30_000,

  // maxRetries: retries on transient errors (5xx, network). Default: 3
  maxRetries: 3,

  // optimize: enable Context Optimizer globally (-40% tokens). Default: true
  // Pro plan feature — compresses prompts before sending to the LLM.
  optimize: true,

  // route: enable Model Router globally. Default: false
  // Pro plan feature — GateCtr picks the optimal LLM by cost + latency.
  route: false,
});
console.log("Client created with full config:", clientFull);

// --- GateCtrConfigError: thrown synchronously when apiKey is missing ---
try {
  new GateCtr({ apiKey: "" }); // empty string → throws immediately
} catch (err: unknown) {
  if (err instanceof GateCtrConfigError) {
    console.error("Config error caught:", err.message);
    // err.message: "GateCtr API key is required. Pass apiKey in the config
    //               or set the GATECTR_API_KEY environment variable."
  }
}
