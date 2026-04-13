import { useState, useEffect } from "react";
import { Plus, PieChart, Users, CheckCircle, Clock, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

interface SurveyOption { label: string; votes: number; }

const Surveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSurveys = async () => {
    const { data } = await supabase.from("surveys").select("*").order("created_at", { ascending: false });
    setSurveys(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSurveys(); }, []);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => { const o = [...options]; o[i] = val; setOptions(o); };

  const handleCreate = async () => {
    if (!question.trim()) { toast({ title: "Erreur", description: "La question est requise", variant: "destructive" }); return; }
    const validOpts = options.filter(o => o.trim());
    if (validOpts.length < 2) { toast({ title: "Erreur", description: "Au moins 2 options", variant: "destructive" }); return; }
    setSaving(true);
    const optionsPayload: Json = validOpts.map(l => ({ label: l, votes: 0 }));
    const { error } = await supabase.from("surveys").insert({
      title: question, options: optionsPayload, end_date: endDate || null,
      status: "active", created_by: user?.id,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else toast({ title: "Sondage créé ✓" });
    setSaving(false); setQuestion(""); setOptions(["", "", ""]); setEndDate(""); setCreateOpen(false);
    fetchSurveys();
  };

  const endSurvey = async (id: string) => {
    await supabase.from("surveys").update({ status: "ended" }).eq("id", id);
    toast({ title: "Sondage terminé" }); fetchSurveys();
  };

  const deleteSurvey = async (id: string) => {
    await supabase.from("surveys").delete().eq("id", id);
    toast({ title: "Sondage supprimé" }); fetchSurveys();
  };

  const parseOptions = (opts: Json): SurveyOption[] => {
    if (Array.isArray(opts)) return opts as SurveyOption[];
    return [];
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Sondages</h1>
          <p className="text-sm text-muted-foreground">{surveys.length} sondages · {surveys.filter(s => s.status === "active").length} actifs</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5"><Plus className="w-4 h-4" /> Nouveau sondage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Créer un sondage</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="text-sm">Question</Label><Textarea className="mt-1" rows={2} placeholder="Posez votre question..." value={question} onChange={e => setQuestion(e.target.value)} /></div>
              <div>
                <Label className="text-sm">Options de réponse</Label>
                <div className="space-y-2 mt-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={o} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                      {options.length > 2 && <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeOption(i)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
                </div>
              </div>
              <div><Label className="text-sm">Date de fin</Label><Input type="date" className="mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {surveys.map((s) => {
          const opts = parseOptions(s.options);
          return (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PieChart className="w-5 h-5 text-gold shrink-0" />
                    <div className="min-w-0">
                      <CardTitle className="text-base font-display truncate">{s.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.total_votes} votes</span>
                        <span className="flex items-center gap-1">
                          {s.status === "active" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {s.status === "active" ? (s.end_date ? `Fin : ${s.end_date}` : "Sans fin") : "Terminé"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {s.status === "active" ? "Actif" : "Terminé"}
                    </span>
                    {s.status === "active" && (
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => endSurvey(s.id)}>Terminer</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSurvey(s.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opts.map((opt, i) => {
                    const pct = s.total_votes > 0 ? (opt.votes / s.total_votes) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{pct.toFixed(1)}% ({opt.votes})</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {surveys.length === 0 && <p className="text-center text-muted-foreground py-12">Aucun sondage. Créez le premier !</p>}
      </div>
    </div>
  );
};

export default Surveys;
