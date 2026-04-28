import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import {
  ALL_NETWORKS, NETWORKS, addUtm, buildShareUrl, canOpenComposer, slugify,
  type SocialNetwork,
} from "@/lib/socialShare";

interface ShareBarProps {
  title: string;
  articleId?: string;
  url?: string; // par défaut: window.location.href
  className?: string;
}

const ShareBar = ({ title, articleId, url, className = "" }: ShareBarProps) => {
  const [copied, setCopied] = useState(false);
  const baseUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const campaign = articleId ? slugify(title) : "share";

  const trackClick = async (network: string) => {
    try {
      await supabase.from("social_clicks").insert({
        network,
        article_id: articleId || null,
        visitor_ip: getVisitorId(),
        user_agent: navigator.userAgent.slice(0, 200),
        referer: document.referrer.slice(0, 200),
      });
    } catch { /* silent */ }
  };

  const share = async (network: SocialNetwork) => {
    const linkWithUtm = addUtm(baseUrl, network, campaign);
    void trackClick(network);

    if (!canOpenComposer(network)) {
      await navigator.clipboard.writeText(linkWithUtm);
      toast({ title: `Lien copié`, description: `Collez-le dans ${NETWORKS[network].label}` });
      return;
    }
    const shareUrl = buildShareUrl(network, linkWithUtm, title);
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const copyLink = async () => {
    const linkWithUtm = addUtm(baseUrl, "direct", campaign);
    await navigator.clipboard.writeText(linkWithUtm);
    void trackClick("copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Lien copié ✓" });
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, url: addUtm(baseUrl, "native", campaign) });
      void trackClick("native");
    } catch { /* user cancelled */ }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mr-1">Partager</span>
      {ALL_NETWORKS.map((n) => {
        const { icon: Icon, label, color } = NETWORKS[n];
        return (
          <button
            key={n}
            onClick={() => share(n)}
            aria-label={`Partager sur ${label}`}
            title={`Partager sur ${label}`}
            className="w-9 h-9 rounded-full bg-muted hover:scale-110 hover:text-white flex items-center justify-center transition-all duration-200"
            style={{ ['--hover-bg' as never]: color }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
      <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 h-9 ml-1">
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="text-xs">{copied ? "Copié" : "Copier"}</span>
      </Button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <Button variant="ghost" size="sm" onClick={nativeShare} className="gap-1.5 h-9">
          <Share2 className="w-3.5 h-3.5" /><span className="text-xs">Plus</span>
        </Button>
      )}
    </div>
  );
};

export default ShareBar;
