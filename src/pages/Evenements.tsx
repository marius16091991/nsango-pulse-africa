import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  { date: "2026-05-12", time: "19:00", title: "Soirée Portraits — Édition Spéciale", location: "Douala, Hôtel Hilton", desc: "Une soirée d'exception à la rencontre des personnalités qui inspirent." },
  { date: "2026-06-05", time: "10:00", title: "Forum Business Africa", location: "Yaoundé, Palais des Congrès", desc: "Le rendez-vous annuel des leaders et entrepreneurs africains." },
  { date: "2026-07-20", time: "18:30", title: "Nuit de la Culture", location: "Kribi, Plage Tara", desc: "Célébration des arts, mode et lifestyle camerounais." },
];

const Evenements = () => {
  useEffect(() => { document.title = "Événements — Nsango Magazine"; }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 lg:pt-32 pb-20 container mx-auto px-4">
        <SectionTitle title="Événements" subtitle="Agenda des rendez-vous Nsango" />
        <div className="space-y-4 mt-8 max-w-4xl mx-auto">
          {events.map((ev, i) => {
            const d = new Date(ev.date);
            return (
              <div key={i} className="flex flex-col md:flex-row gap-6 bg-card border border-border rounded-lg p-6 hover:border-gold transition-colors">
                <div className="flex md:flex-col items-center md:items-center md:justify-center gap-3 md:gap-0 md:w-24 shrink-0 bg-gradient-to-br from-gold/15 to-gold/5 rounded-lg p-4">
                  <span className="font-display text-3xl font-bold text-gold">{d.getDate()}</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-body">{ev.desc}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" />{ev.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold" />{ev.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold" />{d.toLocaleDateString("fr-FR", { weekday: "long" })}</span>
                  </div>
                </div>
                <Button className="bg-gold hover:bg-gold-dark text-primary self-start md:self-center">S'inscrire</Button>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Evenements;
