import { useState, useEffect } from "react";
import { Plus, PieChart, Users, CheckCircle, Clock, Trash2, Loader2, Download, Copy, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCSV } from "@/lib/visitor";
import type { Json } from "@/integrations/supabase/types";

interface Opt { label: string; votes: number; }
interface QDraft { question: string; options: string[]; }

const Surveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [questionsBySurvey, setQuestionsBySurvey] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Général");
  const [isTemplate, setIsTemplate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState<QDraft[]>([{ question: "", options: ["", ""] }]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("active");

  const fetchAll = async () => {
    const { data } = await supabase.from("surveys").select("*").order("created_at", { ascending: false });
    setSurveys(data || []);
    if (data?.length) {
      const { data: qs } = await supabase.from("survey_questions").select("*").in("survey_id", data.map(s => s.id)).order("sort_order");
      const grouped: Record<string, any[]> = {};
      (qs || []).forEach(q => { (grouped[q.survey_id] = grouped[q.survey_id] || []).push(q); });
      setQuestionsBySurvey(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory("Général"); setIsTemplate(false);
    setStartDate(""); setEndDate(""); setQuestions([{ question: "", options: ["", ""] }]);
  };

  const updateQuestion = (qi: number, field: "question", val: string) => {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: val } : q));
  };
  const updateOpt = (qi: number, oi: number, val: string) => {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q));
  };
  const addOpt = (qi: number) => setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: [...q.options, ""] } : q));
  const removeOpt = (qi: number, oi: number) => setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q));
  const addQuestion = () => setQuestions(qs => [...qs, { question: "", options: ["", ""] }]);
  const removeQuestion = (qi: number) => setQuestions(qs => qs.filter((_, i) => i !== qi));

  const handleCreate = async () => {
    if (!title.trim()) { toast({ title: "Titre requis", variant: "destructive" }); return; }
    const validQs = questions.filter(q => q.question.trim() && q.options.filter(o => o.trim()).length >= 2);
    if (!validQs.length) { toast({ title: "Au moins 1 question avec 2 options", variant: "destructive" }); return; }
    setSaving(true);
    const firstOpts = validQs[0].options.filter(o => o.trim()).map(l => ({ label: l, votes: 0 }));
    const { data: s, error } = await supabase.from("surveys").insert({
      title, description, category,
      options: firstOpts as unknown as Json,
      end_date: endDate || null,
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      is_template: isTemplate,
      status: isTemplate ? "ended" : "active",
      created_by: user?.id,
    }).select().single();
    if (error || !s) { toast({ title: "Erreur", description: error?.message, variant: "destructive" }); setSaving(false); return; }
    if (validQs.length > 1) {
      const rows = validQs.map((q, idx) => ({
        survey_id: s.id, question: q.question,
        options: q.options.filter(o => o.trim()).map(l => ({ label: l, votes: 0 })) as unknown as Json,
        sort_order: idx,
      }));
      await supabase.from("survey_questions").insert(rows);
    }
    toast({ title: isTemplate ? "Modèle sauvegardé ✓" : "Sondage publié ✓" });
    setSaving(false); resetForm(); setCreateOpen(false); fetchAll();
  };

  const duplicate = async (s: any) => {
    const { data: ns, error } = await supabase.from("surveys").insert({
      title: `${s.title} (copie)`, description: s.description, category: s.category,
      options: s.options, status: "active", is_template: false, created_by: user?.id,
      start_date: new Date().toISOString(),
    }).select().single();
    if (error || !ns) { toast({ title: "Erreur", variant: "destructive" }); return; }
    const qs = questionsBySurvey[s.id] || [];
    if (qs.length) {
      await supabase.from("survey_questions").insert(qs.map((q, i) => ({
        survey_id: ns.id, question: q.question,
        options: (Array.isArray(q.options) ? q.options.map((o: any) => ({ label: o.label, votes: 0 })) : []) as unknown as Json,
        sort_order: i,
      })));
    }
    toast({ title: "Sondage dupliqué ✓" }); fetchAll();
  };

  const endSurvey = async (id: string) => { await supabase.from("surveys").update({ status: "ended" }).eq("id", id); toast({ title: "Terminé" }); fetchAll(); };
  const deleteSurvey = async (id: string) => { await supabase.from("surveys").delete().eq("id", id); toast({ title: "Supprimé" }); fetchAll(); };

  const exportCSV = (s: any) => {
    const qs = questionsBySurvey[s.id]?.length ? questionsBySurvey[s.id] : [{ question: s.title, options: s.options, total_votes: s.total_votes }];
    const rows: any[] = [];
    qs.forEach((q: any) => {
      const opts: Opt[] = Array.isArray(q.options) ? q.options : [];
      const total = q.total_votes || opts.reduce((a, o) => a + (o.votes || 0), 0);
      opts.forEach((o: Opt) => {
        rows.push({
          sondage: s.title, question: q.question, option: o.label,
          votes: o.votes, pourcentage: total > 0 ? `${((o.votes / total) * 100).toFixed(1)}%` : "0%",
        });
      });
    });
    exportToCSV(`sondage-${s.title.toLowerCase().replace(/\s+/g, "-")}.csv`, rows);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  const filtered = surveys.filter(s => {
    if (tab === "active") return s.status === "active" && !s.is_template;
    if (tab === "ended") return s.status === "ended" && !s.is_template;
    if (tab === "templates") return s.is_template;
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Sondages</h1>
          <p className="text-sm text-muted-foreground">
            {surveys.filter(s => s.status === "active" && !s.is_template).length} actifs · {surveys.reduce((a, s) => a + (s.total_votes || 0), 0)} votes au total
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={o => { if (!o) resetForm(); setCreateOpen(o); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5"><Plus className="w-4 h-4" /> Nouveau sondage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Créer un sondage</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Titre *</Label><Input className="mt-1" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Quel est votre business model préféré ?" /></div>
              <div><Label>Description (optionnel)</Label><Textarea className="mt-1" rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Catégorie</Label><Input className="mt-1" value={category} onChange={e => setCategory(e.target.value)} /></div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isTemplate} onChange={e => setIsTemplate(e.target.checked)} className="w-4 h-4" />
                    Sauver comme modèle
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Début</Label><Input type="datetime-local" className="mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div><Label>Fin</Label><Input type="date" className="mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold">Questions</Label>
                  <Button size="sm" variant="outline" onClick={addQuestion} className="text-xs gap-1"><Plus className="w-3 h-3" /> Ajouter une question</Button>
                </div>
                <div className="space-y-4">
                  {questions.map((q, qi) => (
                    <div key={qi} className="border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-muted-foreground">Q{qi + 1}</span>
                        <Input value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)} placeholder="Votre question..." className="flex-1" />
                        {questions.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeQuestion(qi)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                      </div>
                      <div className="space-y-1.5 pl-6">
                        {q.options.map((o, oi) => (
                          <div key={oi} className="flex gap-2">
                            <Input value={o} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                            {q.options.length > 2 && <Button size="icon" variant="ghost" onClick={() => removeOpt(qi, oi)}><Trash2 className="w-4 h-4" /></Button>}
                          </div>
                        ))}
                        <Button size="sm" variant="ghost" onClick={() => addOpt(qi)} className="text-xs gap-1"><Plus className="w-3 h-3" /> Option</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isTemplate ? "Sauver modèle" : "Publier")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="ended">Terminés</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-4">
          {filtered.map(s => {
            const qs = questionsBySurvey[s.id]?.length ? questionsBySurvey[s.id] : [{ id: s.id, question: s.title, options: s.options, total_votes: s.total_votes }];
            return (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <PieChart className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-display">{s.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.total_votes || 0} votes</span>
                          <span className="flex items-center gap-1">
                            {s.status === "active" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {s.status === "active" ? (s.end_date ? `Fin ${s.end_date}` : "Sans fin") : "Terminé"}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary">{s.category}</span>
                          {questionsBySurvey[s.id]?.length > 0 && <span className="text-[10px]">{questionsBySurvey[s.id].length} questions</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => exportCSV(s)} title="Exporter CSV"><Download className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => duplicate(s)} title="Dupliquer"><Copy className="w-3.5 h-3.5" /></Button>
                      {s.status === "active" && !s.is_template && <Button size="sm" variant="outline" className="text-xs" onClick={() => endSurvey(s.id)}>Terminer</Button>}
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSurvey(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qs.map((q: any, qi: number) => {
                    const opts: Opt[] = Array.isArray(q.options) ? q.options : [];
                    const total = q.total_votes || opts.reduce((a, o) => a + (o.votes || 0), 0);
                    return (
                      <div key={qi}>
                        {qs.length > 1 && <p className="text-sm font-semibold mb-2">{qi + 1}. {q.question}</p>}
                        <div className="space-y-2">
                          {opts.map((opt, i) => {
                            const pct = total > 0 ? (opt.votes / total) * 100 : 0;
                            return (
                              <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{opt.label}</span>
                                  <span className="text-muted-foreground tabular-nums">{pct.toFixed(1)}% ({opt.votes})</span>
                                </div>
                                <Progress value={pct} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun sondage dans cette catégorie.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Surveys;
