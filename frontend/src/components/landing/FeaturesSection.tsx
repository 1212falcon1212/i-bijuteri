"use client";

import { Gem, Truck, ShieldCheck, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksContent {
  section_title: string;
  section_subtitle: string;
  steps: HowItWorksStep[];
  verification_card_title: string;
  verification_card_subtitle: string;
  verification_checklist: string[];
  trusted_by_text: string;
  trusted_by_cities: string[];
}

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

interface FeaturesSectionProps {
  /** When `content` is provided, renders the full landing "how it works" layout
   *  (3-step timeline on the left + sticky verification card on the right). */
  content?: HowItWorksContent;
  /** When provided (and no `content`), renders the compact 3-strip features
   *  row used by the authenticated market home. */
  features?: FeatureItem[];
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: Gem,
    title: "Şeffaf Fiyatlama",
    subtitle: "Açık tedarikçi ve fiyat profili",
  },
  {
    icon: Truck,
    title: "Ücretsiz Kargo",
    subtitle: "Tüm siparişlerde satıcı karşılar",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli Tedarik",
    subtitle: "Onaylı satıcılardan, ayar garantili",
  },
];

export default function FeaturesSection({
  features,
  content,
}: FeaturesSectionProps) {
  // ─── Landing variant — 3-step timeline + sticky verification card ─────────
  if (content) {
    return (
      <section
        id="nasil-calisir"
        className="bg-surface-bg scroll-mt-24"
      >
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-16 lg:py-20">
          {/* Section heading */}
          <div className="max-w-2xl mb-12 lg:mb-14">
            <h2 className="font-display text-3xl lg:text-[40px] font-semibold text-charcoal -tracking-[.01em] leading-tight mb-3">
              {content.section_title}
            </h2>
            <p className="text-charcoal-mid text-base lg:text-[17px] leading-[1.6]">
              {content.section_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-12">
            {/* ─── Timeline column ─── */}
            <ol className="space-y-7 lg:space-y-9 relative">
              {/* Connector line */}
              <span
                aria-hidden
                className="absolute left-5 top-3 bottom-3 w-px bg-card-border hidden sm:block"
              />
              {content.steps.map((step, i) => (
                <li key={i} className="relative pl-14 sm:pl-16">
                  <span className="absolute left-0 top-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-primary-foreground font-display text-xl sm:text-[22px] font-semibold grid place-items-center shadow-card">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-xl lg:text-[22px] font-semibold text-charcoal mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-charcoal-mid leading-relaxed text-[15px]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>

            {/* ─── Sticky verification card ─── */}
            <aside className="lg:sticky lg:top-24 self-start bg-white border border-card-border rounded-2xl shadow-card p-7 lg:p-8">
              <Badge className="bg-green-100 text-green-800 border-transparent uppercase tracking-[.1em] text-[10.5px]">
                {content.verification_card_subtitle ||
                  "Doğrulanmış Satıcılar"}
              </Badge>

              <h3 className="font-display text-2xl lg:text-[26px] font-semibold text-charcoal mt-4 mb-3 leading-snug">
                {content.verification_card_title}
              </h3>

              <p className="text-charcoal-mid text-[14px] leading-relaxed mb-5">
                Vergi levhası ve imza sirküleri ile doğrulanmış işletmelerden
                oluşan onaylı satıcı ağımız ile güvenle ticaret yapın.
              </p>

              <ul className="space-y-3 mb-6">
                {content.verification_checklist.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary-dark grid place-items-center mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    <span className="text-charcoal text-[14px] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-5 border-t border-card-border">
                <p className="text-[11px] text-charcoal-light uppercase tracking-[.12em] font-semibold mb-3">
                  {content.trusted_by_text}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-medium text-charcoal-mid">
                  {content.trusted_by_cities.map((city, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  // ─── Compact 3-strip variant (market home) ────────────────────────────────
  const resolved = features ?? DEFAULT_FEATURES;

  return (
    <section className="bg-surface-bg">
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-6 lg:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-4">
        {resolved.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-white border border-card-border rounded-2xl p-6 lg:px-6 lg:py-[22px] flex items-center gap-4 lg:gap-[18px] shadow-card"
            >
              <div className="w-12 h-12 lg:w-[52px] lg:h-[52px] rounded-xl bg-primary-light text-primary-dark grid place-items-center flex-shrink-0">
                <Icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="text-charcoal font-semibold text-[15px] lg:text-base -tracking-[.005em]">
                  {feature.title}
                </div>
                <div className="text-charcoal-mid text-[12.5px] mt-1 line-clamp-2">
                  {feature.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
