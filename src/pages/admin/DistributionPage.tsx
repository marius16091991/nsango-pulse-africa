import { useState } from "react";
import { Globe, Mail, Smartphone, Crown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const DistributionPage = () => {
  const [channels, setChannels] = useState([
    { name: "Site web", icon: Globe, enabled: true, reach: "100%", desc: "Publication sur nsangomagazine.com" },
    { name: "Newsletter", icon: Mail, enabled: true, reach: "18.4K abonnés", desc: "Envoi automatique aux abonnés newsletter" },
    { name: "Push mobile", icon: Smartphone, enabled: false, reach: "5.2K devices", desc: "Notifications push via l'app mobile" },
    { name: "Premium only", icon: Crown, enabled: true, reach: "1,203 abonnés", desc: "Contenus exclusifs premium" },
  ]);

  const [rules, setRules] = useState({ embargo: true, autoNewsletter: true, autoSocial: false });
  const [frequency, setFrequency] = useState("daily");

  const toggleChannel = (name: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.name !== name) return ch;
      toast({ title: ch.enabled ? `${name} désactivé` : `${name} activé` });
      return { ...ch, enabled: !ch.enabled };
    }));
  };

  const recentDistributions = [
    { title: "Aliko Dangote : L'empire", channels: ["web", "newsletter", "premium"], sent: "2026-04-02 08:00", delivered: 18200, opened: 7800 },
    { title: "Fashion Week de Lagos", channels: ["web", "newsletter"], sent: "2026-03-31 10:00", delivered: 18400, opened: 6200 },
    { title: "Interview : Ngozi Okonjo-Iweala", channels: ["web", "premium"], sent: "2026-03-28 09:00", delivered: 1203, opened: 890 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Diffusion & Distribution</h1>
        <p className="text-sm text-muted-foreground font-body">Contrôlez la diffusion à travers tous les canaux</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <Card key={ch.name}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><ch.icon className="w-5 h-5 text-gold" /></div>
                <div>
                  <p className="text-sm font-medium">{ch.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{ch.desc}</p>
                  <p className="text-xs text-gold font-body mt-0.5">{ch.reach}</p>
                </div>
              </div>
              <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(ch.name)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Règles de distribution</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Embargo premium</p><p className="text-xs text-muted-foreground font-body">Articles premium exclusifs 48h avant publication publique</p></div>
            <Switch checked={rules.embargo} onCheckedChange={(v) => { setRules(r => ({ ...r, embargo: v })); toast({ title: v ? "Embargo activé" : "Embargo désactivé" }); }} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Auto-newsletter</p><p className="text-xs text-muted-foreground font-body">Envoyer automatiquement les nouveaux articles</p></div>
            <Switch checked={rules.autoNewsletter} onCheckedChange={(v) => { setRules(r => ({ ...r, autoNewsletter: v })); toast({ title: v ? "Auto-newsletter activée" : "Auto-newsletter désactivée" }); }} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Partage social automatique</p><p className="text-xs text-muted-foreground font-body">Publier sur les réseaux sociaux</p></div>
            <Switch checked={rules.autoSocial} onCheckedChange={(v) => { setRules(r => ({ ...r, autoSocial: v })); toast({ title: v ? "Partage social activé" : "Partage social désactivé" }); }} />
          </div>
          <div>
            <Label className="font-body text-sm">Fréquence newsletter</Label>
            <Select value={frequency} onValueChange={(v) => { setFrequency(v); toast({ title: "Fréquence mise à jour" }); }}>
              <SelectTrigger className="mt-1 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">À chaque article</SelectItem>
                <SelectItem value="daily">Quotidienne</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Dernières diffusions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDistributions.map((d, i) => (
              <div key={i} className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{d.title}</h4>
                  <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> {d.sent}</span>
                </div>
                <div className="flex gap-2 mb-3">{d.channels.map(ch => <span key={ch} className="text-[10px] px-2 py-0.5 rounded bg-muted font-body capitalize">{ch}</span>)}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="flex justify-between text-xs font-body mb-1"><span className="text-muted-foreground">Délivrés</span><span>{d.delivered.toLocaleString()}</span></div><Progress value={100} className="h-1.5" /></div>
                  <div><div className="flex justify-between text-xs font-body mb-1"><span className="text-muted-foreground">Ouverts</span><span>{d.opened.toLocaleString()} ({((d.opened / d.delivered) * 100).toFixed(0)}%)</span></div><Progress value={(d.opened / d.delivered) * 100} className="h-1.5" /></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionPage;
