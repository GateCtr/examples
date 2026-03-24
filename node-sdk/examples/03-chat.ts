// examples/03-chat.ts
// Demonstrates client.chat() with a multi-turn conversation.

import { GateCtr } from "@gatectr/sdk";

const client = new GateCtr();

const response = await client.chat({
  model: "gpt-4o",
  messages: [
    // System message sets the assistant's behavior
    { role: "system", content: "You are a concise technical assistant. Answer in one sentence." },
    // First user turn
    { role: "user", content: "What is GateCtr?" },
    // Assistant turn (simulated prior response in a multi-turn flow)
    { role: "assistant", content: "GateCtr is an LLM middleware gateway that optimizes, routes, and enforces budgets on your AI requests." },
    // Second user turn
    { role: "user", content: "What is the main benefit?" },
  ],
  max_tokens: 80,
  temperature: 0.3,
});

// The assistant's reply content
console.log("Reply:", response.choices[0]?.message.content);

// modelUsed: the actual model that processed this request.
// With Model Router enabled, this may differ from the model you requested.
console.log("Model used:", response.gatectr.modelUsed);
