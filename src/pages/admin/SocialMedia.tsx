import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, ExternalLink, Edit, Save, BarChart3, Send, Copy, Calendar, Loader2, Share2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ALL_NETWORKS, NETWORKS, addUtm, buildShareUrl, canOpenComposer, slugify,
  type SocialNetwork,
} from "@/lib/socialShare";

type Account = {
  id: string; network: string; handle: string; url: string;
  sort_order: number; active: boolean;
};
type Post = {
  id: string; article_id: string | null; networks: string[]; message: string;
  image_url: string | null; link_url: string | null; scheduled_at: string | null;
  published_at: string | null; status: string; utm_campaign: string | null;
  created_at: string; articles?: { title: string } | null;
};

const SITE = typeof window !== "undefined" ? window.location.origin : "https://nsangomagazine.com";

const SocialMedia = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("accounts");
  const [searchParams, setSearchParams] = useSearchParams();

  // === COMPTES ===
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [accDialog, setAccDialog] = useState(false);

  const fetchAccounts = async () => {
    const { data } = await supabase.from("social_accounts").select("*").order("sort_order");
    setAccounts((data as Account[]) || []);
  };

  const saveAccount = async () => {
    if (!editAcc) return;
    const { id, ...payload } = editAcc;
    const { error } = id
      ? await supabase.from("social_accounts").update(payload).eq("id", id)
      : await supabase.from("social_accounts").insert(payload);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: id ? "Compte mis à jour ✓" : "Compte ajouté ✓" });
    setAccDialog(false); setEditAcc(null); fetchAccounts();
  };

  const toggleAccount = async (a: Account, active: boolean) => {
    await supabase.from("social_accounts").update({ active }).eq("id", a.id);
    fetchAccounts();
  };

  const deleteAccount = async (id: string) => {
    await supabase.from("social_accounts").delete().eq("id", id);
    toast({ title: "Compte supprimé" }); fetchAccounts();
  };

  // === FILE DE PUBLICATION ===
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([]);
  const [postDialog, setPostDialog] = useState(false);
  const [postForm, setPostForm] = useState<Partial<Post>>({
    message: "", networks: [], status: "draft", utm_campaign: "",
  });
  const [editPostId, setEditPostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from("social_posts")
      .select("*, articles(title)")
      .order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
  };

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles")
      .select("id, title").eq("status", "published")
      .order("created_at", { ascending: false }).limit(100);
    setArticles(data || []);
  };

  const openPostDialog = (p?: Post) => {
    if (p) {
      setPostForm(p); setEditPostId(p.id);
    } else {
      setPostForm({ message: "", networks: [], status: "draft", utm_campaign: "", article_id: null });
      setEditPostId(null);
    }
    setPostDialog(true);
  };

  const savePost = async (publishNow: boolean) => {
    if (!postForm.message?.trim()) return toast({ title: "Message requis", variant: "destructive" });
    if (!postForm.networks?.length) return toast({ title: "Sélectionnez au moins un réseau", variant: "destructive" });

    const article = articles.find(a => a.id === postForm.article_id);
    const linkUrl = article ? `${SITE}/article/${article.id}` : (postForm.link_url || SITE);
    const campaign = postForm.utm_campaign || (article ? slugify(article.title) : "manual-share");

    const payload = {
      article_id: postForm.article_id || null,
      networks: postForm.networks,
      message: postForm.message,
      image_url: postForm.image_url || "",
      link_url: linkUrl,
      scheduled_at: postForm.scheduled_at || null,
      utm_campaign: campaign,
      status: publishNow ? "published" : (postForm.scheduled_at ? "scheduled" : "draft"),
      published_at: publishNow ? new Date().toISOString() : null,
      created_by: user?.id,
    };

    const { error } = editPostId
      ? await supabase.from("social_posts").update(payload).eq("id", editPostId)
      : await supabase.from("social_posts").insert(payload);

    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });

    if (publishNow) {
      // Ouvrir tous les composers
      (postForm.networks as SocialNetwork[]).forEach((n) => {
        if (canOpenComposer(n)) {
          const url = buildShareUrl(n, addUtm(linkUrl, n, campaign), postForm.message!);
          window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
        }
      });
      toast({ title: "Composers ouverts ✓", description: "Validez chaque publication dans les nouveaux onglets" });
    } else {
      toast({ title: "Post enregistré ✓" });
    }
    setPostDialog(false); fetchPosts();
  };

  const publishExisting = (p: Post) => {
    const link = p.link_url || SITE;
    const campaign = p.utm_campaign || "share";
    p.networks.forEach((n) => {
      if (canOpenComposer(n as SocialNetwork)) {
        const url = buildShareUrl(n as SocialNetwork, addUtm(link, n, campaign), p.message);
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
      }
    });
    supabase.from("social_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", p.id).then(fetchPosts);
  };

  const deletePost = async (id: string) => {
    await supabase.from("social_posts").delete().eq("id", id);
    toast({ title: "Post supprimé" }); fetchPosts();
  };

  // === STATS ===
  const [stats, setStats] = useState<{ network: string; clicks: number }[]>([]);
  const [topArticles, setTopArticles] = useState<{ title: string; clicks: number }[]>([]);

  const fetchStats = async () => {
    const { data: clicks } = await supabase.from("social_clicks").select("network, article_id");
    const byNetwork: Record<string, number> = {};
    const byArticle: Record<string, number> = {};
    (clicks || []).forEach((c: any) => {
      byNetwork[c.network] = (byNetwork[c.network] || 0) + 1;
      if (c.article_id) byArticle[c.article_id] = (byArticle[c.article_id] || 0) + 1;
    });
    setStats(Object.entries(byNetwork).map(([network, n]) => ({ network, clicks: n })).sort((a, b) => b.clicks - a.clicks));

    const articleIds = Object.keys(byArticle);
    if (articleIds.length) {
      const { data: arts } = await supabase.from("articles").select("id, title").in("id", articleIds);
      setTopArticles(
        (arts || []).map(a => ({ title: a.title, clicks: byArticle[a.id] }))
          .sort((a, b) => b.clicks - a.clicks).slice(0, 10)
      );
    }
  };

  useEffect(() => {
    fetchAccounts(); fetchPosts(); fetchArticles(); fetchStats();
  }, []);

  // Pré-remplir depuis ?article=ID (deep-link depuis ArticlesManager)
  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId && articles.length) {
      const art = articles.find(a => a.id === articleId);
      if (art) {
        setTab("queue");
        setPostForm({
          article_id: articleId,
          message: `${art.title} — à lire sur Nsango Magazine`,
          networks: ["facebook", "x", "linkedin", "whatsapp", "telegram"],
          status: "draft",
          utm_campaign: slugify(art.title),
        });
        setEditPostId(null);
        setPostDialog(true);
        searchParams.delete("article");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, articles, setSearchParams]);

  const totalClicks = stats.reduce((s, x) => s + x.clicks, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Réseaux sociaux & Partage</h1>
        <p className="text-sm text-muted-foreground font-body">
          Gérez vos comptes, planifiez vos publications et mesurez le trafic ramené.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="accounts" className="gap-1.5"><Share2 className="w-4 h-4" /> Comptes</TabsTrigger>
          <TabsTrigger value="queue" className="gap-1.5"><Send className="w-4 h-4" /> File de publication</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Statistiques</TabsTrigger>
        </TabsList>

        {/* ============ COMPTES ============ */}
        <TabsContent value="accounts" className="mt-5 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditAcc({ id: "", network: "facebook", handle: "", url: "", sort_order: accounts.length, active: true }); setAccDialog(true); }} className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
              <Plus className="w-4 h-4" /> Ajouter un compte
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.map((a) => {
              const cfg = NETWORKS[a.network as SocialNetwork];
              const Icon = cfg?.icon;
              return (
                <Card key={a.id} className={a.active ? "" : "opacity-60"}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {Icon && <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cfg.color }}>
                      <Icon className="w-5 h-5" />
                    </div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold capitalize">{cfg?.label || a.network}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.handle || a.url}</p>
                    </div>
                    <Switch checked={a.active} onCheckedChange={(v) => toggleAccount(a, v)} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditAcc(a); setAccDialog(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAccount(a.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </CardContent>
                </Card>
              );
            })}
            {accounts.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Aucun compte configuré.</p>}
          </div>
        </TabsContent>

        {/* ============ FILE ============ */}
        <TabsContent value="queue" className="mt-5 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openPostDialog()} className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
              <Plus className="w-4 h-4" /> Nouveau post
            </Button>
          </div>
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {p.articles?.title && <p className="text-xs text-gold font-body mb-1">📄 {p.articles.title}</p>}
                      <p className="text-sm whitespace-pre-wrap">{p.message}</p>
                    </div>
                    <Badge variant={p.status === "published" ? "default" : p.status === "scheduled" ? "secondary" : "outline"}>
                      {p.status === "published" ? "Publié" : p.status === "scheduled" ? "Programmé" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.networks.map((n) => {
                      const cfg = NETWORKS[n as SocialNetwork];
                      const Icon = cfg?.icon;
                      return Icon && (
                        <span key={n} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded text-white" style={{ backgroundColor: cfg.color }}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.scheduled_at).toLocaleString("fr-FR")}</span>}
                    {p.utm_campaign && <span>· campaign: {p.utm_campaign}</span>}
                  </div>
                  <div className="flex gap-2">
                    {p.status !== "published" && (
                      <Button size="sm" onClick={() => publishExisting(p)} className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Publier maintenant
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openPostDialog(p)} className="gap-1.5"><Edit className="w-3.5 h-3.5" /> Modifier</Button>
                    <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)} className="text-destructive gap-1.5"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun post dans la file.</p>}
          </div>
        </TabsContent>

        {/* ============ STATS ============ */}
        <TabsContent value="stats" className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Clics totaux</p>
              <p className="text-2xl font-display font-bold mt-1">{totalClicks.toLocaleString()}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Réseaux actifs</p>
              <p className="text-2xl font-display font-bold mt-1">{accounts.filter(a => a.active).length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Posts publiés</p>
              <p className="text-2xl font-display font-bold mt-1">{posts.filter(p => p.status === "published").length}</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base font-display">Clics par réseau</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {stats.map((s) => {
                const cfg = NETWORKS[s.network as SocialNetwork];
                const pct = totalClicks ? (s.clicks / totalClicks) * 100 : 0;
                return (
                  <div key={s.network} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="capitalize">{cfg?.label || s.network}</span><span>{s.clicks} ({pct.toFixed(0)}%)</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg?.color || "hsl(var(--gold))" }} />
                    </div>
                  </div>
                );
              })}
              {stats.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Pas encore de clics enregistrés.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top articles partagés</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topArticles.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                    <span className="truncate flex-1">{i + 1}. {a.title}</span>
                    <span className="text-gold font-semibold ml-3">{a.clicks} clics</span>
                  </div>
                ))}
                {topArticles.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Aucun article partagé pour le moment.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog COMPTE */}
      <Dialog open={accDialog} onOpenChange={setAccDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editAcc?.id ? "Modifier" : "Ajouter"} un compte</DialogTitle></DialogHeader>
          {editAcc && (
            <div className="space-y-3 mt-3">
              <div>
                <Label className="text-sm">Réseau</Label>
                <Select value={editAcc.network} onValueChange={(v) => setEditAcc({ ...editAcc, network: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_NETWORKS.map(n => <SelectItem key={n} value={n}>{NETWORKS[n].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm">Handle / Nom affiché</Label><Input className="mt-1" value={editAcc.handle} onChange={(e) => setEditAcc({ ...editAcc, handle: e.target.value })} placeholder="@nsangomag" /></div>
              <div><Label className="text-sm">URL du profil *</Label><Input className="mt-1" value={editAcc.url} onChange={(e) => setEditAcc({ ...editAcc, url: e.target.value })} placeholder="https://..." /></div>
              <div className="flex items-center gap-2"><Switch checked={editAcc.active} onCheckedChange={(v) => setEditAcc({ ...editAcc, active: v })} /><Label className="text-sm">Actif (visible dans le footer)</Label></div>
              <Button onClick={saveAccount} className="w-full bg-gold hover:bg-gold-dark text-primary gap-1.5"><Save className="w-4 h-4" /> Enregistrer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog POST */}
      <Dialog open={postDialog} onOpenChange={setPostDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editPostId ? "Modifier" : "Nouveau"} post</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-sm">Article à partager (optionnel)</Label>
              <Select value={postForm.article_id || "none"} onValueChange={(v) => setPostForm({ ...postForm, article_id: v === "none" ? null : v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Aucun (lien libre)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (lien libre)</SelectItem>
                  {articles.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!postForm.article_id && (
              <div><Label className="text-sm">Lien à partager</Label><Input className="mt-1" value={postForm.link_url || ""} onChange={(e) => setPostForm({ ...postForm, link_url: e.target.value })} placeholder="https://..." /></div>
            )}
            <div>
              <Label className="text-sm">Message *</Label>
              <Textarea className="mt-1" rows={4} value={postForm.message} onChange={(e) => setPostForm({ ...postForm, message: e.target.value })} placeholder="Votre message accrocheur..." />
              <p className="text-[10px] text-muted-foreground mt-1">{postForm.message?.length || 0} caractères · X limite à 280</p>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Réseaux ciblés *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_NETWORKS.map(n => {
                  const checked = postForm.networks?.includes(n);
                  const cfg = NETWORKS[n];
                  const Icon = cfg.icon;
                  return (
                    <label key={n} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${checked ? "border-gold bg-gold/10" : "border-border"}`}>
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        const set = new Set(postForm.networks || []);
                        if (v) set.add(n); else set.delete(n);
                        setPostForm({ ...postForm, networks: Array.from(set) });
                      }} />
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      <span className="text-xs">{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">Programmer pour</Label><Input type="datetime-local" className="mt-1" value={postForm.scheduled_at?.slice(0, 16) || ""} onChange={(e) => setPostForm({ ...postForm, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
              <div><Label className="text-sm">UTM campaign</Label><Input className="mt-1" value={postForm.utm_campaign || ""} onChange={(e) => setPostForm({ ...postForm, utm_campaign: e.target.value })} placeholder="auto" /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="outline" onClick={() => savePost(false)} className="gap-1.5"><Save className="w-4 h-4" /> Enregistrer</Button>
              <Button onClick={() => savePost(true)} className="bg-gold hover:bg-gold-dark text-primary gap-1.5"><Send className="w-4 h-4" /> Publier maintenant</Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">💡 « Publier maintenant » ouvre les composers de chaque réseau dans de nouveaux onglets, pré-remplis avec votre message + lien (avec UTM tracking).</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMedia;
