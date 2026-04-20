import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, AlertTriangle, Loader2, Ban, MessageSquare, ShieldAlert, Trash2, Plus, Reply } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  approved: { label: "Approuvé", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  flagged: { label: "Signalé", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  rejected: { label: "Rejeté", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const CommentsManager = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyOpen, setReplyOpen] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newWord, setNewWord] = useState("");

  const fetchAll = async () => {
    const [c, b, w] = await Promise.all([
      supabase.from("comments").select("*, articles(title)").order("created_at", { ascending: false }),
      supabase.from("banned_authors").select("*").order("created_at", { ascending: false }),
      supabase.from("forbidden_words").select("*").order("word"),
    ]);
    setComments(c.data || []); setBans(b.data || []); setWords(w.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("comments").update({ status: newStatus }).eq("id", id);
    toast({ title: `Commentaire ${newStatus === "approved" ? "approuvé" : "rejeté"}` });
    fetchAll();
  };

  const bulkAction = async (action: "approve" | "reject" | "delete") => {
    if (!selected.size) return;
    const ids = Array.from(selected);
    if (action === "delete") await supabase.from("comments").delete().in("id", ids);
    else await supabase.from("comments").update({ status: action === "approve" ? "approved" : "rejected" }).in("id", ids);
    toast({ title: `${ids.length} commentaire(s) traité(s)` });
    setSelected(new Set()); fetchAll();
  };

  const banAuthor = async (c: any) => {
    if (!c.author_email) { toast({ title: "Pas d'email pour bannir", variant: "destructive" }); return; }
    await supabase.from("banned_authors").insert({ email: c.author_email, reason: `Auteur de "${c.content.slice(0, 30)}..."`, banned_by: user?.id });
    await supabase.from("comments").update({ status: "rejected" }).eq("author_email", c.author_email);
    toast({ title: `${c.author_name} banni` }); fetchAll();
  };

  const unban = async (id: string) => { await supabase.from("banned_authors").delete().eq("id", id); toast({ title: "Débanni" }); fetchAll(); };

  const sendReply = async () => {
    if (!replyOpen || !replyText.trim()) return;
    await supabase.from("comments").insert({
      article_id: replyOpen.article_id, parent_id: replyOpen.id,
      author_name: "Nsango Magazine", author_email: null,
      content: replyText.trim(), status: "approved", is_official: true, user_id: user?.id,
    });
    toast({ title: "Réponse officielle publiée ✓" });
    setReplyOpen(null); setReplyText(""); fetchAll();
  };

  const addWord = async () => {
    if (!newWord.trim()) return;
    const { error } = await supabase.from("forbidden_words").insert({ word: newWord.trim().toLowerCase() });
    if (error) toast({ title: "Existe déjà", variant: "destructive" });
    else { setNewWord(""); fetchAll(); }
  };
  const removeWord = async (id: string) => { await supabase.from("forbidden_words").delete().eq("id", id); fetchAll(); };

  const filtered = comments.filter(c => {
    if (search && !c.content.toLowerCase().includes(search.toLowerCase()) && !c.author_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = comments.filter(c => c.status === "pending").length;
  const flaggedCount = comments.filter(c => c.status === "flagged").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Modération</h1>
        <p className="text-sm text-muted-foreground">{pendingCount} en attente · {flaggedCount} signalé{flaggedCount > 1 ? "s" : ""} · {bans.length} banni{bans.length > 1 ? "s" : ""}</p>
      </div>

      <Tabs defaultValue="comments">
        <TabsList>
          <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-1.5" /> Commentaires</TabsTrigger>
          <TabsTrigger value="bans"><Ban className="w-4 h-4 mr-1.5" /> Bannis ({bans.length})</TabsTrigger>
          <TabsTrigger value="words"><ShieldAlert className="w-4 h-4 mr-1.5" /> Mots interdits ({words.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="flagged">Signalés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selected.size > 0 && (
            <Card className="border-gold">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{selected.size} sélectionné(s)</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => bulkAction("approve")} className="text-green-700">Approuver</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction("reject")} className="text-destructive">Rejeter</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction("delete")}>Supprimer</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div> : (
            <div className="space-y-2">
              {filtered.map(c => {
                const cfg = statusConfig[c.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Card key={c.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selected.has(c.id)} onCheckedChange={(v) => { setSelected(s => { const n = new Set(s); v ? n.add(c.id) : n.delete(c.id); return n; }); }} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{c.author_name}</span>
                            {c.author_email && <span className="text-xs text-muted-foreground">{c.author_email}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" /> {cfg.label}
                            </span>
                            {c.is_official && <span className="text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded font-bold">OFFICIEL</span>}
                            {c.parent_id && <span className="text-[10px] text-muted-foreground">↳ réponse</span>}
                            {c.reports_count > 0 && <span className="text-[10px] text-destructive">⚠ {c.reports_count} signalement(s)</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">sur « {c.articles?.title || "—"} » · {new Date(c.created_at).toLocaleString("fr-FR")} · ❤️ {c.likes_count || 0}</p>
                          <p className="text-sm">{c.content}</p>
                          {c.mentions?.length > 0 && <p className="text-[11px] text-gold mt-1">Mentions : {c.mentions.map((m: string) => `@${m}`).join(" ")}</p>}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {c.status !== "approved" && <Button size="sm" variant="outline" className="text-xs h-7 text-green-700" onClick={() => updateStatus(c.id, "approved")}><CheckCircle className="w-3 h-3" /></Button>}
                          {c.status !== "rejected" && <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => updateStatus(c.id, "rejected")}><XCircle className="w-3 h-3" /></Button>}
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setReplyOpen(c)} title="Réponse officielle"><Reply className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => banAuthor(c)} title="Bannir l'auteur"><Ban className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Aucun commentaire</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bans" className="mt-4 space-y-2">
          {bans.map(b => (
            <Card key={b.id}><CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{b.email || b.ip}</p>
                <p className="text-xs text-muted-foreground">{b.reason} · {new Date(b.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => unban(b.id)} className="text-xs">Débannir</Button>
            </CardContent></Card>
          ))}
          {bans.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Aucun auteur banni</p>}
        </TabsContent>

        <TabsContent value="words" className="mt-4 space-y-3">
          <Card><CardContent className="p-4 flex gap-2">
            <Input placeholder="Mot interdit (auto-flag des commentaires)..." value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === "Enter" && addWord()} />
            <Button onClick={addWord} className="bg-gold hover:bg-gold-dark text-primary gap-1"><Plus className="w-4 h-4" /> Ajouter</Button>
          </CardContent></Card>
          <div className="flex flex-wrap gap-2">
            {words.map(w => (
              <span key={w.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-sm">
                {w.word}
                <button onClick={() => removeWord(w.id)} className="hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
            {words.length === 0 && <p className="text-sm text-muted-foreground">Aucun mot interdit défini.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!replyOpen} onOpenChange={(o) => !o && setReplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Réponse officielle Nsango</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">En réponse à <strong>{replyOpen?.author_name}</strong> : « {replyOpen?.content?.slice(0, 80)}... »</p>
          <Textarea rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Votre réponse officielle..." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReplyOpen(null)}>Annuler</Button>
            <Button className="bg-gold hover:bg-gold-dark text-primary" onClick={sendReply}>Publier</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentsManager;
