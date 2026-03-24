// examples/05-models.ts
// Demonstrates client.models() — enumerate all models available through GateCtr.

import { GateCtr } from "@gatectr/sdk";

const client = new GateCtr();

const { models, requestId } = await client.models();

console.log(`${String(models.length)} models available (requestId: ${requestId})\n`);

for (const model of models) {
  console.log(model.modelId);
  console.log(`  provider:      ${model.provider}`);        // openai | anthropic | mistral | gemini
  console.log(`  contextWindow: ${model.contextWindow.toLocaleString()} tokens`);
  console.log(`  capabilities:  ${model.capabilities.join(", ")}`); // e.g. chat, complete, vision
  console.log();
}
