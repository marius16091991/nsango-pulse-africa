import { useState } from "react";
import { Plus, PieChart, Users, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface SurveyOption { label: string; votes: number; }
interface Survey {
  id: number;
  title: string;
  status: "active" | "ended";
  totalVotes: number;
  endDate: string;
  options: SurveyOption[];
}

const Surveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: 1, title: "Quelle personnalité africaine vous inspire le plus en 2026 ?", status: "active", totalVotes: 4520, endDate: "2026-04-15",
      options: [
        { label: "Aliko Dangote", votes: 1350 }, { label: "Ngozi Okonjo-Iweala", votes: 1120 },
        { label: "Paul Kagame", votes: 890 }, { label: "Tidjane Thiam", votes: 720 }, { label: "Chimamanda Ngozi Adichie", votes: 440 },
      ],
    },
    {
      id: 2, title: "Quel sujet souhaitez-vous voir plus dans Nsango Magazine ?", status: "active", totalVotes: 2180, endDate: "2026-04-20",
      options: [
        { label: "Startups & Innovation", votes: 680 }, { label: "Culture & Arts", votes: 520 },
        { label: "Business & Finance", votes: 450 }, { label: "Sport", votes: 310 }, { label: "Politique", votes: 220 },
      ],
    },
    {
      id: 3, title: "Meilleur film africain de l'année", status: "ended", totalVotes: 6800, endDate: "2026-03-31",
      options: [
        { label: "The Woman King", votes: 2800 }, { label: "Atlantics", votes: 1900 },
        { label: "Lionheart", votes: 1200 }, { label: "Rafiki", votes: 900 },
      ],
    },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState("all");

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => { const o = [...options]; o[i] = val; setOptions(o); };

  const handleCreate = () => {
    if (!question.trim()) { toast({ title: "Erreur", description: "La question est requise", variant: "destructive" }); return; }
    const validOpts = options.filter(o => o.trim());
    if (validOpts.length < 2) { toast({ title: "Erreur", description: "Au moins 2 options", variant: "destructive" }); return; }
    const newSurvey: Survey = {
      id: Date.now(), title: question, status: "active", totalVotes: 0,
      endDate: endDate || "Non défini",
      options: validOpts.map(l => ({ label: l, votes: 0 })),
    };
    setSurveys(prev => [newSurvey, ...prev]);
    toast({ title: "Sondage créé", description: question });
    setQuestion(""); setOptions(["", "", ""]); setEndDate(""); setCreateOpen(false);
  };

  const endSurvey = (id: number) => {
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, status: "ended" as const } : s));
    toast({ title: "Sondage terminé" });
  };

  const deleteSurvey = (id: number) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    toast({ title: "Sondage supprimé" });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Sondages</h1>
          <p className="text-sm text-muted-foreground font-body">{surveys.length} sondages · {surveys.filter(s => s.status === "active").length} actifs</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1"><Plus className="w-4 h-4" /> Nouveau sondage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Créer un sondage</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="font-body text-sm">Question</Label><Textarea className="mt-1" rows={2} placeholder="Posez votre question..." value={question} onChange={e => setQuestion(e.target.value)} /></div>
              <div>
                <Label className="font-body text-sm">Options de réponse</Label>
                <div className="space-y-2 mt-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={o} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                      {options.length > 2 && <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeOption(i)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs font-body" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Date de fin</Label><Input type="date" className="mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                <div><Label className="font-body text-sm">Visibilité</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les visiteurs</SelectItem>
                      <SelectItem value="members">Membres uniquement</SelectItem>
                      <SelectItem value="premium">Premium uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="font-body" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary font-body" onClick={handleCreate}>Publier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {surveys.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <PieChart className="w-5 h-5 text-gold shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="text-base font-display truncate">{s.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.totalVotes.toLocaleString()} votes</span>
                      <span className="flex items-center gap-1">
                        {s.status === "active" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {s.status === "active" ? `Fin : ${s.endDate}` : "Terminé"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {s.status === "active" ? "Actif" : "Terminé"}
                  </span>
                  {s.status === "active" && (
                    <Button size="sm" variant="outline" className="text-xs font-body" onClick={() => endSurvey(s.id)}>Terminer</Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSurvey(s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {s.options.map((opt, i) => {
                  const pct = s.totalVotes > 0 ? (opt.votes / s.totalVotes) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-body">{opt.label}</span>
                        <span className="text-xs text-muted-foreground font-body">{pct.toFixed(1)}% ({opt.votes})</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Surveys;
