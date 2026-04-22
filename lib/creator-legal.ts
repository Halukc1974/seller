/**
 * Versioned list of legal documents a creator must acknowledge during
 * onboarding. Every entry is captured in CreatorLegalAcceptance on acceptance.
 *
 * When a document materially changes, bump its version to force re-acceptance
 * on the next creator touchpoint.
 */
export interface LegalRequirement {
  key: string;
  version: string;
  label: string;
  description: string;
  link?: { href: string; label: string };
}

export const CREATOR_LEGAL_REQUIREMENTS: readonly LegalRequirement[] = [
  {
    key: "creator-terms",
    version: "1",
    label: "Creator Terms",
    description:
      "I have read and agree to the Creator Terms in full, including the obligations, restrictions and moderation rules set out there.",
    link: { href: "/creator-terms", label: "Read Creator Terms" },
  },
  {
    key: "ip-ownership",
    version: "1",
    label: "Intellectual-property ownership",
    description:
      "I confirm that I own — or hold all necessary written licences for — every file, asset and element I will list, and that I have the right to sell it on Seller.",
  },
  {
    key: "revenue-share",
    version: "1",
    label: "Revenue share (80% creator / 20% platform)",
    description:
      "I acknowledge that Seller retains a 20% platform fee on each completed sale and that I will receive the remaining 80%, subject to clearance periods and deductions for refunds, chargebacks and fraud reversals.",
  },
  {
    key: "no-refunds",
    version: "1",
    label: "No refunds to buyers",
    description:
      "I acknowledge that all sales are final — digital goods are non-refundable once delivered — and I will not offer or promise refunds to buyers outside the platform policy.",
    link: { href: "/refund-policy", label: "Read refund policy" },
  },
  {
    key: "prohibited-content",
    version: "1",
    label: "Prohibited content",
    description:
      "I will not list infringing, unlawful, adult, malicious or misrepresented material, and I accept that Seller may remove a listing or suspend my account without notice for violations.",
  },
  {
    key: "tax-responsibility",
    version: "1",
    label: "Tax responsibility",
    description:
      "I am solely responsible for reporting and paying any income, sales, VAT/GST or other taxes that apply to my earnings on Seller.",
  },
] as const;

export type LegalAcceptanceInput = { key: string; version: string };

export function validateAcceptances(
  input: unknown,
): { ok: true; accepted: LegalAcceptanceInput[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "Legal acceptances are required." };
  }

  const received = new Map<string, string>();
  for (const raw of input) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "Invalid acceptance entry." };
    }
    const key = (raw as Record<string, unknown>).key;
    const version = (raw as Record<string, unknown>).version;
    if (typeof key !== "string" || typeof version !== "string") {
      return { ok: false, error: "Invalid acceptance entry." };
    }
    received.set(key, version);
  }

  const accepted: LegalAcceptanceInput[] = [];
  for (const req of CREATOR_LEGAL_REQUIREMENTS) {
    const version = received.get(req.key);
    if (!version) {
      return {
        ok: false,
        error: `You must accept: ${req.label}.`,
      };
    }
    if (version !== req.version) {
      return {
        ok: false,
        error: `${req.label} was updated. Please reload and accept the current version.`,
      };
    }
    accepted.push({ key: req.key, version });
  }
  return { ok: true, accepted };
}
