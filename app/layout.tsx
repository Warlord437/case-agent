import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://case-agent-5oxkxwc7j-warlord437s-projects.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Case Study Analyzer — AI-Powered Structured Analysis",
    template: "%s | Case Study Analyzer",
  },
  description:
    "Upload a case study (PDF, Word, Excel) and get structured analysis in seconds — summaries, key inferences, statistical evidence, anomalies, risks, and recommendations. Choose from 8 analytical lenses including Product Manager, Consulting, AI/ML, and Economist.",
  keywords: [
    "case study analyzer",
    "AI case study analysis",
    "business case study tool",
    "structured analysis",
    "case study summary",
    "AI document analysis",
    "PDF analyzer",
    "management consulting tool",
    "business analysis AI",
    "Llama 4",
    "Groq AI",
    "case study insights",
    "risk analysis tool",
    "strategic analysis",
  ],
  authors: [{ name: "Tathagata Saha" }],
  creator: "Tathagata Saha",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Case Study Analyzer",
    title: "Case Study Analyzer — AI-Powered Structured Analysis",
    description:
      "Upload a case study and get deep, structured analysis in seconds. 8 lenses, 10 output sections, powered by Llama 4.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Case Study Analyzer — Upload, analyze, get insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Study Analyzer — AI-Powered Structured Analysis",
    description:
      "Upload a case study and get deep, structured analysis in seconds. 8 analytical lenses, real AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fef9ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
