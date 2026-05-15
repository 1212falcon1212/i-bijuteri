"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Box,
  CreditCard,
  FileCheck,
  Truck,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdvantageFeature {
  icon?: string;
  image?: string;
  title: string;
  description: string;
}

interface WhySectionProps {
  title: string;
  subtitle: string;
  features: AdvantageFeature[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  box: Box,
  "credit-card": CreditCard,
  "file-check": FileCheck,
  truck: Truck,
  shield: Shield,
};

const GRADIENTS = [
  "from-[#B89968] to-[#8C6F3F]",
  "from-[#C9A961] to-[#A8884A]",
  "from-[#C9A068] to-[#B89968]",
  "from-[#D4B896] to-[#C9A068]",
  "from-[#8C6F3F] to-[#6E2638]",
  "from-[#B89968] to-[#D4B896]",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function WhySection({
  title,
  subtitle,
  features,
}: WhySectionProps) {
  return (
    <section id="avantajlar" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FBF8F3]/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F1E6D0]/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBF8F3] text-[#B89968] text-sm font-semibold mb-5">
            <Shield className="w-3.5 h-3.5" />
            Avantajlar
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-charcoal leading-tight -tracking-[.015em]">
            {title}
          </h2>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#B89968] to-[#D4B896]" />
          <p className="mt-5 text-lg text-[#6A5F4E] max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
        >
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon || ''] || Shield;
            const gradient = GRADIENTS[i % GRADIENTS.length];

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group relative rounded-2xl bg-white border border-[#ECE3D2] hover:border-[#D4B896] shadow-sm hover:shadow-xl hover:shadow-[#D4B896]/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Image from API or Icon fallback */}
                {feature.image ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="pt-7 px-7">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg shadow-[#D4B896]/30 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                <div className={feature.image ? 'p-6' : 'px-7 pb-7'}>

                {/* Content */}
                <h3 className="text-lg font-bold text-[#1B1611] mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-[#6A5F4E] leading-relaxed text-[15px]">
                  {feature.description}
                </p>
                </div>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#B89968] to-[#D4B896] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
