import { useEffect, useState } from "react";
import { Crown, TrendingUp, DollarSign, Clock, Inbox, Layers, Wallet, Type } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import RequestsList from "@/components/admin/RequestsList";
import PlansManager from "@/components/admin/PlansManager";
import SettingsManager from "@/components/admin/SettingsManager";

const Subscriptions = () => {
  const [stats, setStats] = useState({ pending: 0, paid: 0, revenue: 0, conversion: 0 });

  const fetchStats = async () => {
    const { data } = await supabase.from("subscription_requests").select("status,amount");
    if (!data) return;
    const pending = data.filter(r => r.status === "pending").length;
    const paid = data.filter(r => r.status === "paid").length;
    const revenue = data.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);
    const conversion = data.length > 0 ? (paid / data.length) * 100 : 0;
    setStats({ pending, paid, revenue, conversion });
  };

  useEffect(() => {
    fetchStats();
    const ch = supabase.channel("sub_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_requests" }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const cards = [
    { label: "En attente", value: stats.pending.toString(), icon: Clock, color: "text-amber-600" },
    { label: "Abonnés Premium", value: stats.paid.toString(), icon: Crown, color: "text-gold" },
    { label: "Revenus encaissés", value: `${stats.revenue.toLocaleString("fr-FR")} XAF`, icon: DollarSign, color: "text-green-600" },
    { label: "Conversion", value: `${stats.conversion.toFixed(0)}%`, icon: TrendingUp, color: "text-blue-600" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Abonnements Premium</h1>
        <p className="text-sm text-muted-foreground font-body">Gérez les demandes, les plans, les coordonnées de paiement et les textes du modal</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
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

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="requests" className="gap-2 py-2.5"><Inbox className="w-4 h-4" /> Demandes</TabsTrigger>
          <TabsTrigger value="plans" className="gap-2 py-2.5"><Layers className="w-4 h-4" /> Plans</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 py-2.5"><Wallet className="w-4 h-4" /> Paiements</TabsTrigger>
          <TabsTrigger value="texts" className="gap-2 py-2.5"><Type className="w-4 h-4" /> Textes</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-5"><RequestsList /></TabsContent>
        <TabsContent value="plans" className="mt-5"><PlansManager /></TabsContent>
        <TabsContent value="payments" className="mt-5">
          <SettingsManager category="payment" description="Numéros mobile money, email PayPal et coordonnées bancaires utilisés dans le modal Premium" />
        </TabsContent>
        <TabsContent value="texts" className="mt-5">
          <SettingsManager category="text" description="Titres, sous-titres et messages affichés aux visiteurs dans le modal Premium" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscriptions;
