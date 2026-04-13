import { useState, useEffect } from "react";
import { FileText, Users, Eye, Crown, TrendingUp, TrendingDown, ArrowUpRight, Activity, BarChart3, MessageSquare, PieChart, Megaphone, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ articles: 0, published: 0, surveys: 0, comments: 0, campaigns: 0, pendingComments: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [artRes, pubRes, survRes, comRes, campRes, pendRes, recentRes] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("surveys").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("ad_campaigns").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("articles").select("id, title, status, views, created_at, category").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({
        articles: artRes.count || 0,
        published: pubRes.count || 0,
        surveys: survRes.count || 0,
        comments: comRes.count || 0,
        campaigns: campRes.count || 0,
        pendingComments: pendRes.count || 0,
      });
      setRecentArticles(recentRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700", draft: "bg-muted text-muted-foreground",
    scheduled: "bg-blue-100 text-blue-700", review: "bg-amber-100 text-amber-700",
  };
  const statusLabels: Record<string, string> = {
    published: "Publié", draft: "Brouillon", scheduled: "Programmé", review: "En révision",
  };

  const cards = [
    { label: "Articles", value: stats.articles, sub: `${stats.published} publiés`, icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "Sondages", value: stats.surveys, sub: "actifs", icon: PieChart, color: "bg-purple-50 text-purple-600" },
    { label: "Commentaires", value: stats.comments, sub: `${stats.pendingComments} en attente`, icon: MessageSquare, color: "bg-green-50 text-green-600" },
    { label: "Campagnes pub", value: stats.campaigns, sub: "total", icon: Megaphone, color: "bg-gold/10 text-gold-dark" },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Bonjour, {profile?.display_name || "Admin"} 👋</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de Nsango Magazine</p>
        </div>
        <Link to="/admin/articles">
          <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5 shadow-sm">
            <FileText className="w-4 h-4" /> Nouvel article
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((s) => (
          <Card key={s.label} className="hover:shadow-card transition-shadow">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label} · {s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 hover:shadow-card transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gold" />
                <CardTitle className="text-base font-display">Articles récents</CardTitle>
              </div>
              <Link to="/admin/articles" className="text-xs text-gold hover:underline flex items-center gap-1">
                Voir tout <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentArticles.length > 0 ? recentArticles.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.category} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.views > 0 && <span className="text-xs text-muted-foreground">{a.views.toLocaleString()} vues</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[a.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun article. Créez votre premier article !</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold" />
              <CardTitle className="text-base font-display">Actions rapides</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { to: "/admin/articles", icon: "📝", label: "Créer un article" },
              { to: "/admin/surveys", icon: "📊", label: "Lancer un sondage" },
              { to: "/admin/advertising", icon: "📢", label: "Nouvelle campagne" },
              { to: "/admin/comments", icon: "💬", label: `Modérer (${stats.pendingComments})` },
              { to: "/admin/magazine", icon: "📖", label: "Magazine mensuel" },
              { to: "/admin/settings", icon: "⚙️", label: "Paramètres" },
            ].map((action) => (
              <Link key={action.to} to={action.to}>
                <Button variant="outline" className="w-full justify-start text-sm gap-2 hover:bg-gold/5 hover:border-gold/30 transition-all">
                  <span>{action.icon}</span> {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
