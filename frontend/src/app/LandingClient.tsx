"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhySection from "@/components/landing/WhySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";
import WaFab from "@/components/design/WaFab";

// ─── Types ──────────────────────────────────────────────────────────────────

interface HeroContent {
  title: string;
  highlight_word: string;
  subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  social_proof_text: string;
  social_proof_rating: string;
}

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

interface AdvantageFeature {
  icon: string;
  title: string;
  description: string;
}

interface AdvantagesContent {
  section_title: string;
  section_subtitle: string;
  features: AdvantageFeature[];
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

interface StatsContent {
  section_title: string;
  section_subtitle: string;
  items: StatItem[];
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialsContent {
  section_title: string;
  section_subtitle: string;
  items: TestimonialItem[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqContent {
  section_title: string;
  items: FaqItem[];
}

interface CtaContent {
  title: string;
  subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
}

export interface LandingContent {
  hero: HeroContent;
  how_it_works: HowItWorksContent;
  advantages: AdvantagesContent;
  stats: StatsContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  cta: CtaContent;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_CONTENT: LandingContent = {
  hero: {
    title: "Pırıltıyı toptan {highlight} vitrininize taşıyın.",
    highlight_word: "fiyatla",
    subtitle:
      "Türkiye'nin en güvenilir bijuteri tedarikçilerinden seçilmiş binlerce model — şeffaf fiyatlama, hızlı kargo ve onaylı satıcılarla.",
    cta_primary_text: "Hemen Üye Ol",
    cta_secondary_text: "Nasıl Çalışır?",
    social_proof_text: "500+ doğrulanmış satıcı güveniyor",
    social_proof_rating: "4.9",
  },
  how_it_works: {
    section_title: "3 Adımda Bijuteri Ticareti",
    section_subtitle:
      "Vergi levhanız ile dakikalar içinde sisteme dahil olun ve toptan bijuteri ticaretine başlayın.",
    steps: [
      {
        title: "VKN ile Hızlı Kayıt",
        description:
          "Vergi levhası ve imza sirkülerinizi yükleyin. Şirketiniz doğrulanır, hesabınız 1-2 iş günü içinde aktifleşir.",
      },
      {
        title: "Ürünlerinizi Listeleyin",
        description:
          "Kolye, küpe, yüzük, bileklik ve tüm bijuteri kategorilerini kolayca listeleyin. Toplu yükleme desteğiyle hızlı başlayın.",
      },
      {
        title: "Güvenle Alın / Satın",
        description:
          "KDV ve stopaj otomatik hesaplanır, e-Fatura üretilir. Kargonu sen belirle, ödemeni güvenle al.",
      },
    ],
    verification_card_title: "Doğrulanmış Satıcılar",
    verification_card_subtitle: "Doğrulanmış Satıcılar",
    verification_checklist: [
      "VKN doğrulaması (10/11 haneli)",
      "Vergi levhası kontrolü",
      "İmza sirküleri onayı",
      "Yönetici onayı (1-2 iş günü)",
    ],
    trusted_by_text: "Türkiye genelinde güveniyor",
    trusted_by_cities: [
      "İstanbul",
      "İzmir",
      "Ankara",
      "Bursa",
      "Antalya",
      "Konya",
    ],
  },
  advantages: {
    section_title: "Neden i-Bijuteri?",
    section_subtitle:
      "Bijuteri sektörü için tasarlanmış uçtan uca B2B pazaryeri deneyimi.",
    features: [
      {
        icon: "trending-up",
        title: "Geniş Ürün Yelpazesi",
        description:
          "Kolye, küpe, yüzük, bileklik, saat ve aksesuar dahil binlerce kategori tek platformda.",
      },
      {
        icon: "shield",
        title: "Doğrulanmış Satıcılar",
        description:
          "VKN ve imza sirküleri ile doğrulanan üretici, ithalatçı ve toptancılar. Güvenle çalışın.",
      },
      {
        icon: "truck",
        title: "Esnek Kargo",
        description:
          "Kargonu sen belirle. Anlaşmalı kargo şirketleri veya kendi lojistiğin ile teslimat senin elinde.",
      },
      {
        icon: "file-check",
        title: "Otomatik E-Fatura",
        description:
          "Her sipariş için otomatik e-Fatura üretimi. KDV ve stopaj hesaplamaları sistem tarafından yapılır.",
      },
      {
        icon: "credit-card",
        title: "Şeffaf Komisyon",
        description:
          "%10 komisyon + ₺50 sabit hizmet bedeli. Gizli ücret yok, fiyatlandırma şeffaf.",
      },
      {
        icon: "box",
        title: "Güvenli Ödeme",
        description:
          "Ödemeler havuzda tutulur, ürün teslim edildikten sonra satıcıya aktarılır. Alıcı ve satıcı koruma altında.",
      },
    ],
  },
  stats: {
    section_title: "Rakamlarla i-Bijuteri",
    section_subtitle: "Her gün büyüyen güvenilir bijuteri ağı",
    items: [
      { value: 500, suffix: "+", label: "Satıcı" },
      { value: 10000, suffix: "+", label: "Aktif İlan" },
      { value: 10, suffix: "%", label: "Komisyon" },
      { value: 50, suffix: "₺", label: "Hizmet Bedeli" },
    ],
  },
  testimonials: {
    section_title: "Satıcılar Ne Diyor?",
    section_subtitle:
      "Platformumuzu kullanan kuyumcu, atölye ve perakende sahiplerinin deneyimleri.",
    items: [
      {
        quote:
          "Atölyemde ürettiğim kolye ve küpeleri Türkiye'nin her yerine ulaştırabiliyorum. E-Fatura otomasyonu işimi çok kolaylaştırdı.",
        author: "A.Y.",
        role: "Atölye Sahibi, İstanbul",
      },
      {
        quote:
          "İthal ettiğim ürünleri perakendecilere toptan satmak için ideal platform. Komisyon şeffaf, ödemeler zamanında geliyor.",
        author: "F.D.",
        role: "İthalatçı, İzmir",
      },
      {
        quote:
          "Mağazam için doğrulanmış satıcılardan kaliteli ürün tedarik ediyorum. Kargo opsiyonları esnek, fiyatlar rekabetçi.",
        author: "M.K.",
        role: "Perakende Sahibi, Ankara",
      },
    ],
  },
  faq: {
    section_title: "Sıkça Sorulan Sorular",
    items: [
      {
        question: "Kayıt için ne gerekir?",
        answer:
          "Vergi levhası, imza sirküleri ve şirket bilgileriniz yeterlidir. Belgelerin doğrulanmasının ardından hesabınız 1-2 iş günü içinde aktifleşir.",
      },
      {
        question: "Komisyon ve hizmet bedeli nedir?",
        answer:
          "Her satışta %10 komisyon ve sipariş başına ₺50 sabit hizmet bedeli alınır. Üyelik ve ilan oluşturma tamamen ücretsizdir.",
      },
      {
        question: "Kargo nasıl işler?",
        answer:
          "Kargo şirketini ve teslimat sürecini sen belirlersin. Anlaşmalı kargo entegrasyonlarımız veya kendi lojistik çözümünle ürünlerini gönderebilirsin.",
      },
      {
        question: "Ödemeyi ne zaman alırım?",
        answer:
          "Alıcı ödemesi platform havuzunda tutulur. Ürün alıcıya ulaştığında ve onay verildiğinde, hakediş tutarı cüzdanına aktarılır.",
      },
    ],
  },
  cta: {
    title: "Hemen Ücretsiz Başlayın",
    subtitle:
      "VKN ve imza sirküleri ile dakikalar içinde kayıt olun. Üyelik tamamen ücretsiz!",
    cta_primary_text: "Ücretsiz Kayıt Ol",
    cta_secondary_text: "Giriş Yap",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

interface LandingClientProps {
  initialContent?: LandingContent;
}

export default function LandingClient({
  initialContent,
}: LandingClientProps = {}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const content = initialContent ?? DEFAULT_CONTENT;

  // Auth redirect — non-blocking, content always renders
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/market");
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-surface-bg"
      style={{ scrollBehavior: "smooth" }}
    >
      <LandingHeader />

      <main>
        <HeroSection content={content.hero} />

        <FeaturesSection content={content.how_it_works} />

        <WhySection
          title={content.advantages.section_title}
          subtitle={content.advantages.section_subtitle}
          features={content.advantages.features}
        />

        <TestimonialsSection
          title={content.testimonials.section_title}
          subtitle={content.testimonials.section_subtitle}
          items={content.testimonials.items}
        />

        <FaqSection
          title={content.faq.section_title}
          items={content.faq.items}
        />

        <CtaSection content={content.cta} stats={content.stats.items} />
      </main>

      <LandingFooter />

      <WaFab />
    </div>
  );
}
