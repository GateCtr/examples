// examples/07-error-handling.ts
// Demonstrates instanceof catch branches for all five GateCtr error classes.

import {
  GateCtr,
  GateCtrApiError,
  GateCtrTimeoutError,
  GateCtrNetworkError,
  GateCtrStreamError,
  GateCtrConfigError,
} from "@gatectr/sdk";

// --- 1. GateCtrConfigError — thrown synchronously, no network call needed ---
try {
  new GateCtr({ apiKey: "" }); // empty apiKey → throws immediately
} catch (err) {
  if (err instanceof GateCtrConfigError) {
    console.log("GateCtrConfigError:", err.message);
  }
}

// --- 2–5. API / Timeout / Network / Stream errors — thrown during requests ---
const client = new GateCtr();

try {
  await client.complete({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }],
  });
} catch (err) {
  if (err instanceof GateCtrApiError) {
    // Non-2xx HTTP response from the GateCtr API
    console.log("GateCtrApiError");
    console.log("  status:    ", err.status); // HTTP status code (e.g. 401, 429, 500)
    console.log("  code:      ", err.code); // machine-readable code (e.g. "unauthorized", "budget_exceeded")
    console.log("  requestId: ", err.requestId); // use this when contacting support
    console.log("  message:   ", err.message);
  } else if (err instanceof GateCtrTimeoutError) {
    // Request exceeded the configured timeout
    console.log("GateCtrTimeoutError");
    console.log("  timeoutMs: ", err.timeoutMs); // the timeout value that was exceeded
    console.log("  message:   ", err.message);
  } else if (err instanceof GateCtrNetworkError) {
    // DNS failure, connection refused, or other transport-level error
    console.log("GateCtrNetworkError:", err.message);
  } else if (err instanceof GateCtrStreamError) {
    // Stream failed mid-flight (use in for-await loops around client.stream())
    console.log("GateCtrStreamError:", err.message);
  } else {
    throw err; // unexpected — re-throw
  }
}
