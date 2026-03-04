import { NextRequest, NextResponse } from "next/server";
import type { AnalyzeRequest, Depth, Lens } from "@frontend/types/analysis";
import { MAX_INPUT_CHARS, MIN_INPUT_CHARS } from "@backend/lib/limits";
import { normalizeText } from "@backend/lib/sanitize";
import { runAnalysis } from "@backend/llm";

const VALID_DEPTHS: Depth[] = ["concise", "standard", "detailed"];
const VALID_LENSES: Lens[] = ["pm", "ba", "consulting", "general"];

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const { text, depth, lens } = body as Record<string, unknown>;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Field 'text' is required and must be a non-empty string." },
        { status: 400 },
      );
    }

    if (!VALID_DEPTHS.includes(depth as Depth)) {
      return NextResponse.json(
        {
          error: `Field 'depth' must be one of: ${VALID_DEPTHS.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    if (!VALID_LENSES.includes(lens as Lens)) {
      return NextResponse.json(
        { error: `Field 'lens' must be one of: ${VALID_LENSES.join(", ")}.` },
        { status: 400 },
      );
    }

    const cleaned = normalizeText(text as string);

    if (cleaned.length < MIN_INPUT_CHARS) {
      return NextResponse.json(
        {
          error: `Text is too short (${cleaned.length} chars). Minimum is ${MIN_INPUT_CHARS}.`,
        },
        { status: 400 },
      );
    }

    if (cleaned.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        {
          error: `Text is too long (${cleaned.length} chars). Maximum is ${MAX_INPUT_CHARS}.`,
        },
        { status: 400 },
      );
    }

    const req: AnalyzeRequest = {
      text: cleaned,
      depth: depth as Depth,
      lens: lens as Lens,
    };

    const result = await runAnalysis(req);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[/api/analyze]", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 },
      );
    }

    const msg = err instanceof Error ? err.message : "";

    if (msg.includes("rate limit") || msg.includes("quota")) {
      return NextResponse.json(
        { error: "The AI service is temporarily rate-limited. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    if (msg.includes("invalid") || msg.includes("revoked")) {
      return NextResponse.json(
        { error: "AI service authentication failed. Please check the API key configuration." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: msg || "Internal server error." },
      { status: 500 },
    );
  }
}
