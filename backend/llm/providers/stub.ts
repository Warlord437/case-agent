export interface LLMProviderOptions {
  temperature?: number;
  max_tokens?: number;
}

export interface LLMProvider {
  readonly name: string;
  generateJson(prompt: string, opts?: LLMProviderOptions): Promise<string>;
}

const STUB_EXTRACT = JSON.stringify({
  entities: [
    "Acme Corp",
    "North American market",
    "Cloud Platform division",
  ],
  themes: [
    "Digital transformation",
    "Market expansion",
    "Operational efficiency",
  ],
  facts: [
    "Revenue grew 24% year-over-year",
    "Customer churn decreased from 8% to 4.5%",
    "Cloud Platform division launched 3 new products",
  ],
  problems: [
    "Legacy systems hinder integration speed",
    "Talent acquisition in competitive market",
    "Regulatory compliance across multiple regions",
  ],
  opportunities: [
    "Untapped APAC market segment",
    "AI-assisted customer onboarding",
    "Strategic partnerships with regional players",
  ],
});

const STUB_WRITE_CONCISE = JSON.stringify({
  summary:
    "The case study describes a mid-size technology company navigating digital transformation while expanding into new markets. Key tensions exist between rapid growth ambitions and legacy infrastructure constraints.",
  analysis:
    "The organisation demonstrates strong top-line momentum (24% YoY revenue growth) but faces structural headwinds in integration speed and talent retention. The Cloud Platform division is the primary growth engine, yet its success increases dependency risk.",
  key_inferences: [
    "The 24% growth rate concentrated in one division suggests the rest of the business may be flat or declining — the headline number masks uneven performance.",
    "Churn halving (8% → 4.5%) in the same period as 3 new product launches implies the new products are solving retention problems, not just acquiring new customers.",
  ],
  key_points: [
    "Revenue growth outpaces industry average by 2×",
    "Churn reduction signals improved product-market fit",
    "Cloud division carries disproportionate growth burden",
  ],
  statistical_evidence: [
    { metric: "Revenue growth", value: "24% YoY", context: "Roughly 2× the industry average, but concentrated in one division." },
    { metric: "Customer churn", value: "8% → 4.5%", context: "Near-halving suggests systemic retention improvement, not a one-off." },
  ],
  anomalies: [
    { observation: "Churn dropped sharply while the company simultaneously launched 3 new products", why_it_matters: "Rapid product launches usually increase churn due to instability — the opposite happening suggests unusually strong product-market fit or aggressive discounting.", severity: "medium" },
  ],
  focus_areas: [
    "Break out Cloud Platform revenue vs. legacy revenue to see if growth is masking decline elsewhere.",
  ],
  risks: [
    "Legacy tech debt may slow future product launches",
    "Single-division growth dependency",
    "Cross-regional compliance exposure",
  ],
  recommendations: [
    "Prioritise legacy modernisation roadmap within 2 quarters",
    "Diversify growth across at least one additional division",
    "Establish dedicated compliance taskforce for APAC entry",
  ],
  follow_up_questions: [
    "What percentage of total revenue comes from the Cloud Platform division?",
    "What is the current legacy modernisation budget allocation?",
    "Are there existing partnerships in the APAC region?",
  ],
});

