"use client";

import { useState } from "react";
import type { AnalysisResult, StatisticalEvidence, Anomaly } from "@frontend/types/analysis";

interface Props {
  result: AnalysisResult | null;
  error: string | null;
  loading: boolean;
}

function ProseSection({
  title, emoji, className, text, index,
}: {
  title: string; emoji: string; className: string; text: string; index: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (!text) return null;

  return (
    <div
      className={`card animate-in ${className}`}
      style={{ padding: 0, overflow: "hidden", animationDelay: `${index * 0.06}s` }}
    >
      <button className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ flex: 1 }}>{title}</span>
        <Chevron collapsed={collapsed} />
      </button>
      {!collapsed && (
        <div className="section-body">
          <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{text}</p>
        </div>
      )}
    </div>
  );
}

function ListSection({
  title, emoji, className, items, index,
}: {
  title: string; emoji: string; className: string; items: string[]; index: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className={`card animate-in ${className}`}
      style={{ padding: 0, overflow: "hidden", animationDelay: `${index * 0.06}s` }}
    >
      <button className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ flex: 1 }}>{title}</span>
        <span className="pill" style={{ marginRight: 8 }}>{items.length}</span>
        <Chevron collapsed={collapsed} />
      </button>
      {!collapsed && (
        <div className="section-body">
          <ul style={{ margin: 0, paddingLeft: 6, listStyle: "none" }}>
            {items.map((item, i) => (
              <li key={i} style={{
                padding: "6px 0",
                borderBottom: i < items.length - 1 ? "1px dashed var(--border)" : "none",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                lineHeight: 1.55,
              }}>
                <NumberBadge n={i + 1} />
                <span style={{ minWidth: 0 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatsSection({ items, index }: { items: StatisticalEvidence[]; index: number }) {
  const [collapsed, setCollapsed] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="card animate-in section-stats"
      style={{ padding: 0, overflow: "hidden", animationDelay: `${index * 0.06}s` }}
    >
      <button className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <span style={{ fontSize: 20 }}>{"\u{1F4CA}"}</span>
        <span style={{ flex: 1 }}>Statistical Evidence</span>
        <span className="pill">{items.length}</span>
        <Chevron collapsed={collapsed} />
      </button>
      {!collapsed && (
        <div className="section-body" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="stats-table">
            <thead>
              <tr>
                {["Metric", "Value", "Context"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px dashed var(--border)" }}>
                  <td><strong>{row.metric}</strong></td>
                  <td style={{ fontWeight: 700, color: "var(--coral)", whiteSpace: "nowrap" }}>{row.value}</td>
                  <td>{row.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const SEVERITY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  high: { bg: "var(--coral-light)", border: "var(--coral)", label: "HIGH" },
  medium: { bg: "var(--sun-light)", border: "var(--sun)", label: "MED" },
  low: { bg: "var(--sky-light)", border: "var(--sky)", label: "LOW" },
};

function AnomaliesSection({ items, index }: { items: Anomaly[]; index: number }) {
  const [collapsed, setCollapsed] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="card animate-in section-anomalies"
      style={{ padding: 0, overflow: "hidden", animationDelay: `${index * 0.06}s` }}
    >
      <button className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <span style={{ fontSize: 20 }}>{"\u{1F50E}"}</span>
        <span style={{ flex: 1 }}>Anomalies &amp; Red Flags</span>
        <span className="pill" style={{ background: "var(--coral-light)", borderColor: "var(--coral)" }}>
          {items.length}
        </span>
        <Chevron collapsed={collapsed} />
      </button>
      {!collapsed && (
        <div className="section-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((a, i) => {
            const sev = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.medium;
            return (
              <div
                key={i}
                className="anomaly-card"
                style={{ background: sev.bg, border: `2px solid ${sev.border}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span className="severity-badge" style={{ background: sev.border }}>
                    {sev.label}
                  </span>
                  <strong style={{ fontSize: 14 }}>{a.observation}</strong>
                </div>
                {a.why_it_matters && (
                  <p style={{ margin: 0, fontSize: 14, color: "var(--ink-light)", lineHeight: 1.5 }}>
                    {a.why_it_matters}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chevron({ collapsed }: { collapsed: boolean }) {
  return (
    <span style={{
      fontSize: 14,
      color: "var(--pencil)",
      transition: "transform 0.2s",
      transform: collapsed ? "rotate(-90deg)" : "rotate(0)",
      marginLeft: 8,
      flexShrink: 0,
    }}>
      {"\u25BC"}
    </span>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "var(--sun-light)",
      border: "2px solid var(--sun)",
      fontSize: 12,
      fontWeight: 800,
      flexShrink: 0,
      marginTop: 1,
    }}>
      {n}
    </span>
  );
}

export default function OutputPanel({ result, error, loading }: Props) {
  if (loading) {
    return (
      <div className="card" style={{ padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "bounce 0.8s ease-in-out infinite" }}>
          {"\u{1F9D0}"}
        </div>
        <p style={{ fontFamily: "var(--font-hand)", fontSize: "clamp(18px, 4vw, 22px)", color: "var(--ink)", margin: 0 }}>
          Reading through your case study...
        </p>
        <p style={{ color: "var(--pencil)", fontSize: 14, marginTop: 6 }}>
          Extracting data, drawing inferences, spotting anomalies
        </p>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 12, height: 12, borderRadius: "50%",
                background: "var(--coral)", border: "2px solid var(--ink)",
                animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "24px 20px", borderColor: "var(--coral)", background: "var(--coral-light)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{"\u{1F635}"}</span>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: "var(--font-hand)", fontSize: 20, margin: "0 0 6px" }}>
              Oops, something went wrong
            </h3>
            <p style={{ margin: 0, lineHeight: 1.5, color: "var(--ink)", wordBreak: "break-word" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card" style={{
        padding: "36px 20px", textAlign: "center",
        borderStyle: "dashed", borderColor: "var(--border)", background: "var(--paper)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u{1F4AD}"}</div>
        <h3 style={{ fontFamily: "var(--font-hand)", fontSize: "clamp(20px, 4vw, 24px)", margin: "0 0 8px" }}>
          Your analysis will show up here
        </h3>
        <p style={{ color: "var(--pencil)", fontSize: 15, maxWidth: 360, margin: "0 auto" }}>
          Upload a case study, pick your options, and hit that Analyze button!
        </p>
      </div>
    );
  }

  let sectionIdx = 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{"\u{1F389}"}</span>
        <h2 style={{ fontFamily: "var(--font-hand)", fontSize: "clamp(22px, 4vw, 28px)", margin: 0 }}>
          Here&rsquo;s what we found
        </h2>
      </div>

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ProseSection title="Summary" emoji={"\u{1F4CB}"} className="section-summary" text={result.summary} index={sectionIdx++} />
        <ProseSection title="Deep Analysis" emoji={"\u{1F9E9}"} className="section-analysis" text={result.analysis} index={sectionIdx++} />
        <ListSection title="Key Inferences" emoji={"\u{1F9E0}"} className="section-inferences" items={result.key_inferences} index={sectionIdx++} />
        <ListSection title="Key Points" emoji={"\u{2B50}"} className="section-keypoints" items={result.key_points} index={sectionIdx++} />
        <StatsSection items={result.statistical_evidence} index={sectionIdx++} />
        <AnomaliesSection items={result.anomalies} index={sectionIdx++} />
        <ListSection title="Focus Areas" emoji={"\u{1F3AF}"} className="section-focus" items={result.focus_areas} index={sectionIdx++} />
        <ListSection title="Risks" emoji={"\u{26A0}\u{FE0F}"} className="section-risks" items={result.risks} index={sectionIdx++} />
        <ListSection title="Recommendations" emoji={"\u{1F4A1}"} className="section-recommendations" items={result.recommendations} index={sectionIdx++} />
        <ListSection title="Follow-up Questions" emoji={"\u{2753}"} className="section-followup" items={result.follow_up_questions} index={sectionIdx++} />
      </div>

      <div className="meta-footer">
        <span>{"\u{2699}\u{FE0F}"} Provider: <strong>{result.meta.provider}</strong></span>
        {result.meta.model && <span>&middot; Model: <strong>{result.meta.model}</strong></span>}
        {result.meta.latency_ms != null && (
          <span>&middot; {"\u{23F1}\u{FE0F}"} {(result.meta.latency_ms / 1000).toFixed(1)}s</span>
        )}
        {result.meta.input_chars != null && (
          <span>&middot; {"\u{1F4DD}"} {result.meta.input_chars.toLocaleString()} chars</span>
        )}
      </div>
    </div>
  );
}
