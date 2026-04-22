import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { useSeoOverride } from "@/hooks/useSeoOverride";

interface Props {
  /** Titre brut de la page (sera inséré dans le template) */
  title?: string;
  /** Description meta */
  description?: string;
  /** Image OG absolue */
  image?: string;
  /** Type OG (article, website, video.other...) */
  type?: string;
  /** Override route_pattern (par défaut: location.pathname) */
  route?: string;
  /** Si contenu lié, type + id (article/video/page) */
  targetType?: "article" | "video" | "page";
  targetId?: string | null;
  /** JSON-LD additionnel (ex: Article, BreadcrumbList) */
  jsonld?: object | object[];
  /** Forcer noindex sur cette page */
  noindex?: boolean;
}

const upsertMeta = (selector: string, attrName: "name" | "property", attrValue: string, content: string) => {
  if (!content) {
    const existing = document.head.querySelector(selector);
    if (existing) existing.remove();
    return;
  }
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

const upsertJsonLd = (id: string, data: any) => {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const SeoHead = ({ title, description, image, type = "website", route, targetType, targetId, jsonld, noindex }: Props) => {
  const settings = useSeoSettings();
  const location = useLocation();
  const currentRoute = route || location.pathname;
  const override = useSeoOverride({ route: currentRoute, targetType, targetId });

  useEffect(() => {
    const finalTitle = override?.title || title || "";
    const template = settings.title_template || "%s";
    const fullTitle = finalTitle
      ? template.includes("%s") ? template.replace("%s", finalTitle) : `${finalTitle} — ${settings.organization_name}`
      : settings.default_title;

    document.title = fullTitle;

    const finalDesc = (override?.description || description || settings.default_description || "").slice(0, 300);
    const finalImage = override?.og_image || image || settings.default_og_image;
    const base = (settings.canonical_base_url || "").replace(/\/$/, "");
    const finalCanonical = override?.canonical || `${base}${currentRoute}`;
    const robots = noindex ? "noindex,nofollow" : (override?.robots || settings.default_robots || "index,follow");
    const lang = settings.default_language || "fr-FR";

    document.documentElement.lang = lang.split("-")[0];

    upsertMeta('meta[name="description"]', "name", "description", finalDesc);
    upsertMeta('meta[name="robots"]', "name", "robots", robots);
    upsertMeta('meta[name="keywords"]', "name", "keywords", override?.keywords || settings.default_keywords || "");
    upsertLink("canonical", finalCanonical);

    // Open Graph
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", finalDesc);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", finalCanonical);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", settings.organization_name || "");
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", lang.replace("-", "_"));
    upsertMeta('meta[property="og:image"]', "property", "og:image", finalImage);
    if (settings.facebook_app_id) {
      upsertMeta('meta[property="fb:app_id"]', "property", "fb:app_id", settings.facebook_app_id);
    }

    // Twitter
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", settings.twitter_card_type || "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", finalDesc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", finalImage);
    upsertMeta('meta[name="twitter:site"]', "name", "twitter:site", settings.twitter_handle || "");

    // GSC verification (au cas où injecté en module au lieu de TrackingScripts)
    if (settings.gsc_verification) {
      upsertMeta('meta[name="google-site-verification"]', "name", "google-site-verification", settings.gsc_verification);
    }
    if (settings.bing_verification) {
      upsertMeta('meta[name="msvalidate.01"]', "name", "msvalidate.01", settings.bing_verification);
    }

    // JSON-LD Organization (toujours présent)
    let sameAs: string[] = [];
    try { sameAs = JSON.parse(settings.organization_sameas || "[]"); } catch {}
    upsertJsonLd("ld-organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: settings.organization_name,
      url: settings.organization_url,
      logo: settings.organization_logo || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    });

    // JSON-LD personnalisé
    const merged = override?.jsonld && Object.keys(override.jsonld).length ? override.jsonld : jsonld;
    if (merged) {
      upsertJsonLd("ld-page", merged);
    } else {
      document.getElementById("ld-page")?.remove();
    }
  }, [settings, override, title, description, image, type, currentRoute, jsonld, noindex]);

  return null;
};

export default SeoHead;