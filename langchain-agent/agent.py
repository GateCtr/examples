# langchain-agent/agent.py
# LangChain agent routed through GateCtr.
#
# GateCtr enforces a token budget and auto-falls back to Mistral
# when the OpenAI budget is exceeded — no runaway agent loops.
#
# The only change from a standard LangChain setup:
#   api_key  → your GATECTR_API_KEY
#   base_url → https://api.gatectr.com/v1
#
# Setup:
#   pip install -r requirements.txt
#   cp .env.example .env  # add your GATECTR_API_KEY
#   python agent.py

from __future__ import annotations

import os

from dotenv import load_dotenv
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv()

GATECTR_API_KEY = os.environ["GATECTR_API_KEY"]

# ── LLM via GateCtr ───────────────────────────────────────────────────────────
# Drop-in replacement: swap api_key + base_url. Everything else stays the same.
# GateCtr caps token usage automatically — no infinite loops.

llm = ChatOpenAI(
    api_key=GATECTR_API_KEY,
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
    temperature=0,
)

# ── Tools ─────────────────────────────────────────────────────────────────────


@tool
def get_word_count(text: str) -> int:
    """Count the number of words in a text."""
    return len(text.split())


@tool
def reverse_text(text: str) -> str:
    """Reverse the characters in a text."""
    return text[::-1]


tools = [get_word_count, reverse_text]

# ── Agent ─────────────────────────────────────────────────────────────────────

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Use tools when needed."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)

# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Running LangChain agent via GateCtr...\n")

    result = agent_executor.invoke(
        {"input": "How many words are in 'GateCtr controls your LLM costs'? Then reverse that sentence."}
    )

    print("\n── Result ──────────────────────────────────────────────────────────")
    print(result["output"])
    print("\nToken usage and cost visible at https://app.gatectr.com/analytics")
