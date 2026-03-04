"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      maxWidth: 480,
      margin: "80px auto",
      padding: "32px 24px",
      textAlign: "center",
      background: "var(--paper, #fffdf7)",
      border: "2.5px solid var(--ink, #2d2926)",
      borderRadius: 16,
      boxShadow: "4px 4px 0 var(--ink, #2d2926)",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F635}"}</div>
      <h2 style={{
        fontFamily: "var(--font-hand, cursive)",
        fontSize: 24,
        margin: "0 0 12px",
      }}>
        Something went wrong
      </h2>
      <p style={{ color: "var(--pencil, #8b8178)", fontSize: 15, marginBottom: 20 }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "10px 24px",
          fontSize: 16,
          fontWeight: 700,
          border: "2.5px solid var(--ink, #2d2926)",
          borderRadius: 10,
          background: "var(--coral, #ff6b6b)",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "3px 3px 0 var(--ink, #2d2926)",
        }}
      >
        Try again
      </button>
    </div>
  );
}
