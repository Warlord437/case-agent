import type { LLMProvider, LLMProviderOptions } from "./stub";

const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1500;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChoice {
  message?: { content?: string };
  finish_reason?: string;
}

interface GroqResponse {
  choices?: GroqChoice[];
  error?: { message?: string; type?: string; code?: string };
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

export class GroqProvider implements LLMProvider {
  readonly name = "groq";
  readonly model: string;
  private readonly apiKey: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? DEFAULT_MODEL;
  }

  async generateJson(
    prompt: string,
    opts?: LLMProviderOptions,
  ): Promise<string> {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are a precise analytical assistant. Always respond with valid JSON only — no markdown fences, no commentary, no extra text.",
      },
      { role: "user", content: prompt },
    ];

    const body = {
      model: this.model,
      messages,
      temperature: opts?.temperature ?? 0.3,
      max_completion_tokens: opts?.max_tokens ?? 8192,
      top_p: 1,
      stream: false,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        lastError = new Error(
          "Groq API rate limit reached. Free tier allows 30 requests/min. Please wait a moment.",
        );
        if (attempt < MAX_RETRIES) continue;
        throw lastError;
      }

      if (res.status === 401) {
        throw new Error(
          "Groq API key is invalid. Get one at https://console.groq.com/keys",
        );
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "unknown error");
        throw new Error(
          `Groq API returned ${res.status}: ${errText.slice(0, 300)}`,
        );
      }

      const data: GroqResponse = await res.json();

      if (data.error) {
        throw new Error(
          `Groq API error: ${data.error.message ?? "unknown"}`,
        );
      }

      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        const reason = data.choices?.[0]?.finish_reason ?? "no content";
        throw new Error(`Groq returned no text. Finish reason: ${reason}`);
      }

      return stripMarkdownFences(text);
    }

    throw lastError ?? new Error("Groq request failed after retries");
  }
}
