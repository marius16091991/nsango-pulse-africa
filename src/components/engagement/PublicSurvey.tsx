import { useEffect, useState } from "react";
import { Loader2, PieChart, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getVisitorId } from "@/lib/visitor";
import { toast } from "@/hooks/use-toast";

interface Option { label: string; votes: number; }
interface Question { id: string; question: string; options: Option[]; total_votes: number; sort_order: number; }

const PublicSurvey = () => {
  const { user } = useAuth();
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [voted, setVoted] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase
        .from("surveys")
        .select("*")
        .eq("status", "active")
        .eq("is_template", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!s) { setLoading(false); return; }
      setSurvey(s);
      const { data: q } = await supabase.from("survey_questions").select("*").eq("survey_id", s.id).order("sort_order");
      const qs: Question[] = (q || []).map((row: any) => ({ ...row, options: Array.isArray(row.options) ? row.options : [] }));
      // Si pas de questions multiples, on retombe sur le sondage simple
      if (qs.length === 0 && Array.isArray(s.options) && s.options.length) {
        qs.push({ id: s.id, question: s.title, options: s.options, total_votes: s.total_votes, sort_order: 0 });
      }
      setQuestions(qs);
      // Vérifie les votes existants
      const visitor = getVisitorId();
      const { data: votes } = await supabase
        .from("survey_votes")
        .select("question_id, survey_id, option_index")
        .eq("survey_id", s.id)
        .or(user ? `user_id.eq.${user.id}` : `voter_ip.eq.${visitor}`);
      const v: Record<string, number> = {};
      (votes || []).forEach((row: any) => { v[row.question_id || row.survey_id] = row.option_index; });
      setVoted(v);
      setLoading(false);
    })();
  }, [user?.id]);

  const vote = async (q: Question, idx: number) => {
    if (submitting || voted[q.id] !== undefined) return;
    setSubmitting(q.id);
    const visitor = getVisitorId();
    const isMulti = q.id !== survey.id;
    const { error } = await supabase.from("survey_votes").insert({
      survey_id: survey.id,
      question_id: isMulti ? q.id : null,
      option_index: idx,
      user_id: user?.id || null,
      voter_ip: user ? null : visitor,
    });
    if (error) {
      toast({ title: "Vote impossible", description: error.message, variant: "destructive" });
    } else {
      setVoted(v => ({ ...v, [q.id]: idx }));
      // Recharge les compteurs
      const updatedOpts = [...q.options];
      updatedOpts[idx] = { ...updatedOpts[idx], votes: (updatedOpts[idx].votes || 0) + 1 };
      setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, options: updatedOpts, total_votes: x.total_votes + 1 } : x));
    }
    setSubmitting(null);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>;
  if (!survey || questions.length === 0) return null;

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center gap-2 text-gold mb-1">
          <PieChart className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Sondage Nsango</span>
        </div>
        <h3 className="font-display text-lg md:text-xl font-bold mb-1">{survey.title}</h3>
        {survey.description && <p className="text-sm text-muted-foreground mb-4">{survey.description}</p>}

        <div className="space-y-5">
          {questions.map((q, qi) => (
            <div key={q.id}>
              {questions.length > 1 && <p className="text-sm font-semibold mb-2">{qi + 1}. {q.question}</p>}
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const has = voted[q.id] !== undefined;
                  const pct = q.total_votes > 0 ? (opt.votes / q.total_votes) * 100 : 0;
                  const mine = voted[q.id] === i;
                  return has ? (
                    <div key={i} className="relative">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-1.5">
                          {mine && <CheckCircle2 className="w-3.5 h-3.5 text-gold" />}
                          {opt.label}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">{pct.toFixed(0)}% · {opt.votes}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  ) : (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2.5 hover:border-gold hover:bg-gold/5"
                      disabled={submitting === q.id}
                      onClick={() => vote(q, i)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{q.total_votes} vote{q.total_votes > 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicSurvey;