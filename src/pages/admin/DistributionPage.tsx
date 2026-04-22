import { useEffect, useState } from "react";
import { Globe, Mail, Smartphone, Crown, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import SettingsManager from "@/components/admin/SettingsManager";

interface RecentArticle { id: string; title: string; created_at: string; category: string; premium: boolean; views: number; }

const DistributionPage = () => {
  const [stats, setStats] = useState({ articles: 0, premium: 0, sentEmails: 0, pendingEmails: 0 });
  const [recent, setRecent] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: prem }, { count: sent }, { count: pending }, { data: articles }] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published").eq("premium", true),
        supabase.from("email_outbox").select("*", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("email_outbox").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("articles").select("id,title,created_at,category,premium,views").eq("status", "published").order("created_at", { ascending: false }).limit(8),
      ]);
      setStats({ articles: total || 0, premium: prem || 0, sentEmails: sent || 0, pendingEmails: pending || 0 });
      setRecent((articles as any) || []);
      setLoading(false);
    })();
  }, []);

  const channels = [
    { name: "Site web", icon: Globe, value: `${stats.articles} article(s) publié(s)`, desc: "Diffusion sur toutes les pages publiques" },
    { name: "Newsletter / Emails", icon: Mail, value: `${stats.sentEmails} envoyé(s)`, desc: `${stats.pendingEmails} en attente d'envoi` },
    { name: "Push mobile", icon: Smartphone, value: "Activé", desc: "Notifications natives via service worker" },
    { name: "Premium only", icon: Crown, value: `${stats.premium} contenu(s)`, desc: "Articles réservés aux abonnés" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Diffusion & Distribution</h1>
        <p className="text-sm text-muted-foreground font-body">Vue d'ensemble des canaux et règles de distribution (enregistrées en base).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <Card key={ch.name}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><ch.icon className="w-5 h-5 text-gold" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{ch.name}</p>
                <p className="text-xs text-muted-foreground font-body">{ch.desc}</p>
                <p className="text-xs text-gold font-body mt-0.5">{ch.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SettingsManager category="distribution" description="Règles appliquées lors de la publication d'un nouvel article (embargo premium, auto-newsletter, fréquence)." />

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Dernières publications</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 font-body">Aucun article publié.</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <span className="text-xs text-muted-foreground font-body">{a.category} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    {a.premium && <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-body">Premium</span>}
                    <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> {a.views} vues</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionPage;
