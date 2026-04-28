import { ExternalLink, FileText, Globe, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const SeoToolsTab = () => {
  const settings = useSeoSettings();
  const sitemapUrl = `${SUPABASE_URL}/functions/v1/sitemap`;
  const robotsUrl = `${SUPABASE_URL}/functions/v1/robots`;
  const base = settings.canonical_base_url?.replace(/\/$/, "") || "";

  const ping = (engine: "google" | "bing") => {
    const target = encodeURIComponent(sitemapUrl);
    const url = engine === "google"
      ? `https://www.google.com/ping?sitemap=${target}`
      : `https://www.bing.com/ping?sitemap=${target}`;
    window.open(url, "_blank");
    toast({ title: `Ping ${engine} envoyé` });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 font-display"><Globe className="w-4 h-4 text-gold" /> Sitemap</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-body">Sitemap XML généré dynamiquement à partir des contenus publiés.</p>
          <div className="flex flex-col gap-1">
            <code className="text-[11px] font-mono p-2 bg-secondary rounded break-all">{sitemapUrl}</code>
            <p className="text-[10px] text-muted-foreground">Configure une redirection /sitemap.xml dans ton hébergeur ou utilise cette URL directement dans la Search Console.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" asChild><a href={sitemapUrl} target="_blank" rel="noreferrer" className="gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Voir XML</a></Button>
            <Button size="sm" onClick={() => ping("google")} className="gap-1.5 bg-gold text-primary hover:bg-gold-dark"><Send className="w-3.5 h-3.5" /> Ping Google</Button>
            <Button size="sm" variant="outline" onClick={() => ping("bing")} className="gap-1.5"><Send className="w-3.5 h-3.5" /> Ping Bing</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 font-display"><FileText className="w-4 h-4 text-gold" /> Robots.txt</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-body">Servi dynamiquement depuis le contenu défini dans l'onglet Robots.</p>
          <code className="text-[11px] font-mono p-2 bg-secondary rounded break-all block">{robotsUrl}</code>
          <Button size="sm" variant="outline" asChild><a href={robotsUrl} target="_blank" rel="noreferrer" className="gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Voir robots.txt</a></Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 font-display"><Globe className="w-4 h-4 text-gold" /> Outils webmaster</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-body">
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Google Search Console</p>
            <p className="text-xs text-muted-foreground mt-0.5">Indexation, performance, erreurs</p>
          </a>
          <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Google Analytics 4</p>
            <p className="text-xs text-muted-foreground mt-0.5">Audience, conversions</p>
          </a>
          <a href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(base)}`} target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Test Rich Results</p>
            <p className="text-xs text-muted-foreground mt-0.5">Vérifier le JSON-LD</p>
          </a>
          <a href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(base)}`} target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Facebook Debugger</p>
            <p className="text-xs text-muted-foreground mt-0.5">Test cartes Open Graph</p>
          </a>
          <a href={`https://cards-dev.twitter.com/validator`} target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Twitter Card Validator</p>
            <p className="text-xs text-muted-foreground mt-0.5">Test cartes X/Twitter</p>
          </a>
          <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(base)}`} target="_blank" rel="noreferrer" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> PageSpeed Insights</p>
            <p className="text-xs text-muted-foreground mt-0.5">Core Web Vitals</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoToolsTab;