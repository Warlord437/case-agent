# Case Study Analyzer

A Next.js (App Router) + TypeScript web app that accepts case study text or file uploads and returns structured analysis through a provider-agnostic LLM pipeline.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload a case study (PDF, DOCX, TXT, CSV, XLSX, PPTX) or paste text, select Depth and Lens, then click **Analyze**.

The app ships with a **stub LLM provider** so it runs end-to-end locally without any API keys.

## Architecture

```
├── app/                              # Next.js App Router (routes & pages)
│   ├── api/
│   │   ├── analyze/route.ts          # POST /api/analyze
│   │   └── upload/route.ts           # POST /api/upload (file parsing)
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main page (client component)
│   └── globals.css                   # Global cartoon-style CSS
│
├── frontend/                         # Client-side code
│   ├── components/
│   │   ├── InputPanel.tsx            # File upload, paste area, depth/lens selectors
│   │   ├── OutputPanel.tsx           # Renders structured analysis results
│   │   └── FileUploadZone.tsx        # Drag-and-drop multi-file upload
│   └── types/
│       ├── analysis.ts               # Shared TypeScript types (AnalyzeRequest, AnalysisResult)
│       └── modules.d.ts              # Type declarations for untyped npm packages
│
├── backend/                          # Server-side code
│   ├── lib/
│   │   ├── limits.ts                 # Input length constants
│   │   ├── sanitize.ts               # Text normalisation
│   │   ├── hash.ts                   # SHA-256 helper (for future caching)
│   │   └── parse-file.ts             # File-to-text extraction (PDF, DOCX, XLSX, etc.)
│   └── llm/                          # Provider-agnostic LLM layer
│       ├── index.ts                  # Public exports
│       ├── pipeline.ts               # 2-pass pipeline: extract → write
│       ├── prompts.ts                # Prompt builders for each pass
│       ├── schema.ts                 # Empty result factory
│       └── providers/
│           └── stub.ts               # Deterministic stub provider (no API key needed)
```

### Import Aliases

| Alias | Maps to | Used by |
|-------|---------|---------|
| `@frontend/*` | `./frontend/*` | Pages, components, API routes (for types) |
| `@backend/*` | `./backend/*` | API routes, LLM pipeline |
| `@/*` | `./*` | General fallback |

### Data Flow

1. User uploads files or pastes text, picks depth and lens.
2. Files go to `POST /api/upload` which extracts text using `backend/lib/parse-file.ts`.
3. `POST /api/analyze` validates input, normalises text, and calls the LLM pipeline.
4. **Pass 1 (Extract):** builds an extraction prompt → provider returns structured entities/themes/facts.
5. **Pass 2 (Write):** builds a writing prompt using extracted data → provider returns the final analysis.
6. The pipeline validates the output shape and returns `AnalysisResult` with metadata.

### Output Shape

```json
{
  "summary": "...",
  "analysis": "...",
  "key_points": ["..."],
  "risks": ["..."],
  "recommendations": ["..."],
  "follow_up_questions": ["..."],
  "meta": {
    "provider": "stub",
    "latency_ms": 165,
    "input_chars": 1234
  }
}
```

## Plugging In Real LLM Providers

1. Create a new file in `backend/llm/providers/` (e.g., `openai.ts`).
2. Implement the `LLMProvider` interface from `backend/llm/providers/stub.ts`.
3. Pass your provider instance to `runAnalysis(req, myProvider)` in the API route.

```typescript
import type { LLMProvider } from "@backend/llm";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";

  async generateJson(prompt: string): Promise<string> {
    // Call OpenAI API and return the JSON string
  }
}
```

## Future Extensibility

- **RAG / Vector DB:** Add a retrieval step before the extract pass in `backend/llm/pipeline.ts`.
- **Caching:** Use `backend/lib/hash.ts` to cache results by input hash.
- **Database:** Add a persistence layer without changing the LLM pipeline.
- **Streaming:** Modify `generateJson` to return a stream and update the API route to use Server-Sent Events.
