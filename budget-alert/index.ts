// budget-alert/index.ts
// Receives GateCtr webhook events and forwards budget alerts to Slack.
//
// GateCtr sends a POST to this server when:
//   - budget.threshold_reached  — usage crossed the alert threshold (e.g. 80%)
//   - budget.exceeded           — hard cap hit, requests are now blocked
//
// Setup in GateCtr dashboard:
//   Webhooks → New webhook → URL: http://your-server:3002/webhooks/gatectr
//   Events: budget.threshold_reached, budget.exceeded
//
// Slack setup:
//   https://api.slack.com/messaging/webhooks → create an Incoming Webhook
//   Set SLACK_WEBHOOK_URL in your .env

import express, { type Request, type Response } from "express";
import crypto from "node:crypto";

const app = express();

// Raw body needed for HMAC signature verification
app.use(express.raw({ type: "application/json" }));

const PORT = process.env["PORT"] ?? "3002";
const SLACK_WEBHOOK_URL = process.env["SLACK_WEBHOOK_URL"] ?? "";
// Optional: set in GateCtr dashboard → Webhooks → Signing secret
const GATECTR_WEBHOOK_SECRET = process.env["GATECTR_WEBHOOK_SECRET"] ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BudgetEvent {
  event: "budget.threshold_reached" | "budget.exceeded";
  project_id: string;
  project_name?: string;
  timestamp: string;
  data: {
    tokens_used: number;
    tokens_limit: number;
    percent: number;
    cost_usd: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expected}`),
    Buffer.from(signature)
  );
}

async function sendSlackAlert(event: BudgetEvent): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set — skipping Slack notification");
    return;
  }

  const { data, project_name, project_id, event: eventType } = event;
  const isHardStop = eventType === "budget.exceeded";

  const emoji = isHardStop ? "🚨" : "⚠️";
  const title = isHardStop
    ? "Budget limit reached — requests blocked"
    : `Budget alert — ${String(data.percent)}% used`;

  const text = [
    `${emoji} *${title}*`,
    `Project: \`${project_name ?? project_id}\``,
    `Tokens: ${data.tokens_used.toLocaleString()} / ${data.tokens_limit.toLocaleString()} (${String(data.percent)}%)`,
    `Cost: $${data.cost_usd.toFixed(4)}`,
    isHardStop
      ? "Action required: <https://app.gatectr.com/budget|Adjust your budget limit>"
      : "<https://app.gatectr.com/budget|View budget in GateCtr>",
  ].join("\n");

  const slackRes = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!slackRes.ok) {
    console.error(`Slack webhook failed: ${String(slackRes.status)}`);
  } else {
    console.log(`Slack alert sent for event: ${eventType}`);
  }
}

// ── Webhook endpoint ──────────────────────────────────────────────────────────

app.post("/webhooks/gatectr", async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer;

  // Verify HMAC signature if secret is configured
  if (GATECTR_WEBHOOK_SECRET) {
    const signature = req.headers["x-gatectr-signature"];
    if (typeof signature !== "string" || !verifySignature(rawBody, signature, GATECTR_WEBHOOK_SECRET)) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
  }

  let event: BudgetEvent;
  try {
    event = JSON.parse(rawBody.toString()) as BudgetEvent;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  console.log(`Received event: ${event.event} — project: ${event.project_id}`);

  // Handle budget events — ignore others silently
  if (event.event === "budget.threshold_reached" || event.event === "budget.exceeded") {
    await sendSlackAlert(event);
  }

  // Always respond 200 quickly — GateCtr retries on non-2xx
  res.json({ ok: true });
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", slack: SLACK_WEBHOOK_URL ? "configured" : "not configured" });
});

app.listen(PORT, () => {
  console.log(`Budget alert webhook receiver on http://localhost:${PORT}`);
  console.log(`  POST /webhooks/gatectr — GateCtr budget events`);
  console.log(`  GET  /health           — health check`);
  console.log(`  Slack: ${SLACK_WEBHOOK_URL ? "configured" : "not configured — set SLACK_WEBHOOK_URL"}`);
});
