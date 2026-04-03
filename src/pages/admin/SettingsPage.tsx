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

const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground font-body">Configuration technique de la plateforme</p>
        </div>
        <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1" onClick={handleSave}>
          <Save className="w-4 h-4" /> {saved ? "Enregistré ✓" : "Enregistrer"}
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
                  <div><Label className="font-body text-sm">Nom du site</Label><Input defaultValue="Nsango Magazine" className="mt-1" /></div>
                  <div><Label className="font-body text-sm">Slogan</Label><Input defaultValue="Les visages qui inspirent l'Afrique" className="mt-1" /></div>
                </div>
                <div><Label className="font-body text-sm">Description SEO</Label><Textarea defaultValue="Nsango Magazine — le premier magazine numérique premium dédié aux personnalités influentes du continent africain." className="mt-1" rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="font-body text-sm">Email de contact</Label><Input defaultValue="contact@nsangomagazine.com" className="mt-1" /></div>
                  <div>
                    <Label className="font-body text-sm">Langue par défaut</Label>
                    <Select defaultValue="fr">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Database className="w-4 h-4" /> Maintenance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Mode maintenance</p><p className="text-xs text-muted-foreground font-body">Rendre le site temporairement inaccessible</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Cache des pages</p><p className="text-xs text-muted-foreground font-body">Activer la mise en cache pour les performances</p></div>
                  <Switch defaultChecked />
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
                <div><p className="text-sm font-medium">Mode sombre par défaut</p><p className="text-xs text-muted-foreground font-body">Les visiteurs verront le mode sombre en premier</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Animations</p><p className="text-xs text-muted-foreground font-body">Activer les animations au scroll</p></div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label className="font-body text-sm">Articles par page</Label>
                <Select defaultValue="12">
                  <SelectTrigger className="mt-1 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Logo (URL)</Label>
                <Input defaultValue="/logo.svg" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Sécurité & Accès</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Authentification à deux facteurs</p><p className="text-xs text-muted-foreground font-body">Exiger 2FA pour les comptes admin</p></div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Modération des commentaires</p><p className="text-xs text-muted-foreground font-body">Approuver manuellement avant publication</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Protection anti-spam</p><p className="text-xs text-muted-foreground font-body">reCAPTCHA sur les formulaires publics</p></div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label className="font-body text-sm">Durée de session admin (heures)</Label>
                <Input type="number" defaultValue="24" className="mt-1 w-32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Mail className="w-4 h-4" /> Notifications email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Nouvel abonné premium</p><p className="text-xs text-muted-foreground font-body">Être notifié à chaque nouvel abonnement</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Nouveau commentaire</p><p className="text-xs text-muted-foreground font-body">Être notifié des nouveaux commentaires</p></div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Rapport hebdomadaire</p><p className="text-xs text-muted-foreground font-body">Recevoir un résumé des performances chaque lundi</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Alertes de sécurité</p><p className="text-xs text-muted-foreground font-body">Connexions suspectes et tentatives d'intrusion</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4">
            {[
              { name: "Cloudinary", desc: "Stockage et optimisation des médias", connected: true },
              { name: "Stripe", desc: "Paiements et abonnements", connected: true },
              { name: "Mailchimp", desc: "Newsletter et email marketing", connected: false },
              { name: "Google Analytics", desc: "Suivi du trafic et comportement", connected: true },
              { name: "Facebook Pixel", desc: "Suivi publicitaire Facebook", connected: false },
              { name: "Disqus", desc: "Système de commentaires", connected: false },
            ].map((i) => (
              <Card key={i.name}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{i.desc}</p>
                  </div>
                  <Button size="sm" variant={i.connected ? "outline" : "default"} className={`text-xs font-body ${!i.connected ? "bg-gold hover:bg-gold-dark text-primary" : ""}`}>
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
