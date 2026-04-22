import { Search, Globe, BarChart3, Building2, FileCode, ArrowLeftRight, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeoSettingsTab from "@/components/admin/seo/SeoSettingsTab";
import SeoOverridesTab from "@/components/admin/seo/SeoOverridesTab";
import SeoRedirectsTab from "@/components/admin/seo/SeoRedirectsTab";
import SeoToolsTab from "@/components/admin/seo/SeoToolsTab";

const SeoManager = () => {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Search className="w-6 h-6 text-gold" /> Référencement (SEO)</h1>
        <p className="text-sm text-muted-foreground font-body">
          Gestion complète du référencement : balises par défaut, surcharges par contenu, tracking, sitemap, redirections et outils webmaster.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="font-body flex-wrap h-auto">
          <TabsTrigger value="general" className="gap-1.5"><Globe className="w-4 h-4" /> Général</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5"><Building2 className="w-4 h-4" /> Social</TabsTrigger>
          <TabsTrigger value="organization" className="gap-1.5"><Building2 className="w-4 h-4" /> Organisation</TabsTrigger>
          <TabsTrigger value="tracking" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Tracking</TabsTrigger>
          <TabsTrigger value="overrides" className="gap-1.5"><FileCode className="w-4 h-4" /> Pages & Contenus</TabsTrigger>
          <TabsTrigger value="robots" className="gap-1.5"><FileCode className="w-4 h-4" /> Robots</TabsTrigger>
          <TabsTrigger value="redirects" className="gap-1.5"><ArrowLeftRight className="w-4 h-4" /> Redirections</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5"><Wrench className="w-4 h-4" /> Outils</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><SeoSettingsTab category="general" /></TabsContent>
        <TabsContent value="social"><SeoSettingsTab category="social" /></TabsContent>
        <TabsContent value="organization"><SeoSettingsTab category="organization" /></TabsContent>
        <TabsContent value="tracking"><SeoSettingsTab category="tracking" /></TabsContent>
        <TabsContent value="overrides"><SeoOverridesTab /></TabsContent>
        <TabsContent value="robots"><SeoSettingsTab category="robots" /></TabsContent>
        <TabsContent value="redirects"><SeoRedirectsTab /></TabsContent>
        <TabsContent value="tools"><SeoToolsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoManager;