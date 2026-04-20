import { useEffect, useState } from "react";
import { Crown, Users, TrendingUp, DollarSign, Search, MoreHorizontal, Mail, Check, X, Copy, Filter, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SubRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  plan_name: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  status: string;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  user_id: string | null;
}

const methodLabels: Record<string, string> = {
  paypal: "PayPal",
  orange_money: "Orange Money",
  mtn_money: "MTN MoMo",
  bank_transfer: "Virement",
};

const methodColors: Record<string, string> = {
  paypal: "bg-blue-100 text-blue-700",
  orange_money: "bg-orange-100 text-orange-700",
  mtn_money: "bg-yellow-100 text-yellow-700",
  bank_transfer: "bg-gray-100 text-gray-700",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  refused: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  refused: "Refusé",
};

const Subscriptions = () => {
  const [requests, setRequests] = useState<SubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("subscription_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_requests" }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: "paid" | "refused" | "pending") => {
    const { error } = await supabase
      .from("subscription_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: status === "paid" ? "Paiement validé" : status === "refused" ? "Demande refusée" : "Remise en attente",
        description: status === "paid" ? "L'abonné a été passé en Premium." : undefined,
      });
    }
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast({ title: "Référence copiée", description: ref });
  };

  const filtered = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterMethod !== "all" && r.payment_method !== filterMethod) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.full_name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.payment_reference.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const paidCount = requests.filter(r => r.status === "paid").length;
  const revenue = requests.filter(r => r.status === "paid").reduce((sum, r) => sum + Number(r.amount), 0);
  const conversion = requests.length > 0 ? (paidCount / requests.length) * 100 : 0;

  const stats = [
    { label: "En attente", value: pendingCount.toString(), icon: Clock, color: "text-amber-600" },
    { label: "Abonnés Premium", value: paidCount.toString(), icon: Crown, color: "text-gold" },
    { label: "Revenus encaissés", value: `${revenue.toLocaleString("fr-FR")} XAF`, icon: DollarSign, color: "text-green-600" },
    { label: "Taux de conversion", value: `${conversion.toFixed(0)}%`, icon: TrendingUp, color: "text-blue-600" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Demandes d'abonnement Premium</h1>
        <p className="text-sm text-muted-foreground font-body">Validez les paiements et gérez les abonnés Nsango Premium</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold font-display">{s.value}</p>
                <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Filter className="w-4 h-4" /> Liste des demandes ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Nom, email, référence..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="refused">Refusé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Mode de paiement" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous modes</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="orange_money">Orange Money</SelectItem>
                <SelectItem value="mtn_money">MTN MoMo</SelectItem>
                <SelectItem value="bank_transfer">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">
              <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground font-body">
                    <th className="p-3">Demandeur</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3 hidden md:table-cell">Référence</th>
                    <th className="p-3 hidden lg:table-cell">Mode</th>
                    <th className="p-3 hidden lg:table-cell">Date</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{r.full_name}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                        {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{r.plan_name}</p>
                        <p className="text-xs text-muted-foreground">{Number(r.amount).toLocaleString("fr-FR")} XAF</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <button
                          onClick={() => copyRef(r.payment_reference)}
                          className="inline-flex items-center gap-1 text-xs font-mono bg-muted/50 px-2 py-1 rounded hover:bg-muted"
                        >
                          {r.payment_reference}
                          <Copy className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${methodColors[r.payment_method] || "bg-muted"}`}>
                          {methodLabels[r.payment_method] || r.payment_method}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground font-body">
                        {format(new Date(r.created_at), "dd MMM yyyy", { locale: fr })}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {r.status !== "paid" && (
                              <DropdownMenuItem className="gap-2 text-green-700" onClick={() => updateStatus(r.id, "paid")}>
                                <Check className="w-4 h-4" /> Marquer comme payé
                              </DropdownMenuItem>
                            )}
                            {r.status !== "refused" && (
                              <DropdownMenuItem className="gap-2 text-red-700" onClick={() => updateStatus(r.id, "refused")}>
                                <X className="w-4 h-4" /> Refuser
                              </DropdownMenuItem>
                            )}
                            {r.status !== "pending" && (
                              <DropdownMenuItem className="gap-2" onClick={() => updateStatus(r.id, "pending")}>
                                <Clock className="w-4 h-4" /> Remettre en attente
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2" onClick={() => { window.location.href = `mailto:${r.email}?subject=Votre abonnement Nsango Premium (${r.payment_reference})`; }}>
                              <Mail className="w-4 h-4" /> Contacter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;