const STUB_WRITE_STANDARD = JSON.stringify({
  summary:
    "The case study examines a mid-size technology company undergoing significant digital transformation while pursuing aggressive market expansion. The company has achieved notable revenue growth of 24% year-over-year and reduced customer churn from 8% to 4.5%, primarily driven by its Cloud Platform division. However, the organisation faces material challenges around legacy system integration, talent acquisition, and multi-region regulatory compliance.",
  analysis:
    "The organisation sits at an inflection point. Its Cloud Platform division has emerged as a clear growth engine, launching three new products and driving the majority of new revenue. This success, however, masks underlying structural issues. Legacy systems continue to slow integration timelines, creating friction for enterprise customers who expect seamless onboarding. The talent market remains highly competitive, with the company struggling to attract senior engineers and product managers — roles critical to sustaining its current trajectory. On the regulatory front, the company's ambition to enter APAC markets will require navigating a patchwork of data sovereignty and financial compliance frameworks that differ markedly from its North American base.",
  key_inferences: [
    "The 24% aggregate growth rate, driven primarily by one division, implies the remaining business units are growing at or below market rate — the company's overall health is less robust than the headline suggests.",
    "Churn halving from 8% to 4.5% coinciding with 3 new product launches suggests the new products addressed specific retention pain points rather than merely adding features — this is a signal of strong customer feedback loops.",
    "The talent acquisition challenge combined with legacy system constraints suggests a vicious cycle: top engineers avoid companies with heavy legacy burdens, which further slows modernisation.",
    "The absence of any mention of gross margins or unit economics alongside revenue growth is a red flag — high growth can mask unprofitable scaling.",
    "APAC expansion plans without mention of existing regional presence or partnerships suggest this is an early-stage aspiration rather than an execution-ready initiative.",
  ],
  key_points: [
    "24% YoY revenue growth outpaces the industry average by roughly 2×",
    "Customer churn reduction from 8% to 4.5% indicates improving product-market fit and retention strategy effectiveness",
    "The Cloud Platform division launched 3 new products, establishing it as the primary innovation hub",
    "Legacy infrastructure remains a bottleneck for enterprise integration timelines",
    "APAC expansion represents the largest untapped growth opportunity",
  ],
  statistical_evidence: [
    { metric: "Revenue growth", value: "24% YoY", context: "Approximately 2× the SaaS industry median of ~12%. However, this is an aggregate figure — breakdown by division is not provided." },
    { metric: "Customer churn rate", value: "8% → 4.5%", context: "A 44% reduction in churn. At scale, each percentage point of churn reduction can represent millions in retained ARR." },
    { metric: "New product launches", value: "3 products", context: "All from the Cloud Platform division, reinforcing its role as the sole innovation engine." },
  ],
  anomalies: [
    { observation: "Revenue grew 24% while churn simultaneously dropped 44%", why_it_matters: "In most companies, aggressive growth through new customer acquisition temporarily increases churn as less-qualified leads convert. The simultaneous improvement suggests either exceptional product quality or a change in customer segment targeting.", severity: "medium" },
    { observation: "No margin or profitability data accompanies the growth metrics", why_it_matters: "Growth without profitability context is a common pattern in companies that are buying growth through heavy sales/marketing spend. The absence of this data should be treated as a potential warning sign.", severity: "high" },
    { observation: "All 3 new products came from a single division", why_it_matters: "Zero innovation output from other divisions suggests either resource starvation or strategic neglect of non-cloud business lines.", severity: "medium" },
  ],
  focus_areas: [
    "Decompose the 24% revenue growth by division to determine whether non-Cloud segments are growing, flat, or contracting.",
    "Examine the unit economics of the Cloud Platform division separately — is the growth profitable?",
    "Investigate the churn reduction drivers: was it product improvement, pricing changes, customer success investment, or customer mix shift?",
    "Assess the legacy modernisation timeline and cost — what is the actual technical debt burden in engineering hours per quarter?",
    "Map the APAC regulatory landscape for the specific product categories the company operates in.",
  ],
  risks: [
    "Accumulating technical debt in legacy systems may slow future product launches by 30-50%",
    "Over-reliance on a single division for growth creates strategic fragility — if Cloud Platform stumbles, there is no fallback",
    "Multi-region compliance requirements could delay APAC market entry by 6-12 months and consume significant legal/engineering resources",
    "Talent shortages in key engineering roles threaten delivery capacity and create single-point-of-failure risk on key personnel",
    "Competitive pressure from well-funded incumbents in the cloud space could compress margins even as revenue grows",
  ],
  recommendations: [
    "Establish a dedicated legacy modernisation programme with a 2-quarter milestone plan and ring-fenced budget (suggest 15-20% of engineering capacity)",
    "Diversify the growth portfolio by investing in at least one adjacent product line within the next fiscal year",
    "Create a cross-functional APAC compliance taskforce to map regulatory requirements before committing to market entry",
    "Implement an employer branding and referral programme to address the talent pipeline gap — target 30% reduction in time-to-hire",
    "Explore strategic partnerships with regional cloud providers to accelerate APAC go-to-market without full in-house build-out",
  ],
  follow_up_questions: [
    "What is the exact revenue split between the Cloud Platform division and other business units?",
    "What are the gross and contribution margins for the Cloud Platform vs. legacy products?",
    "What is the current budget allocation for legacy system modernisation, and what percentage of engineering time goes to maintenance vs. new development?",
    "Has the company conducted a formal regulatory gap analysis for target APAC markets?",
    "What is the average time-to-hire for senior engineering and product roles, and what is the offer acceptance rate?",
  ],
});

