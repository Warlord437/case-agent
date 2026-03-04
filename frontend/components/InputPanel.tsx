"use client";

import { useState, useCallback } from "react";
import type { Depth, Lens, AnalyzeRequest } from "@frontend/types/analysis";
import { MAX_INPUT_CHARS, MIN_INPUT_CHARS } from "@backend/lib/limits";
import FileUploadZone from "./FileUploadZone";

interface Props {
  loading: boolean;
  onSubmit: (req: AnalyzeRequest) => void;
}

const DEPTH_OPTIONS: { value: Depth; label: string; emoji: string }[] = [
  { value: "concise", label: "Quick glance", emoji: "\u{26A1}" },
  { value: "standard", label: "Balanced", emoji: "\u{2696}\u{FE0F}" },
  { value: "detailed", label: "Deep dive", emoji: "\u{1F50D}" },
];

const LENS_OPTIONS: { value: Lens; label: string; emoji: string }[] = [
  { value: "general", label: "General", emoji: "\u{1F30D}" },
  { value: "pm", label: "Product Manager", emoji: "\u{1F680}" },
  { value: "ba", label: "Business Analyst", emoji: "\u{1F4C8}" },
  { value: "consulting", label: "Consulting", emoji: "\u{1F454}" },
];

export default function InputPanel({ loading, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [depth, setDepth] = useState<Depth>("standard");
  const [lens, setLens] = useState<Lens>("general");
  const [showPaste, setShowPaste] = useState(false);

  const charCount = text.length;
  const tooShort = charCount > 0 && charCount < MIN_INPUT_CHARS;
  const tooLong = charCount > MAX_INPUT_CHARS;
  const canSubmit = !loading && charCount >= MIN_INPUT_CHARS && !tooLong;

  const handleFilesReady = useCallback((combinedText: string) => {
    setText(combinedText);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({ text, depth, lens });
  }, [canSubmit, text, depth, lens, onSubmit]);

  return (
    <div className="card" style={{ padding: "20px 18px" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-hand)",
          fontSize: "clamp(22px, 4vw, 26px)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span>{"\u{1F4DA}"}</span>
          Feed it a case study
        </h2>
        <p style={{ color: "var(--pencil)", fontSize: 14, marginTop: 4 }}>
          Upload files or paste text below — then pick how you want it analyzed.
        </p>
      </div>

      <FileUploadZone disabled={loading} onFilesReady={handleFilesReady} />

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-ghost"
          onClick={() => setShowPaste(!showPaste)}
          style={{ fontSize: 14, padding: "6px 16px" }}
          type="button"
        >
          {showPaste ? "\u{1F53C}" : "\u{270D}\u{FE0F}"} {showPaste ? "Hide text area" : "Or paste text manually"}
        </button>
      </div>

      {showPaste && (
        <div className="animate-in" style={{ marginTop: 12 }}>
          <textarea
            className="cartoon-textarea"
            rows={6}
            placeholder="Paste your case study text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            fontSize: 13,
            gap: 8,
          }}>
            <span style={{
              color: tooShort || tooLong ? "var(--coral)" : "var(--pencil)",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} chars
              {tooShort && ` (min ${MIN_INPUT_CHARS})`}
            </span>
            {text.length > 0 && (
              <button
                onClick={() => setText("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--coral)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {!showPaste && charCount > 0 && (
        <div style={{
          marginTop: 10,
          padding: "8px 14px",
          borderRadius: 10,
          background: "var(--mint-light)",
          border: "2px solid var(--mint)",
          fontSize: 14,
          fontWeight: 600,
        }}>
          {"\u{2705}"} {charCount.toLocaleString()} characters ready to analyze
        </div>
      )}

      <div className="squiggle-divider" />

      <div className="options-row">
        <div className="option-group">
          <label style={{
            fontFamily: "var(--font-hand)",
            fontSize: 17,
            fontWeight: 600,
          }}>
            {"\u{1F3AF}"} Depth
          </label>
          <select
            className="cartoon-select"
            value={depth}
            onChange={(e) => setDepth(e.target.value as Depth)}
            disabled={loading}
          >
            {DEPTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.emoji} {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="option-group">
          <label style={{
            fontFamily: "var(--font-hand)",
            fontSize: 17,
            fontWeight: 600,
          }}>
            {"\u{1F453}"} Lens
          </label>
          <select
            className="cartoon-select"
            value={lens}
            onChange={(e) => setLens(e.target.value as Lens)}
            disabled={loading}
          >
            {LENS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.emoji} {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: "clamp(16px, 3vw, 18px)",
            padding: "12px 24px",
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>{"\u{2699}\u{FE0F}"}</span>
              Crunching the case...
            </>
          ) : (
            <>
              {"\u{1F9E0}"} Analyze this!
            </>
          )}
        </button>
      </div>
    </div>
  );
}
