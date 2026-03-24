# GateCtr — Next.js App Router Example

Next.js 15 + App Router. Three API routes showing GateCtr in a real server context.

| Route | What it shows |
|---|---|
| `POST /api/chat` | Standard completion — Budget Firewall, Context Optimizer |
| `POST /api/stream` | Streaming via SSE — `for await` over `client.stream()` |
| `GET /api/budget-status` | Token usage for the past 30 days |

## Setup

```bash
cd examples/nextjs-app
pnpm install
cp .env.example .env.local
```

Edit `.env.local`:

```
GATECTR_API_KEY=gtr_your_api_key_here
```

Get your key at [app.gatectr.com/api-keys](https://app.gatectr.com/api-keys). Your key stays yours — GateCtr never stores it.

## Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — type a prompt, hit Send or Stream, check your budget.

## How it works

```
Browser → Next.js API route → GateCtr → OpenAI / Anthropic / Mistral
```

GateCtr intercepts every request and:
- Compresses the prompt (Context Optimizer — ~40% fewer tokens)
- Enforces your budget cap (Budget Firewall — returns 429 if exceeded)
- Routes to the optimal model if `route: true` (Model Router)

Your LLM provider key never leaves GateCtr's encrypted vault.
