# GateCtr — Budget Alert Example

Webhook receiver that forwards GateCtr budget events to Slack.

When your token usage crosses a threshold, GateCtr POSTs to this server — which sends a Slack alert instantly.

```
GateCtr → POST /webhooks/gatectr → Slack Incoming Webhook
```

## Events handled

| Event | Trigger | Slack message |
|---|---|---|
| `budget.threshold_reached` | Usage crossed alert % (e.g. 80%) | ⚠️ Warning with usage stats |
| `budget.exceeded` | Hard cap hit — requests blocked | 🚨 Critical with action link |

## Setup

```bash
cd examples/budget-alert
pnpm install
cp .env.example .env
```

Edit `.env`:

```
GATECTR_API_KEY=gtr_your_api_key_here
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Create a Slack Incoming Webhook at [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks).

## Run

```bash
pnpm dev
```

## Configure in GateCtr dashboard

1. Go to **Webhooks → New webhook**
2. URL: `http://your-server:3002/webhooks/gatectr`
3. Events: `budget.threshold_reached`, `budget.exceeded`
4. Copy the signing secret → set `GATECTR_WEBHOOK_SECRET` in `.env`

## Security

Requests are verified via HMAC-SHA256 signature (`x-gatectr-signature` header).  
Set `GATECTR_WEBHOOK_SECRET` to enable verification — strongly recommended in production.
