import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Sparkles, Target, Heart, Users } from "lucide-react";

const APropos = () => {
  useEffect(() => { document.title = "À propos — Nsango Magazine"; }, []);

  const values = [
    { icon: Sparkles, title: "Excellence", desc: "Un journalisme exigeant qui valorise l'authenticité." },
    { icon: Target, title: "Mission", desc: "Mettre en lumière les visages qui inspirent l'Afrique." },
    { icon: Heart, title: "Passion", desc: "L'amour du continent au cœur de chaque publication." },
    { icon: Users, title: "Communauté", desc: "Connecter une génération ambitieuse et créative." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 lg:pt-32 pb-20">
        <section className="container mx-auto px-4 max-w-4xl text-center">
          <SectionTitle title="À propos de Nsango Magazine" subtitle="Notre histoire, notre vision" />
          <p className="text-lg text-muted-foreground font-body leading-relaxed mt-8">
            Nsango Magazine est un média panafricain premium qui célèbre les talents, les leaders et les créateurs
            qui façonnent l'Afrique d'aujourd'hui et de demain. À travers reportages, portraits, interviews et
            chroniques culturelles, nous racontons une Afrique fière, créative et tournée vers l'avenir.
          </p>
        </section>

        <section className="container mx-auto px-4 mt-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-xl p-6 text-center hover:border-gold transition-colors">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 font-body">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Nous contacter</h2>
          <div className="bg-card border border-border rounded-xl p-8 space-y-4 font-body">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Rédaction</span>
              <a href="mailto:redaction@kibafood.cm" className="text-gold hover:underline">redaction@kibafood.cm</a>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Partenariats</span>
              <a href="mailto:partenariats@kibafood.cm" className="text-gold hover:underline">partenariats@kibafood.cm</a>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Publicité</span>
              <a href="mailto:pub@kibafood.cm" className="text-gold hover:underline">pub@kibafood.cm</a>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Adresse</span>
              <span>Douala, Cameroun</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default APropos;
