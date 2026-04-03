import { FileText, Users, Eye, Crown, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Articles publiés", value: "342", change: "+12%", up: true, icon: FileText },
  { label: "Utilisateurs actifs", value: "18.4K", change: "+8.3%", up: true, icon: Users },
  { label: "Vues ce mois", value: "245K", change: "+22%", up: true, icon: Eye },
  { label: "Abonnés premium", value: "1,203", change: "-2.1%", up: false, icon: Crown },
];

const recentArticles = [
  { id: 1, title: "Aliko Dangote : L'empire qui redéfinit l'Afrique", status: "published", views: 12400, date: "2 avr. 2026" },
  { id: 2, title: "Les startups fintech en pleine explosion au Kenya", status: "draft", views: 0, date: "1 avr. 2026" },
  { id: 3, title: "Fashion Week de Lagos : les créateurs qui brillent", status: "published", views: 8200, date: "31 mars 2026" },
  { id: 4, title: "Interview exclusive : Ngozi Okonjo-Iweala", status: "scheduled", views: 0, date: "5 avr. 2026" },
  { id: 5, title: "Le nouveau visage du cinéma africain", status: "review", views: 0, date: "3 avr. 2026" },
];

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<string, string> = {
  published: "Publié",
  draft: "Brouillon",
  scheduled: "Programmé",
  review: "En révision",
};

const Dashboard = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground font-body">Vue d'ensemble de Nsango Magazine</p>
      </div>
      <Link to="/admin/articles">
        <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1">
          <FileText className="w-4 h-4" /> Nouvel article
        </Button>
      </Link>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground"><s.icon className="w-5 h-5" /></span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.up ? "text-green-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-display">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent articles */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display">Articles récents</CardTitle>
            <Link to="/admin/articles" className="text-xs text-gold hover:underline font-body flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground font-body">{a.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {a.views > 0 && (
                    <span className="text-xs text-muted-foreground font-body">{a.views.toLocaleString()} vues</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${statusColors[a.status]}`}>
                    {statusLabels[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/admin/articles"><Button variant="outline" className="w-full justify-start text-sm font-body">📝 Créer un article</Button></Link>
          <Link to="/admin/surveys"><Button variant="outline" className="w-full justify-start text-sm font-body">📊 Lancer un sondage</Button></Link>
          <Link to="/admin/advertising"><Button variant="outline" className="w-full justify-start text-sm font-body">📢 Nouvelle campagne</Button></Link>
          <Link to="/admin/magazine"><Button variant="outline" className="w-full justify-start text-sm font-body">📖 Magazine mensuel</Button></Link>
          <Link to="/admin/subscriptions"><Button variant="outline" className="w-full justify-start text-sm font-body">👑 Gérer les abonnés</Button></Link>
          <Link to="/admin/settings"><Button variant="outline" className="w-full justify-start text-sm font-body">⚙️ Paramètres</Button></Link>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
