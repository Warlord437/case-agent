import type { LLMProvider, LLMProviderOptions } from "./stub";

const DEFAULT_MODEL = "gemini-2.0-flash";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

interface GeminiContent {
  parts: { text: string }[];
  role: string;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  error?: { message?: string; code?: number };
}

function stripMarkdownFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    const firstNewline = s.indexOf("\n");
    if (firstNewline !== -1) s = s.slice(firstNewline + 1);
  }
  if (s.endsWith("```")) {
    s = s.slice(0, -3);
  }
  return s.trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private readonly apiKey: string;
  readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? DEFAULT_MODEL;
  }

  async generateJson(
    prompt: string,
    opts?: LLMProviderOptions,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contents: GeminiContent[] = [
      { role: "user", parts: [{ text: prompt }] },
    ];

    const body = {
      contents,
      generationConfig: {
        temperature: opts?.temperature ?? 0.3,
        maxOutputTokens: opts?.max_tokens ?? 8192,
        responseMimeType: "application/json",
      },
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        lastError = new Error(
          "Gemini API rate limit exceeded. Your API key quota may be exhausted — check https://ai.google.dev/gemini-api/docs/rate-limits",
        );
        if (attempt < MAX_RETRIES) continue;
        throw lastError;
      }

      if (res.status === 403) {
        throw new Error(
          "Gemini API key is invalid or has been revoked. Generate a new key at https://aistudio.google.com/apikey",
        );
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "unknown error");
        throw new Error(
          `Gemini API returned ${res.status}: ${errText.slice(0, 300)}`,
        );
      }

      const data: GeminiResponse = await res.json();

      if (data.error) {
        throw new Error(
          `Gemini API error: ${data.error.message ?? "unknown"} (code ${data.error.code})`,
        );
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        const reason = data.candidates?.[0]?.finishReason ?? "no content";
        throw new Error(`Gemini returned no text. Finish reason: ${reason}`);
      }

      return stripMarkdownFences(text);
    }

    throw lastError ?? new Error("Gemini request failed after retries");
  }
}
