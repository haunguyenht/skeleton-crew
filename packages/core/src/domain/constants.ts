import type { IndustryCode, LineOfBusiness } from "./types";

/** Jurisdictions the delegated underwriting authority covers. */
export const SUPPORTED_JURISDICTIONS = ["US", "CA", "GB", "SG", "AU", "DE", "NL"] as const;

/** Rate on limit for a benchmark risk, before any modifier. */
export const LINE_BASE_RATES: Record<LineOfBusiness, number> = {
  cyber: 0.0032,
  "tech-eo": 0.0026,
  "professional-liability": 0.0019,
};

export const LINE_LABELS: Record<LineOfBusiness, string> = {
  cyber: "Cyber",
  "tech-eo": "Technology E&O",
  "professional-liability": "Professional Liability",
};

export interface IndustryProfile {
  label: string;
  /** 0..100 input to the industry-volatility factor. */
  volatility: number;
  /** Multiplies the line base rate. */
  rateMultiplier: number;
}

export const INDUSTRY_PROFILES: Record<IndustryCode, IndustryProfile> = {
  saas: { label: "SaaS / software", volatility: 34, rateMultiplier: 1.0 },
  fintech: { label: "Fintech / payments", volatility: 64, rateMultiplier: 1.35 },
  healthtech: { label: "Health technology", volatility: 56, rateMultiplier: 1.2 },
  ecommerce: { label: "E-commerce", volatility: 47, rateMultiplier: 1.1 },
  manufacturing: { label: "Manufacturing", volatility: 58, rateMultiplier: 1.15 },
  logistics: { label: "Logistics", volatility: 52, rateMultiplier: 1.08 },
  consulting: { label: "Consulting", volatility: 28, rateMultiplier: 0.9 },
};

/** Minimum technical premium; nothing is quoted below this. */
export const MIN_PREMIUM_USD = 2_500;

/** Limit above which a facultative referral is required. */
export const FACULTATIVE_LIMIT_USD = 10_000_000;
