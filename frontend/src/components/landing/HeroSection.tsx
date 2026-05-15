"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroContent {
  title: string;
  highlight_word: string;
  subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  social_proof_text: string;
  social_proof_rating: string;
  image?: string;
  eyebrow_text?: string;
}

interface HeroStat {
  value: string;
  superscript?: string;
  label: string;
}

interface HeroSectionProps {
  content: HeroContent;
  stats?: HeroStat[];
  /** Eyebrow text above the title */
  eyebrow?: string;
  /** Compact variant for authenticated market home — smaller padding, hides stats, CTAs route to in-app destinations. */
  compact?: boolean;
}

const DEFAULT_STATS: HeroStat[] = [
  { value: "12.4k", superscript: "+", label: "Aktif Ürün" },
  { value: "340", superscript: "+", label: "Onaylı Tedarikçi" },
  { value: "48 sa", label: "Ortalama Teslimat" },
];

/**
 * Renders a heading like "Pırıltıyı toptan {fiyatla} vitrininize taşıyın."
 * — using {highlight} placeholder to mark the italic gold word.
 */
function renderTitle(title: string, highlight: string) {
  if (!title.includes("{highlight}")) {
    // Fallback: append highlight inline if pattern not found.
    return (
      <>
        {title}{" "}
        <em className="text-primary not-italic font-display italic font-medium">
          {highlight}
        </em>
      </>
    );
  }
  const parts = title.split("{highlight}");
  return (
    <>
      {parts[0]}
      <em className="text-primary not-italic font-display italic font-medium">
        {highlight}
      </em>
      {parts[1]}
    </>
  );
}

