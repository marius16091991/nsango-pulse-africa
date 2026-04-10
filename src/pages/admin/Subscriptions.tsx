import { useState } from "react";
import { Crown, Users, TrendingUp, DollarSign, Search, MoreHorizontal, Mail, Ban, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Subscriber {
  id: number; name: string; email: string; plan: string; since: string; status: string; amount: number;
}

const planColors: Record<string, string> = {
  Gold: "bg-gold/20 text-gold-dark",
  Silver: "bg-gray-200 text-gray-700",
  Bronze: "bg-amber-100 text-amber-700",
};

const Subscriptions = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    { id: 1, name: "Amara Diallo", email: "amara@example.com", plan: "Gold", since: "2025-06-15", status: "active", amount: 19.99 },
    { id: 2, name: "Jean Mabika", email: "jean.m@example.com", plan: "Silver", since: "2025-09-01", status: "active", amount: 9.99 },
    { id: 3, name: "Fatou Ndiaye", email: "fatou@example.com", plan: "Gold", since: "2025-03-20", status: "active", amount: 19.99 },
    { id: 4, name: "Paul Essomba", email: "paul.e@example.com", plan: "Bronze", since: "2026-01-10", status: "active", amount: 4.99 },
    { id: 5, name: "Marie Kouassi", email: "marie.k@example.com", plan: "Gold", since: "2025-11-05", status: "cancelled", amount: 19.99 },
    { id: 6, name: "Omar Sy", email: "omar.s@example.com", plan: "Silver", since: "2026-02-14", status: "active", amount: 9.99 },
  ]);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  const toggleStatus = (id: number) => {
    setSubscribers(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newStatus = s.status === "active" ? "cancelled" : "active";
      toast({ title: newStatus === "active" ? "Abonnement réactivé" : "Abonnement suspendu", description: s.name });
      return { ...s, status: newStatus };
    }));
  };

  const filtered = subscribers.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPlan !== "all" && s.plan !== filterPlan) return false;
    return true;
  });

  const activeCount = subscribers.filter(s => s.status === "active").length;
  const revenue = subscribers.filter(s => s.status === "active").reduce((sum, s) => sum + s.amount, 0);

  const stats = [
    { label: "Abonnés actifs", value: activeCount.toString(), icon: Crown, color: "text-gold" },
    { label: "Revenus mensuels", value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { label: "Taux de rétention", value: `${((activeCount / subscribers.length) * 100).toFixed(0)}%`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Total abonnés", value: subscribers.length.toString(), icon: Users, color: "text-gold" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Abonnements Premium</h1>
        <p className="text-sm text-muted-foreground font-body">Gérez les abonnés et la distribution premium</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div><p className="text-2xl font-bold font-display">{s.value}</p><p className="text-xs text-muted-foreground font-body">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { plan: "Bronze", price: "4,99 $/mois", features: ["Articles premium (5/mois)", "Newsletter exclusive"], count: subscribers.filter(s => s.plan === "Bronze" && s.status === "active").length },
          { plan: "Silver", price: "9,99 $/mois", features: ["Articles illimités", "Magazine mensuel", "Newsletter"], count: subscribers.filter(s => s.plan === "Silver" && s.status === "active").length },
          { plan: "Gold", price: "19,99 $/mois", features: ["Tout Silver +", "Vidéos exclusives", "Accès anticipé", "Sans publicité"], count: subscribers.filter(s => s.plan === "Gold" && s.status === "active").length },
        ].map((p) => (
          <Card key={p.plan} className={p.plan === "Gold" ? "border-gold/50 ring-1 ring-gold/20" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold font-body ${planColors[p.plan]}`}>{p.plan}</span>
                <span className="text-sm font-bold">{p.price}</span>
              </div>
              <p className="text-2xl font-bold font-display">{p.count}</p>
              <p className="text-xs text-muted-foreground font-body mb-3">abonnés actifs</p>
              <ul className="space-y-1">{p.features.map(f => <li key={f} className="text-xs text-muted-foreground font-body">✓ {f}</li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg font-display">Liste des abonnés</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground font-body">
                <th className="p-3">Abonné</th><th className="p-3">Plan</th><th className="p-3 hidden md:table-cell">Depuis</th><th className="p-3 hidden md:table-cell">Montant</th><th className="p-3">Statut</th><th className="p-3 w-10"></th>
              </tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${planColors[s.plan]}`}>{s.plan}</span></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground font-body">{s.since}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground font-body">${s.amount}/mois</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.status === "active" ? "Actif" : "Annulé"}
                      </span>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => toast({ title: "Email envoyé", description: s.email })}><Mail className="w-4 h-4" /> Email</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(s.id)}>
                            <Ban className="w-4 h-4" /> {s.status === "active" ? "Suspendre" : "Réactiver"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;
