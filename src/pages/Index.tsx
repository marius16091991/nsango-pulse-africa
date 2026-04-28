import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import AdBanner from "@/components/AdBanner";
import PublicSurvey from "@/components/engagement/PublicSurvey";
import { usePageSections } from "@/hooks/usePageSections";
import { PageSectionRenderer } from "@/components/PageSectionRenderer";

const Index = () => {
  const { sections, loading } = usePageSections("home");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead route="/" type="website" />
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-muted-foreground font-body">Aucune section configurée. Rendez-vous dans l'admin pour commencer.</p>
        </div>
      )}

      {sections.map((section, i) => (
        <div key={section.id}>
          <PageSectionRenderer section={section} />
          {/* Insert ad banner after the first hero / featured section */}
          {i === 0 && (
            <div className="container mx-auto px-4 py-4 space-y-6">
              <AdBanner variant="horizontal" />
              <PublicSurvey />
            </div>
          )}
        </div>
      ))}

      <Footer />
    </div>
  );
};

export default Index;
