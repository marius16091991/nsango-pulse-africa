import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Heart, Flag, Reply, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getVisitorId } from "@/lib/visitor";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  id: string; parent_id: string | null; author_name: string; author_email: string | null;
  content: string; created_at: string; status: string; is_official: boolean;
  likes_count: number; mentions: string[] | null;
}

const renderContent = (content: string) =>
  content.split(/(@\w+)/g).map((part, i) =>
    part.startsWith("@") ? <span key={i} className="text-gold font-semibold">{part}</span> : <span key={i}>{part}</span>
  );

const CommentSection = ({ articleId }: { articleId: string }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .in("status", ["approved"])
      .order("created_at", { ascending: true });
    setComments((data as any) || []);
    // Likes du visiteur
    const visitor = getVisitorId();
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .or(user ? `user_id.eq.${user.id}` : `voter_ip.eq.${visitor}`);
    setLikedIds(new Set((likes || []).map((l: any) => l.comment_id)));
    setLoading(false);
  };

  useEffect(() => {
    if (user && profile?.display_name) setName(profile.display_name);
    load();
  }, [articleId, user?.id]);

  const submit = async () => {
    if (!name.trim() || !content.trim()) {
      toast({ title: "Remplissez nom et message", variant: "destructive" }); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      author_name: name.trim(),
      author_email: email.trim() || null,
      content: content.trim(),
      parent_id: replyTo?.id || null,
      user_id: user?.id || null,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Merci ! Votre commentaire est en attente de validation." });
      setContent(""); setReplyTo(null);
      load();
    }
    setSubmitting(false);
  };

  const toggleLike = async (c: Comment) => {
    const visitor = getVisitorId();
    if (likedIds.has(c.id)) {
      const q = supabase.from("comment_likes").delete().eq("comment_id", c.id);
      await (user ? q.eq("user_id", user.id) : q.eq("voter_ip", visitor));
      setLikedIds(s => { const n = new Set(s); n.delete(c.id); return n; });
      setComments(cs => cs.map(x => x.id === c.id ? { ...x, likes_count: Math.max(0, x.likes_count - 1) } : x));
    } else {
      const { error } = await supabase.from("comment_likes").insert({
        comment_id: c.id, user_id: user?.id || null, voter_ip: user ? null : visitor,
      });
      if (!error) {
        setLikedIds(s => new Set(s).add(c.id));
        setComments(cs => cs.map(x => x.id === c.id ? { ...x, likes_count: x.likes_count + 1 } : x));
      }
    }
  };

  const report = async (c: Comment) => {
    const visitor = getVisitorId();
    const { error } = await supabase.from("comment_reports").insert({
      comment_id: c.id, reporter_user_id: user?.id || null, reporter_ip: user ? null : visitor, reason: "Signalé par un lecteur",
    });
    if (error) toast({ title: "Déjà signalé", variant: "destructive" });
    else toast({ title: "Merci, ce commentaire est signalé aux modérateurs." });
  };

  const roots = comments.filter(c => !c.parent_id);
  const replies = (id: string) => comments.filter(c => c.parent_id === id);

  const CommentCard = ({ c, depth = 0 }: { c: Comment; depth?: number }) => (
    <div className={cn("rounded-lg border border-border bg-card/50 p-3", depth > 0 && "ml-6 md:ml-10 border-l-2 border-l-gold/30")}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-sm">{c.author_name}</span>
        {c.is_official && (
          <span className="flex items-center gap-1 text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded font-bold">
            <ShieldCheck className="w-3 h-3" /> Réponse officielle Nsango
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">· {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
      </div>
      <p className="text-sm mt-1.5 leading-relaxed">{renderContent(c.content)}</p>
      <div className="flex items-center gap-1 mt-2 -ml-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toggleLike(c)}>
          <Heart className={cn("w-3.5 h-3.5", likedIds.has(c.id) && "fill-destructive text-destructive")} /> {c.likes_count || 0}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setReplyTo(c); setContent(`@${c.author_name.replace(/\s+/g, "")} `); }}>
          <Reply className="w-3.5 h-3.5" /> Répondre
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => report(c)}>
          <Flag className="w-3.5 h-3.5" /> Signaler
        </Button>
      </div>
      {replies(c.id).length > 0 && (
        <div className="mt-3 space-y-2">
          {replies(c.id).map(r => <CommentCard key={r.id} c={r} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="w-5 h-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Commentaires <span className="text-muted-foreground font-normal">({roots.length})</span></h2>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-4 mb-6">
        {replyTo && (
          <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
            <span>Réponse à <strong>{replyTo.author_name}</strong></span>
            <button className="underline" onClick={() => { setReplyTo(null); setContent(""); }}>Annuler</button>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <Input placeholder="Votre nom *" value={name} onChange={e => setName(e.target.value)} disabled={!!user} />
          <Input placeholder="Votre email (privé)" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <Textarea placeholder="Votre commentaire... Utilisez @prenom pour mentionner quelqu'un." rows={3} value={content} onChange={e => setContent(e.target.value)} />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">Les commentaires sont modérés avant publication.</p>
          <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary gap-1.5" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Publier</>}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>
      ) : roots.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Soyez le premier à commenter.</p>
      ) : (
        <div className="space-y-3">{roots.map(c => <CommentCard key={c.id} c={c} />)}</div>
      )}
    </section>
  );
};

export default CommentSection;