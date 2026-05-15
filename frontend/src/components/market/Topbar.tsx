/**
 * @deprecated Use `@/components/design/Topbar` instead.
 *
 * This file remains as a compatibility shim so any historical imports keep
 * working — it simply re-exports the canonical design system Topbar.
 *
 * Migration:
 *   - import { Topbar } from "@/components/market/Topbar"
 *   + import Topbar from "@/components/design/Topbar"
 */
export { default as Topbar } from "@/components/design/Topbar";
export { default } from "@/components/design/Topbar";
