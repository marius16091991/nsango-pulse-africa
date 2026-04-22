import { Globe, Wallet, Type, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import SettingsManager from "@/components/admin/SettingsManager";

const SettingsPage = () => {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground font-body">
          Configurez les informations du site et les paramètres premium. Toutes les valeurs sont enregistrées en base et utilisées immédiatement sur le site public.
        </p>
      </div>

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="font-body">
          <TabsTrigger value="site" className="gap-1.5"><Globe className="w-4 h-4" /> Site</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5"><Wallet className="w-4 h-4" /> Paiements Premium</TabsTrigger>
          <TabsTrigger value="text" className="gap-1.5"><Type className="w-4 h-4" /> Textes Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <SettingsManager category="site" description="Nom du site, slogan, description SEO et email de contact (utilisés dans le footer et les balises meta)." />
        </TabsContent>

        <TabsContent value="payment">
          <SettingsManager category="payment" description="Numéros mobile money, email PayPal et coordonnées bancaires utilisés dans le modal Premium." />
        </TabsContent>

        <TabsContent value="text">
          <SettingsManager category="text" description="Titres, sous-titres et messages affichés aux visiteurs dans le modal Premium." />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Crown className="w-4 h-4 text-gold" /> Liens utiles</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-body">
          <Link to="/admin/content" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold">Pages & Sections</p>
            <p className="text-xs text-muted-foreground mt-0.5">Modifier le contenu des pages</p>
          </Link>
          <Link to="/admin/subscriptions" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold">Plans Premium</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gérer les offres d'abonnement</p>
          </Link>
          <Link to="/admin/social" className="rounded-lg border p-3 hover:border-gold hover:bg-secondary/50 transition-colors">
            <p className="font-semibold">Réseaux sociaux</p>
            <p className="text-xs text-muted-foreground mt-0.5">Comptes affichés dans le footer</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
