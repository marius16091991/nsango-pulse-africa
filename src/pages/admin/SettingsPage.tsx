import { useState } from "react";
import { Save, Globe, Palette, Shield, Bell, Database, Zap, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [siteName, setSiteName] = useState("Nsango Magazine");
  const [slogan, setSlogan] = useState("Les visages qui inspirent l'Afrique");
  const [seoDesc, setSeoDesc] = useState("Nsango Magazine — le premier magazine numérique premium dédié aux personnalités influentes du continent africain.");
  const [contactEmail, setContactEmail] = useState("contact@nsangomagazine.com");
  const [language, setLanguage] = useState("fr");
  const [maintenance, setMaintenance] = useState(false);
  const [cache, setCache] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [articlesPerPage, setArticlesPerPage] = useState("12");
  const [twoFactor, setTwoFactor] = useState(false);
  const [commentModeration, setCommentModeration] = useState(true);
  const [antiSpam, setAntiSpam] = useState(true);
  const [sessionDuration, setSessionDuration] = useState("24");

  const [integrations, setIntegrations] = useState([
    { name: "Cloudinary", desc: "Stockage et optimisation des médias", connected: true },
    { name: "Stripe", desc: "Paiements et abonnements", connected: true },
    { name: "Mailchimp", desc: "Newsletter et email marketing", connected: false },
    { name: "Google Analytics", desc: "Suivi du trafic", connected: true },
    { name: "Facebook Pixel", desc: "Suivi publicitaire Facebook", connected: false },
    { name: "Disqus", desc: "Système de commentaires", connected: false },
  ]);

  const handleSave = () => toast({ title: "Paramètres enregistrés ✓", description: "Les modifications ont été sauvegardées" });

  const toggleIntegration = (name: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.name !== name) return i;
      toast({ title: i.connected ? `${name} déconnecté` : `${name} connecté` });
      return { ...i, connected: !i.connected };
    }));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground font-body">Configuration de la plateforme</p>
        </div>
        <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1" onClick={handleSave}>
          <Save className="w-4 h-4" /> Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="font-body">
          <TabsTrigger value="general" className="gap-1"><Globe className="w-4 h-4" /> Général</TabsTrigger>
          <TabsTrigger value="display" className="gap-1"><Palette className="w-4 h-4" /> Affichage</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Shield className="w-4 h-4" /> Sécurité</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1"><Zap className="w-4 h-4" /> Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base font-display">Informations du site</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="font-body text-sm">Nom du site</Label><Input value={siteName} onChange={e => setSiteName(e.target.value)} className="mt-1" /></div>
                  <div><Label className="font-body text-sm">Slogan</Label><Input value={slogan} onChange={e => setSlogan(e.target.value)} className="mt-1" /></div>
                </div>
                <div><Label className="font-body text-sm">Description SEO</Label><Textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="mt-1" rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="font-body text-sm">Email de contact</Label><Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="mt-1" /></div>
                  <div><Label className="font-body text-sm">Langue</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Database className="w-4 h-4" /> Maintenance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Mode maintenance</p><p className="text-xs text-muted-foreground font-body">Rendre le site inaccessible</p></div>
                  <Switch checked={maintenance} onCheckedChange={(v) => { setMaintenance(v); toast({ title: v ? "Mode maintenance activé" : "Site en ligne" }); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Cache des pages</p><p className="text-xs text-muted-foreground font-body">Mise en cache pour les performances</p></div>
                  <Switch checked={cache} onCheckedChange={setCache} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Apparence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Mode sombre par défaut</p></div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Animations</p></div>
                <Switch checked={animations} onCheckedChange={setAnimations} />
              </div>
              <div>
                <Label className="font-body text-sm">Articles par page</Label>
                <Select value={articlesPerPage} onValueChange={setArticlesPerPage}>
                  <SelectTrigger className="mt-1 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="6">6</SelectItem><SelectItem value="12">12</SelectItem><SelectItem value="24">24</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Sécurité & Accès</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Authentification 2FA</p><p className="text-xs text-muted-foreground font-body">Exiger 2FA pour les admins</p></div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Modération des commentaires</p></div>
                <Switch checked={commentModeration} onCheckedChange={setCommentModeration} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Protection anti-spam</p></div>
                <Switch checked={antiSpam} onCheckedChange={setAntiSpam} />
              </div>
              <div>
                <Label className="font-body text-sm">Durée de session admin (heures)</Label>
                <Input type="number" value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} className="mt-1 w-32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Mail className="w-4 h-4" /> Notifications email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {["Nouvel abonné premium", "Nouveau commentaire", "Rapport hebdomadaire", "Alertes de sécurité"].map((n, i) => (
                <div key={n} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n}</p>
                  <Switch defaultChecked={i !== 1} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4">
            {integrations.map((i) => (
              <Card key={i.name}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm font-medium">{i.name}</p><p className="text-xs text-muted-foreground font-body">{i.desc}</p></div>
                  <Button size="sm" variant={i.connected ? "outline" : "default"} className={`text-xs font-body ${!i.connected ? "bg-gold hover:bg-gold-dark text-primary" : ""}`} onClick={() => toggleIntegration(i.name)}>
                    {i.connected ? "Connecté ✓" : "Connecter"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
