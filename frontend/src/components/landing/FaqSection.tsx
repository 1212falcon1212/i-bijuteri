"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

function FaqAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "bg-white border-[#D4B896] shadow-lg shadow-[#D4B896]/25"
          : "bg-white border-[#ECE3D2] hover:border-[#D4B896] shadow-sm"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`font-semibold pr-4 transition-colors duration-200 ${
            isOpen ? "text-[#B89968]" : "text-[#1B1611]"
          }`}
        >
          {item.question}
        </span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-[#B89968] text-white rotate-180"
              : "bg-[#FBF8F3] text-[#9C8E78]"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <p className="text-[#6A5F4E] leading-relaxed">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = useCallback(
    (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    },
    [openIndex]
  );

  if (items.length === 0) return null;

  return (
    <section id="sss" className="py-24 lg:py-32 bg-[#FBF8F3]">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBF8F3] text-[#B89968] text-sm font-semibold mb-5">
            <HelpCircle className="w-3.5 h-3.5" />
            SSS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal -tracking-[.015em]">
            {title}
          </h2>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#B89968] to-[#D4B896]" />
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <FaqAccordion
                item={item}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
