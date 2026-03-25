# GateCtr — LangChain Agent Example

LangChain agent with automatic token cap and auto-fallback to Mistral when OpenAI exceeds budget.

```
Your app → LangChain Agent → GateCtr → OpenAI (or Mistral on budget exceeded)
```

## What it shows

- Drop-in endpoint swap — zero LangChain code changes
- Budget Firewall caps token usage per run
- Auto-fallback to Mistral when OpenAI budget is hit
- Full audit trail via GateCtr dashboard

## Setup

```bash
cd examples/langchain-agent
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```
GATECTR_API_KEY=gtr_your_api_key_here
```

## Run

```bash
python agent.py
```

## How it works

GateCtr acts as a transparent proxy. The only change from a standard LangChain setup:

```python
# Before — direct OpenAI
llm = ChatOpenAI(api_key=os.environ["OPENAI_API_KEY"])

# After — via GateCtr (one line change)
llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)
```

GateCtr then:
1. Enforces your token budget — blocks runaway loops automatically
2. Routes to Mistral if OpenAI budget is exceeded
3. Logs every request to your dashboard

## Links

[Dashboard](https://gatectr.com) · [Docs](https://docs.gatectr.com) · [Python SDK](https://github.com/GateCtr/sdk-python)
