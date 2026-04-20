import { useEffect, useState } from "react";
import { Mail, RefreshCw, CheckCircle2, XCircle, Clock, Copy, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface OutboxEmail {
  id: string; to_email: string; to_name: string | null; subject: string;
  html_body: string; status: string; attempts: number; last_error: string | null;
  created_at: string; sent_at: string | null; category: string;
}

const RELAY_URL = `https://ukwxyzcdjyiovxasbpxq.supabase.co/functions/v1/notifications-relay`;

const statusBadge = (s: string) => {
  if (s === "sent") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle2 className="w-3 h-3" />Envoyé</Badge>;
  if (s === "failed") return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Échec</Badge>;
  return <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300"><Clock className="w-3 h-3" />En attente</Badge>;
};

const EmailsOutbox = () => {
  const [emails, setEmails] = useState<OutboxEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "failed">("all");
  const [preview, setPreview] = useState<OutboxEmail | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("email_outbox").select("*").order("created_at", { ascending: false }).limit(200);
    setEmails((data || []) as OutboxEmail[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? emails : emails.filter(e => e.status === filter);
  const counts = {
    pending: emails.filter(e => e.status === "pending").length,
    sent: emails.filter(e => e.status === "sent").length,
    failed: emails.filter(e => e.status === "failed").length,
  };

  const copy = (txt: string) => { navigator.clipboard.writeText(txt); toast.success("Copié"); };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold" /> Emails sortants
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            File d'attente alimentée par les notifications. Votre serveur d'hébergement les envoie via SMTP.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5"><Send className="w-4 h-4" /> Intégration serveur</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Brancher votre serveur SMTP</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">Configurez un cron sur votre hébergement (toutes les 1–5 min) qui appelle :</p>
                <div className="space-y-2">
                  <p className="font-semibold text-xs">1. Lire les emails en attente</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`GET ${RELAY_URL}/pending?limit=50
Headers:
  x-api-key: VOTRE_NOTIFICATIONS_RELAY_API_KEY`}
                  </pre>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => copy(`${RELAY_URL}/pending`)}>
                    <Copy className="w-3 h-3" /> Copier l'URL
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-xs">2. Marquer un email envoyé / échoué</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`POST ${RELAY_URL}/mark
Headers:
  x-api-key: VOTRE_NOTIFICATIONS_RELAY_API_KEY
  Content-Type: application/json

{ "id": "uuid-de-email", "status": "sent" }
ou
{ "id": "uuid-de-email", "status": "failed", "error": "message" }`}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  La clé <code className="bg-muted px-1 rounded">NOTIFICATIONS_RELAY_API_KEY</code> est celle que vous avez configurée. Conservez-la côté serveur uniquement.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={load} size="sm" variant="outline" className="gap-1.5" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "pending", l: "En attente", v: counts.pending, c: "text-amber-600" },
          { k: "sent", l: "Envoyés", v: counts.sent, c: "text-green-600" },
          { k: "failed", l: "Échecs", v: counts.failed, c: "text-destructive" },
        ].map(s => (
          <Card key={s.k} className={`cursor-pointer transition ${filter === s.k ? "border-gold/40 bg-gold/5" : ""}`} onClick={() => setFilter(filter === s.k ? "all" : s.k as any)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-body">{s.l}</p>
              <p className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Aucun email {filter !== "all" && `(${filter})`}</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <Card key={e.id}>
              <CardContent className="p-3 flex items-center gap-3">
                {statusBadge(e.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{e.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">→ {e.to_name ? `${e.to_name} <${e.to_email}>` : e.to_email}</p>
                  {e.last_error && <p className="text-[10px] text-destructive mt-0.5 truncate">⚠ {e.last_error}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: fr })}</p>
                  {e.attempts > 0 && <p className="text-[10px] text-muted-foreground">{e.attempts} tentative{e.attempts > 1 ? "s" : ""}</p>}
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPreview(e)}>Aperçu</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-sm">{preview?.subject}</DialogTitle></DialogHeader>
          {preview && (
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <p className="text-xs text-muted-foreground mb-3">Destinataire : <strong>{preview.to_email}</strong></p>
              <iframe srcDoc={preview.html_body} className="w-full min-h-[500px] border rounded" title="Preview" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailsOutbox;