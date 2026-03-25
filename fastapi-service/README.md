# GateCtr — FastAPI Service Example

Async FastAPI service with GateCtr budget enforcement per endpoint.

```
Client → FastAPI → GateCtr → LLM provider
```

## What it shows

- Async completions via the GateCtr Python SDK
- Budget Firewall — hard cap per project
- Per-request options (optimizer, router)
- Proper error handling for budget exceeded events

## Setup

```bash
cd examples/fastapi-service
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```
GATECTR_API_KEY=gtr_your_api_key_here
```

## Run

```bash
uvicorn main:app --reload
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/summarize` | Summarize a text |
| `POST` | `/chat` | Single chat completion |
| `GET` | `/health` | Health check |

## Example request

```bash
curl -X POST http://localhost:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "GateCtr is a middleware gateway for LLM API calls. One endpoint swap. Full control."}'
```

## Links

[Dashboard](https://gatectr.com) · [Docs](https://docs.gatectr.com) · [Python SDK](https://github.com/GateCtr/sdk-python)
