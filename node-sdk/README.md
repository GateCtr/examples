# GateCtr Node.js SDK — Examples

Runnable TypeScript examples for every public method of `@gatectr/sdk`.

One gateway. Every LLM. -40% tokens. Zero code changes.

## Setup

```bash
cd examples/node-sdk
pnpm install
cp .env.example .env
```

Edit `.env` and set your API key:

```
GATECTR_API_KEY=gtr_your_api_key_here
```

Get your key at [app.gatectr.com/api-keys](https://app.gatectr.com/api-keys). Your key stays yours — GateCtr never stores it.

## Run any example

```bash
pnpm exec tsx examples/01-client-setup.ts
pnpm exec tsx examples/02-complete.ts
pnpm exec tsx examples/03-chat.ts
pnpm exec tsx examples/04-streaming.ts
pnpm exec tsx examples/05-models.ts
pnpm exec tsx examples/06-usage.ts
pnpm exec tsx examples/07-error-handling.ts
pnpm exec tsx examples/08-per-request-options.ts
pnpm exec tsx examples/09-context-optimizer.ts
pnpm exec tsx examples/10-budget-firewall.ts
pnpm exec tsx examples/11-model-router.ts
```

## Examples

| File                        | What it demonstrates                                    |
| --------------------------- | ------------------------------------------------------- |
| `01-client-setup.ts`        | All `GateCtr` constructor options, `GateCtrConfigError` |
| `02-complete.ts`            | `client.complete()`, full `gatectr` metadata            |
| `03-chat.ts`                | `client.chat()`, multi-turn conversation                |
| `04-streaming.ts`           | `client.stream()`, `for await`, `AbortController`       |
| `05-models.ts`              | `client.models()`, model enumeration                    |
| `06-usage.ts`               | `client.usage()`, date-range filtering                  |
| `07-error-handling.ts`      | All 5 error classes, `instanceof` checks                |
| `08-per-request-options.ts` | Per-request `gatectr: { budgetId, optimize, route }`    |
| `09-context-optimizer.ts`   | Context Optimizer — `tokensSaved` comparison (Pro)      |
| `10-budget-firewall.ts`     | Budget Firewall — `budget_exceeded` graceful fallback   |
| `11-model-router.ts`        | Model Router — `route: true`, `modelUsed`               |

## Validate

```bash
pnpm typecheck   # zero TypeScript errors
pnpm lint        # ESLint
pnpm format      # Prettier
```
