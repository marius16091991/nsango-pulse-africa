import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Resolve a lucide icon by name string. Returns fallback if not found. */
export const getLucideIcon = (name?: string | null, fallback: LucideIcon = Icons.Circle): LucideIcon => {
  if (!name) return fallback;
  const Cmp = (Icons as any)[name];
  return (Cmp as LucideIcon) || fallback;
};
