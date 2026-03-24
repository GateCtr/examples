# GateCtr — Express Proxy Example

Drop-in proxy for existing OpenAI calls. Point your app here instead of `api.openai.com` — zero other changes.

```
Your app → http://localhost:3001/v1 → GateCtr → OpenAI / Anthropic / Mistral
```

GateCtr intercepts every request: Budget Firewall, Context Optimizer, Model Router — all active.

## Endpoints

| Method | Path | Mirrors |
|---|---|---|
| `POST` | `/v1/chat/completions` | `POST /v1/chat/completions` (OpenAI) |
| `POST` | `/v1/completions` | `POST /v1/completions` (OpenAI legacy) |
| `GET` | `/health` | — |

Streaming (`"stream": true`) is supported on `/v1/chat/completions`.

## Setup

```bash
cd examples/express-proxy
pnpm install
cp .env.example .env
```

Edit `.env`:

```
GATECTR_API_KEY=gtr_your_api_key_here
```

## Run

```bash
pnpm dev
```

## Swap your existing app

```diff
- const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
+ const openai = new OpenAI({
+   apiKey: process.env.GATECTR_API_KEY,
+   baseURL: "http://localhost:3001/v1",
+ });
```

That's it. No other changes. GateCtr controls the traffic.
