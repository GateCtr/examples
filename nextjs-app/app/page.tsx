"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GatectrMeta {
  modelUsed?: string;
  tokensUsed?: number;
  tokensSaved?: number;
  costUsd?: number;
  requestId?: string;
}

interface ChatResponse {
  content?: string;
  gatectr?: GatectrMeta;
  error?: string;
  code?: string;
  requestId?: string;
}

interface BudgetStatus {
  totalTokens?: number;
  totalRequests?: number;
  totalCostUsd?: number;
  savedTokens?: number;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [prompt, setPrompt] = useState("What is the difference between REST and GraphQL?");
  const [chatOutput, setChatOutput] = useState("");
  const [chatMeta, setChatMeta] = useState<GatectrMeta | null>(null);
  const [streamOutput, setStreamOutput] = useState("");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState<"chat" | "stream" | "budget" | null>(null);
  const [error, setError] = useState("");

  // ── Chat (standard) ─────────────────────────────────────────────────────────
  async function handleChat() {
    setLoading("chat");
    setError("");
    setChatOutput("");
    setChatMeta(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = (await res.json()) as ChatResponse;

      if (data.error) {
        setError(`${data.error}${data.code ? ` [${data.code}]` : ""}`);
      } else {
        setChatOutput(data.content ?? "");
        setChatMeta(data.gatectr ?? null);
      }
    } catch {
      setError("Network error. Check your GATECTR_API_KEY.");
    } finally {
      setLoading(null);
    }
  }

  // ── Stream ───────────────────────────────────────────────────────────────────
  async function handleStream() {
    setLoading("stream");
    setError("");
    setStreamOutput("");

    try {
      const res = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.body) { setError("No stream body"); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6);
          if (chunk === "[DONE]") break;
          if (chunk.startsWith("[ERROR]")) { setError(chunk.slice(8)); break; }
          setStreamOutput((prev) => prev + chunk);
        }
      }
    } catch {
      setError("Stream error. Check your GATECTR_API_KEY.");
    } finally {
      setLoading(null);
    }
  }

  // ── Budget status ────────────────────────────────────────────────────────────
  async function handleBudget() {
    setLoading("budget");
    setError("");
    setBudgetStatus(null);

    try {
      const res = await fetch("/api/budget-status");
      const data = (await res.json()) as BudgetStatus;
      setBudgetStatus(data);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main>
      <div>
        <h1>GateCtr — Next.js Example</h1>
        <p className="subtitle">API route · Budget Firewall · Streaming</p>
      </div>

      {/* Prompt input */}
      <div className="card">
        <h2>Prompt</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
        />
      </div>

      {/* Chat */}
      <div className="card">
        <h2>Chat — /api/chat</h2>
        <div className="row">
          <button
            className="primary"
            onClick={() => void handleChat()}
            disabled={loading !== null}
          >
            {loading === "chat" ? "Sending…" : "Send"}
          </button>
        </div>
        {chatOutput && <div className="output">{chatOutput}</div>}
        {chatMeta && (
          <div className="meta">
            {chatMeta.modelUsed && <span className="badge">{chatMeta.modelUsed}</span>}{" "}
            {chatMeta.tokensUsed !== undefined && <span className="badge">{chatMeta.tokensUsed} tokens</span>}{" "}
            {chatMeta.tokensSaved !== undefined && chatMeta.tokensSaved > 0 && (
              <span className="badge">−{chatMeta.tokensSaved} saved</span>
            )}{" "}
            {chatMeta.costUsd !== undefined && <span className="badge">${chatMeta.costUsd.toFixed(5)}</span>}
          </div>
        )}
      </div>

      {/* Stream */}
      <div className="card">
        <h2>Stream — /api/stream</h2>
        <div className="row">
          <button
            className="primary"
            onClick={() => void handleStream()}
            disabled={loading !== null}
          >
            {loading === "stream" ? "Streaming…" : "Stream"}
          </button>
        </div>
        {streamOutput && <div className="output">{streamOutput}</div>}
      </div>

      {/* Budget */}
      <div className="card">
        <h2>Budget status — /api/budget-status</h2>
        <div className="row">
          <button
            onClick={() => void handleBudget()}
            disabled={loading !== null}
          >
            {loading === "budget" ? "Loading…" : "Check usage"}
          </button>
        </div>
        {budgetStatus && !budgetStatus.error && (
          <div className="meta">
            <span className="badge">{budgetStatus.totalTokens?.toLocaleString()} tokens</span>{" "}
            <span className="badge">{budgetStatus.totalRequests} requests</span>{" "}
            <span className="badge">${budgetStatus.totalCostUsd?.toFixed(4)}</span>{" "}
            {(budgetStatus.savedTokens ?? 0) > 0 && (
              <span className="badge">−{budgetStatus.savedTokens?.toLocaleString()} saved by optimizer</span>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
