import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageSections } from "@/hooks/usePageSections";
import { PageSectionRenderer } from "@/components/PageSectionRenderer";
import { supabase } from "@/integrations/supabase/client";

interface Props { slug: string; defaultTitle?: string; }

const DynamicPage = ({ slug, defaultTitle }: Props) => {
  const { sections, loading } = usePageSections(slug);

  useEffect(() => {
    supabase.from("pages").select("title,meta_description").eq("slug", slug).maybeSingle().then(({ data }) => {
      const title = data?.title || defaultTitle || "Nsango Magazine";
      document.title = `${title} — Nsango Magazine`;
      if (data?.meta_description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
        meta.setAttribute("content", data.meta_description);
      }
    });
  }, [slug, defaultTitle]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-muted-foreground font-body">Aucune section configurée pour cette page.</p>
        </div>
      )}

      {sections.map(section => <PageSectionRenderer key={section.id} section={section} />)}

      <Footer />
    </div>
  );
};

export default DynamicPage;
