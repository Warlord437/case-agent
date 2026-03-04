"use client";

import { useState, useCallback } from "react";
import type { AnalyzeRequest, AnalysisResult } from "@frontend/types/analysis";
import InputPanel from "@frontend/components/InputPanel";
import OutputPanel from "@frontend/components/OutputPanel";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (req: AnalyzeRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Server returned ${res.status}`);
        return;
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: "clamp(28px, 5vw, 44px)" }}>{"\u{1F4D6}"}</span>
          <h1>Case Study Analyzer</h1>
          <span style={{ fontSize: "clamp(28px, 5vw, 44px)" }}>{"\u{270F}\u{FE0F}"}</span>
        </div>
        <p className="page-subtitle">
          Drop your case study files, pick a lens, and get a structured
          breakdown — summaries, risks, recommendations, the works.
        </p>
        <div className="squiggle-divider" style={{ maxWidth: 300, margin: "22px auto 0" }} />
      </header>

      <div className="main-layout">
        <div className="panel-input">
          <InputPanel loading={loading} onSubmit={handleSubmit} />
        </div>
        <div className="panel-output">
          <OutputPanel result={result} error={error} loading={loading} />
        </div>
      </div>

      <footer className="page-footer">
        <div className="squiggle-divider" style={{ maxWidth: 200, margin: "0 auto 12px" }} />
        <p>Made with {"\u{2615}"} and questionable amounts of sticky notes</p>
      </footer>
    </div>
  );
}
