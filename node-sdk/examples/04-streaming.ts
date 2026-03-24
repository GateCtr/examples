// examples/04-streaming.ts
// Demonstrates client.stream() with for-await, AbortController, and GateCtrStreamError.

import { GateCtr, GateCtrStreamError } from "@gatectr/sdk";

const client = new GateCtr();

// AbortController lets you cancel the stream after a timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort(); // abort after 10 seconds if stream hasn't finished
}, 10_000);

try {
  // stream() returns an AsyncIterable<StreamChunk>
  for await (const chunk of client.stream({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Count from 1 to 20, one number per line." }],
    max_tokens: 200,
    signal: controller.signal, // pass the AbortSignal to enable cancellation
  })) {
    if (chunk.delta !== null) {
      // Write each token delta directly to stdout — no newline, live streaming effect
      process.stdout.write(chunk.delta);
    }
  }
  // Print a newline after the stream ends
  process.stdout.write("\n");
} catch (err) {
  if (err instanceof GateCtrStreamError) {
    // Stream failed mid-flight (network drop, server error, etc.)
    console.error("\nStream error:", err.message);
  } else {
    throw err;
  }
} finally {
  clearTimeout(timeoutId);
}