const STUB_WRITE_DETAILED = JSON.stringify({
  summary:
    "The case study provides a comprehensive examination of a mid-size technology company navigating a complex intersection of digital transformation, market expansion, and organisational scaling. The company has posted impressive headline metrics — 24% year-over-year revenue growth and a near-halving of customer churn from 8% to 4.5% — driven predominantly by its Cloud Platform division, which launched three new products in the review period. Despite these achievements, the organisation confronts significant structural challenges including legacy system integration bottlenecks, intensifying competition for technical talent, and the regulatory complexity inherent in its planned expansion into APAC markets. The case raises fundamental questions about sustainable growth architecture and the trade-offs between speed-to-market and infrastructure resilience.",
  analysis:
    "The company's performance data tells a story of concentrated success. The Cloud Platform division has become the de facto growth engine, but this concentration creates both opportunity and vulnerability. On the positive side, the division's rapid product cadence (three launches in a single period) demonstrates strong execution capability and suggests a well-functioning product development pipeline. The churn reduction is particularly noteworthy — moving from 8% to 4.5% requires not just product improvement but systematic changes to customer success, onboarding, and support processes. This suggests the company is building durable competitive advantages beyond pure feature competition.\n\nHowever, several structural risks demand attention. The legacy system challenge is not merely technical — it represents a strategic bottleneck that affects customer acquisition velocity, integration partner relationships, and the company's ability to serve enterprise segments that demand seamless interoperability. Each quarter of delayed modernisation compounds the eventual migration cost and complexity.\n\nThe talent acquisition challenge operates on multiple levels. Beyond the immediate capacity constraint, difficulty attracting senior engineers signals potential employer brand issues or compensation misalignment. In a market where top talent gravitates toward perceived innovation leaders, the company's legacy infrastructure could become a recruiting liability.\n\nThe APAC expansion opportunity is substantial but requires careful sequencing. Markets like Singapore, Japan, and Australia offer different regulatory environments, customer expectations, and competitive landscapes. A one-size-fits-all entry strategy would likely underperform compared to a staged, market-specific approach.",
  key_points: [
    "Revenue growth of 24% YoY significantly outpaces the industry average, suggesting strong product-market fit in current segments",
    "Customer churn reduction from 8% to 4.5% indicates systematic improvement in retention mechanisms, not just product features",
    "The Cloud Platform division's 3 new product launches demonstrate strong execution velocity and innovation pipeline health",
    "Legacy system integration remains the primary bottleneck for enterprise customer acquisition and partner ecosystem growth",
    "APAC market entry represents a $2B+ addressable opportunity but requires navigating heterogeneous regulatory frameworks",
    "Talent acquisition challenges in engineering and product roles threaten the sustainability of current growth rates",
    "The company's growth concentration in a single division creates strategic fragility that needs proactive diversification",
  ],
  risks: [
    "Technical debt accumulation: Legacy systems create compounding integration costs estimated at 30-50% delivery slowdown per quarter of delayed modernisation",
    "Single-division dependency: Cloud Platform carries disproportionate growth burden, creating existential risk if market conditions shift",
    "Regulatory complexity: APAC expansion exposes the company to at least 4 distinct data sovereignty frameworks with potentially conflicting requirements",
    "Talent pipeline fragility: Current hiring velocity is insufficient to support projected growth, with average time-to-fill for senior roles exceeding 90 days",
    "Competitive encirclement: Well-funded incumbents and VC-backed challengers are converging on the company's core cloud platform segment",
    "Customer concentration risk: If the top 20% of accounts by revenue are Cloud Platform customers, revenue stability is tied to a single product line",
    "Integration partner fatigue: Legacy system limitations may erode goodwill with integration partners critical to ecosystem growth",
  ],
  recommendations: [
    "Launch a legacy modernisation programme with executive sponsorship, ring-fenced budget (suggest 15-20% of engineering capacity), and quarterly milestone reviews",
    "Diversify the growth portfolio by identifying and investing in 1-2 adjacent product lines with $100M+ TAM within the next 2 quarters",
    "Establish a dedicated APAC compliance and market-entry taskforce with representation from Legal, Engineering, Product, and Sales",
    "Implement a comprehensive employer branding initiative paired with competitive compensation benchmarking to close the talent gap",
    "Develop a staged APAC entry strategy: start with Singapore (regulatory clarity, English-speaking, regional hub) before expanding to Japan and Australia",
    "Create a customer advisory board drawn from top-tier accounts to surface integration pain points and validate the modernisation roadmap",
    "Explore strategic acquisition of a small APAC-based cloud company to accelerate market entry and acquire local talent and regulatory expertise",
  ],
  follow_up_questions: [
    "What is the exact revenue breakdown by division, and what are the margin profiles of each?",
    "What percentage of engineering capacity is currently allocated to legacy system maintenance vs. new product development?",
    "Has a formal total addressable market (TAM) analysis been conducted for each target APAC market?",
    "What is the current customer concentration — specifically, what percentage of revenue comes from the top 10 and top 20 accounts?",
    "What is the company's current net promoter score (NPS) and how does it trend by customer segment?",
    "Are there any existing patents or proprietary technology in the Cloud Platform division that create defensible moats?",
    "What is the board's risk appetite for M&A activity in the APAC region?",
  ],
});

function pickWriteResponse(prompt: string): string {
  if (prompt.includes("brief") || prompt.includes("concise")) {
    return STUB_WRITE_CONCISE;
  }
  if (prompt.includes("thorough") || prompt.includes("detailed")) {
    return STUB_WRITE_DETAILED;
  }
  return STUB_WRITE_STANDARD;
}

export class StubProvider implements LLMProvider {
  readonly name = "stub";

  async generateJson(prompt: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 80));

    const isWritePass =
      prompt.includes('"summary"') && prompt.includes("EXTRACTED DATA:");

    return isWritePass ? pickWriteResponse(prompt) : STUB_EXTRACT;
  }
}
