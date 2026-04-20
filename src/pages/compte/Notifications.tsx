import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Check, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  article: "Nouveaux articles", comment: "Réponses à mes commentaires",
  subscription: "Abonnements", premium: "Statut premium",
  user: "Communauté", system: "Annonces système",
};

const UserNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading, markRead, markAllRead, remove, unreadCount } = useNotifications();
  const [prefs, setPrefs] = useState<any>({ in_app: true, email: true, push: false, types: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setPrefs(data); });
  }, [user]);

  const savePref = async (patch: any) => {
    if (!user) return;
    const next = { ...prefs, ...patch, user_id: user.id };
    setPrefs(next); setSaving(true);
    const { error } = await supabase.from("notification_preferences").upsert(next, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Préférences sauvegardées");
  };

  const toggleType = (key: string, val: boolean) => {
    savePref({ types: { ...(prefs.types || {}), [key]: val } });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;
  if (!user) return (
    <div className="min-h-screen flex flex-col">
      <Header /><div className="flex-1 flex items-center justify-center">
        <Card><CardContent className="p-8 text-center space-y-3">
          <p>Connectez-vous pour gérer vos notifications.</p>
          <Link to="/auth"><Button className="bg-gold hover:bg-gold-dark text-primary">Se connecter</Button></Link>
        </CardContent></Card>
      </div><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(4rem+1.75rem)] lg:h-[calc(5rem+1.75rem)]" />
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2"><Bell className="w-6 h-6 text-gold" /> Mes notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-display font-bold">Canaux de réception</h2>
            <div className="flex items-center justify-between"><Label>Notifications dans l'app</Label><Switch checked={prefs.in_app} onCheckedChange={v => savePref({ in_app: v })} /></div>
            <div className="flex items-center justify-between"><Label>Emails</Label><Switch checked={prefs.email} onCheckedChange={v => savePref({ email: v })} /></div>
            <div className="flex items-center justify-between"><Label>Notifications push (navigateur)</Label><Switch checked={prefs.push} onCheckedChange={v => savePref({ push: v })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="font-display font-bold">Types d'événements</h2>
            {Object.entries(TYPE_LABELS).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <Label className="text-sm font-body">{label}</Label>
                <Switch checked={prefs.types?.[k] !== false} onCheckedChange={v => toggleType(k, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Historique</h2>
          {unreadCount > 0 && <Button size="sm" variant="outline" onClick={markAllRead}>Tout marquer lu</Button>}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune notification</p>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <Card key={n.id} className={!n.read ? "border-gold/30 bg-gold/5" : ""}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}</span>
                      {n.link && <Link to={n.link} onClick={() => markRead(n.id)} className="text-[10px] text-gold hover:underline inline-flex items-center gap-0.5">Voir <ExternalLink className="w-2.5 h-2.5" /></Link>}
                    </div>
                  </div>
                  {!n.read && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)}><Check className="w-3.5 h-3.5" /></Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(n.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserNotifications;
