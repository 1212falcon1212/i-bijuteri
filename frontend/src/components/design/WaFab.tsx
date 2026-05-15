"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface WaFabProps {
  phone?: string;
  message?: string;
  /** Show the introductory bubble (defaults to true) */
  showBubble?: boolean;
}

const DEFAULT_PHONE = "905428482646";
const DEFAULT_MESSAGE = "Merhaba, i-bijuteri hakkında bilgi almak istiyorum.";

/**
 * Floating WhatsApp action button with introductory bubble.
 * Mirrors i-bijuteri.html `.wa-fab` design — green circle + cream bubble above.
 */
export default function WaFab({
  phone = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  showBubble = true,
}: WaFabProps) {
  const [bubbleVisible, setBubbleVisible] = useState(showBubble);

  const cleanedPhone = phone.replace(/\D/g, "");
  const href = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed right-6 bottom-6 z-30 flex flex-col items-end gap-2.5">
      {bubbleVisible && (
        <div className="relative bg-surface border border-card-border rounded-xl px-4 py-3 shadow-lift text-[13px] text-charcoal max-w-[220px] animate-in fade-in slide-in-from-bottom-1 duration-200">
          <button
            type="button"
            onClick={() => setBubbleVisible(false)}
            aria-label="Bildirimi kapat"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface border border-card-border grid place-items-center text-charcoal-mid hover:text-charcoal"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="font-semibold">Size nasıl yardımcı olabiliriz?</div>
          <div className="text-[11.5px] text-charcoal-mid mt-0.5">
            WhatsApp ile yazın
          </div>
        </div>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile iletişime geç"
        className="w-14 h-14 rounded-full grid place-items-center text-white cursor-pointer transition-transform hover:scale-105"
        style={{
          backgroundColor: "#25D366",
          boxShadow: "0 12px 32px -8px rgba(37,211,102,.5)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1s-.8.9-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.5-1.8-1.7-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.2A9 9 0 1 0 12 3z" />
        </svg>
      </a>
    </div>
  );
}
