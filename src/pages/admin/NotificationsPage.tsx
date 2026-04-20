import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Trash2, Search, Filter, ExternalLink, CheckCheck, Plus, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const typeLabels: Record<string, string> = {
  article: "Article", comment: "Commentaire", subscription: "Abonnement",
  premium: "Premium", user: "Utilisateur", alert: "Alerte", system: "Système", info: "Info",
};
const typeColors: Record<string, string> = {
  article: "bg-green-100 text-green-700", comment: "bg-blue-100 text-blue-700",
  subscription: "bg-gold/20 text-gold-dark", premium: "bg-gold/20 text-gold-dark",
  user: "bg-purple-100 text-purple-700", alert: "bg-red-100 text-red-700",
  system: "bg-muted text-muted-foreground", info: "bg-muted text-muted-foreground",
};

const NotificationsPage = () => {
  const { notifications, loading, unreadCount, markRead, markAllRead, remove, removeAll, refetch } = useNotifications();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bLink, setBLink] = useState("");
  const [bType, setBType] = useState("system");

  const filtered = useMemo(() => notifications.filter(n => {
    if (search && !`${n.title} ${n.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && n.type !== filterType) return false;
    if (filterRead === "unread" && n.read) return false;
    if (filterRead === "read" && !n.read) return false;
    return true;
  }), [notifications, search, filterType, filterRead]);

  const sendBroadcast = async () => {
    if (!bTitle.trim()) { toast.error("Titre requis"); return; }
    setSending(true);
    // Cible : tous les utilisateurs ayant un profil
    const { data: profs } = await supabase.from("profiles").select("user_id");
    const rows = (profs || []).map(p => ({
      user_id: p.user_id, type: bType, title: bTitle,
      description: bDesc || null, link: bLink || null,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) toast.error(error.message);
      else toast.success(`Notification envoyée à ${rows.length} utilisateur(s)`);
    }
    setSending(false); setCreateOpen(false);
    setBTitle(""); setBDesc(""); setBLink(""); setBType("system");
    refetch();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-gold" /> Notifications</h1>
          <p className="text-sm text-muted-foreground font-body">{notifications.length} au total · {unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0} className="gap-1.5">
            <CheckCheck className="w-4 h-4" /> Tout lire
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
                <Plus className="w-4 h-4" /> Diffuser
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Envoyer une notification à tous les utilisateurs</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><Label className="text-xs">Type</Label>
                  <Select value={bType} onValueChange={setBType}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Titre *</Label><Input value={bTitle} onChange={e => setBTitle(e.target.value)} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Description</Label><Textarea value={bDesc} onChange={e => setBDesc(e.target.value)} rows={3} className="mt-1" /></div>
                <div><Label className="text-xs">Lien (optionnel)</Label><Input value={bLink} onChange={e => setBLink(e.target.value)} placeholder="/premium" className="mt-1 h-9" /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                  <Button onClick={sendBroadcast} disabled={sending} className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 h-9" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44 h-9"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="read">Lues</SelectItem>
            </SelectContent>
          </Select>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => { if (confirm("Tout supprimer ?")) removeAll(); }} className="text-destructive gap-1.5">
              <Trash2 className="w-4 h-4" /> Vider
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">Aucune notification</p>
        ) : filtered.map(n => (
          <Card key={n.id} className={`transition ${!n.read ? "border-gold/30 bg-gold/5" : ""}`}>
            <CardContent className="p-3 flex items-start gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${typeColors[n.type] || typeColors.system}`}>
                {typeLabels[n.type] || n.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                </div>
                {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground" title={format(new Date(n.created_at), "PPpp", { locale: fr })}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                  </span>
                  {n.link && (
                    <Link to={n.link} onClick={() => markRead(n.id)} className="text-[10px] text-gold hover:underline inline-flex items-center gap-0.5">
                      Voir <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.read && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)} title="Marquer lu">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(n.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
