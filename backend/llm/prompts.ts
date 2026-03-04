import type { AnalyzeRequest } from "@frontend/types/analysis";

const DEPTH_INSTRUCTION: Record<string, string> = {
  concise:
    "Be concise. Summaries: 2-3 sentences. Lists: 3-4 items max. Focus on the most critical findings only.",
  standard:
    "Provide balanced detail. Summaries: 4-6 sentences. Lists: 5-7 items. Cover all significant dimensions.",
  detailed:
    "Be exhaustive. Summaries: 6-10 sentences. Lists: 7-12 items. Leave no significant angle unexplored. Provide nuance and supporting reasoning for every point.",
};

const LENS_INSTRUCTION: Record<string, string> = {
  pm: "Adopt the perspective of a senior Product Manager. Prioritise user impact, product-market fit signals, roadmap implications, stakeholder communication, and feature/capability gaps. Frame risks in terms of delivery timelines and customer outcomes.",
  ba: "Adopt the perspective of a senior Business Analyst. Prioritise requirements clarity, process flows, data models, gap analysis, stakeholder needs, and measurable business outcomes. Be precise about what data is present vs. assumed.",
  consulting:
    "Adopt the perspective of a top-tier Management Consultant. Prioritise strategic positioning, competitive dynamics, market sizing, organisational capability, and actionable recommendations with clear rationale and implementation sequencing.",
  general:
    "Provide a balanced, general-purpose analysis accessible to a broad audience. Cover business, technical, and strategic dimensions evenly.",
};

export function buildExtractPrompt(req: AnalyzeRequest): string {
  return `You are an expert case study analyst performing the EXTRACTION phase.

Your job is to read the case study below and extract every piece of structured data from it — facts, numbers, claims, entities, problems, and opportunities. Be thorough. Do NOT invent or infer data that is not present in the text. If the text contains numbers, percentages, dollar amounts, dates, or any quantitative data, capture them exactly.

${DEPTH_INSTRUCTION[req.depth] ?? DEPTH_INSTRUCTION.standard}
${LENS_INSTRUCTION[req.lens] ?? LENS_INSTRUCTION.general}

Return ONLY valid JSON (no markdown fences, no commentary) matching this exact shape:
{
  "entities": string[],
  "themes": string[],
  "facts": string[],
  "quantitative_data": string[],
  "problems": string[],
  "opportunities": string[],
  "claims_without_evidence": string[],
  "notable_absences": string[]
}

Rules:
- "entities": All organisations, people, products, markets, geographies mentioned.
- "themes": High-level themes or topics the case covers.
- "facts": Concrete, verifiable statements of fact from the text.
- "quantitative_data": Every number, percentage, dollar amount, date, duration, ratio, or measurable metric mentioned. Quote them exactly as stated.
- "problems": Challenges, pain points, blockers, or negative trends described.
- "opportunities": Growth levers, untapped markets, improvements, or positive trends described.
- "claims_without_evidence": Assertions made in the text that lack supporting data or reasoning.
- "notable_absences": Important information you would expect in a case study of this type that is conspicuously missing from the text.

--- CASE STUDY ---
${req.text}
--- END ---`;
}

export function buildWritePrompt(
  extractedJson: string,
  req: AnalyzeRequest,
): string {
  return `You are an expert case study analyst performing the ANALYSIS phase.

Using the structured extraction below, write a comprehensive analytical report. You must go beyond surface-level summarisation — identify patterns, draw inferences, flag anomalies, and surface what the case study does NOT say that matters.

${DEPTH_INSTRUCTION[req.depth] ?? DEPTH_INSTRUCTION.standard}
${LENS_INSTRUCTION[req.lens] ?? LENS_INSTRUCTION.general}

EXTRACTED DATA:
${extractedJson}

Return ONLY valid JSON (no markdown fences, no commentary) matching this exact shape:
{
  "summary": string,
  "analysis": string,
  "key_inferences": string[],
  "key_points": string[],
  "statistical_evidence": [{ "metric": string, "value": string, "context": string }],
  "anomalies": [{ "observation": string, "why_it_matters": string, "severity": "low" | "medium" | "high" }],
  "focus_areas": string[],
  "risks": string[],
  "recommendations": string[],
  "follow_up_questions": string[]
}

Instructions for each field:

"summary": A crisp executive summary of the case. State what the case is about, who the key actors are, what happened, and what the stakes are.

"analysis": A deep, multi-paragraph analytical narrative. Do NOT just restate facts. Instead:
  - Identify cause-effect relationships between facts.
  - Highlight tensions and trade-offs.
  - Compare stated goals against actual evidence.
  - Note where the narrative is strong vs. where it relies on assumptions.

"key_inferences": Things that are NOT explicitly stated in the text but can be logically inferred from the evidence. Each inference should state what you infer AND why (what evidence supports it). These are your analytical value-add — the "so what" behind the facts.

"key_points": The most important takeaways from the case, stated clearly and ranked by significance.

"statistical_evidence": Every quantitative data point found in the case. For each:
  - "metric": What is being measured (e.g., "Revenue growth", "Customer churn rate")
  - "value": The exact figure (e.g., "24% YoY", "$4.2M")
  - "context": Why this number matters, what it implies, or how it compares to benchmarks

"anomalies": Things that seem unusual, inconsistent, contradictory, or surprising in the data or narrative. For each:
  - "observation": What seems off
  - "why_it_matters": The potential implication
  - "severity": "low", "medium", or "high" based on potential impact

"focus_areas": Specific topics, sections, or dimensions of the case that deserve deeper investigation. These are areas where a reader should spend extra time or request more data. Frame each as an actionable direction, e.g., "Examine the unit economics of the Cloud Platform division separately from legacy revenue."

"risks": Threats, vulnerabilities, and downside scenarios. Be specific — state the risk, the trigger, and the potential consequence.

"recommendations": Actionable next steps. Each should specify what to do, why, and in what timeframe.

"follow_up_questions": Questions that the case study leaves unanswered but that would materially change the analysis if answered. Rank by importance.`;
}
