"use client";

import BijuteriFooter from "@/components/design/BijuteriFooter";

/**
 * Public landing footer — proxy to the canonical BijuteriFooter design component.
 * Keeps a stable import path for the landing page.
 */
export default function LandingFooter() {
  return <BijuteriFooter />;
}
