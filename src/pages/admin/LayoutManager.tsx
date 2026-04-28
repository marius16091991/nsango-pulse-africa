import { useState } from "react";
import { Layout, PanelTop, PanelBottom, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsManager from "@/components/admin/SettingsManager";
import NavLinksManager from "@/components/admin/layout/NavLinksManager";

const LayoutManager = () => {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Layout className="w-6 h-6 text-gold" /> Tête & Pied de page
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Configurez la navigation, les textes et les liens affichés dans le header et le footer du site public. Toutes les modifications sont appliquées immédiatement.
        </p>
      </div>

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList className="font-body">
          <TabsTrigger value="header" className="gap-1.5"><PanelTop className="w-4 h-4" /> Header — Navigation</TabsTrigger>
          <TabsTrigger value="footer" className="gap-1.5"><PanelBottom className="w-4 h-4" /> Footer — Liens</TabsTrigger>
          <TabsTrigger value="texts" className="gap-1.5"><Type className="w-4 h-4" /> Textes & libellés</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <NavLinksManager location="header" />
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <NavLinksManager location="footer" />
        </TabsContent>

        <TabsContent value="texts">
          <SettingsManager
            category={"layout" as any}
            description="Bandeau supérieur, libellés, tagline footer, bouton premium et copyright."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LayoutManager;
