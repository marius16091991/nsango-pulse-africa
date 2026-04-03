import { BarChart3, Eye, Users, Clock, TrendingUp, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const topArticles = [
  { title: "Burna Boy : talent émergent", views: 22300, category: "Talents" },
  { title: "Portrait : Wangari Maathai", views: 15600, category: "Portraits" },
  { title: "Aliko Dangote : L'empire", views: 12400, category: "Business" },
  { title: "Fashion Week de Lagos", views: 8200, category: "Culture" },
  { title: "Tech Hub : Kigali Innovation", views: 6100, category: "Business" },
];

const countries = [
  { name: "Nigeria", pct: 28 },
  { name: "RD Congo", pct: 18 },
  { name: "Côte d'Ivoire", pct: 14 },
  { name: "Kenya", pct: 11 },
  { name: "Cameroun", pct: 9 },
  { name: "Sénégal", pct: 7 },
  { name: "France", pct: 6 },
  { name: "Autres", pct: 7 },
];

const AnalyticsPage = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Analytiques</h1>
        <p className="text-sm text-muted-foreground font-body">Performances et statistiques de la plateforme</p>
      </div>
      <Select defaultValue="30">
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7 derniers jours</SelectItem>
          <SelectItem value="30">30 derniers jours</SelectItem>
          <SelectItem value="90">3 derniers mois</SelectItem>
          <SelectItem value="365">12 derniers mois</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Pages vues", value: "245K", icon: Eye, change: "+22%" },
        { label: "Visiteurs uniques", value: "68.2K", icon: Users, change: "+15%" },
        { label: "Temps moyen", value: "4m 32s", icon: Clock, change: "+8%" },
        { label: "Taux de rebond", value: "34.2%", icon: TrendingUp, change: "-5%" },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-5 h-5 text-gold" />
              <span className="text-xs text-green-600 font-semibold font-body">{s.change}</span>
            </div>
            <p className="text-2xl font-bold font-display">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top articles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" /> Articles les plus lus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topArticles.map((a, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground font-body w-4">{i + 1}.</span>
                    <span className="text-sm font-medium truncate">{a.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-body shrink-0">{a.views.toLocaleString()}</span>
                </div>
                <Progress value={(a.views / topArticles[0].views) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geography */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Globe className="w-4 h-4 text-gold" /> Audience par pays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {countries.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-body">{c.name}</span>
                  <span className="text-xs text-muted-foreground font-body">{c.pct}%</span>
                </div>
                <Progress value={c.pct} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AnalyticsPage;
