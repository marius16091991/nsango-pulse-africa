// Réseaux sociaux supportés + utilitaires de partage avec UTM
import {
  Facebook, Twitter, Linkedin, MessageCircle, Send, Instagram,
  Youtube, Music2, Link as LinkIcon, type LucideIcon,
} from "lucide-react";

export type SocialNetwork =
  | "facebook" | "x" | "linkedin" | "whatsapp"
  | "telegram" | "instagram" | "tiktok" | "youtube";

export const NETWORKS: Record<SocialNetwork, { label: string; icon: LucideIcon; color: string }> = {
  facebook:  { label: "Facebook",  icon: Facebook,       color: "#1877F2" },
  x:         { label: "X",         icon: Twitter,        color: "#000000" },
  linkedin:  { label: "LinkedIn",  icon: Linkedin,       color: "#0A66C2" },
  whatsapp:  { label: "WhatsApp",  icon: MessageCircle,  color: "#25D366" },
  telegram:  { label: "Telegram",  icon: Send,           color: "#26A5E4" },
  instagram: { label: "Instagram", icon: Instagram,      color: "#E4405F" },
  tiktok:    { label: "TikTok",    icon: Music2,         color: "#000000" },
  youtube:   { label: "YouTube",   icon: Youtube,        color: "#FF0000" },
};

export const ALL_NETWORKS = Object.keys(NETWORKS) as SocialNetwork[];

export const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

/** Ajoute les paramètres UTM à une URL */
export const addUtm = (url: string, network: string, campaign: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", network);
    u.searchParams.set("utm_medium", "social");
    if (campaign) u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch { return url; }
};

/** Construit l'URL du composer pour le réseau */
export const buildShareUrl = (
  network: SocialNetwork, link: string, message: string,
): string => {
  const u = encodeURIComponent(link);
  const t = encodeURIComponent(message);
  switch (network) {
    case "facebook":  return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`;
    case "x":         return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "linkedin":  return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "whatsapp":  return `https://wa.me/?text=${t}%20${u}`;
    case "telegram":  return `https://t.me/share/url?url=${u}&text=${t}`;
    // Instagram / TikTok / YouTube ne supportent pas le share via URL → on copie le lien
    case "instagram":
    case "tiktok":
    case "youtube":   return link;
  }
};

export const canOpenComposer = (n: SocialNetwork) =>
  !["instagram", "tiktok", "youtube"].includes(n);