export default function HeroSection({
  content,
  stats = DEFAULT_STATS,
  eyebrow,
  compact = false,
}: HeroSectionProps) {
  const router = useRouter();

  // ─── Compact variant (used by authenticated market home) ───────────────────
  if (compact) {
    const resolvedEyebrow = eyebrow ?? content.eyebrow_text ?? "Hoş Geldiniz";

    return (
      <section className="bg-surface-bg">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 pt-6 lg:pt-8">
          <div
            className="relative overflow-hidden rounded-3xl text-[#FBF8F3] grid lg:grid-cols-[1.05fr_1fr] min-h-[340px]"
            style={{
              background:
                "radial-gradient(120% 80% at 80% 20%, rgba(184,153,104,.18), transparent 55%), linear-gradient(135deg, #2A1B1F 0%, var(--color-burgundy) 55%, #3B1E2A 100%)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 80% at 10% 100%, rgba(184,153,104,.22), transparent 60%), radial-gradient(40% 60% at 90% 0%, rgba(255,255,255,.08), transparent 60%)",
              }}
            />

            <div className="relative z-10 flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12">
              <div
                className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full text-[11.5px] tracking-[.14em] uppercase font-semibold mb-6"
                style={{
                  color: "#F1E6D0",
                  border: "1px solid rgba(241,230,208,.35)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {resolvedEyebrow}
              </div>

              <h1
                className="font-display font-semibold text-[#FBF8F3] mb-5 leading-[1.04] -tracking-[.015em] text-3xl sm:text-4xl lg:text-[44px]"
                style={{ textWrap: "balance" }}
              >
                {renderTitle(content.title, content.highlight_word)}
              </h1>

              <p className="text-base lg:text-[16px] leading-[1.55] text-[#FBF8F3]/75 max-w-[460px] mb-9">
                {content.subtitle}
              </p>

              <div className="flex flex-wrap gap-3.5 items-center">
                <button
                  type="button"
                  onClick={() => router.push("/market")}
                  className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground rounded-full px-7 py-4 text-[14px] font-semibold tracking-[.02em] hover:bg-primary-dark hover:-translate-y-0.5 transition-all"
                >
                  {content.cta_primary_text || "Koleksiyonu Keşfet"}
                  <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/market/hesabim")}
                  className="inline-flex items-center bg-transparent text-[#FBF8F3] border border-[#FBF8F3]/35 rounded-full px-6 py-[15px] text-[14px] font-medium hover:bg-[#FBF8F3]/10 transition-colors"
                >
                  {content.cta_secondary_text || "Hesabım"}
                </button>
              </div>
            </div>

            <div className="relative hidden lg:grid place-items-center p-8 z-[1]">
              <HeroPendantArt />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── Full landing variant — VKN form on the right ──────────────────────────
  const resolvedEyebrow =
    eyebrow ?? content.eyebrow_text ?? "Yeni Sezon · İlkbahar 2026";
  const rating = content.social_proof_rating || "4.9";
  const socialProofText =
    content.social_proof_text || "500+ doğrulanmış satıcı güveniyor";

  return (
    <section className="bg-surface-bg">
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 pt-10 lg:pt-16 pb-8 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
          {/* ─── Copy column ─── */}
          <div className="flex flex-col">
            <div
              className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full text-[11.5px] tracking-[.14em] uppercase font-semibold mb-6 bg-primary-light text-primary-dark"
              style={{
                border: "1px solid rgba(184,153,104,.35)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {resolvedEyebrow}
            </div>

            <h1
              className="font-display font-semibold text-charcoal mb-5 leading-[1.04] -tracking-[.015em] text-4xl sm:text-5xl lg:text-[60px]"
              style={{ textWrap: "balance" }}
            >
              {renderTitle(content.title, content.highlight_word)}
            </h1>

            <p className="text-base lg:text-[17px] leading-[1.6] text-charcoal-mid max-w-[560px] mb-8">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap gap-3.5 items-center mb-8">
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground rounded-full px-7 py-4 text-[14px] font-semibold tracking-[.02em] hover:bg-primary-dark hover:-translate-y-0.5 transition-all"
              >
                {content.cta_primary_text || "Hemen Üye Ol"}
                <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
              </button>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center text-charcoal border border-card-border bg-white rounded-full px-6 py-[15px] text-[14px] font-medium hover:bg-surface-bg transition-colors"
              >
                {content.cta_secondary_text || "Nasıl Çalışır?"}
              </a>
            </div>

            {/* Social proof — 5 stars + text */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[13px] text-charcoal-mid">
                <strong className="text-charcoal font-semibold">
                  {rating}/5
                </strong>{" "}
                — {socialProofText}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8 mt-10 pt-8 border-t border-card-border max-w-[520px]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl lg:text-[28px] font-semibold text-charcoal -tracking-[.01em] leading-none">
                    {stat.value}
                    {stat.superscript && (
                      <sup className="text-sm text-primary ml-0.5 align-top">
                        {stat.superscript}
                      </sup>
                    )}
                  </div>
                  <div className="text-[11.5px] uppercase tracking-[.08em] font-medium text-charcoal-light mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── VKN form column ─── */}
          <VknRegistrationCard onSubmit={(vkn) => router.push(`/register?vkn=${vkn}`)} />
        </div>
      </div>
    </section>
  );
}

/**
 * VKN registration quick-start card — right column of the landing hero.
 */
function VknRegistrationCard({
  onSubmit,
}: {
  onSubmit: (vkn: string) => void;
}) {
  const [vkn, setVkn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = vkn.trim();
    if (!/^\d{10,11}$/.test(trimmed)) {
      setError("Lütfen 10 veya 11 haneli geçerli bir VKN girin.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="bg-white border border-card-border rounded-2xl shadow-card p-7 lg:p-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-light text-primary-dark text-[11px] uppercase tracking-[.12em] font-semibold">
          Hızlı Başlangıç
        </span>
      </div>
      <h3 className="font-display text-2xl lg:text-[26px] font-semibold text-charcoal mb-2">
        VKN ile Hızlı Kayıt
      </h3>
      <p className="text-sm text-charcoal-mid mb-5 leading-relaxed">
        Vergi kimlik numaranızla kaydınızı başlatın; süreç bir kaç dakika sürer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="vkn-input"
            className="block text-[12px] uppercase tracking-[.08em] font-semibold text-charcoal-light mb-1.5"
          >
            VKN
          </label>
          <input
            id="vkn-input"
            type="text"
            inputMode="numeric"
            placeholder="10 veya 11 haneli VKN"
            value={vkn}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 11);
              setVkn(next);
              if (error) setError(null);
            }}
            maxLength={11}
            pattern="[0-9]{10,11}"
            className="w-full h-12 px-4 rounded-xl border border-card-border bg-white text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          {error && (
            <p className="text-xs text-destructive mt-1.5">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-dark rounded-xl font-semibold text-[14px]"
        >
          Doğrula ve Devam Et
        </Button>
      </form>

      <p className="text-xs text-charcoal-light mt-3 leading-relaxed">
        Vergi levhası ve imza sirküleri ile birkaç dakikada onay.
      </p>
    </div>
  );
}

/**
 * Inline SVG: gold pendant necklace with burgundy gem — matches i-bijuteri.html hero art.
 */
function HeroPendantArt() {
  return (
    <svg
      viewBox="0 0 480 460"
      fill="none"
      className="w-full h-auto max-w-[480px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F1E0B0" />
          <stop offset="45%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#8C6F3F" />
        </linearGradient>
        <radialGradient id="hero-gem" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FBE5EE" />
          <stop offset="50%" stopColor="#D17A92" />
          <stop offset="100%" stopColor="#5C1F32" />
        </radialGradient>
      </defs>
      {/* Chain curves */}
      <path
        d="M40 60 C 120 130, 360 130, 440 60"
        stroke="url(#hero-gold)"
        strokeWidth={3}
        fill="none"
        strokeDasharray="2 3"
        opacity={0.85}
      />
      <path
        d="M70 80 C 150 150, 330 150, 410 80"
        stroke="url(#hero-gold)"
        strokeWidth={2}
        fill="none"
        strokeDasharray="2 4"
        opacity={0.6}
      />
      {/* Bail */}
      <path
        d="M236 130 L236 180 M244 130 L244 180"
        stroke="url(#hero-gold)"
        strokeWidth={3}
        fill="none"
      />
      <rect x={228} y={180} width={24} height={14} rx={3} fill="url(#hero-gold)" />
      {/* Pendant frame */}
      <ellipse cx={240} cy={290} rx={100} ry={118} fill="url(#hero-gold)" />
      <ellipse cx={240} cy={290} rx={92} ry={110} fill="#3B1E2A" />
      {/* Gem */}
      <ellipse cx={240} cy={290} rx={74} ry={92} fill="url(#hero-gem)" />
      <ellipse cx={216} cy={262} rx={22} ry={34} fill="#FBE5EE" opacity={0.5} />
      {/* Decorative diamonds */}
      <g fill="#FBF0CF">
        <circle cx={240} cy={175} r={3.5} />
        <circle cx={166} cy={222} r={3} />
        <circle cx={314} cy={222} r={3} />
        <circle cx={146} cy={296} r={3.5} />
        <circle cx={334} cy={296} r={3.5} />
        <circle cx={166} cy={370} r={3} />
        <circle cx={314} cy={370} r={3} />
        <circle cx={240} cy={408} r={3.5} />
      </g>
      {/* Sparkles */}
      <g stroke="#F1E6D0" strokeWidth={1.5} strokeLinecap="round" opacity={0.7}>
        <path d="M390 150 l0 18 M381 159 l18 0" />
        <path d="M100 200 l0 14 M93 207 l14 0" />
        <path d="M380 380 l0 12 M374 386 l12 0" />
      </g>
    </svg>
  );
}
